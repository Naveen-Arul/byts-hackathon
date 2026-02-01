import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodingTimerProps {
  isTyping: boolean;
  editorFocused: boolean;
}

const CodingTimer = ({ isTyping, editorFocused }: CodingTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start when user starts typing
  useEffect(() => {
    if (isTyping && !hasStarted) {
      setIsRunning(true);
      setHasStarted(true);
    }
  }, [isTyping, hasStarted]);

  // Pause/resume based on editor focus
  useEffect(() => {
    if (hasStarted) {
      setIsRunning(editorFocused);
    }
  }, [editorFocused, hasStarted]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    setHasStarted(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50"
    >
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">Active Coding Time</span>
      </div>

      <div
        className={`font-mono text-sm font-semibold min-w-[52px] text-center ${
          isRunning ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {formatTime(seconds)}
      </div>

      <div className="flex items-center gap-1">
        {!isRunning ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleStart}
            title="Start"
          >
            <Play className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handlePause}
            title="Pause"
          >
            <Pause className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {isRunning && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default CodingTimer;
