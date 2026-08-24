import {
  Brain,
  CircuitBoard,
  FlaskConical,
  Gauge,
  Lock,
  ScanSearch,
  Swords,
  MessageSquareText,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type AgentDef = {
  id: string;
  name: string;
  purpose: string;
  icon: LucideIcon;
};

export const AGENTS: AgentDef[] = [
  { id: "intent", name: "Intent Detection", purpose: "Infers the programming task from the source code.", icon: Brain },
  { id: "logic", name: "Logic Evaluation", purpose: "Checks whether the logic actually solves the inferred task.", icon: CircuitBoard },
  { id: "testcases", name: "Test Case Generation", purpose: "Derives edge cases the code should survive.", icon: FlaskConical },
  { id: "complexity", name: "Complexity Analysis", purpose: "Estimates time and space behaviour and better alternatives.", icon: Gauge },
  { id: "hardcoding", name: "Hardcoding Detection", purpose: "Flags answers baked in instead of computed.", icon: ScanSearch },
  { id: "security", name: "Security & Safety", purpose: "Looks for unsafe calls, injection risks and data leaks.", icon: Lock },
  { id: "adversarial", name: "Adversarial Testing", purpose: "Stresses the solution with hostile inputs.", icon: Swords },
  { id: "feedback", name: "Feedback Synthesis", purpose: "Turns findings into actionable, personalized guidance.", icon: MessageSquareText },
  { id: "judge", name: "Master Judge", purpose: "Weighs every agent and issues the final verdict.", icon: Scale },
];

export const PIPELINE_STEPS = [
  "Understanding submitted code",
  "Inferring programming task",
  "Evaluating logical correctness",
  "Analyzing test cases and edge cases",
  "Analyzing complexity",
  "Detecting hardcoding",
  "Checking security and safety",
  "Performing adversarial analysis",
  "Generating personalized feedback",
  "Preparing final evaluation",
];
