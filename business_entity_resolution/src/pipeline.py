"""
End-to-end Pipeline for Business Entity Resolution Challenge.
Supports country-partitioned multi-key indexing, candidate generation, and scoring.
"""

import os
import sys
import time
import argparse

sys.stdout.reconfigure(encoding='utf-8')

from .blocking import BlockingEngine

DELIM = "\t"

def run_country_pipeline(
    country: str,
    s1_records: list[tuple[str, str, str, str]],
    s2_path: str,
    s3_path: str,
    threshold: float = 0.52,
    top_k: int = 15
) -> dict[str, tuple[list[str], list[str]]]:
    """
    Execute blocking and matching for a single country partition.
    Returns: mapping {s1_id: (matched_ids, candidate_ids)}
    """
    print(f"\n[{country}] Processing partition: {len(s1_records)} Source-1 entities...", flush=True)
    t0 = time.time()
    
    engine = BlockingEngine(max_unigram_freq=80, max_candidates_per_entity=top_k)
    engine.index_s1(s1_records)
    print(f"[{country}] S1 index built in {time.time() - t0:.2f}s. Streaming Source-2 and Source-3...", flush=True)

    # Stream Source 2
    t_s2 = time.time()
    s2_count = 0
    if os.path.isfile(s2_path):
        with open(s2_path, "r", encoding="utf-8") as f:
            header = f.readline()
            for line in f:
                parts = line.rstrip("\n").split(DELIM)
                if len(parts) >= 4 and parts[3] == country:
                    s2_count += 1
                    engine.process_source_record(parts[0], parts[1], parts[2], parts[3])
    print(f"[{country}] Streamed {s2_count} matching Source-2 records in {time.time() - t_s2:.2f}s.", flush=True)

    # Stream Source 3
    t_s3 = time.time()
    s3_count = 0
    if os.path.isfile(s3_path):
        with open(s3_path, "r", encoding="utf-8") as f:
            header = f.readline()
            for line in f:
                parts = line.rstrip("\n").split(DELIM)
                if len(parts) >= 4 and parts[3] == country:
                    s3_count += 1
                    engine.process_source_record(parts[0], parts[1], parts[2], parts[3])
    print(f"[{country}] Streamed {s3_count} matching Source-3 records in {time.time() - t_s3:.2f}s.", flush=True)

    engine.prune_candidates()
    print(f"[{country}] Pruned candidate sets. Formatting outputs...", flush=True)

    results = {}
    for s1_id, name, addr, c in s1_records:
        cand_dict = engine.candidates.get(s1_id, {})
        # Final matches: candidates with score >= threshold, sorted by score descending
        matches = [cid for cid, sc in sorted(cand_dict.items(), key=lambda x: x[1], reverse=True) if sc >= threshold]
        # Candidate set: all candidates considered (must include all matches)
        candidates = list(cand_dict.keys())
        # Deduplicate while preserving order
        matches_dedup = list(dict.fromkeys(matches))
        candidates_dedup = list(dict.fromkeys(candidates))
        # Ensure matches are strict subset of candidates
        for mid in matches_dedup:
            if mid not in candidates_dedup:
                candidates_dedup.append(mid)
        results[s1_id] = (matches_dedup, candidates_dedup)

    print(f"[{country}] Finished in {time.time() - t0:.2f}s.", flush=True)
    return results

def run_pipeline(
    data_dir: str,
    output_dir: str,
    threshold: float = 0.52,
    top_k: int = 15,
    is_test: bool = True
) -> None:
    """
    Run end-to-end entity resolution pipeline.
    """
    t_start = time.time()
    os.makedirs(output_dir, exist_ok=True)
    
    prefix = "test" if is_test else "train"
    s1_path = os.path.join(data_dir, f"{prefix}_source1.tsv")
    s2_path = os.path.join(data_dir, f"{prefix}_source2.tsv")
    s3_path = os.path.join(data_dir, f"{prefix}_source3.tsv")

    print(f"Loading Source-1 from: {s1_path}", flush=True)
    s1_ordered_ids = []
    country_buckets = {}
    
    with open(s1_path, "r", encoding="utf-8") as f:
        header = f.readline()
        for line in f:
            parts = line.rstrip("\n").split(DELIM)
            if len(parts) >= 4:
                s1_id, name, addr, country = parts[0], parts[1], parts[2], parts[3]
                s1_ordered_ids.append(s1_id)
                if country not in country_buckets:
                    country_buckets[country] = []
                country_buckets[country].append((s1_id, name, addr, country))

    print(f"Loaded {len(s1_ordered_ids)} Source-1 records across countries: {list(country_buckets.keys())}", flush=True)

    all_results = {}
    for country, records in country_buckets.items():
        c_res = run_country_pipeline(country, records, s2_path, s3_path, threshold=threshold, top_k=top_k)
        all_results.update(c_res)

    # Write output TSV files preserving exact original row order
    matching_file = os.path.join(output_dir, "matching_results.tsv")
    candidate_file = os.path.join(output_dir, "candidate_pairs.tsv")

    print(f"\nWriting output files...", flush=True)
    with open(matching_file, "w", encoding="utf-8", newline="\n") as f_match, \
         open(candidate_file, "w", encoding="utf-8", newline="\n") as f_cand:
         
        f_match.write("source1_entity_id\tmatched_entity_ids\n")
        f_cand.write("source1_entity_id\tcandidate_entity_ids\n")

        singletons = 0
        total_matches = 0
        total_candidates = 0

        for s1_id in s1_ordered_ids:
            matches, candidates = all_results.get(s1_id, ([], []))
            if not matches:
                singletons += 1
            total_matches += len(matches)
            total_candidates += len(candidates)

            f_match.write(f"{s1_id}\t{','.join(matches)}\n")
            f_cand.write(f"{s1_id}\t{','.join(candidates)}\n")

    print("\n" + "=" * 60)
    print("PIPELINE EXECUTION SUMMARY")
    print("=" * 60)
    print(f"Total Source-1 entities: {len(s1_ordered_ids)}")
    print(f"Identified singletons (no matches): {singletons} ({singletons / len(s1_ordered_ids) * 100:.2f}%)")
    print(f"Total matched pairs: {total_matches} (avg {total_matches / max(1, len(s1_ordered_ids) - singletons):.2f} per non-singleton)")
    print(f"Total candidate pairs: {total_candidates} (avg {total_candidates / len(s1_ordered_ids):.2f} per entity)")
    print(f"Wrote matching results to: {matching_file}")
    print(f"Wrote candidate pairs to:  {candidate_file}")
    print(f"Total elapsed time: {time.time() - t_start:.2f}s")
    print("=" * 60, flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Business Entity Resolution Pipeline")
    parser.add_argument("--data-dir", type=str, required=True, help="Directory containing dataset files")
    parser.add_argument("--output-dir", type=str, default="output", help="Directory for output TSV files")
    parser.add_argument("--threshold", type=float, default=0.52, help="Decision threshold for matching")
    parser.add_argument("--top-k", type=int, default=15, help="Maximum candidates per entity")
    parser.add_argument("--is-test", action="store_true", default=True, help="Set to True for test dataset")
    args = parser.parse_args()

    run_pipeline(
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        threshold=args.threshold,
        top_k=args.top_k,
        is_test=args.is_test
    )
