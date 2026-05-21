from fastapi import APIRouter, status
from sqlalchemy.future import select

from app.core.deps import CurrentUser, DbSession
from app.db.models import Account
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services import auth as auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    user, _ = await auth_service.register_user(db, payload)
    return auth_service.issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    user = await auth_service.authenticate(db, payload)
    return auth_service.issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: DbSession) -> TokenResponse:
    return await auth_service.refresh_tokens(db, payload.refresh_token)


@router.get("/me", response_model=CurrentUserResponse)
async def me(user: CurrentUser, db: DbSession) -> CurrentUserResponse:
    account = (
        await db.execute(select(Account).where(Account.id == user.account_id))
    ).scalar_one()
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        account_id=user.account_id,
        account_name=account.name,
    )
