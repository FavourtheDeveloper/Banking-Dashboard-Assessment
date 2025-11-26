# Banking Dashboard Technical Assessment

A deliberately basic banking dashboard application designed as a starting point for technical assessment. The project provides candidates with a foundation to demonstrate their skills in both frontend and backend development.

## Project Overview

This is an intentionally basic implementation with clear areas for improvement. Candidates are expected to identify issues, suggest improvements, and implement solutions.

### Current Implementation

- React + TypeScript frontend with basic account display
- Node.js + Express backend with simple REST API
- SQLite in-memory database
- Basic styling and component structure
- Type-safe implementation

### Key Areas for Improvement

#### Frontend

- [ ] Enhanced visual design and UX
- [ ] Responsive layout improvements
- [ ] Component structure optimization
- [ ] Loading states and animations
- [ ] Error handling and user feedback
- [ ] Form validation
- [ ] Authentication UI
- [ ] Transaction history view
- [ ] Filtering and sorting capabilities
- [ ] Accessibility improvements
- [ ] Unit and integration tests
- [ ] Performance optimizations

#### Backend

- [ ] Persistent database implementation
- [ ] Authentication and authorization
- [ ] Input validation and sanitization
- [ ] Error handling improvements
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] API documentation
- [ ] Logging system
- [ ] Unit and integration tests
- [ ] Security improvements

## Technical Stack

### Frontend

- React 18
- TypeScript
- CSS Modules
- Vite
- Modern ES6+ features

### Backend

- Node.js
- Express
- TypeScript
- SQLite (in-memory)
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install all dependencies (root, client, and server)
npm run install-all
```

### Running the Application

```bash
# Start both frontend and backend servers
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Current Implementation

- GET /api/accounts - Get all accounts
- GET /api/accounts/:id - Get account by ID

### Potential Additional Endpoints

- POST /api/accounts - Create new account
- PUT /api/accounts/:id - Update account
- DELETE /api/accounts/:id - Delete account
- GET /api/accounts/:id/transactions - Get account transactions
- POST /api/auth/login - User authentication
- GET /api/users/profile - Get user profile

## Project Structure

```
/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types/       # TypeScript interfaces
│   │   ├── api/         # API integration
│   │   └── styles/      # CSS modules
│   └── public/
└── server/               # Node.js backend
    └── src/
        ├── routes/      # API routes
        ├── services/    # Business logic
        └── types/       # TypeScript interfaces
```

## Assessment Goals

This project serves as a foundation for candidates to demonstrate:

1. Code quality and organization
2. Problem-solving approach
3. Technical decision-making
4. Understanding of full-stack development
5. Attention to detail
6. Knowledge of best practices
7. Ability to identify and implement improvements

## Notes for Candidates

- The current implementation is deliberately basic
- Focus on both technical improvements and code quality
- Consider real-world production requirements
- Document your changes and reasoning
- Think about scalability and maintainability
- Consider security implications
- Implement proper error handling
- Add appropriate tests
- Follow best practices for your chosen technologies
# Banking-Dashboard-Assessment
