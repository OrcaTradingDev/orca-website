from typing import Any, Optional, Dict

def ok(message: Optional[str] = None, **extra: Any) -> Dict[str, Any]:
    payload = {"ok": True}
    if message:
        payload["message"] = message
    if extra:
        payload.update(extra)
    return payload

def err(message: str, code: str = "bad_request", **extra: Any) -> Dict[str, Any]:
    payload = {"ok": False, "error": {"code": code, "message": message}}
    if extra:
        payload.update(extra)
    return payload

