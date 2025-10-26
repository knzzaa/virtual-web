# EnglishLab - Virtual Learning Platform

![EnglishLab](frontend/assets/img/logo.png)

**EnglishLab** is an interactive virtual learning platform designed to help students learn English through engaging materials, interactive exams, and gamified missions. Built with modern web technologies, it features a clean, responsive UI and a robust backend API.

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Backend Documentation](#backend-documentation)
  - [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Database Schema](#database-schema)
- [Frontend Documentation](#frontend-documentation)
  - [Architecture](#frontend-architecture)
  - [Key Components](#key-components)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🎓 Learning Modules

- **Materials**: Browse and study English learning materials with video content
- **Exams**: Take timed multiple-choice exams to test knowledge
- **Missions**: Complete interactive vocabulary quizzes with visual questions

### 🔐 User Management

- Secure authentication with JWT and HTTP-only cookies
- User registration and login
- Persistent login sessions
- Password hashing with bcrypt

### 📊 Progress Tracking

- Track exam scores and submission history
- Monitor mission completion progress
- View detailed performance analytics
- Like/favorite learning materials

### 🎨 User Experience

- Responsive design for mobile, tablet, and desktop
- Modern, clean interface with gradient designs
- Smooth animations and transitions
- Real-time feedback on quiz answers

---

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schema validation
- **Development**: tsx for hot-reloading

### Frontend

- **Core**: HTML5, CSS3, JavaScript (ES6+ Modules)
- **Styling**: CSS with CSS Variables, Flexbox, Grid
- **Assets**: Custom SVG icons, Unsplash images
- **Hosting**: Static hosting (Netlify, Vercel, GitHub Pages)

---

## 📁 Project Structure

```
virtual-web/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── db/             # Database configuration and schemas
│   │   │   ├── index.ts    # Database connection
│   │   │   ├── schema.ts   # Drizzle ORM schemas
│   │   │   └── seed.ts     # Database seeder
│   │   ├── dtos/           # Data Transfer Objects & Validation
│   │   │   ├── auth.dto.ts
│   │   │   ├── exam.dto.ts
│   │   │   └── mission.dto.ts
│   │   ├── middlewares/    # Express/Hono middlewares
│   │   │   └── auth.middleware.ts
│   │   ├── routes/         # API route handlers
│   │   │   ├── auth.route.ts
│   │   │   ├── material.route.ts
│   │   │   ├── exam.route.ts
│   │   │   └── mission.route.ts
│   │   ├── services/       # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── material.service.ts
│   │   │   ├── exam.service.ts
│   │   │   └── mission.service.ts
│   │   ├── utils/          # Helper functions
│   │   │   ├── config.ts
│   │   │   ├── jwt.ts
│   │   │   └── exceptions.ts
│   │   └── index.ts        # Application entry point
│   ├── drizzle/            # Drizzle migration files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/               # Frontend application
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   │   ├── style.css  # Global styles
│   │   │   ├── auth.css   # Authentication pages
│   │   │   ├── material.css
│   │   │   ├── exam.css
│   │   │   ├── mission.css
│   │   │   └── history.css
│   │   ├── img/           # Images and icons
│   │   └── js/            # JavaScript modules
│   │       ├── api.js     # API configuration
│   │       ├── auth.js    # Authentication service
│   │       ├── material.js
│   │       ├── exam.js
│   │       ├── mission.js
│   │       ├── protected.js
│   │       └── *-page.js  # Page-specific controllers
│   ├── pages/
│   │   ├── auth/          # Login/Register pages
│   │   └── dashboard/     # Protected pages
│   │       ├── material/
│   │       ├── exam/
│   │       └── mission/
│   └── index.html         # Landing page
│
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd virtual-web/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_URL=postgresql://postgres:password@localhost:5432/englishlab

   # JWT Configuration (minimum 32 characters for security)
   JWT_SECRET=change-this-to-a-secure-random-32-character-or-longer-secret-key
   JWT_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up the database**

   ```bash
   # Create database
   createdb englishlab

   # Generate migrations
   npm run db:generate

   # Run migrations
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

6. **Verify installation**

   ```bash
   curl http://localhost:3000/health
   ```

   Expected response:

   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-01T00:00:00.000Z",
     "service": "EnglishLab API",
     "environment": "development"
   }
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Update API configuration**

   Edit `assets/js/api.js` to match your backend URL:

   ```javascript
   const API_BASE_URL = "http://localhost:3000/api";
   ```

3. **Serve the frontend**

   You can use any static file server. Here are some options:

   **Option A: Using Python's built-in server**

   ```bash
   python3 -m http.server 5173
   ```

   **Option B: Using Node's http-server**

   ```bash
   npx http-server -p 5173
   ```

   **Option C: Using VS Code Live Server extension**

   - Install "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

4. **Access the application**

   Open your browser and navigate to `http://localhost:5173`

5. **Test the application**
   - Register a new account
   - Login with your credentials
   - Explore materials, take exams, and complete missions

---

## 🚀 Deployment

The EnglishLab application is deployed on **Vercel** for both frontend and backend:

### Frontend Deployment

- **Platform**: Vercel CDN
- **Type**: Static site hosting
- **URL**: Deployed frontend is served through Vercel's global CDN for optimal performance

### Backend Deployment

- **Platform**: Vercel Serverless Functions
- **Infrastructure**: AWS Lambda (serverless architecture behind Vercel Functions)
- **Database**: PostgreSQL (NeonDB Serverless)

### Environment Variables

When deploying to production, ensure you set the following environment variables:

**Backend (Vercel):**

```env
# Server Configuration
NODE_ENV=production

# Database Configuration
DB_URL=postgresql://username:password@host:port/database

# JWT Configuration (minimum 32 characters for security)
JWT_SECRET=your-production-secret-key-must-be-secure-32-chars-minimum
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Frontend:**

- Update `assets/js/api.js` to point to your production backend URL

### Deployment Steps

1. **Frontend Deployment to Vercel:**

   ```bash
   cd frontend
   vercel --prod
   ```

2. **Backend Deployment to Vercel:**

   ```bash
   cd backend
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Go to your Vercel project settings
   - Add all required environment variables
   - Redeploy if necessary

---

## 📖 Backend Documentation

### API Endpoints

All API endpoints are prefixed with `/api`.

#### Base URL

```
http://localhost:3000/api
```

---

### 🔐 Authentication Endpoints

Authentication uses JWT tokens stored in HTTP-only cookies. Tokens expire after 7 days by default.

#### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules:**

- `fullName`: Required, minimum 2 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400 Bad Request`: Validation failed
- `409 Conflict`: Email already exists

---

#### Login User

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Invalid credentials

---

#### Get Current User

```http
GET /api/auth/me
```

**Headers:**

```
Cookie: token=<jwt_token>
```

**Response (200 OK):**

```json
{
  "user": {
    "userId": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token

---

#### Logout User

```http
POST /api/auth/logout
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 📚 Material Endpoints

All material endpoints require authentication.

#### List All Materials

```http
GET /api/materials
```

**Headers:**

```
Cookie: token=<jwt_token>
```

**Response (200 OK):**

```json
[
  {
    "materialId": 1,
    "title": "Basic Greetings",
    "slug": "basic-greetings",
    "description": "Learn common English greetings and introductions",
    "youtubeUrl": "https://www.youtube.com/watch?v=abc123",
    "content": "# Introduction\n\nLearn how to greet people...",
    "colorClass": "gradient-1",
    "isLiked": true
  }
]
```

---

#### Get Single Material

```http
GET /api/materials/:slug
```

**Path Parameters:**

- `slug`: Material identifier (e.g., "basic-greetings")

**Response (200 OK):**

```json
{
  "materialId": 1,
  "title": "Basic Greetings",
  "slug": "basic-greetings",
  "description": "Learn common English greetings and introductions",
  "youtubeUrl": "https://www.youtube.com/watch?v=abc123",
  "content": "# Introduction\n\nLearn how to greet people in English...",
  "colorClass": "gradient-1",
  "isLiked": false
}
```

**Error Responses:**

- `404 Not Found`: Material not found

---

#### Toggle Material Like

```http
POST /api/materials/:slug/like
```

**Response (200 OK):**

```json
{
  "message": "Material liked",
  "isLiked": true
}
```

or

```json
{
  "message": "Material unliked",
  "isLiked": false
}
```

---

### 📝 Exam Endpoints

All exam endpoints require authentication.

#### List All Exams

```http
GET /api/exams
```

**Response (200 OK):**

```json
[
  {
    "examId": 1,
    "title": "Grammar Basics Test",
    "slug": "grammar-basics-test",
    "description": "Test your knowledge of basic English grammar",
    "duration": 600,
    "totalQuestions": 10
  }
]
```

---

#### Get Exam Details

```http
GET /api/exams/:slug
```

**Response (200 OK):**

```json
{
  "examId": 1,
  "title": "Grammar Basics Test",
  "slug": "grammar-basics-test",
  "description": "Test your knowledge of basic English grammar",
  "duration": 600,
  "questions": [
    {
      "questionId": 1,
      "questionNumber": 1,
      "questionText": "What is the plural of 'child'?",
      "options": ["childs", "children", "childes", "child"]
    }
  ]
}
```

**Note:** The `correctOptionIndex` is intentionally excluded to prevent cheating.

---

#### Submit Exam

```http
POST /api/exams/:slug/submit
```

**Request Body:**

```json
{
  "answers": [
    {
      "questionNumber": 1,
      "selectedOptionIndex": 1
    },
    {
      "questionNumber": 2,
      "selectedOptionIndex": 0
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "submissionId": 1,
  "score": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "details": [
    {
      "questionNumber": 1,
      "isCorrect": true,
      "selectedOptionIndex": 1,
      "correctOptionIndex": 1
    },
    {
      "questionNumber": 2,
      "isCorrect": false,
      "selectedOptionIndex": 0,
      "correctOptionIndex": 2
    }
  ]
}
```

**Error Responses:**

- `400 Bad Request`: Invalid answers format or incomplete submission
- `404 Not Found`: Exam not found

---

#### Get Exam Submission History

```http
GET /api/exams/:slug/submissions
```

**Response (200 OK):**

```json
[
  {
    "submissionId": 3,
    "score": 9,
    "totalQuestions": 10,
    "percentage": 90,
    "submittedAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "submissionId": 2,
    "score": 7,
    "totalQuestions": 10,
    "percentage": 70,
    "submittedAt": "2025-01-10T14:20:00.000Z"
  }
]
```

---

### 🎯 Mission Endpoints

All mission endpoints require authentication. Missions are completed sequentially - users must finish one mission before proceeding to the next.

#### Get Next Mission

```http
GET /api/missions/next
```

**Response (200 OK) - New Mission:**

```json
{
  "mission": {
    "missionId": 1,
    "title": "Animals Vocabulary Challenge",
    "slug": "animals-vocabulary-challenge",
    "description": "Identify common animals in English",
    "totalQuestions": 5
  },
  "currentQuestion": {
    "questionNumber": 1,
    "questionText": "Which one is a \"Dog\"?",
    "options": [
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400"
    ]
  },
  "progress": {
    "questionsAnswered": 0,
    "currentScore": 0
  }
}
```

**Response (200 OK) - Resume Mission:**

```json
{
  "mission": {
    "missionId": 1,
    "title": "Animals Vocabulary Challenge",
    "slug": "animals-vocabulary-challenge",
    "description": "Identify common animals in English",
    "totalQuestions": 5
  },
  "currentQuestion": {
    "questionNumber": 3,
    "questionText": "Which one is an \"Elephant\"?",
    "options": [
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400",
      "https://images.unsplash.com/photo-1489084917528-a57e68a79a1e?w=400",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400"
    ]
  },
  "progress": {
    "questionsAnswered": 2,
    "currentScore": 2
  }
}
```

**Response (200 OK) - All Completed:**

```json
{
  "message": "All missions completed! Great job!",
  "completed": true
}
```

---

#### Submit Mission Answer

```http
POST /api/missions/:slug/answer
```

**Request Body:**

```json
{
  "questionNumber": 1,
  "selectedOptionIndex": 0
}
```

**Response (200 OK) - Correct Answer, More Questions:**

```json
{
  "isCorrect": true,
  "correctOptionIndex": 0,
  "currentScore": 1,
  "nextQuestion": {
    "questionNumber": 2,
    "questionText": "Which one is a \"Cat\"?",
    "options": [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400"
    ]
  }
}
```

**Response (200 OK) - Wrong Answer:**

```json
{
  "isCorrect": false,
  "correctOptionIndex": 1,
  "currentScore": 1,
  "nextQuestion": {
    "questionNumber": 3,
    "questionText": "Which one is an \"Elephant\"?",
    "options": []
  }
}
```

**Response (200 OK) - Mission Completed:**

```json
{
  "isCorrect": true,
  "correctOptionIndex": 0,
  "currentScore": 5,
  "completed": true,
  "finalScore": 5,
  "totalQuestions": 5,
  "percentage": 100
}
```

**Error Responses:**

- `400 Bad Request`: Invalid question number or mission state
- `404 Not Found`: Mission not found

---

#### Get Mission Completion History

```http
GET /api/missions/completions
```

**Response (200 OK):**

```json
[
  {
    "completionId": 2,
    "missionTitle": "Food & Drinks Vocabulary",
    "score": 4,
    "totalQuestions": 5,
    "completedAt": "2025-01-20T16:45:00.000Z"
  },
  {
    "completionId": 1,
    "missionTitle": "Animals Vocabulary Challenge",
    "score": 5,
    "totalQuestions": 5,
    "completedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

### 🔒 Authentication

The API uses JWT tokens for authentication, stored in HTTP-only cookies for security.

#### Token Storage

- **Production**: Cookies with `secure: true`, `sameSite: 'None'`
- **Development**: Cookies with `secure: true`, `sameSite: 'None'`

#### Making Authenticated Requests

When using fetch from the frontend:

```javascript
fetch("http://localhost:3000/api/auth/me", {
  method: "GET",
  credentials: "include", // Important: Include cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### Token Expiration

- Default expiration: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable
- After expiration, users must log in again

---

### 🗄️ Database Schema

The application uses PostgreSQL with Drizzle ORM. Below is the database schema:

#### Users Table

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Materials Table

```sql
CREATE TABLE materials (
  material_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  youtube_url TEXT,
  content TEXT NOT NULL,
  color_class VARCHAR(50)
);
```

#### Material Likes Table

```sql
CREATE TABLE material_likes (
  like_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(material_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);
```

#### Exams Table

```sql
CREATE TABLE exams (
  exam_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Exam Questions Table

```sql
CREATE TABLE exam_questions (
  question_id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(exam_id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  UNIQUE(exam_id, question_number)
);
```

#### Exam Submissions Table

```sql
CREATE TABLE exam_submissions (
  submission_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(exam_id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### Missions Table

```sql
CREATE TABLE missions (
  mission_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  mission_order INTEGER NOT NULL UNIQUE
);
```

#### Mission Questions Table

```sql
CREATE TABLE mission_questions (
  question_id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(mission_id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  UNIQUE(mission_id, question_number)
);
```

#### Mission Progress Table

```sql
CREATE TABLE mission_progress (
  progress_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  mission_id INTEGER REFERENCES missions(mission_id) ON DELETE CASCADE,
  current_question_number INTEGER NOT NULL,
  current_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, mission_id)
);
```

---

## 👥 Authors

- **Ratukhansa Salsabila** - 18223034
- **Irdina Ilmuna Yosapat** - 18223060

---
