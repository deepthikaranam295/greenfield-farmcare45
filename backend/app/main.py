import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import logger
from app.middleware.logging import LoggingMiddleware
from app.routers import auth, farms, tasks, reports, users, cameras

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(farms.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(cameras.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"status": "error", "message": "Internal server error"})


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.post("/api/seed-users", include_in_schema=False)
def seed_users():
    import traceback
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    import uuid
    db: Session = SessionLocal()
    try:
        created = []
        for name, email, password, role in [
            ("Admin", "admin@greenfield.com", "Admin@2026", UserRole.admin),
            ("Customer One", "customer@greenfield.com", "Customer@2026", UserRole.customer),
            ("Field Team", "field@greenfield.com", "Field@2026", UserRole.field_team),
        ]:
            if not db.query(User).filter(User.email == email).first():
                db.add(User(id=uuid.uuid4(), name=name, email=email,
                            password_hash=hash_password(password), role=role, is_active=True))
                created.append(email)
        db.commit()
        return {"created": created, "message": "Done"}
    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})
    finally:
        db.close()


# Serve React frontend from dist folder (production / demo sharing)
_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"
if _DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        file = _DIST / full_path
        if file.exists() and file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(_DIST / "index.html"))
