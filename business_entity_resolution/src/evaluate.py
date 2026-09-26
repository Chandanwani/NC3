"""
Evaluation metrics for the Business Entity Resolution Challenge.
Computes Macro F_0.5 score per Source 1 entity and handles singleton evaluation.
"""

def compute_f05(precision: float, recall: float) -> float:
    """Calculate F_0.5 score given precision and recall."""
    if precision <= 0.0 or recall <= 0.0:
        return 0.0
    denom = 0.25 * precision + recall
    if denom <= 0.0:
        return 0.0
    return (1.25 * precision * recall) / denom

def evaluate_macro_f05(ground_truth: dict[str, set[str]], predictions: dict[str, set[str]]) -> float:
    """
    Compute macro-averaged F_0.5 across all Source 1 entities in the evaluation set.
    
    Rules:
    - Singletons (entities with 0 ground truth matches) score 1.0 if predicted empty,
      and 0.0 if any match is predicted.
    - Entities with true matches score 0.0 if predicted empty or true positives is 0.
    """
    scores = []
    for s1_id, true_set in ground_truth.items():
        pred_set = predictions.get(s1_id, set())
        if len(true_set) == 0:
            scores.append(1.0 if len(pred_set) == 0 else 0.0)
        else:
            if len(pred_set) == 0:
                scores.append(0.0)
            else:
                tp = len(true_set.intersection(pred_set))
                if tp == 0:
                    scores.append(0.0)
                else:
                    p = tp / len(pred_set)
                    r = tp / len(true_set)
                    scores.append(compute_f05(p, r))
                    
    return sum(scores) / len(scores) if scores else 0.0
