# Blida 1 AI House - Backend API

Official backend API for the Blida 1 AI House website. Built with Express.js and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Team Collaboration Guide](#team-collaboration-guide)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Admin Dashboard](#admin-dashboard)
- [Scripts](#scripts)
- [Security](#security)
- [License](#license)

## 🔭 Overview

This backend API powers the Blida 1 AI House website - the digital face of the university's AI initiative. The API provides:

- **Event Management** - Create, manage, and display workshops, seminars, and datathons
- **Statistics Tracking** - Monitor measurable outcomes (students trained, workshops hosted)
- **Testimonials** - Collect and showcase participant feedback
- **Team Management** - Display team member profiles
- **Contact System** - Handle inquiries from students, startups, researchers
- **Admin Dashboard** - CMS for non-technical staff to manage content

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (>= 18) |
| Framework | Express.js 4.x |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken) |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Email | Nodemailer |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL pool configuration
│   │   └── initDb.js         # Database initialization script
│   ├── controllers/
│   │   ├── eventController.js
│   │   ├── testimonialController.js
│   │   ├── statisticController.js
│   │   ├── teamController.js
│   │   ├── contactController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── errorHandler.js   # Error handling
│   │   └── validation.js     # Request validation
│   ├── models/
│   │   ├── Event.js
│   │   ├── Testimonial.js
│   │   ├── Statistic.js
│   │   ├── TeamMember.js
│   │   ├── ContactInquiry.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── events.js
│   │   ├── testimonials.js
│   │   ├── statistics.js
│   │   ├── team.js
│   │   ├── contact.js
│   │   └── admin.js
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── tests/
│   ├── unit_tests/           # Fast isolated tests (mocked dependencies)
│   ├── integration_tests/    # Route/controller/model flow tests
│   └── E2E_tests/            # End-to-end scenario tests
├── .env.example              # Environment template
├── package.json
└── README.md
```

## � Team Collaboration Guide

This section is for **CSCClub Development Team** members working on this project.

### Git Workflow

We use **Git Flow** branching strategy:

```
main        → Production-ready code
  ↑
develop     → Integration branch for features
  ↑
feature/*   → Individual feature branches
hotfix/*    → Emergency production fixes
```

### Branch Naming Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/description` | `feature/event-registration` |
| Bugfix | `fix/bug-description` | `fix/login-validation` |
| Hotfix | `hotfix/critical-fix` | `hotfix/database-connection` |
| Release | `release/v1.x.x` | `release/v1.1.0` |

### Commit Message Convention

Use format: `<type>: <description>`

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add event registration endpoint` |
| `fix` | Bug fix | `fix: correct JWT token expiration` |
| `docs` | Documentation | `docs: update API endpoints list` |
| `refactor` | Code refactoring | `refactor: simplify event controller` |
| `test` | Tests | `test: add event controller tests` |
| `chore` | Maintenance | `chore: update dependencies` |

### Development Workflow

1. **Before starting work:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **During development:**
   - Write clean, commented code
   - Follow existing code style
   - Test your changes locally
   - Commit frequently with clear messages

3. **Before pushing:**
   ```bash
   npm run lint          # Check code style
   npm test              # Run tests
   ```

4. **Create Pull Request:**
   - Push branch: `git push origin feature/your-feature-name`
   - Open PR to `develop` branch
   - Add meaningful title and description
   - Link related issues
   - Request review from 1-2 team members

### Code Review Checklist

**For Authors:**
- [ ] Self-review completed
- [ ] All tests passing
- [ ] No console.logs left
- [ ] Error handling implemented
- [ ] API documentation updated (if needed)

**For Reviewers:**
- [ ] Code logic is correct
- [ ] Security considerations checked
- [ ] Performance impact assessed
- [ ] Variable names are clear
- [ ] No duplicate code

### Project Tasks Assignment

**Backend Completion Deadline: March 25, 2026**

| Task | Assigned To | Description | Deadline | Status |
|------|-------------|-------------|----------|--------|
| **Events API & Media Upload** | Hocine | Complete events CRUD, add multer for image uploads, media gallery endpoints | March 22 | 🔵 Not Started |
| **Statistics & Dashboard** | Walid | Statistics API completion, admin dashboard stats aggregation, charts data | March 22 | 🔵 Not Started |
| **Team, Testimonials & Contact** | Issam Eddine | Team members API, testimonials with approval workflow, contact inquiry system | March 22 | 🔵 Not Started |
| **Testing & Documentation** | All | Unit tests, API documentation, integration tests | March 25 | 🔵 Not Started |
| **Final Integration** | All | Merge all branches, final testing, bug fixes | March 25 | 🔵 Not Started |

---

#### Hocine - Events & Media Module
- [ ] Fix any issues in `eventController.js`
- [ ] Add image upload with multer (events images)
- [ ] Create media upload endpoints (`POST /api/v1/events/:id/media`)
- [ ] Add file validation (images only, max 5MB)
- [ ] Serve static files from `/uploads`
- [ ] Test all event endpoints
- [ ] **Deadline: March 22, 2026**

#### Walid - Statistics & Analytics Module
- [ ] Complete `statisticController.js` endpoints
- [ ] Add admin dashboard aggregation endpoint:
  - Total events count
  - Upcoming events count
  - New inquiries count
  - Pending testimonials count
- [ ] Create dashboard stats route (`GET /api/v1/admin/dashboard`)
- [ ] Test statistics endpoints
- [ ] **Deadline: March 22, 2026**

#### Issam Eddine - Team, Testimonials & Contact Module
- [ ] Verify `teamController.js` endpoints work correctly
- [ ] Complete testimonial approval workflow
- [ ] Add email notification for new inquiries
- [ ] Test contact form submission
- [ ] Test testimonial submission and approval
- [ ] **Deadline: March 22, 2026**

---

### Daily Check-ins

**Standup Time:** 9:00 PM daily

**Format:**
1. What did you complete today?
2. What are you working on tomorrow?
3. Any blockers?

### Work Distribution Rules

- Each member works on their assigned module in a separate branch
- Branch naming: `feature/hocine-events`, `feature/walid-stats`, `feature/issam-contact`
- Create PR to `develop` branch when module is complete
- All PRs must be reviewed by at least 1 other member
- Merge only after approval and tests passing

### Communication

- **Daily standups:** Check progress and blockers
- **Discord/Slack:** Quick questions and updates
- **GitHub Issues:** Track bugs and feature requests
- **PR Comments:** Code-specific discussions

### Environment Setup (Team)

Each team member should:

1. Clone the repo
2. Copy `.env.example` to `.env`
3. Use **different ports** if working on same machine:
   ```env
   PORT=5001  # Member 1
   PORT=5002  # Member 2
   DB_NAME=ai_house_dev_1  # Separate dev databases
   ```
4. Never commit `.env` or `node_modules`
5. Always pull `develop` before creating new branches

### Database Changes

When modifying database schema:
1. Update `src/config/initDb.js`
2. Test migration on local database
3. Document changes in PR description
4. Notify team to run `npm run db:init`

### API Versioning

We use `/api/v1/` prefix. When making breaking changes:
- Discuss with team first
- Plan migration strategy
- Version bump to `/api/v2/`

---

## �🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:init

# Start development server
npm run dev
```

The server will start at `http://localhost:5000`

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `ai_house` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing key | - |
| `FRONTEND_URL` | Frontend CORS origin | `http://localhost:3000` |
| `SMTP_HOST` | Email server host | - |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |

## 🗄️ Database Setup

### Automatic Initialization

Run the database initialization script:

```bash
npm run db:init
```

This will:
- Create all required tables
- Set up indexes for performance
- Create a default super admin (username: `admin`, password: `admin123`)

### Manual Setup

Create the database manually:

```sql
CREATE DATABASE ai_house;
```

Then run the initialization script.

### Database Schema

**Tables:**
- `admins` - Admin users for CMS
- `events` - Workshops, seminars, datathons
- `team_members` - Team profiles
- `testimonials` - Participant feedback
- `statistics` - Measurable outcomes
- `contact_inquiries` - Contact form submissions
- `media` - Event photos/videos
- `announcements` - News/updates

## 📚 API Documentation

### Base URL
```
/api/v1
```

### Public Endpoints

#### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List all events |
| GET | `/events/featured` | Get featured events |
| GET | `/events/upcoming` | Get upcoming events |
| GET | `/events/:id` | Get event details |

#### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/statistics` | Get all statistics |

#### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/team` | List team members |

#### Testimonials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/testimonials` | List approved testimonials |
| POST | `/testimonials` | Submit testimonial |

#### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact` | Submit inquiry |

### Protected Endpoints (Admin)

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

#### Admin Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| GET | `/admin/profile` | Get profile |

#### Event Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

#### Testimonial Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/testimonials/admin/all` | Get all (including pending) |
| PUT | `/testimonials/:id/approve` | Approve testimonial |

#### Statistics Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/statistics` | Create statistic |
| PUT | `/statistics/:id` | Update statistic |
| PATCH | `/statistics/:id/value` | Quick value update |
| DELETE | `/statistics/:id` | Delete statistic |

#### Contact Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contact` | List inquiries |
| GET | `/contact/stats` | Get inquiry stats |
| PUT | `/contact/:id/status` | Update inquiry status |
| DELETE | `/contact/:id` | Delete inquiry |

### Request/Response Examples

#### Create Event (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Smart Pedagogy DATATHON",
    "event_type": "datathon",
    "start_date": "2026-04-15T09:00:00Z",
    "end_date": "2026-04-17T18:00:00Z",
    "location": "AI House, Aeronautics Pavilion 20",
    "description": "Join us for 3 days of AI innovation in education",
    "max_participants": 100
  }'
```

#### Submit Contact Form
```bash
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Partnership Inquiry",
    "message": "Interested in collaborating on AI research",
    "inquiry_type": "partnership"
  }'
```

## 🎛️ Admin Dashboard

The admin dashboard provides non-technical staff with tools to:

- **Manage Events**: Add/edit workshops, seminars, datathons
- **Update Statistics**: Modify measurable outcomes in real-time
- **Review Testimonials**: Approve/reject submitted feedback
- **Handle Inquiries**: View and respond to contact form submissions
- **Team Profiles**: Update team member information

### Default Admin Credentials
After database initialization:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these immediately in production!**

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server (nodemon) |
| `npm test` | Run tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run end-to-end tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:init` | Initialize database tables |
| `npm run db:seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

## 🔒 Security

Security measures implemented:

- **Helmet.js** - Security headers
- **CORS** - Configured for specific origins
- **Rate Limiting** - Prevent abuse (100 req/15min)
- **JWT Authentication** - Stateless auth with expiration
- **Password Hashing** - bcrypt (10 rounds)
- **Input Validation** - express-validator
- **SQL Injection Protection** - Parameterized queries
- **Error Handling** - No stack traces in production

### Admin Roles

- `admin` - Can manage content (events, stats, testimonials)
- `super_admin` - Can also manage other admins

## 🧪 Testing

The test suite is organized into dedicated folders to keep each test level clear and maintainable:

- `tests/unit_tests/` - Unit tests for isolated logic and controller behavior using mocks
- `tests/integration_tests/` - Integration tests for API flow across routes, middleware, controllers, and models
- `tests/E2E_tests/` - End-to-end tests for complete real-world scenarios

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up email (SMTP)
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS
- [ ] Configure process manager (PM2)
- [ ] Set up log rotation

### PM2 Configuration

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "ai-house-api"

# Save configuration
pm2 save
pm2 startup
```

## 📞 Support

For technical support or questions:
- Email: maison_ia@univ-blida.dz
- Address: Aeronautics Pavilion 20, Blida 1 University

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

**Made with ❤️ by CSCClub Development Team**