# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start local development server with hot reload (uses ts-node-dev on index-local.ts)
- `npm run build` - Compile TypeScript to JavaScript in dist/ directory
- `npm run run-build` - Run the compiled application from dist/
- `npm test` - Run the application using ts-node (for testing purposes)
- `npm run clean` - Remove dist/ and node_modules/ directories

## Architecture Overview

This is a Node.js/Express backend application built with TypeScript that serves as a portfolio backend with multiple user types and functionality.

### Application Structure

**Dual Entry Points:**
- `src/index.ts` - Serverless handler for AWS Lambda deployment
- `src/index-local.ts` - Local development server (includes cron jobs and SMS functionality)

**Core Features:**
- Multi-role authentication (USER, TEACHER, STUDENT)
- OTP verification via SMS (AWS SNS) and Email (AWS SES)
- Stock market data integration
- News aggregation with OpenAI summarization
- Portfolio data management
- Profile matching system for teachers/students

### Key Components

**Models (Mongoose/MongoDB):**
- `User.ts` - Core user model with role-based fields
- `Data.ts` - Portfolio/user data storage
- `OTP.ts` - OTP verification system
- `News.ts` - Cached news with AI summaries
- `Stocks.ts` - Stock market data
- `Student.ts` / `VisitedProfiles.ts` - Student-teacher matching

**Routes:**
- `/user/*` - Authentication, signup, login, OTP verification
- `/post/*` - Private user data operations
- `/teachers/*` - Teacher-specific functionality
- `/students/*` - Student-specific functionality
- `/stocks/*` - Stock market data and services

**External Services:**
- MongoDB Atlas for data persistence
- AWS SNS for SMS OTP delivery
- AWS SES for email OTP delivery
- OpenAI API for news summarization and text improvement
- NewsAPI for business news aggregation

### Environment Configuration

The application uses `env.json` for environment variables including:
- Database credentials (MONGO_USERNAME, MONGO_PASSWORD)
- JWT secret (SECRET_JWT_TOKEN)
- AWS credentials (AWS_ACCESSKEY, AWS_SECRET_ACCESSKEY)
- OpenAI API key (OPENAI_API_KEY)
- NewsAPI key (NEWS_API_KEY)

### Deployment

- **Local**: Uses `index-local.ts` with cron jobs and direct Express server
- **Serverless**: Uses `index.ts` with serverless-http wrapper for AWS Lambda
- **Configuration**: serverless.yml configured for AWS deployment in ap-south-1 region

### Important Notes

- The local version includes a cron job that sends SMS every 10 minutes
- Authentication uses JWT tokens with role-based access
- OTP verification is required for both teacher and student signups
- News data is cached for 1 hour to avoid API rate limits
- Stock data integration is available through dedicated routes and services