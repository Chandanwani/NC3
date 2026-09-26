import sys

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
