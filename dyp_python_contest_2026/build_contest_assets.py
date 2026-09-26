import os
import zipfile
from collections import Counter

BASE_DIR = r"c:\Users\chand\OneDrive\Desktop\project\dyp_python_contest_2026"
TESTCASES_DIR = os.path.join(BASE_DIR, "testcases")
SOLUTIONS_DIR = os.path.join(BASE_DIR, "solutions")
ZIPS_DIR = os.path.join(BASE_DIR, "hackerrank_zip_packages")

os.makedirs(TESTCASES_DIR, exist_ok=True)
os.makedirs(SOLUTIONS_DIR, exist_ok=True)
os.makedirs(ZIPS_DIR, exist_ok=True)

# ----------------- SOLUTIONS -----------------

P1_CODE = '''import sys

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    if n == 0:
        print("Zero")
    elif n > 0:
        print("Positive Even" if n % 2 == 0 else "Positive Odd")
    else:
        print("Negative Even" if n % 2 == 0 else "Negative Odd")

if __name__ == "__main__":
    main()
'''

P2_CODE = '''import sys
from collections import Counter

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    freq = Counter(arr)
    for key in sorted(freq.keys()):
        print(f"{key} {freq[key]}")

if __name__ == "__main__":
    main()
'''

P3_CODE = '''import sys

def main():
    text = sys.stdin.read().strip()
    if not text:
        return
    words = text.split()
    print(" ".join(reversed(words)))

if __name__ == "__main__":
    main()
'''

P4_CODE = '''import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    m = int(tokens[1])
    idx = 2
    for _ in range(n):
        row = [int(tokens[idx + j]) for j in range(m)]
        idx += m
        print(max(row))

if __name__ == "__main__":
    main()
'''

P5_CODE = '''import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    arr = [int(tokens[1 + i]) for i in range(n)]
    pos = int(tokens[1 + n])
    val = int(tokens[2 + n])
    arr.insert(pos, val)
    print(*(arr))

if __name__ == "__main__":
    main()
'''

with open(os.path.join(SOLUTIONS_DIR, "p1_number_classification.py"), "w", encoding="utf-8") as f:
    f.write(P1_CODE)
with open(os.path.join(SOLUTIONS_DIR, "p2_element_frequency.py"), "w", encoding="utf-8") as f:
    f.write(P2_CODE)
with open(os.path.join(SOLUTIONS_DIR, "p3_reverse_words.py"), "w", encoding="utf-8") as f:
    f.write(P3_CODE)
with open(os.path.join(SOLUTIONS_DIR, "p4_matrix_row_maximum.py"), "w", encoding="utf-8") as f:
    f.write(P4_CODE)
with open(os.path.join(SOLUTIONS_DIR, "p5_linked_list_insertion.py"), "w", encoding="utf-8") as f:
    f.write(P5_CODE)

# ----------------- TEST CASES -----------------

PROBLEMS = {
    "p1_number_classification": [
        ("24\n", "Positive Even\n"),
        ("15\n", "Positive Odd\n"),
        ("-8\n", "Negative Even\n"),
        ("0\n", "Zero\n"),
        ("-7\n", "Negative Odd\n"),
        ("1000000000\n", "Positive Even\n"),
        ("-999999999\n", "Negative Odd\n"),
        ("1\n", "Positive Odd\n"),
        ("-2\n", "Negative Even\n"),
    ],
    "p2_element_frequency": [
        ("7\n2 3 2 4 3 2 5\n", "2 3\n3 2\n4 1\n5 1\n"),
        ("5\n1 1 2 2 3\n", "1 2\n2 2\n3 1\n"),
        ("6\n5 5 5 5 5 5\n", "5 6\n"),
        ("8\n4 2 4 3 2 4 3 1\n", "1 1\n2 2\n3 2\n4 3\n"),
        ("10\n-1 2 -1 3 2 -1 4 3 3 5\n", "-1 3\n2 2\n3 3\n4 1\n5 1\n"),
        ("1\n42\n", "42 1\n"),
        ("6\n-10 -20 -10 -5 -20 -5\n", "-20 2\n-10 2\n-5 2\n"),
    ],
    "p3_reverse_words": [
        ("Python is very powerful\n", "powerful very is Python\n"),
        ("Hello World\n", "World Hello\n"),
        ("I love Python programming\n", "programming Python love I\n"),
        ("Data Structures\n", "Structures Data\n"),
        ("Python makes coding interesting\n", "interesting coding makes Python\n"),
        ("Python\n", "Python\n"),
        ("Code test submit win\n", "win submit test Code\n"),
    ],
    "p4_matrix_row_maximum": [
        ("3 4\n1 2 3 4\n5 8 2 6\n9 3 7 1\n", "4\n8\n9\n"),
        ("2 3\n1 5 2\n8 3 4\n", "5\n8\n"),
        ("3 3\n-5 -2 -8\n-1 -9 -3\n-7 -4 -6\n", "-2\n-1\n-4\n"),
        ("1 5\n10 20 5 40 30\n", "40\n"),
        ("4 4\n12 5 8 3\n1 25 7 9\n18 2 30 4\n6 11 5 20\n", "12\n25\n30\n20\n"),
        ("1 1\n-99\n", "-99\n"),
    ],
    "p5_linked_list_insertion": [
        ("5\n10 20 30 40 50\n2 25\n", "10 20 25 30 40 50\n"),
        ("4\n1 2 3 4\n0 10\n", "10 1 2 3 4\n"),
        ("4\n1 2 3 4\n4 10\n", "1 2 3 4 10\n"),
        ("5\n10 20 30 40 50\n3 99\n", "10 20 30 99 40 50\n"),
        ("6\n5 10 15 20 25 30\n1 100\n", "5 100 10 15 20 25 30\n"),
        ("1\n50\n0 25\n", "25 50\n"),
        ("1\n50\n1 75\n", "50 75\n"),
    ]
}

for prob_key, cases in PROBLEMS.items():
    prob_dir = os.path.join(TESTCASES_DIR, prob_key)
    input_dir = os.path.join(prob_dir, "input")
    output_dir = os.path.join(prob_dir, "output")
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    
    zip_path = os.path.join(ZIPS_DIR, f"{prob_key}.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for idx, (inp, out) in enumerate(cases):
            inp_filename = f"input{idx:02d}.txt"
            out_filename = f"output{idx:02d}.txt"
            
            with open(os.path.join(input_dir, inp_filename), "w", encoding="utf-8") as f:
                f.write(inp)
            with open(os.path.join(output_dir, out_filename), "w", encoding="utf-8") as f:
                f.write(out)
                
            zf.writestr(f"input/{inp_filename}", inp)
            zf.writestr(f"output/{out_filename}", out)

print("All contest assets, test cases, solutions, and HackerRank zip packages created successfully!")
