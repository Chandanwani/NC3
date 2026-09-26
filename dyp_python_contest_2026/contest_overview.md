# DYP Python Coding Challenge 2026

## 1. Contest Description & Overview
**Contest Name:** DYP Python Coding Challenge 2026  
**Purpose:** A college-level Python programming competition designed to test participants' understanding of Python fundamentals, data structures, problem-solving, and programming logic.  
**Duration:** 60 Minutes  
**Total Marks:** 100  
**Allowed Programming Language:** Python 3  
**Format:**
* Round 1: MCQ — 20 marks (10 Questions × 2 Marks)
* Round 2: Coding — 80 marks (5 Problems)
**Access:** Private / Restricted

---

## 2. Contest Rules
1. Participants must complete the contest within 60 minutes.
2. Only Python 3 is allowed for coding problems.
3. Participants must submit their own solutions.
4. Internet resources, AI assistants, and external libraries not part of Python's standard library are prohibited.
5. Each coding problem is evaluated using visible sample test cases and hidden test cases.
6. The leaderboard is ranked by total score; ties are broken by submission time (earliest to reach score ranks higher).
7. Carefully follow the required input and output format. Extra spaces, formatting mismatches, or debugging prints will result in failing test cases.
8. Plagiarism or code sharing will result in disqualification.
9. Submissions close strictly at 60 minutes.

---

## 3. Section 1: MCQ Round (10 Questions × 2 Marks = 20 Marks)

### Q1. Python Data Type
Which of the following is used to store multiple values that can be changed?
- A. Tuple
- B. List
- C. String
- D. Integer
**Correct Answer:** B. List

---

### Q2. Output Prediction
What is the output?
```python
x = 10
y = 3
print(x // y)
```
- A. 3.33
- B. 3
- C. 4
- D. 1
**Correct Answer:** B. 3

---

### Q3. Conditional Statements
What will be printed?
```python
x = 15
if x > 10:
    print("A")
else:
    print("B")
```
- A. A
- B. B
- C. Error
- D. Nothing
**Correct Answer:** A. A

---

### Q4. Loop
What is the output?
```python
for i in range(2, 6):
    print(i, end=" ")
```
- A. 2 3 4 5
- B. 2 3 4 5 6
- C. 1 2 3 4 5
- D. 3 4 5 6
**Correct Answer:** A. 2 3 4 5

---

### Q5. Function
Which keyword is used to define a function in Python?
- A. function
- B. define
- C. def
- D. fun
**Correct Answer:** C. def

---

### Q6. List
What is the output?
```python
a = [10, 20, 30]
a.append(40)
print(len(a))
```
- A. 3
- B. 4
- C. 40
- D. Error
**Correct Answer:** B. 4

---

### Q7. Dictionary
Which data structure stores data in key-value pairs?
- A. List
- B. Tuple
- C. Dictionary
- D. Set
**Correct Answer:** C. Dictionary

---

### Q8. 2D List
Which is a valid 2D list in Python?
- A. `[1, 2, 3]`
- B. `[[1, 2], [3, 4]]`
- C. `{1, 2, 3}`
- D. `(1, 2, 3)`
**Correct Answer:** B. `[[1, 2], [3, 4]]`

---

### Q9. Linked List
In a singly linked list, each node generally contains:
- A. Only data
- B. Only address
- C. Data and reference to the next node
- D. Two references only
**Correct Answer:** C. Data and reference to the next node

---

### Q10. Recursion
What is recursion?
- A. A loop that never ends
- B. A function calling itself
- C. A variable calling itself
- D. A class calling another class
**Correct Answer:** B. A function calling itself

---

## 4. Section 2: Coding Problems (5 Problems = 80 Marks)

### Problem 1: Number Classification
* **Difficulty:** Easy
* **Score:** 10 Marks
* **Problem Statement:**
  Given an integer $N$, determine whether it is positive, negative, or zero.
  If the number is positive or negative, also determine whether it is even or odd.
* **Input Format:**
  A single integer $N$.
