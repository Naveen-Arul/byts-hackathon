import { motion } from "framer-motion";
import { Code, Play, Shield, Brain, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Code,
    number: "01",
    title: "Write Code",
    description: "Write your solution in our feature-rich code editor",
  },
  {
    icon: Play,
    number: "02",
    title: "Run Code",
    description: "Execute your code with custom test inputs",
  },
  {
    icon: Shield,
    number: "03",
    title: "Secure Execution",
    description: "Code runs in an isolated sandbox environment",
  },
  {
    icon: Brain,
    number: "04",
    title: "AI Analysis",
    description: "AI evaluates logic, efficiency, and quality",
  },
  {
    icon: FileCheck,
    number: "05",
    title: "Get Feedback",
    description: "Receive personalized improvement suggestions",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
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
            A simple, streamlined workflow to help you improve your coding skills.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-6 text-center relative z-10">
                  {/* Step Number */}
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {step.number}
                  </span>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
