from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


# Erorr Response Pydantic Model 

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    error_code: str
    trace_id : str | None = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        json_schema_extra={
            "example" : {
                "status" : "error",
                "message" : "An unexpected error occured.",
                "errorCode" : "INTERNAL_SERVER_ERROR",
                "traceId" : "550e8400-e29b-41d4-a716-446655440000"
            }
        }
    )


