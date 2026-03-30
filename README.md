# Quiz Arena

Quiz Arena is a full-stack quiz platform where users can sign up, create quizzes, publish them, and play quizzes with scoring and leaderboard-style results.

The project is built with Next.js App Router, TypeScript, MongoDB/Mongoose, and NextAuth credentials authentication.

## Features

- Credentials-based authentication with protected pages
- Quiz creation and editing dashboard
- Public and private/draft quiz visibility
- Quiz play flow with answer submission and score calculation
- Attempt tracking and ranking support
- AI-tagged seed tooling for test users, quizzes, and attempts

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- MongoDB + Mongoose
- NextAuth (credentials provider)
- Tailwind CSS + component-based UI

## Project Structure

- `src/app` - pages, layouts, and API route handlers
- `src/components` - UI and feature components
- `src/lib` - auth, DB connection, quiz logic, utilities
- `src/models` - Mongoose models (`User`, `Quiz`, `QuizAttempt`)
- `scripts` - developer scripts such as data seeding

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB database (Atlas or local)

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=quiz-arena
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
```

### Important Auth Requirement

`NEXTAUTH_SECRET` must be a long random string (minimum 32 characters). The app validates this at startup and throws an error if the value is missing or still a placeholder.

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run seed:ai` - generate AI-tagged seed users, quizzes, and attempts
- `npm run seed:ai:cleanup` - remove AI-tagged seeded data

## Seeding Test Data

Generate seed data:

```bash
npm run seed:ai
```

Custom volume example:

```bash
npm run seed:ai -- --users 20 --quizzes-per-user 4 --min-questions 5 --max-questions 10 --min-attempts-per-user 5 --max-attempts-per-user 15
```

Cleanup seeded records:

```bash
npm run seed:ai:cleanup
```

Seeded data is intentionally marked for easy cleanup:

- User emails use `ai_seed_v1.*@seed.local`
- Quiz tags include `ai-seed` and `ai_seed_v1`
- Quiz titles are prefixed with `[AI SEED]`

## API Overview

Core API routes in `src/app/api`:

- `/api/auth/[...nextauth]` - auth endpoints
- `/api/register` - user registration
- `/api/quizzes` - create/list quizzes
- `/api/quizzes/[id]` - update/delete a quiz
- `/api/quizzes/[id]/duplicate` - duplicate quiz
- `/api/attempts/[id]/submit` - submit a quiz attempt

## Authentication Notes

- Uses `CredentialsProvider` with JWT session strategy.
- Session user IDs are attached in auth callbacks.
- Server-side helpers in `src/lib/auth.ts`:
  - `getServerAuthSession()`
  - `requireUser()`

## Troubleshooting

- `CALLBACK_CREDENTIALS_JWT_ERROR`:
  - Ensure auth uses JWT session strategy.
- `Invalid NEXTAUTH_SECRET`:
  - Set a strong random secret in `.env` and restart the server.
- `MONGODB_URI is not configured`:
  - Verify `.env` exists and has valid database values.

## License

This project is currently private. Add a license file if you plan to open-source it.
