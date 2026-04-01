# Quiz Arena

Quiz Arena is a full-stack quiz platform that enables users to create, publish, and play quizzes with real-time scoring and leaderboard-style results.

This project demonstrates end-to-end application development using modern web technologies, including secure authentication, scalable API design, and structured data modeling.

---

## Overview

Quiz Arena provides a complete workflow for both quiz creators and players:

- User authentication and account management
- Quiz creation, editing, and publishing
- Public and private quiz visibility
- Interactive quiz attempts with automatic scoring
- Attempt tracking designed for leaderboard and ranking systems

---

## Key Features

- Credentials-based authentication with protected routes using NextAuth
- Full CRUD functionality for quizzes
- Structured quiz attempt and scoring system
- Public and private access control for content
- Modular and scalable project architecture
- AI-assisted data seeding for testing and development

---

## Tech Stack

**Frontend**

- Next.js 16 (App Router)
- React 19
- TypeScript

**Backend**

- Next.js API Routes
- Node.js

**Database**

- MongoDB
- Mongoose

**Authentication**

- NextAuth (Credentials Provider, JWT strategy)

**Styling**

- Tailwind CSS

---

## Project Structure

```
src/
  app/           # Application routes, layouts, and API handlers
  components/    # Reusable UI and feature components
  lib/           # Authentication, database connection, business logic
  models/        # Mongoose schemas (User, Quiz, QuizAttempt)

scripts/         # Development utilities (e.g., data seeding)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or Atlas)

---

### Environment Variables

Create a `.env` file based on `.env.example`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=quiz-arena
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-secret
```

Important:

- `NEXTAUTH_SECRET` must be at least 32 characters.
- The application validates this at startup.

---

## Local Development

Install dependencies:

```
npm install
```

Run the development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Available Scripts

```
npm run dev              # Start development server
npm run build            # Create production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run seed:ai          # Generate test data
npm run seed:ai:cleanup  # Remove seeded data
```

---

## Data Seeding

Generate sample users, quizzes, and attempts:

```
npm run seed:ai
```

Custom configuration:

```
npm run seed:ai -- --users 20 --quizzes-per-user 4 --min-questions 5 --max-questions 10 --min-attempts-per-user 5 --max-attempts-per-user 15
```

Cleanup seeded data:

```
npm run seed:ai:cleanup
```

Seeded records are tagged for safe removal:

- Emails: `ai_seed_v1.*@seed.local`
- Tags: `ai-seed`, `ai_seed_v1`
- Titles prefixed with `[AI SEED]`

---

## API Overview

Core endpoints:

- `/api/auth/[...nextauth]` - Authentication
- `/api/register` - User registration
- `/api/quizzes` - Create and list quizzes
- `/api/quizzes/[id]` - Update and delete quizzes
- `/api/quizzes/[id]/duplicate` - Duplicate quiz
- `/api/attempts/[id]/submit` - Submit quiz attempts

---

## Authentication

- Implemented using NextAuth Credentials Provider
- JWT-based session strategy
- Server-side helpers:
  - `getServerAuthSession()`
  - `requireUser()`

---

## Deployment (Vercel)

1. Set up MongoDB Atlas and obtain a connection string
2. Push the repository to GitHub
3. Import the project at https://vercel.com/new
4. Configure environment variables in Vercel

Required environment variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Generate a secure secret:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

- CALLBACK_CREDENTIALS_JWT_ERROR  
  Ensure JWT session strategy is enabled

- Invalid NEXTAUTH_SECRET  
  Provide a valid secret and restart the application

- MONGODB_URI is not configured  
  Verify `.env` file and database credentials

---

## Future Improvements

- Role-based access control
- Real-time leaderboard updates
- Enhanced analytics dashboard
- Multiplayer quiz functionality

---

## Author

Marco Jerome Gador  
GitHub: https://github.com/yourusername  
Email: mgador53@gmail.com

---

## License

This project is currently private. A license can be added if the project is open-sourced.
