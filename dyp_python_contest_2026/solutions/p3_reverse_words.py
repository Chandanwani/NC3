import sys

def main():
    text = sys.stdin.read().strip()
    if not text:
        return
    words = text.split()
    print(" ".join(reversed(words)))

if __name__ == "__main__":
    main()
