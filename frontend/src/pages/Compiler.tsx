import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Play,
  Send,
  Trash2,
  Terminal,
  FileInput,
  Home,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import CodingTimer from "@/components/compiler/CodingTimer";

const languages = [
  { value: "python", label: "Python", extension: ".py" },
  { value: "java", label: "Java", extension: ".java" },
  { value: "c", label: "C", extension: ".c" },
  { value: "cpp", label: "C++", extension: ".cpp" },
];

const defaultCode: Record<string, string> = {
  python: `# Write your Python code here
def main():
    n = int(input())
    print(f"Hello! You entered: {n}")

if __name__ == "__main__":
    main()`,
  java: `// Write your Java code here
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Hello! You entered: " + n);
    }
}`,
  c: `// Write your C code here
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("Hello! You entered: %d\\n", n);
    return 0;
}`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "Hello! You entered: " << n << endl;
    return 0;
}`,
};

type Status = "ready" | "running" | "completed" | "submitted";

const Compiler = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultCode.python);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Output will appear here after execution");
  const [status, setStatus] = useState<Status>("ready");
  const [isTyping, setIsTyping] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(defaultCode[value]);
  };

  const handleClearEditor = () => {
    setCode("");
    setInput("");
    setOutput("Output will appear here after execution");
    setStatus("ready");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setIsTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset typing state after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleRunCode = async () => {
    setStatus("running");
    setOutput("Executing code...");

    try {
      // Call backend API
      const response = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          code: code,
          input: input,
        }),
      });

      const result = await response.json();

      // Handle response
      if (result.status === "success") {
        // Build output with execution metrics
        let outputText = "";
        
        if (result.stdout) {
          outputText += result.stdout;
        }
        
        if (result.stderr) {
          outputText += result.stderr;
        }
        
        if (!result.stdout && !result.stderr) {
          outputText = "(Program executed but produced no output)";
        }

        // Add execution metrics
        outputText += `\n\n─────────────────────────────────────\n`;
        outputText += `✓ Execution Time: ${result.executionTime}ms\n`;
        outputText += `✓ Memory Used: ${(result.memoryUsed / 1024).toFixed(2)} KB\n`;
        if (result.compilationTime > 0) {
          outputText += `✓ Compilation Time: ${result.compilationTime}ms\n`;
        }

        setOutput(outputText);
        setStatus("completed");

        toast({
          title: "✅ Execution Complete",
          description: `Completed in ${result.executionTime}ms`,
        });
      } else {
        // Handle error from API
        setOutput(result.error || "Execution failed");
        setStatus("ready");

        toast({
          title: "❌ Execution Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle network or connection errors
      setOutput(
        "❌ Error: Could not connect to backend server.\n\n" +
        "Make sure the backend is running at http://localhost:5000\n\n" +
        "Start backend with: cd backend && node index.js"
      );
      setStatus("ready");

      toast({
        title: "❌ Connection Error",
        description: "Could not reach backend server",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCode = async () => {
    setStatus("running");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStatus("submitted");

    toast({
      title: "Code Submitted",
      description: "Your code has been submitted for AI evaluation.",
    });
  };

  const getStatusText = () => {
    switch (status) {
      case "ready":
        return "Ready to Run";
      case "running":
        return "Executing...";
      case "completed":
        return "Execution Completed";
      case "submitted":
        return "Submitted for AI Evaluation";
      default:
        return "Ready";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "completed":
      case "submitted":
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const lineNumbers = code.split("\n").length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0"
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold hidden sm:inline">CodeJudge AI</span>
          </Link>

          <div className="h-6 w-px bg-border/50 hidden sm:block" />

          {/* Language Selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 h-9 bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border/50 hidden md:block" />

          {/* Coding Timer */}
          <div className="hidden md:block">
            <CodingTimer isTyping={isTyping} editorFocused={editorFocused} />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearEditor}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunCode}
            disabled={status === "running"}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            Run
          </Button>

          <Button
            size="sm"
            onClick={handleSubmitCode}
            disabled={status === "running"}
            className="gap-2 btn-primary-glow"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </motion.header>

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="h-full flex flex-col"
            >
              <div className="h-10 px-4 flex items-center bg-muted/30 border-b border-border/50 flex-shrink-0">
                <span className="text-sm font-medium text-muted-foreground">
                  main{languages.find((l) => l.value === language)?.extension}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex code-editor overflow-auto">
                  {/* Line Numbers */}
                  <div className="w-12 py-4 text-right pr-4 line-numbers text-sm flex-shrink-0 select-none">
                    {Array.from({ length: lineNumbers }, (_, i) => (
                      <div key={i + 1} className="leading-6">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {/* Code Area */}
                  <textarea
                    value={code}
                    onChange={handleCodeChange}
                    onFocus={() => setEditorFocused(true)}
                    onBlur={() => setEditorFocused(false)}
                    className="flex-1 bg-transparent resize-none outline-none py-4 pr-4 font-mono text-sm leading-6 text-foreground"
                    spellCheck={false}
                    placeholder="Write your code here..."
                  />
                </div>
              </div>
            </motion.div>
          </ResizablePanel>

          {/* Horizontal Resize Handle */}
          <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/50 transition-colors" />

          {/* Right Panel - Input/Output with Vertical Split */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="h-full"
            >
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Input Terminal */}
                <ResizablePanel defaultSize={40} minSize={15}>
                  <div className="h-full flex flex-col">
                    <div className="h-10 px-4 flex items-center gap-2 bg-muted/30 border-b border-border/50 flex-shrink-0">
                      <FileInput className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Program Input</span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input for your program here..."
                        className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm text-muted-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                </ResizablePanel>

                {/* Vertical Resize Handle */}
                <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/50 transition-colors" />

                {/* Output Terminal */}
                <ResizablePanel defaultSize={60} minSize={15}>
                  <div className="h-full flex flex-col">
                    <div className="h-10 px-4 flex items-center gap-2 bg-muted/30 border-b border-border/50 flex-shrink-0">
                      <Terminal className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Program Output</span>
                    </div>
                    <div className="flex-1 terminal-output p-4 overflow-auto">
                      <pre className="font-mono text-sm text-terminal-text whitespace-pre-wrap">
                        {output}
                      </pre>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="h-8 border-t border-border/50 bg-card/80 flex items-center px-4 text-xs text-muted-foreground flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span>Lines: {lineNumbers}</span>
          <span className="capitalize">{language}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Compiler;
