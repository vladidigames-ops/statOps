from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.middleware.request_id import RequestIdMiddleware

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    logger.info("startup", env=settings.env, app=settings.app_name)
    yield
    logger.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestIdMiddleware)

    app.include_router(v1_router, prefix=settings.api_v1_prefix)

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"app": settings.app_name, "version": "0.1.0"}

    return app


app = create_app()
