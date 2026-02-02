// 📦 Import required packages
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Groq = require("groq-sdk");
require("dotenv").config(); // Load .env file

// 🚀 Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json()); // Parse JSON request bodies

// 🔐 OneCompiler API Configuration (from .env)
const ONECOMPILER_URL = process.env.ONECOMPILER_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// 🤖 Groq AI Configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running! 🚀",
    endpoints: {
      run: "POST /run - Execute code",
      review: "POST /review - AI Code Review"
    }
  });
});

// 🔁 Run Code API
app.post("/run", async (req, res) => {
  try {
    const { language, code, input } = req.body;

    // Validate request
    if (!language || !code) {
      return res.status(400).json({
        error: "Missing required fields: language and code"
      });
    }

    // Build request payload for OneCompiler
    const payload = {
      language: language,
      stdin: input || "",
      files: [
        {
          name: "index",
          content: code
        }
      ]
    };

    // Call OneCompiler API
    const response = await axios.post(
      ONECOMPILER_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY
        }
      }
    );

    // Send execution result back to frontend
    res.json(response.data);

  } catch (error) {
    console.error("❌ Error executing code:", error.message);
    
    // Send error response
    res.status(500).json({
      status: "error",
      error: "Code execution failed",
      message: error.response?.data?.message || error.message
    });
  }
});

