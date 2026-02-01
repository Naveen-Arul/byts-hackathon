// 📦 Import required packages
const express = require("express");
const cors = require("cors");
const axios = require("axios");
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

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running! 🚀",
    endpoints: {
      run: "POST /run - Execute code"
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

// 🎧 Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📡 OneCompiler API configured and ready`);
});