* **Constraints:**
  $-10^9 \le N \le 10^9$
* **Output Format:**
  - If $N$ is zero: `Zero`
  - For positive numbers: `Positive Even` or `Positive Odd`
  - For negative numbers: `Negative Even` or `Negative Odd`
* **Sample 1:**
  Input: `24`  
  Output: `Positive Even`
* **Sample 2:**
  Input: `15`  
  Output: `Positive Odd`
* **Sample 3:**
  Input: `-8`  
  Output: `Negative Even`
* **Sample 4:**
  Input: `0`  
  Output: `Zero`
* **Sample 5:**
  Input: `-7`  
  Output: `Negative Odd`

---

### Problem 2: Element Frequency
* **Difficulty:** Easy
* **Score:** 15 Marks
* **Problem Statement:**
  Given a list of integers, find the frequency of every distinct element.
  Print each distinct element followed by its frequency in ascending order of the distinct elements.
* **Input Format:**
  The first line contains an integer $N$.
  The second line contains $N$ space-separated integers.
* **Constraints:**
  $1 \le N \le 1000$  
  $-10^5 \le arr[i] \le 10^5$
* **Output Format:**
  Print each distinct element and its frequency on a new line, separated by a space.
* **Sample 1:**
  Input:
  ```text
  7
  2 3 2 4 3 2 5
  ```
  Output:
  ```text
  2 3
  3 2
  4 1
  5 1
  ```
* **Sample 2:**
  Input:
  ```text
  5
  1 1 2 2 3
  ```
  Output:
  ```text
  1 2
  2 2
  3 1
  ```

---

### Problem 3: Reverse Words
* **Difficulty:** Easy-Medium
* **Score:** 15 Marks
* **Problem Statement:**
  Given a sentence, reverse the order of the words without reversing the characters inside each word.
* **Input Format:**
  The input contains a single line containing a sentence.
* **Constraints:**
  $1 \le \text{length of sentence} \le 1000$
* **Output Format:**
  Print the words in reverse order separated by a single space.
* **Sample 1:**
  Input: `Python is very powerful`  
  Output: `powerful very is Python`
* **Sample 2:**
  Input: `Hello World`  
  Output: `World Hello`

---

### Problem 4: Matrix Row Maximum
* **Difficulty:** Medium
* **Score:** 20 Marks
* **Problem Statement:**
  Given an $N \times M$ matrix, find the maximum element from each row.
* **Input Format:**
  The first line contains two integers $N$ and $M$.
  The next $N$ lines contain $M$ integers each.
* **Constraints:**
  $1 \le N, M \le 100$  
  $-10^5 \le \text{matrix}[i][j] \le 10^5$
* **Output Format:**
  Print the maximum element of each row on a separate line.
* **Sample 1:**
  Input:
  ```text
  3 4
  1 2 3 4
  5 8 2 6
  9 3 7 1
  ```
  Output:
  ```text
  4
  8
  9
  ```
* **Sample 2:**
  Input:
  ```text
  2 3
  1 5 2
  8 3 4
  ```
  Output:
  ```text
  5
  8
  ```

---

### Problem 5: Linked List Insertion
* **Difficulty:** Medium-Hard
* **Score:** 20 Marks
* **Problem Statement:**
  Given a list of integers, insert a new element at the specified position.
  The position is **0-indexed**.
* **Input Format:**
  The first line contains $N$.
  The second line contains $N$ integers.
  The third line contains two integers: `position` and `value`.
* **Constraints:**
  $1 \le N \le 1000$  
  $0 \le \text{position} \le N$  
  $-10^5 \le \text{value} \le 10^5$
* **Output Format:**
  Print the resulting elements separated by spaces.
* **Sample 1:**
  Input:
  ```text
  5
  10 20 30 40 50
  2 25
  ```
  Output:
  ```text
  10 20 25 30 40 50
  ```
* **Sample 2:**
  Input:
  ```text
  4
  1 2 3 4
  0 10
  ```
  Output:
  ```text
  10 1 2 3 4
  ```
