# Backend API Server
# Backend API Server

FastAPI backend for CodeJudge AI. The backend uses LangGraph and LangChain to judge submitted code with a multi-agent workflow.

## Quick Start

```bash
pip install -r requirements.txt
python run.py
```

The server runs at `http://localhost:5000`.

## Environment Variables

Create a `.env` file in this folder:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
PORT=5000
CORS_ORIGINS=http://localhost:5173
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   ├── agents/
│   ├── core/
│   ├── graph/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── main.py
├── run.py
├── requirements.txt
└── README.md
```

## API

### `GET /`
Health check endpoint.

### `POST /evaluate`
Submits code to the LangGraph evaluation engine.

Request body:

```json
{
  "problem_statement": "...",
  "sample_input": "...",
  "sample_output": "...",
  "student_code": "print('Hello World')",
  "language": "python",
  "student_explanation": "..."
}
```

Compatibility alias:

### `POST /submit-code`
Same behavior as `/evaluate` for older clients.

Response shape:

```json
{
  "status": "success",
  "review": {
    "score": 91,
    "confidence": 94,
    "overall_feedback": "..."
  },
  "metadata": {
    "model": "llama-3.1-8b-instant",
    "language": "python",
    "timestamp": "...",
    "code_truncated_for_review": false
  }
}
```
    "model": "llama-3.1-8b-instant",
    "language": "python",
    "timestamp": "...",
    "code_truncated_for_review": false
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "AI code review failed",
  "message": "..."
}
```

## Testing

Test with PowerShell:
```powershell
$body = @{
    language = "python"
    code = "print('Hello from Backend!')"
    input = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/submit-code" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Project Structure

```
backend/
├── .env
├── .gitignore
├── graph.py
├── main.py
├── requirements.txt
├── schemas.py
└── README.md
```
