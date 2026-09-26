"""
High-Recall Multi-Key Inverted Index Blocking and Streaming Candidate Generator.
Country-partitioned and memory-efficient.
"""

import re
from collections import defaultdict, Counter
from typing import Iterator

from .preprocess import clean_name, clean_addr
from .matching import score_candidate_pair

class BlockingEngine:
    def __init__(self, max_unigram_freq: int = 80, max_candidates_per_entity: int = 15):
        self.max_unigram_freq = max_unigram_freq
        self.max_candidates = max_candidates_per_entity
        self.s1_data = {}  # s1_id -> (clean_name, clean_addr, name_set, addr_set, num_set, country)
        self.name_unigram_index = defaultdict(list)
        self.name_bigram_index = defaultdict(list)
        self.addr_anchor_index = defaultdict(list)
        self.candidates = defaultdict(dict)  # s1_id -> {cand_id: score}

    def index_s1(self, s1_records: list[tuple[str, str, str, str]]) -> None:
        """
        Build inverted multi-key index for a list of Source 1 records.
        s1_records: list of (s1_id, name, addr, country)
        """
        word_freq = Counter()
        parsed_records = []
        
        for s1_id, name, addr, country in s1_records:
            n_str, n_words, n_set = clean_name(name)
            a_str, a_words, a_set, nums = clean_addr(addr)
            for w in set(n_words):
                word_freq[w] += 1
            parsed_records.append((s1_id, n_str, a_str, n_words, n_set, a_words, a_set, nums, country))
            self.s1_data[s1_id] = (n_str, a_str, n_set, a_set, nums, country)

        for s1_id, n_str, a_str, n_words, n_set, a_words, a_set, nums, country in parsed_records:
            nw = sorted(list(set(n_words)))
            # 1. Low-frequency name unigrams
            for w in nw:
                if word_freq[w] <= self.max_unigram_freq and len(w) >= 3:
                    self.name_unigram_index[w].append(s1_id)
            # 2. Name bigrams for compounds / phrases
            for i in range(len(nw)):
                for j in range(i + 1, min(i + 4, len(nw))):
                    self.name_bigram_index[(nw[i], nw[j])].append(s1_id)
            # 3. Address numeric anchors (country, street/door number, locality token)
            for num in nums:
                for aw in a_words[-4:]:
                    self.addr_anchor_index[(country, num, aw)].append(s1_id)

    def process_source_record(self, cand_id: str, cand_name: str, cand_addr: str, cand_country: str) -> None:
        """
        Process a single candidate record from Source 2 or Source 3.
        """
        c_nstr, c_nwords, c_nset = clean_name(cand_name)
        hits = set()
        nw = sorted(list(c_nset))
        
        # Check name unigrams
        for w in nw:
            if w in self.name_unigram_index:
                hits.update(self.name_unigram_index[w])
                
        # Check name bigrams
        for i in range(len(nw)):
            for j in range(i + 1, min(i + 4, len(nw))):
                bg = (nw[i], nw[j])
                if bg in self.name_bigram_index:
                    hits.update(self.name_bigram_index[bg])
                    
        c_astr, c_awords, c_aset, c_nums = clean_addr(cand_addr)
        
        # Check address anchors (only locality tokens from end of address)
        for num in c_nums:
            for aw in c_awords[-4:]:
                k = (cand_country, num, aw)
                if k in self.addr_anchor_index:
                    hits.update(self.addr_anchor_index[k])
                    
        if not hits:
            return
            
        cand_tuple = (c_nstr, c_astr, c_nset, c_aset, c_nums)
        for s1_id in hits:
            s1_info = self.s1_data[s1_id]
            # Must strictly match country
            if s1_info[5] != cand_country:
                continue
            s1_tuple = s1_info[:5]
            sc = score_candidate_pair(s1_tuple, cand_tuple)
            if sc >= 0.35:
                curr_cands = self.candidates[s1_id]
                if cand_id not in curr_cands or sc > curr_cands[cand_id]:
                    curr_cands[cand_id] = sc
                    # Keep size capped at max_candidates
                    if len(curr_cands) > self.max_candidates * 2:
                        top = sorted(curr_cands.items(), key=lambda x: x[1], reverse=True)[:self.max_candidates]
                        self.candidates[s1_id] = dict(top)

    def prune_candidates(self) -> None:
        """Prune candidates to top-K for all entities."""
        for s1_id in self.candidates:
            cands = self.candidates[s1_id]
            if len(cands) > self.max_candidates:
                top = sorted(cands.items(), key=lambda x: x[1], reverse=True)[:self.max_candidates]
                self.candidates[s1_id] = dict(top)
