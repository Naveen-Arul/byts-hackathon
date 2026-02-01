# Backend API Server

Node.js + Express backend for CodeJudge AI compiler.

## 🚀 Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start server
node index.js
```

Server runs at: `http://localhost:5000`

## 🔐 Environment Variables

Configure in `.env` file:

```env
RAPIDAPI_KEY=your_key_here
RAPIDAPI_HOST=onecompiler-apis.p.rapidapi.com
ONECOMPILER_URL=https://onecompiler-apis.p.rapidapi.com/api/v1/run
PORT=5000
```

## 📡 API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Backend is running! 🚀",
  "endpoints": {
    "run": "POST /run - Execute code"
  }
}
```

### `POST /run`
Execute code using OneCompiler API

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello World')",
  "input": ""
}
```

**Response (Success):**
```json
{
  "status": "success",
  "stdout": "Hello World\n",
  "stderr": "",
  "executionTime": 9,
  "memoryUsed": 9816,
  "compilationTime": 0
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Code execution failed",
  "message": "..."
}
```

## 🧪 Testing

Test with PowerShell:
```powershell
$body = @{
    language = "python"
    code = "print('Hello from Backend!')"
    input = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/run" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## 📁 Project Structure

```
backend/
├── .env              # Environment variables (not in Git)
├── .gitignore        # Git ignore rules
├── index.js          # Main server file
├── package.json      # Dependencies
└── README.md         # This file
```

## 🔒 Security

- API keys stored in `.env` (not committed to Git)
- CORS enabled for frontend communication
- Input validation on all endpoints

## 🌐 Supported Languages

- Python
- JavaScript
- Java
- C
- C++
- And many more via OneCompiler API
