import os
from pathlib import Path

def load_env(env_path=None):
    """
    Lightweight zero-dependency .env loader for AUDIRA scripts.
    Loads key=value pairs into os.environ if not already present.
    """
    if env_path is None:
        root_dir = Path(__file__).resolve().parent.parent
        env_path = root_dir / ".env"
    else:
        env_path = Path(env_path)

    if not env_path.is_file():
        return False

    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ:
                    os.environ[k] = v
        return True
    except Exception:
        return False

# Automatically invoke on import
load_env()
