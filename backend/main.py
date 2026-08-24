from __future__ import annotations

import os
import subprocess
from app.main import app


def kill_process_on_port(port: int) -> None:
    """Finds and kills any process occupying the given TCP port on Windows."""
    try:
        # Run netstat to find PIDs listening on this port
        output = subprocess.check_output(
            f'netstat -ano | findstr ":{port} "', shell=True
        ).decode("utf-8", errors="ignore")

        pids = set()
        for line in output.strip().split("\n"):
            parts = line.strip().split()
            if len(parts) >= 5 and parts[-1].isdigit():
                # On Windows netstat -ano output format:
                # Proto  Local Address          Foreign Address        State           PID
                # TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING       1234
                state = parts[3]
                if state == "LISTENING":
                    pids.add(int(parts[-1]))

        current_pid = os.getpid()
        for pid in pids:
            if pid != current_pid and pid != 0:
                print(f"[Port Guard] Port {port} is occupied by PID {pid}. Terminating process...")
                # Forcefully kill the process holding the port
                subprocess.run(
                    f"taskkill /F /PID {pid}",
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
    except subprocess.CalledProcessError:
        # netstat returns exit code 1 if findstr doesn't match anything (port is already free)
        pass
    except Exception as e:
        print(f"[Port Guard] Error trying to clear port {port}: {e}")


if __name__ == "__main__":
    import uvicorn
    from app.core.config import PORT

    # Free the port before starting the server
    kill_process_on_port(PORT)

    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
