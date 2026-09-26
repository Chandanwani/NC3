import sys

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
