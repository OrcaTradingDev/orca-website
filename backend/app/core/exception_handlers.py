import logging 
import uuid
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.common.responses import ErrorResponse

# Get a logger specific to global error handler
logger = logging.getLogger("app.core.exception_handlers")

async def universal_async_handler(request : Request, exc : Exception):
    error_id = str(uuid.uuid4())

    logger.error(
        f"Unhandled Exception: {repr(exc)} | ID: {error_id} | Path : {request.url.path}",
        exc_info=True
    )

    error_content = ErrorResponse(
        message="Something went wrong on our end, Please contact the support with the trace ID.",
        error_code="INTERNAL_SERVER_ERROR",
        trace_id=error_id
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_content.model_dump(by_alias=True)
    )
