# 🌿 GreenField Farm Care

A full-stack farm management platform for landowners in **Anantapur district, Andhra Pradesh**. Built for NRIs and working professionals who own farmland and need a reliable local team to manage it remotely.

**Live stack:** React + TypeScript frontend · FastAPI Python backend · PostgreSQL 16

---

## Features

### Marketing Website (6 pages)
- **Home** — Hero, Why Us, Services preview, How It Works, CTA
- **Services** — 7 service cards with pricing + 3 bundled packages
- **Farm Monitoring & Security** — CCTV setup process, camera features, security patrol pricing
- **Gallery** — Filterable project grid with Framer Motion animations
- **About Us** — Company story, trust cards, service area map
- **Contact** — Enquiry form that sends to WhatsApp + contact details

### Dashboard (role-based)
- **Admin** — full access: farms, tasks, reports, field team management
- **Field Team** — assigned tasks, field reports with photo upload
- **Customer** — view own farms, reports, live camera access

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion, Lucide React, React Router v6 |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, python-jose (JWT), passlib |
| Database | PostgreSQL 16 |
| Storage | AWS S3 (optional — falls back to placeholder URLs) |
| Cache | Redis (optional — graceful fallback if unavailable) |
| DevOps | Docker, docker-compose, pytest |

---

## Project Structure

```
greenfield-farmcare45/
├── backend/
│   ├── app/
│   │   ├── core/           # config, security, logging
│   │   ├── models/         # SQLAlchemy models (User, Farm, Task, Report, Vendor)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic layer
│   │   ├── dependencies/   # Auth guards (get_current_user, require_roles)
│   │   ├── middleware/      # Request logging middleware
│   │   ├── utils/          # Pagination helpers
│   │   └── tests/          # pytest test suite
│   ├── alembic/            # DB migrations
│   ├── seed.py             # Demo data seeder
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    ├── src/
    │   ├── pages/          # Home, Services, FarmMonitoring, Gallery, About, Contact
    │   │   └── dashboard/  # Overview, Farms, FarmDetail, Tasks, Reports
    │   ├── components/     # Navbar, Footer, WhatsAppButton, Layout
    │   │   ├── dashboard/  # Sidebar, StatCard, Badge, Pagination
    │   │   └── ui/         # FadeIn, SectionHeading
    │   ├── api/            # Axios client + endpoint wrappers
    │   ├── contexts/       # AuthContext (JWT + localStorage)
    │   ├── hooks/          # useAuth
    │   └── data/           # services.ts (typed service/package data)
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16

### 1. Clone the repo

```bash
git clone https://github.com/deepthikaranam295/greenfield-farmcare45.git
cd greenfield-farmcare45
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env — set DATABASE_URL with your PostgreSQL credentials

# Run migrations
python -m alembic upgrade head

# Seed demo data
python seed.py

# Start the API server
python -m uvicorn app.main:app --reload --port 8000
```

API will be live at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Website will be live at `http://localhost:5173`

### 4. Docker (alternative — runs everything together)

```bash
cd backend
docker-compose up --build
```

---

## Environment Variables

Create `backend/.env` (see `.env.example`):

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/greenfield_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173

# Optional — S3 photo uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET_NAME=
```

---

## Demo Credentials

After running `python seed.py`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@greenfield.com | Admin@123 |
| Field Team | ramu@greenfield.com | Field@123 |
| Customer | venkat@example.com | Customer@123 |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/farms` | Any role | List farms |
| POST | `/api/farms` | Admin | Create farm |
| GET | `/api/farms/{id}` | Any role | Farm details |
| PUT | `/api/farms/{id}` | Admin | Update farm |
| GET | `/api/tasks/my-tasks` | Field/Admin | Assigned tasks |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/{id}/status` | Field/Admin | Update task status |
| POST | `/api/reports` | Field/Admin | Submit field report |
| POST | `/api/reports/{id}/photos` | Field/Admin | Upload report photos |
| GET | `/health` | Public | Health check |

Full interactive docs: `http://localhost:8000/docs`

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `gf-dark` | `#1B4332` | Navbar, hero backgrounds |
| `gf-mid` | `#2D6A4F` | Buttons, active states |
| `gf-light` | `#40916C` | Accents, icons, hover |
| `gf-pale` | `#D8F3DC` | Light backgrounds, badges |
| `gf-offwhite` | `#F9FDF9` | Page background |

Fonts: **Poppins** (headings) · **Inter** (body)

---

## Contact

**GreenField Farm Care**  
Anantapur, Andhra Pradesh — 515001  
📞 +91 99451 00567  
💬 [WhatsApp](https://wa.me/919945100567)
