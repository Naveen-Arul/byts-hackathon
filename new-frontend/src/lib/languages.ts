export type LanguageId = "python" | "javascript" | "java" | "cpp";

export const LANGUAGES: { id: LanguageId; label: string; monaco: string }[] = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
];

export const STARTER_CODE: Record<LanguageId, string> = {
  python: `def solve(nums):
    """Return the sum of the given numbers."""
    total = 0
    for n in nums:
        total += n
    return total


if __name__ == "__main__":
    print(solve([1, 2, 3, 4, 5]))
`,
  javascript: `function solve(nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}

console.log(solve([1, 2, 3, 4, 5]));
`,
  java: `import java.util.*;

public class Main {
    static int solve(int[] nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(solve(new int[]{1, 2, 3, 4, 5}));
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int solve(const vector<int>& nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}

int main() {
    cout << solve({1, 2, 3, 4, 5}) << endl;
    return 0;
}
`,
};
