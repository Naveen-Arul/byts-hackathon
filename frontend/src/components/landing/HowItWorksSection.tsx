import { motion } from "framer-motion";
import { Code, Send, Brain, GitBranch, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Code,
    number: "01",
    title: "Write Code",
    description: "Paste or write your solution in the Monaco editor",
  },
  {
    icon: Send,
    number: "02",
    title: "Submit to AI",
    description: "Send code without choosing a predefined question",
  },
  {
    icon: GitBranch,
    number: "03",
    title: "Intent Detection",
    description: "AI infers the programming task from your code",
  },
  {
    icon: Brain,
    number: "04",
    title: "Multi-Agent Review",
    description: "Specialist agents evaluate logic, complexity, security, and more",
  },
  {
    icon: FileCheck,
    number: "05",
    title: "Judge Report",
    description: "Receive a combined educational evaluation with detected task and score",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground">
            Write code, let AI infer the task, and get a full judge report in one flow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 text-center relative"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary/60">{step.number}</span>
              <h3 className="font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
