import { motion } from "framer-motion";
import {
  Code2,
  Shield,
  Brain,
  Timer,
  Sparkles,
  FileText,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Multi-Language Code Editor",
    description: "Write and edit code in Python, Java, C, and C++ with syntax highlighting and auto-formatting.",
  },
  {
    icon: Shield,
    title: "Secure Code Execution",
    description: "Execute your code in a sandboxed environment with real-time output display.",
  },
  {
    icon: Brain,
    title: "AI Logic Analysis",
    description: "Deep analysis of your code's logic flow, identifying potential bugs and improvements.",
  },
  {
    icon: Timer,
    title: "Complexity Feedback",
    description: "Get detailed time and space complexity analysis to optimize your algorithms.",
  },
  {
    icon: Sparkles,
    title: "Code Quality Review",
    description: "Receive suggestions for better coding practices, naming conventions, and style.",
  },
  {
    icon: FileText,
    title: "Detailed AI Reports",
    description: "Comprehensive feedback reports with actionable insights and learning resources.",
  },
  {
    icon: GraduationCap,
    title: "Practice & Interview Mode",
    description: "Prepare for coding interviews with curated problems and timed challenges.",
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="py-24 md:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-muted-foreground">
            A comprehensive platform designed to help you write better code and learn faster.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card-hover p-6 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
