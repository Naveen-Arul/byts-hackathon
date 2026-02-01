import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Send,
  Home,
  Maximize2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CodingTimer from "@/components/compiler/CodingTimer";

const Compiler = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [editorFocused, setEditorFocused] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("python");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Listen for code changes from embedded OneCompiler editor
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // OneCompiler sends code change events when codeChangeEvent=true
      if (e.data && e.data.language) {
        // Capture code and language from embedded editor
        setCurrentCode(e.data.files?.[0]?.content || "");
        setCurrentLanguage(e.data.language);
        
        // User is typing - set typing state
        setIsTyping(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing indicator after 2 seconds of no activity
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmitCode = async () => {
    if (!currentCode || currentCode.trim() === "") {
      toast({
        title: "⚠️ No Code to Submit",
        description: "Please write some code before submitting for review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:5000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: currentLanguage,
          code: currentCode,
          problemStatement: "General code review and analysis"
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        toast({
          title: "✅ AI Review Complete",
          description: "Your code has been analyzed. Viewing results...",
        });

        // Navigate to results page with data
        navigate("/review-results", {
          state: {
            review: result.review,
            metadata: result.metadata
          }
        });
      } else {
        throw new Error(result.error || "Review failed");
      }
    } catch (error: any) {
      toast({
        title: "❌ Review Failed",
        description: error.message || "Could not complete AI review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

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
            onClick={handleFullscreen}
            className="gap-2 hidden sm:flex"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            className="gap-2 btn-primary-glow"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for AI Review
              </>
            )}
          </Button>
        </div>
      </motion.header>

      {/* Main Content - Embedded OneCompiler Editor */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="h-full w-full"
        >
          <iframe
            ref={iframeRef}
            frameBorder="0"
            className="w-full h-full"
            src="https://onecompiler.com/embed/?theme=dark&fontSize=16&listenToEvents=true&codeChangeEvent=true"
            title="OneCompiler Embedded Editor"
            allow="clipboard-read; clipboard-write"
          />
        </motion.div>
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="h-8 border-t border-border/50 bg-card/80 flex items-center px-4 text-xs text-muted-foreground flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-3 h-3" />
          <span>CodeJudge AI Compiler</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span>Interactive Compiler with Real-time I/O</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Compiler;
