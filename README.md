# Approval Workflow System

A full-stack application for managing and approving internal requests (Leave, Expenses, General). Built with **NestJS** (Backend) and **Next.js** (Frontend) using **Tailwind CSS**.

## Project Structure
- `backend/`: NestJS API with Prisma ORM and PostgreSQL.
- `frontend/`: Next.js dashboard with responsive Tailwind CSS design.

## Prerequisites
- Node.js (v18+)
- A PostgreSQL database (or use the provided database URL in `.env`)

## Setup Instructions

### 1. Backend Setup
1. Open the `backend` folder.
2. Create a `.env` file based on `.env.example`.
3. Run `npm install`.
4. Run `npx prisma db push` to initialize the database schema.
5. Run `npm run dev` to start the server.
   - API will be available at `http://localhost:3001`

### 2. Frontend Setup
1. Open the `frontend` folder.
2. Run `npm install`.
3. Run `npm run dev` to start the UI.
   - Dashboard will be available at `http://localhost:3000`

---

## API Documentation

The system provides a RESTful API for request management. You can also use the included `approval_workflow_collection.json` in Postman.

### Endpoints

#### 1. Create Request
`POST /requests`
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "requestedBy": "string",
    "type": "LEAVE | EXPENSE | GENERAL"
  }
  ```

#### 2. List Requests
`GET /requests`
- **Query Params (Optional)**:
  - `status`: PENDING, APPROVED, REJECTED
  - `type`: LEAVE, EXPENSE, GENERAL

#### 3. Update Status
`PUT /requests/:id/status`
- **Body**:
  ```json
  {
    "status": "APPROVED | REJECTED",
    "role": "MANAGER"
  }
  ```
- *Note: Only requests with a 'MANAGER' role in the body can update status.*

