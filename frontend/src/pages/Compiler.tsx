import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Send,
  Home,
  Loader2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { evaluateCode } from "@/lib/api";

const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `def solve():
    # Write your code here
    print("Hello, World!")

if __name__ == "__main__":
    solve()
`,
  javascript: `function solve() {
    // Write your code here
    console.log("Hello, World!");
}

// Run the solution
solve();
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}
`,
};

const Compiler = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCode, setCurrentCode] = useState(LANGUAGE_TEMPLATES.python);
  const [currentLanguage, setCurrentLanguage] = useState("python");
  const { toast } = useToast();

  const editorOptions = {
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    autoIndent: "advanced" as const,
    formatOnType: true,
    formatOnPaste: true,
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoSurround: "languageDefined" as const,
    bracketPairColorization: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
  };

  const handleLanguageChange = (newLang: string) => {
    const trimmedCode = currentCode.trim();
    const prevTemplateTrimmed = (LANGUAGE_TEMPLATES[currentLanguage] || "").trim();
    if (!trimmedCode || trimmedCode === prevTemplateTrimmed) {
      setCurrentCode(LANGUAGE_TEMPLATES[newLang] || "");
    }
    setCurrentLanguage(newLang);
  };

  const handleSubmitCode = async () => {
    if (!currentCode.trim()) {
      toast({
        title: "No code to submit",
        description: "Write some code before requesting AI evaluation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await evaluateCode(currentLanguage, currentCode);
      toast({
        title: "AI review complete",
        description: "Detected task and judge report are ready.",
      });
      // Navigate to full results page, passing the entire response as router state
      navigate("/review-results", {
        state: {
          review: result.review,
          metadata: result.metadata,
          agent_outputs: result.agent_outputs,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete AI review";
      toast({
        title: "Review failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold hidden sm:inline">CodeJudge AI</span>
          </Link>
          <Badge variant="secondary" className="hidden md:inline-flex">
            AI Review Workspace
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            className="gap-2 btn-primary-glow"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Evaluate using AI
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base flex items-center justify-between gap-3">
              <span>Code Editor</span>
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-0 pb-4 px-4 overflow-hidden">
            <div className="h-full w-full overflow-hidden rounded-md border border-input">
              <Editor
                height="100%"
                language={currentLanguage}
                value={currentCode}
                theme="vs-dark"
                options={editorOptions}
                onChange={(value) => setCurrentCode(value || "")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compiler;
