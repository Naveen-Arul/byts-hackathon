# Code Guardian AI

Create a modern, ultra-clean AI Code Review & Automated Judging web application named "CodeJudge AI" using React, Tailwind CSS, Monaco Editor, Lucide Icons, and Framer Motion.

--- DESIGN & COLOR PALETTE INSTRUCTIONS ---

- Aesthetic: Frosted glassmorphism, glossy reflective highlights, soft ambient glows, subtle border gradients, smooth micro-interactions, and premium typography (Inter/Outfit).

- STRICT COLOR CONSTRAINT: NO dark themes, NO dark blue, and NO purple.

- Allowed Colors: Light mode only. Crisp white (#FFFFFF), frosted porcelain (#F8FAFC), subtle slate borders (#E2E8F0), emerald/mint green for success (#10B981), warm amber for warnings (#F59E0B), soft coral for errors (#EF4444), and vibrant sky blue (#0EA5E9) for primary buttons/accents.

--- PAGES TO GENERATE ---

1. Landing Page (/):

   - Glassmorphic Hero section with interactive CTA ("Try AI Code Judge").

   - Feature grid highlighting 9-Agent AI Analysis (Logic, Complexity, Security, Hardcoding, Testcases).

   - "How it works" step-by-step visual cards.

2. Code Submission / Editor Workspace (/compiler):

   - Code Editor card using Monaco Editor (theme: light/vs).

   - Language selector dropdown (Python, JavaScript, Java, C++).

   - Pre-populated starter code templates for each language.

   - Prominent "Evaluate Code with AI" button with smooth loading state and spinner.

3. Results Page (/review-results):

   - MUST BE A CLEAN, UNCLUTTERED, SINGLE-PAGE DISPLAY organized cleanly into distinct light glassmorphic sections:

     * Section 1 - Key Metrics Header: Overall Score (0-100 gauge), Verdict Badge (e.g. "Excellent Solution"), Inference Confidence %, and Quick Stats.

     * Section 2 - Inferred Problem Summary: AI-detected problem title, problem statement, algorithm technique, and sample input/output.

     * Section 3 - Score Cards Grid: 4 distinct glass cards displaying Logic Correctness (/10), Algorithmic Efficiency (/10), Code Quality (/10), and Scalability (/10).

     * Section 4 - Logic & Edge Case Evaluation: Detailed breakdown showing covered vs uncovered edge cases and critical gaps.

     * Section 5 - Time & Space Complexity Analysis: Comparison table showing "Current Approach" vs "Optimized Approach" (O(1), O(N), O(N log N)).

     * Section 6 - Security & Quality Insights: Cards listing Strengths, Bad Practices, Security Flaws, and Hardcoding Detection status.

     * Section 7 - Suggested Optimization & Improved Code: Clean side-by-side or stacked diff viewer displaying AI-recommended improved code snippet.

--- BACKEND API INTEGRATION DETAILS ---

Connect the frontend to the backend REST API:

- Base API URL: `http://localhost:5000` (or `import.meta.env.VITE_API_BASE_URL`)

- Primary Endpoint: `POST /evaluate`

- Health Check Endpoint: `GET /`

API Request Payload:

```json

{

  "language": "python",

  "student_code": "def solve():\n    print('Hello World')"

}

Expected API Response Schema:
{

  "status": "success",

  "review": {

    "score": 85,

    "confidence": 95,

    "verdict": "Good Solution",

    "inferred_problem": {

      "title": "Detected Problem Title",

      "statement": "Detailed problem description",

      "algorithm": "Dynamic Programming",

      "expected_input": "n = 5",

      "expected_output": "15",

      "confidence": 90

    },

    "scoring": {

      "logic_correctness": "9/10",

      "efficiency": "8/10",

      "code_quality": "8/10",

      "scalability": "9/10",

      "overall_score": "85",

      "grade": "B"

    },

    "logic_evaluation": {

      "is_correct": true,

      "correctness_confidence": "95%",

      "explanation": "Logic is sound.",

      "edge_cases_coverage": {

        "score": "4/5",

        "covered": ["Empty inputs", "Single element"],

        "not_covered": ["Large integer overflow"],

        "critical_gaps": []

      }

    },

    "complexity_analysis": {

      "time_complexity": { "current": "O(N)" },

      "space_complexity": { "current": "O(1)" },

      "comparison_table": {

        "current_approach": { "time": "O(N^2)", "space": "O(N)", "description": "Nested loops" },

        "optimized_approach": { "time": "O(N log N)", "space": "O(1)", "description": "Sorting based solution" }

      }

    },

    "hardcoding_detected": false,

    "security_issues": [],

    "feedback": ["Great use of descriptive variables."],

    "code_quality": {

      "readability_score": 8,

      "maintainability_score": 8,

      "style_score": 9,

      "good_practices": ["Modular functions"],

      "bad_practices": []

    },

    "improved_code_snippet": "# AI Optimized Version\ndef solve():\n    pass"

  },

  "metadata": {

    "model": "groq-llama-3.3-70b-versatile",

    "language": "python",

    "timestamp": "2026-08-11T15:40:00Z"

  }

}

Ensure full error handling with toast notifications if the API call fails or returns an error.

\--- IMPORTANT PRODUCT SCOPE ---

This is Stage 1 of CodeJudge AI.

The compiler is completely PUBLIC and must be usable without authentication.

DO NOT create:

- Login page

- Register page

- Authentication

- User profiles

- User dashboard

- User history

- Saved submissions

- Database-dependent frontend features

- Subscription/payment pages

A visitor should be able to:

Landing Page

    ↓

Try AI Code Judge

    ↓

Public Compiler

    ↓

Write/Paste Code

    ↓

Evaluate Code with AI

    ↓

AI Analysis Progress

    ↓

Final Review Results

No login or account creation should be required at any point.

The primary product experience is the AI-powered compiler and evaluation report.

\--- GLOBAL NAVIGATION ---

Create a clean responsive navbar used across the website.

Logo:

"CodeJudge AI"

Navigation:

- Home

- AI Code Judge

- How It Works

- About

Primary CTA:

"Try AI Code Judge"

The navbar should remain minimal and should not contain Login/Register buttons.

On mobile, use a clean hamburger menu.

\--- LANDING PAGE ADDITIONS ---

Add a clear product positioning section explaining:

Traditional Online Judge:

"Did your code produce the expected output?"

CodeJudge AI:

"Does your code actually solve the problem correctly, efficiently, and robustly?"

Add a visual comparison:

Traditional Judge

- Predefined test cases

- Pass/Fail

- Limited feedback

- Basic correctness checking

CodeJudge AI

- AI-powered code understanding

- Multi-agent evaluation

- Logic analysis

- Complexity analysis

- Security analysis

- Adversarial testing

- Hardcoding detection

- Personalized feedback

Add a "9 AI Agents" visualization showing:

1. Intent Detection

2. Logic Evaluation

3. Test Case Generation

4. Complexity Analysis

5. Hardcoding Detection

6. Security & Safety

7. Adversarial Testing

8. Feedback Synthesis

9. Master Judge

Use a clean visual pipeline rather than a dense technical diagram.

\--- PUBLIC COMPILER EXPERIENCE ---

The compiler must clearly communicate:

"No login required"

"Paste or write your code and let AI analyze it."

Compiler layout:

- Language selector

- Monaco Editor

- Code formatting button

- Copy code button

- Clear editor button

- Character count

- Evaluate Code with AI button

Do NOT add a traditional "Run Code" button unless an actual execution/sandbox API exists.

The current Stage 1 system analyzes submitted source code using AI agents. It does not claim to execute arbitrary code.

The main CTA should be:

"Evaluate Code with AI"

Secondary action:

"Clear"

\--- CODE INPUT VALIDATION ---

Before submitting:

- Reject completely empty code.

- Show a friendly validation message.

- Preserve the selected programming language.

- Prevent accidental duplicate submissions while evaluation is running.

- Disable the Evaluate button during submission.

- Allow cancellation only if the backend supports request cancellation.

Show:

"Your code is analyzed by multiple AI agents."

\--- AI ANALYSIS EXPERIENCE ---

After clicking "Evaluate Code with AI", navigate to or display a dedicated analysis state.

Create a premium AI evaluation progress interface.

Show the evaluation pipeline:

1. Understanding submitted code

2. Inferring programming task

3. Evaluating logical correctness

4. Analyzing test cases and edge cases

5. Analyzing complexity

6. Detecting hardcoding

7. Checking security and safety

8. Performing adversarial analysis

9. Generating personalized feedback

10. Preparing final evaluation

Use animated progress indicators.

Do NOT claim an agent has completed if the backend has not actually reported completion.

If the backend only returns one final response, use an indeterminate AI analysis animation instead of displaying fake real-time agent completion.

Display:

"AI agents are analyzing your code..."

"Final Judge is preparing your evaluation..."

\--- RESULTS PAGE ADDITIONS ---

Add a sticky or easily accessible results header containing:

- Overall Score

- Verdict

- Confidence

- Programming Language

- Detected Problem

- Analyze Another Code button

Add a "Back to Compiler" action.

Add a "Copy Report" button.

Add an "Export Report" button only if the frontend can actually generate/export the report.

\--- RESULTS PAGE AGENT INSIGHTS ---

Add a dedicated "Agent Insights" section.

Display the 9 agents as expandable cards:

Intent Detection

Logic Evaluation

Test Case Generation

Complexity Analysis

Hardcoding Detection

Security & Safety

Adversarial Testing

Feedback Synthesis

Master Judge

Each card should display:

- Agent name

- Status

- Score if available

- Confidence if available

- Key findings

- Important evidence

- Short explanation

Use accordions/tabs to prevent the page from becoming visually overwhelming.

The Master Judge should be visually emphasized as the final decision.

\--- SCORE VISUALIZATION ---

Use consistent score categories:

90-100:

Excellent

80-89:

Very Good

70-79:

Good

60-69:

Satisfactory

40-59:

Needs Improvement

0-39:

Poor

Do not invent scores on the frontend.

Always display the values returned by the backend.

\--- INFERRED PROBLEM SECTION ---

Clearly label the problem as AI-inferred.

Display:

"AI-Inferred Programming Task"

Do NOT imply that the user explicitly provided the problem statement.

Show:

- Problem title

- Inferred description

- Detected algorithm/technique

- Expected input

- Expected output

- Inference confidence

If inference confidence is low, display:

"Problem inference is uncertain"

and explain that the evaluation should be interpreted accordingly.

\--- EMPTY / UNKNOWN PROBLEM STATE ---

The system must gracefully handle code where a programming problem cannot reliably be inferred.

Example:

Hello World programs

Incomplete code

Very short snippets

Utility functions without context

Syntax fragments

Display:

"Unable to confidently infer the original programming problem."

Still show available analysis such as:

- Code structure

- Complexity observations

- Security observations

- Code quality

- General recommendations

Never fabricate a problem statement.

\--- ERROR STATES ---

Create polished error states for:

1. Backend unavailable

2. API timeout

3. Rate limit

4. Invalid API response

5. Malformed agent output

6. Evaluation failure

7. Network failure

Use Sonner toast notifications plus an inline error state.

Example:

"AI evaluation could not be completed."

Actions:

"Try Again"

"Return to Compiler"

Do not expose raw Python stack traces, API keys, provider errors, or internal backend details.

\--- LOADING STATES ---

Use skeleton loaders for the results page.

Do not show a blank white screen while waiting.

The UI should clearly communicate that AI analysis is in progress.

Use subtle Framer Motion animations.

Avoid excessive animation.

\--- RESPONSIVE DESIGN ---

The entire application must work properly on:

- Desktop

- Laptop

- Tablet

- Mobile

The Monaco editor should have an appropriate minimum height.

Results cards should collapse cleanly on smaller screens.

Tables should become horizontally scrollable or transform into responsive cards.

\--- ACCESSIBILITY ---

Use:

- Semantic HTML

- Keyboard navigation

- Accessible buttons

- Visible focus states

- Proper ARIA labels where necessary

- Sufficient text contrast

- Tooltips for unfamiliar icons

Do not rely only on color to communicate success, warning, or error.

\--- FRONTEND STATE MANAGEMENT ---

Maintain clear states:

IDLE

SUBMITTING

ANALYZING

SUCCESS

ERROR

Prevent duplicate evaluation requests.

Persist the current code only in frontend state/local storage if useful.

Do not create authentication-dependent persistence.

\--- API CONFIGURATION ---

Never hardcode production API URLs inside components.

Use:

VITE_API_BASE_URL

Example:

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

The frontend should call:

POST ${API_BASE_URL}/evaluate

Health check:

GET ${API_BASE_URL}/health

Do not expose API keys in frontend code.

\--- API RESPONSE SAFETY ---

The backend uses AI-generated structured JSON.

The frontend must NEVER assume that every optional field exists.

Safely handle:

- null

- undefined

- empty arrays

- missing agent results

- unexpected nested structures

- malformed strings

Create reusable safe rendering utilities.

A missing agent result must not crash the entire results page.

\--- PRODUCT FOOTER ---

Create a minimal footer containing:

CodeJudge AI

"AI-powered coding evaluation and personalized feedback."

Links:

- Home

- AI Code Judge

- How It Works

- About

Add:

"Built with React, FastAPI, LangGraph, LangChain and Generative AI."

Do not add unnecessary social media links or fake company information.

\--- DESIGN PRINCIPLES ---

The website must feel like a real premium developer tool rather than a generic AI landing page.

Prioritize:

- Clean information hierarchy

- Developer-focused UI

- Excellent typography

- Generous spacing

- Minimal visual clutter

- Smooth transitions

- Strong editor experience

- Clear evaluation results

- Professional data visualization

Avoid:

- Excessive gradients

- Excessive glass blur

- Huge decorative illustrations

- Unnecessary animations

- Fake statistics

- Fake testimonials

- Fake user reviews

- Fake customer logos

- Fake performance claims

Every displayed metric must come from the backend or be explicitly static product information.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f95fed07-d3a1-4588-abd1-83063e92e8c7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
