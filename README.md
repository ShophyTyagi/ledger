# Ledger — Invoice Management App

A single-user invoice management app. Django REST API backend, React + TypeScript frontend.

## Screenshots

![Login](screenshots/Login.png)
![Dashboard](screenshots/Dashboard.png)
![Invoices](screenshots/Invoices.png)
![New Invoice](screenshots/New%20Invoice.png)
![Edit Invoice](screenshots/Edit%20Invoice.png)

---

## Tech Stack

- **Backend**: Python 3.10+, Django 4.2, Django REST Framework, SimpleJWT, SQLite
- **Frontend**: React 18, TypeScript, Vite, React Router 6, Axios

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+

---

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
# venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed test user + sample invoices
python manage.py seed

# Start the dev server
python manage.py runserver
```

API available at `http://localhost:8000`

---

### Frontend

```bash
cd frontend

npm install
npm run dev
```

App available at `http://localhost:5173`

---

## Login credentials

| Field    | Value         |
|----------|---------------|
| Username | `admin`       |
| Password | `password123` |

---

## API Reference

All invoice and dashboard endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint               | Description                   | Auth |
|--------|------------------------|-------------------------------|------|
| POST   | `/api/auth/login/`     | Obtain access + refresh token | No   |
| POST   | `/api/auth/refresh/`   | Refresh access token          | No   |
| GET    | `/api/invoices/`       | List all invoices             | Yes  |
| POST   | `/api/invoices/`       | Create invoice                | Yes  |
| GET    | `/api/invoices/:id/`   | Get invoice by ID             | Yes  |
| PUT    | `/api/invoices/:id/`   | Update invoice                | Yes  |
| DELETE | `/api/invoices/:id/`   | Delete invoice                | Yes  |
| GET    | `/api/dashboard/`      | Dashboard summary             | Yes  |

### Invoice object

```json
{
  "id": 1,
  "client_name": "Acme Corp",
  "invoice_number": "INV-001",
  "line_items": [
    { "description": "Web design", "amount": 1500 },
    { "description": "Hosting setup", "amount": 200 }
  ],
  "due_date": "2024-02-15",
  "status": "sent",
  "created_at": "2024-01-10T12:00:00Z",
  "total_amount": 1700
}
```

Status values: `draft` | `sent` | `paid`

### Dashboard response

```json
{
  "total_outstanding": 3200.00,
  "total_paid": 5000.00,
  "counts": { "draft": 2, "sent": 3, "paid": 8 },
  "recent_invoices": [ ... ]
}
```

---

## Project Structure

```
ledger/
├── backend/
│   ├── ledger/              # Django project settings & URLs
│   ├── invoices/            # App: models, views, serializers, URLs
│   │   └── management/
│   │       └── commands/
│   │           └── seed.py  # Creates test user + sample data
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── api/             # axios instance + per-resource API functions
│       ├── components/      # Navbar, PrivateRoute, InvoiceForm
│       ├── context/         # AuthContext (JWT state)
│       ├── pages/           # Login, Dashboard, Invoices, New, Edit
│       ├── styles/          # global.css
│       ├── types/           # TypeScript interfaces
│       ├── App.tsx          # Router + route definitions
│       └── main.tsx
│
└── README.md
```
