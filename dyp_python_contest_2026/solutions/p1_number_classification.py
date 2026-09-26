import sys

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
