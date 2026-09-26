import os
import subprocess
import sys

BASE_DIR = r"c:\Users\chand\OneDrive\Desktop\project\dyp_python_contest_2026"
TESTCASES_DIR = os.path.join(BASE_DIR, "testcases")
SOLUTIONS_DIR = os.path.join(BASE_DIR, "solutions")

PROBLEMS = [
    ("p1_number_classification", "p1_number_classification.py"),
    ("p2_element_frequency", "p2_element_frequency.py"),
    ("p3_reverse_words", "p3_reverse_words.py"),
    ("p4_matrix_row_maximum", "p4_matrix_row_maximum.py"),
    ("p5_linked_list_insertion", "p5_linked_list_insertion.py"),
]

all_passed = True

for prob_key, script_name in PROBLEMS:
    print(f"--- Testing {prob_key} ---")
    script_path = os.path.join(SOLUTIONS_DIR, script_name)
    input_dir = os.path.join(TESTCASES_DIR, prob_key, "input")
    output_dir = os.path.join(TESTCASES_DIR, prob_key, "output")
    
    input_files = sorted(os.listdir(input_dir))
    for inp_f in input_files:
        out_f = inp_f.replace("input", "output")
        with open(os.path.join(input_dir, inp_f), "r", encoding="utf-8") as f:
            inp_data = f.read()
        with open(os.path.join(output_dir, out_f), "r", encoding="utf-8") as f:
            expected_out = f.read().strip()
            
        res = subprocess.run(
            [sys.executable, script_path],
            input=inp_data,
            text=True,
            capture_output=True
        )
        
        actual_out = res.stdout.strip()
        if actual_out == expected_out:
            print(f"  [PASS] {inp_f}")
        else:
            print(f"  [FAIL] {inp_f}")
            print(f"    Expected:\n{expected_out}")
            print(f"    Actual:\n{actual_out}")
            all_passed = False

if all_passed:
    print("\nSUCCESS: All test cases passed for all 5 problems!")
else:
    print("\nFAILURE: Some test cases failed.")
    sys.exit(1)
