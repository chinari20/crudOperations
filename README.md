# Task Management REST API

A beginner-friendly REST API built with Node.js, Express, MongoDB, and JWT authentication. Users can register, log in, and manage their own tasks.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Create, read, update, and delete tasks
- Each user can access only their own tasks
- Input validation and useful HTTP status codes

## Requirements

- Node.js (version 18 or later recommended)
- MongoDB running locally, or a MongoDB Atlas connection string
- Postman (for testing)

## Setup

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to a new file named `.env`.
5. Update `MONGO_URI` and set a private, long `JWT_SECRET`.
6. Start MongoDB if you are using a local database.
7. Start the server:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000`.

## Authentication

Register and then log in to receive a JWT token. For every task endpoint, send this header:

```text
Authorization: Bearer <JWT_TOKEN>
```

Task endpoints return `401` if the token is missing, invalid, or expired.

## API endpoints

Base URL: `http://localhost:5000`

### 1. Register

`POST /api/auth/register`

Request body:

```json
{
  "name": "Chinari",
  "email": "chinari@example.com",
  "password": "password123"
}
```

Success: `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "USER_ID",
    "name": "Chinari",
    "email": "chinari@example.com"
  }
}
```

### 2. Login

`POST /api/auth/login`

Request body:

```json
{
  "email": "chinari@example.com",
  "password": "password123"
}
```

Success: `200 OK`

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Chinari",
    "email": "chinari@example.com"
  }
}
```

### 3. Create a task

`POST /api/tasks`

Requires authentication.

Request body:

```json
{
  "title": "Complete REST API milestone",
  "description": "Build and test the task API",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-11-13"
}
```

Success: `201 Created`

Returns a message and the created `task` object.

### 4. Get all my tasks

`GET /api/tasks`

Requires authentication.

Success: `200 OK`

```json
{
  "count": 1,
  "tasks": [
    {
      "_id": "TASK_ID",
      "title": "Complete REST API milestone",
      "description": "Build and test the task API",
      "status": "pending",
      "priority": "high",
      "user": "USER_ID"
    }
  ]
}
```

The API returns only tasks owned by the logged-in user.

### 5. Get one task

`GET /api/tasks/:id`

Requires authentication.

Success: `200 OK`

```json
{
  "task": {
    "_id": "TASK_ID",
    "title": "Complete REST API milestone",
    "status": "pending",
    "priority": "high"
  }
}
```

Returns `404 Not Found` if the task does not exist or does not belong to the logged-in user.

### 6. Update a task

`PUT /api/tasks/:id`

Requires authentication. Send one or more fields to update.

Request body:

```json
{
  "status": "completed",
  "priority": "medium"
}
```

Success: `200 OK`

Returns a message and the updated `task` object.

### 7. Delete a task

`DELETE /api/tasks/:id`

Requires authentication.

Success: `200 OK`

```json
{
  "message": "Task deleted successfully"
}
```

## HTTP status codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Missing or invalid authentication |
| 404 | Route or task not found |
| 500 | Server error |

## Project structure

```text
task-management-api/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Test with Postman

1. Register a user.
2. Log in and copy the returned token.
3. In Postman, open the Authorization tab for task requests.
4. Select **Bearer Token** and paste the token.
5. Test create, list, get-one, update, and delete.
6. Try a task request without a token; it should return `401`.

## Important

- Never commit your `.env` file or share your JWT secret.
- Passwords are stored as bcrypt hashes, not plain text.
- This is a learning project. Review and test the code before deploying it.
