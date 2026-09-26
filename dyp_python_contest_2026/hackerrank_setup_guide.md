# DYP Python Coding Challenge 2026 — HackerRank Setup Guide

This guide gives you the exact, step-by-step instructions to create the **private** contest on HackerRank using your account, upload challenges, configure test cases, and restrict access.

---

## Part 1: Create the Contest

1. Go to **HackerRank Administration**: [https://www.hackerrank.com/administration/contests](https://www.hackerrank.com/administration/contests)
   *(Log in with your HackerRank account if not already logged in)*
2. Click **Create Contest** (top right button).
3. Fill in the primary details:
   - **Contest Name:** `DYP Python Coding Challenge 2026`
   - **Contest Slug / URL:** `dyp-python-coding-challenge-2026` *(or custom url)*
   - **Start Time:** Select your desired college contest date & time
   - **End Time:** Set to exactly **60 minutes** after Start Time
   - **Tagline:** `College-level Python programming competition testing core Python concepts and problem-solving.`
   - **Description:** Paste the contents of `contest_overview.md` (Contest Purpose, Structure, and Rules).
   - **Organization Type:** Select `College/University` (or `Company/Other`).
4. Click **Get Started** / **Save**.

---

## Part 2: Make It a PRIVATE Contest

By default, contests can be public or private. To configure access:
1. In your contest administration menu on the left, navigate to **Settings** (or **Signups / Access**).
2. Under **Contest Access / Participant Signups**:
   - Set to **Restricted / Invite-only** or **Password Protected**.
   - **Option A (Secret Password):** Set a contest password/passcode and share it only with DYP college participants.
   - **Option B (Email Whitelist / Invite):** Paste participant college email addresses (`@dypatil.edu` or registered student list).
   - **Option C (Hidden Contest):** Keep it unlisted from HackerRank's public contest directory; only users with the direct link and access token can view and participate.
3. Save changes.

---

## Part 3: Adding Challenges to the Contest

Go to the **Challenges** tab within your contest:

### Option A: 5 Coding Problems (Total 80 Marks)

For each coding problem:
1. Click **Add Challenge** -> **Create New Challenge**.
2. Fill in the Details:
   - **Challenge Name:** (e.g., `Number Classification`)
   - **Challenge Slug:** (e.g., `p1-number-classification`)
   - **Description:** Copy problem statement, input/output format, constraints from `contest_overview.md`.
   - **Allowed Languages:** Restrict to **Python 3** only (uncheck all others).
3. Under **Test Cases**:
   - HackerRank allows you to either add test cases one by one OR upload a `.zip` file!
   - Ready-to-upload zip packages are prepared in:
     `dyp_python_contest_2026/hackerrank_zip_packages/`
     - `p1_number_classification.zip`
     - `p2_element_frequency.zip`
     - `p3_reverse_words.zip`
     - `p4_matrix_row_maximum.zip`
     - `p5_linked_list_insertion.zip`
   - Mark Sample Test Cases as **Sample** (visible to participants during the contest).
   - Mark the remaining test cases as **Hidden** (evaluated automatically upon submission).
4. Under **Score & Weightage**:
   - Problem 1: **10 Marks**
   - Problem 2: **15 Marks**
   - Problem 3: **15 Marks**
   - Problem 4: **20 Marks**
   - Problem 5: **20 Marks**
5. Save and add to the contest.

---

### Option B: 10 MCQ Questions (Total 20 Marks)

In HackerRank Community Contests:
1. Click **Add Challenge** -> Choose **Multiple Choice Question** (or create under Challenge Library).
2. Set score: **2 Marks** each (10 questions × 2 marks = 20 marks).
3. Copy-paste questions, choices, and mark the correct option from Section 4 of `contest_overview.md`.

---

## Part 4: Contest Scoring & Leaderboard Rules

Under **Settings -> Scoring & Leaderboard**:
- **Scoring Type:** Binary / Partial (for coding test cases, partial scoring allocates marks proportionally per passed test case).
- **Tie Breaker:** Earlier submission time gets higher rank.
- **Leaderboard Visibility:**
  - Can be kept visible during contest or frozen 10 minutes before the end to build suspense.
