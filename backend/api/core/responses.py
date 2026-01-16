from typing import Any, Optional, Dict, Union
from fastapi.responses import JSONResponse
from fastapi import status

def success_response(
    data: Any = None, 
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK
) -> JSONResponse:
    """Standard success response wrapper."""
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return JSONResponse(content=body, status_code=status_code)

def error_response(
    code: str,
    message: str,
    details: Optional[Dict] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> JSONResponse:
    """Standard error response wrapper."""
    body = {
        "success": False,
        "error": {"code": code, "message": message}
    }
    if details:
        body["error"]["details"] = details
    return JSONResponse(content=body, status_code=status_code)
