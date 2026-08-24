from main_part1 import app, kill_process_on_port

if __name__ == "__main__":
    import uvicorn
    from app.core.config import PORT

    kill_process_on_port(PORT)
    uvicorn.run("main_part1:app", host="0.0.0.0", port=PORT, reload=False)