// 🤖 AI Code Review API
app.post("/review", async (req, res) => {
  try {
    const { language, code, problemStatement } = req.body;

    // Validate request
    if (!language || !code) {
      return res.status(400).json({
        error: "Missing required fields: language and code"
      });
    }

    // Build comprehensive AI prompt for competition-grade code review
    const systemPrompt = `You are an elite code reviewer, algorithm expert, and interview coach.
Your goal is to provide comprehensive, multi-dimensional code analysis that goes beyond basic evaluation.
Identify ALL possible algorithm patterns, provide interview-ready insights, and mentor the student.
CRITICAL: You MUST provide exactly 4 progressive improvement levels (6/10, 7/10, 8/10, 9-10/10) with complete, distinct code examples for each level. Never skip levels or provide fewer than 4 improvement steps.
Always respond in valid JSON format only, with no additional text before or after the JSON.`;

    const userPrompt = `Perform a comprehensive, competition-grade analysis of the following ${language} code.
${problemStatement ? `Problem Context: ${problemStatement}` : ''}

Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide your analysis in this EXACT JSON structure with ALL fields:

{
  "problem_understanding": "Brief description of what the code attempts to solve",
  
  "identified_patterns": [
    {
      "pattern_name": "Primary algorithm/pattern name (e.g., Two Pointer, Sliding Window, Dynamic Programming)",
      "confidence": "percentage (e.g., 85%)",
      "description": "Why this pattern fits"
    },
    {
      "pattern_name": "Secondary or alternative pattern detected",
      "confidence": "percentage",
      "description": "Alternative interpretation"
    }
  ],
  
  "logic_evaluation": {
    "is_correct": true/false,
    "correctness_confidence": "percentage (e.g., 90%)",
    "explanation": "Detailed logic analysis with reasoning",
    "edge_cases_coverage": {
      "score": "X/5",
      "covered": ["list of handled edge cases"],
      "not_covered": ["list of missing edge cases"],
      "critical_gaps": ["most important missing validations"]
    }
  },
  
  "complexity_analysis": {
    "time_complexity": {
      "current": "Big-O notation",
      "justification": "Step-by-step breakdown",
      "best_case": "Best case Big-O",
      "worst_case": "Worst case Big-O",
      "average_case": "Average case Big-O"
    },
    "space_complexity": {
      "current": "Big-O notation",
      "justification": "Memory usage breakdown",
      "auxiliary_space": "Extra space used"
    },
    "comparison_table": {
      "current_approach": {
        "time": "Big-O",
        "space": "Big-O"
      },
      "optimized_approach": {
        "time": "Potential better Big-O",
        "space": "Potential better Big-O",
        "description": "Brief description of optimized approach"
      }
    },
    "scalability_impact": "How this performs with large inputs (n > 10^4)"
  },
  
  "performance_issues": [
    {
      "issue": "Specific performance problem",
      "severity": "High/Medium/Low",
      "location": "Where in code",
      "impact": "Real-world consequence"
    }
  ],
  
  "optimization_suggestions": [
    {
      "suggestion": "Specific optimization",
      "expected_improvement": "e.g., O(n²) → O(n log n)",
      "difficulty": "Easy/Medium/Hard",
      "priority": "High/Medium/Low"
    }
  ],
  
  "alternative_approaches": [
    {
      "approach_name": "Alternative algorithm/pattern name",
      "description": "How it works conceptually",
      "complexity": "Time and space complexity",
      "when_to_use": "Best use case"
    }
  ],
  
  "code_quality": {
    "readability_score": 1-10,
    "maintainability_score": 1-10,
    "style_score": 1-10,
    "comments": "Detailed assessment of code style and readability",
    "good_practices": ["list of good coding practices found"],
    "bad_practices": ["list of issues found"]
  },
  
  "interview_perspective": {
    "would_pass_interview": true/false,
    "interview_level": "Entry/Mid/Senior",
    "feedback": "What interviewer would say about this solution",
    "follow_up_questions": [
      "Question 1 interviewer might ask",
      "Question 2 based on the code",
      "Question 3 to test deeper understanding"
    ],
    "hints_for_optimization": ["Hint without giving full solution"]
  },
  
  "learning_recommendations": {
    "concepts_to_review": ["Topics student should study based on code"],
    "similar_problems": ["Related problems to practice"],
    "resources": ["Suggested learning resources or topics"]
  },
  
  "risk_analysis": {
    "performance_risk": "Low/Medium/High and why",
    "memory_risk": "Assessment of memory safety",
    "edge_case_risk": "Risk of edge case failures",
    "production_readiness": "Would this work in production?"
  },
  
  "scoring": {
    "logic_correctness": "X/10",
    "efficiency": "X/10",
    "code_quality": "X/10",
    "scalability": "X/10",
    "overall_score": "X/10",
    "grade": "A+/A/B+/B/C/D/F"
  },
  
  "improved_code_snippet": "Optional: Show key optimization (not full rewrite)",
  
  "overall_feedback": "Comprehensive summary with encouragement and clear next steps",
  
  "template_similarity": {
    "resembles_common_pattern": true/false,
    "pattern_name": "If resembles a known template",
    "uniqueness_score": "X/10"
  },
  
  "progressive_improvements": {
    "current_score": "Current overall score (e.g., 5/10)",
    "improvement_path": [
      {
        "target_score": "6/10",
        "what_to_improve": "Specific improvement needed to reach this score",
        "code_example": "COMPLETE, FULL working code at 6/10 level - must be DIFFERENT from original code. Show ENTIRE solution with all imports, main method, and complete logic. NO ellipsis (...), NO snippets, NO truncation. IMPORTANT: Return as plain text without markdown code fences or backticks.",
        "key_changes": ["List of 2-3 specific changes made from original code"]
      },
      {
        "target_score": "7/10",
        "what_to_improve": "Next level improvement - must be DIFFERENT from 6/10 code",
        "code_example": "COMPLETE, FULL working code at 7/10 level with cumulative improvements. Must show NEW optimizations beyond 6/10 version. Show ENTIRE solution from imports to closing braces. NO ... or partial code. Return raw code without markdown formatting.",
        "key_changes": ["2-3 additional changes on top of 6/10 version"]
      },
      {
        "target_score": "8/10",
        "what_to_improve": "Advanced optimization - must introduce NEW improvements beyond 7/10",
        "code_example": "COMPLETE, FULL optimized code at 8/10 level. Must be SIGNIFICANTLY DIFFERENT from 7/10 code. Show the COMPLETE working solution with better algorithm/data structure. NO truncation or ellipsis. Plain text only.",
        "key_changes": ["2-3 advanced improvements beyond 7/10 version"]
      },
      {
        "target_score": "9-10/10",
        "what_to_improve": "Near-perfect solution with production-grade quality - must be SUPERIOR to 8/10",
        "code_example": "COMPLETE, FULL production-ready code at 9-10/10 level. Must include edge cases, optimal complexity, clean code practices that 8/10 lacks. Show the ENTIRE highly optimized solution with all details. NO ... or shortcuts. Return as executable code text.",
        "key_changes": ["2-3 final touches for excellence beyond 8/10 version"]
      }
    ]
  }
}

CRITICAL INSTRUCTIONS FOR PROGRESSIVE IMPROVEMENTS:
1. You MUST ALWAYS provide EXACTLY 4 improvement levels in the improvement_path array: 6/10, 7/10, 8/10, and 9-10/10
2. DO NOT skip any levels - include all four entries even if the current score is already high
3. Each improvement level (6, 7, 8, 9-10) MUST show GENUINELY DIFFERENT code
4. Do NOT copy the same code multiple times - each level should BUILD UPON and IMPROVE the previous
5. Examples of progressive improvements:
   - 6/10: Fix basic logic errors, add input validation
   - 7/10: Optimize from O(n²) to O(n log n) with sorting
   - 8/10: Further optimize to O(n) using hash map/set
   - 9-10/10: Add comprehensive edge cases, error handling, clean code practices
6. Each code_example MUST be COMPLETE, RUNNABLE code with:
   - All necessary imports
   - Complete class/function definitions  
   - Full implementation (NO // ... or ellipsis)
   - All edge case handling
   - Closing braces and proper syntax
7. Show ACTUAL IMPLEMENTATION differences, not just comments about what to change
8. CRITICAL: In the code_example field, return ONLY plain code text. NEVER wrap it in markdown code blocks or backticks. Return raw, executable code that can be directly displayed.
9. Do NOT escape special characters unnecessarily. Return natural code syntax.

MANDATORY: For ALL code submissions (regardless of current score), provide the complete progressive_improvements section with ALL 4 distinct improvement levels (6/10, 7/10, 8/10, 9-10/10) with different code examples at each level.

Be thorough, insightful, and educational. Identify ALL possible patterns the code might be using.`;

    // Call Groq LLaMA API
    console.log("🤖 Sending code to AI for comprehensive review...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    // Extract AI response
    const aiResponse = chatCompletion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    const reviewResult = JSON.parse(aiResponse);

    // Send structured feedback to frontend
    res.json({
      status: "success",
      review: reviewResult,
      metadata: {
        model: "llama-3.1-8b-instant",
        language: language,
        timestamp: new Date().toISOString(),
        tokens_used: chatCompletion.usage?.total_tokens || 0
      }
    });

    console.log("✅ AI review completed successfully");

  } catch (error) {
    console.error("❌ Error in AI code review:", error.message);
    
    // Send error response
    res.status(500).json({
      status: "error",
      error: "AI code review failed",
      message: error.message
    });
  }
});

// 🎧 Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📡 OneCompiler API configured and ready`);
  console.log(`🤖 Groq AI (LLaMA 3.1 8B) configured for code review`);
});
