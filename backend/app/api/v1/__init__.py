from fastapi import APIRouter

from app.api.v1 import auth, establishments, health, sources

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(establishments.router, prefix="/establishments", tags=["establishments"])
router.include_router(sources.router, prefix="/sources", tags=["sources"])
