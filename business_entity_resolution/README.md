# Business Entity Resolution Pipeline

This repository contains the complete, self-contained machine learning pipeline for the **Amazon ML Challenge 2026: Business Entity Resolution Challenge**.

## 1. Overview & Architecture

The objective is to resolve noisy business records across three independent data sources ($S_1$, $S_2$, $S_3$) where $S_1$ serves as the deduplicated reference source. The evaluation metric is **Macro-Averaged $F_{0.5}$**, which weights precision twice as heavily as recall and strictly scores singleton identification.

### System Architecture
1. **Country Partitioning**:
   - Matches are empirically and strictly country-invariant (0 cross-country matches across all ground truth pairs).
   - Datasets are partitioned by country (`US`, `India`, `France`), reducing comparison space and eliminating false cross-border merges.
2. **Text Normalization & Preprocessing** (`src/preprocess.py`):
   - Unicode normalization and accent removal (essential for French records).
   - Domain and URL parsing (extracts core brand tokens from website URLs).
   - Stripping corporate legal designations (`Inc`, `Corp`, `LLC`, `Pvt Ltd`, `SARL`, `SASU`, `SCI`).
   - Address normalization, road abbreviation expansion, and structured number set extraction.
3. **Multi-Key Inverted Index Blocking** (`src/blocking.py`):
   - Multi-key inverted indexing on $S_1$:
     - Low-frequency Name Unigrams ($\le 80$ document frequency).
     - Name Bigrams for compound business titles.
     - Address Anchors: `(Country, Street/Door Number, Locality Token)`.
   - Streaming candidate retrieval with dynamic top-$K$ heap ($K=15$), achieving $>96.3\%$ target recall while keeping candidate size compact.
4. **Calibrated High-Precision Scorer** (`src/matching.py`):
   - Multi-field similarity scoring combining Name Jaccard, Token Containment, Character 3-gram Dice, Address Overlap, and Door/Street Number Consistency.
   - Severe penalty for conflicting door/flat numbers to avoid false merges in high-density multi-tenant commercial centers.
   - Optimal decision threshold ($0.52$) tuned for Macro $F_{0.5}$ on held-out validation data.

---

## 2. Directory Structure

```
business_entity_resolution/
├── src/
│   ├── __init__.py          # Package initialization
│   ├── preprocess.py        # Normalization, tokenization, number extraction
│   ├── blocking.py          # Multi-key inverted index blocking engine
│   ├── matching.py          # High-precision feature extractor & scorer
│   ├── evaluate.py          # Macro F_0.5 evaluation metric implementation
│   └── pipeline.py          # End-to-end country-partitioned streaming pipeline
├── output/
│   ├── matching_results.tsv # Final predicted matches (leaderboard submission)
│   └── candidate_pairs.tsv  # Blocking candidate set
├── requirements.txt         # Pinned runtime dependencies
└── README.md                # Reproduction and execution guide
```

---

## 3. Environment & Prerequisites

Python 3.10+ is required.

Install dependencies:
```bash
pip install -r requirements.txt
```

Pinned dependencies:
- `numpy >= 1.24.0`
- `pandas >= 2.0.0`
- `scikit-learn >= 1.2.0`
- `scipy >= 1.10.0`
- `tqdm >= 4.65.0`

---

## 4. End-to-End Execution Guide

To reproduce both `output/matching_results.tsv` and `output/candidate_pairs.tsv` from the test dataset:

```bash
python -m src.pipeline \
    --data-dir dataset/test \
    --output-dir output \
    --threshold 0.52 \
    --top-k 15
```

### Script Arguments:
- `--data-dir`: Directory containing `test_source1.tsv`, `test_source2.tsv`, `test_source3.tsv`.
- `--output-dir`: Output directory for generated TSV files (default: `output`).
- `--threshold`: Calibrated confidence threshold for final matches (default: `0.52`).
- `--top-k`: Maximum candidate capacity per $S_1$ entity (default: `15`).

---

## 5. Submission Validation

Before submitting to the portal, run the official validation script:

```bash
python utils/validate_submission.py \
    --matching output/matching_results.tsv \
    --candidate output/candidate_pairs.tsv \
    --test-dir dataset/test
```

Exit code `0` (`PASS`) confirms that:
- Every Source 1 entity in the test set has exactly one row.
- All matched IDs only reference valid $S_2$ and $S_3$ entities from the test set.
- No duplicate entity IDs exist within any matched ID list.
- Final matches are a strict subset of the candidate pairs.
