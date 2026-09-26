"""
High-Precision Entity Matching Scorer.
Calibrated to optimize Macro F_0.5 by penalizing false positives heavily.
"""

from .preprocess import jaccard, containment, dice_similarity

def score_candidate_pair(s1_tuple: tuple, cand_tuple: tuple) -> float:
    """
    Score a candidate pair (S1, S2/S3) using multi-field similarity features.
    
    s1_tuple: (name_clean, addr_clean, name_set, addr_set, num_set)
    cand_tuple: (name_clean, addr_clean, name_set, addr_set, num_set)
    
    Returns: affinity score in [0.0, 1.0]
    """
    s1_name, s1_addr, s1_nset, s1_aset, s1_nums = s1_tuple
    c_name, c_addr, c_nset, c_aset, c_nums = cand_tuple
    
    # Fast intersection check
    n_common = len(s1_nset.intersection(c_nset))
    a_common = len(s1_aset.intersection(c_aset))
    num_common = len(s1_nums.intersection(c_nums))
    
    # If no common name words, no common address words, and no common numbers: early exit
    if n_common == 0 and a_common == 0 and num_common == 0:
        return 0.0

    # 1. Fast Name Token Features
    n_jac = jaccard(s1_nset, c_nset)
    n_cont = containment(s1_nset, c_nset)
    
    # 2. Fast Address Token Features
    a_jac = jaccard(s1_aset, c_aset)
    a_cont = containment(s1_aset, c_aset)
    
    # 3. Numeric Features (House/Plot/Unit/Pin number)
    has_num1 = len(s1_nums) > 0
    has_num2 = len(c_nums) > 0
    
    num_feature = 0.0
    if has_num1 and has_num2:
        if s1_nums == c_nums:
            num_feature = 1.0
        elif num_common > 0:
            num_feature = 0.5
        else:
            num_feature = -0.6  # Severe penalty for conflicting door/street numbers!
    elif num_common > 0:
        num_feature = 0.5

    # 4. Selective Fine-Grained Character Matching (only when moderately similar)
    n_dice = 0.0
    if 0.1 <= n_jac < 0.7 or (n_jac == 0 and num_feature > 0 and a_jac > 0.4):
        n_dice = dice_similarity(s1_name, c_name, n=3)
        
    a_dice = 0.0
    if 0.1 <= a_jac < 0.7:
        a_dice = dice_similarity(s1_addr, c_addr, n=3)

    name_score = max(n_jac, 0.85 * n_cont, n_dice)
    addr_score = max(a_jac, 0.85 * a_cont, 0.9 * a_dice)
    
    # 5. Composite Scoring
    if name_score >= 0.75:
        # High confidence name match (e.g. identical or typo variation)
        score = 0.50 * name_score + 0.30 * addr_score + 0.20 * max(0.0, num_feature)
    elif addr_score >= 0.70 and num_feature >= 0.0:
        # High confidence address match with consistent numbers (DBA / alias / transliterated name)
        score = 0.30 * name_score + 0.50 * addr_score + 0.20 * max(0.0, num_feature)
    else:
        score = 0.45 * name_score + 0.45 * addr_score + 0.10 * num_feature

    if num_feature < 0:
        score -= 0.20  # Extra penalty to avoid false merges on multi-unit buildings
        
    return max(0.0, min(1.0, score))
