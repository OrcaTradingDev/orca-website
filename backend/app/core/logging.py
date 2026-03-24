import logging
import sys
import os

def setup_logging():
    # 1. Check if already configured
    root = logging.getLogger()
    if root.handlers:
        return

    # 2. Get level from Environment (Production default: INFO)
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    root.setLevel(log_level)

    # 3. Create a clean, readable formatter
    # Including [%(process)d] is helpful in trading if you use multiple workers
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    root.addHandler(handler)

    # 4. Silence noisy third-party libraries
    # You don't want 'HTTP/1.1 200 OK' cluttering your logs every second 
    # during health checks.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("authlib").setLevel(logging.INFO)
