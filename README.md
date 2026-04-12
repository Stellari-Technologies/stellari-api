# Stellari Platform API - Production-Ready TypeScript Express Backend

## What This Boilerplate Gives You


- ✅ **Type-Safe**: Full TypeScript with strict mode
- ✅ **Database**: PostgreSQL with TypeORM (migrations, entities, relations)
- ✅ **Validation**: Runtime type validation with Zod
- ✅ **Security**: Helmet, CORS, input sanitization
- ✅ **Logging**: Structured logging with Winston
- ✅ **Testing**: Jest with TypeScript support
- ✅ **Docker**: Multi-stage production builds + development containers
- ✅ **CI/CD**: AWS CodePipeline → CodeBuild → ECR → ECS Fargate
- ✅ **Multi-Tenant**: Organization-scoped data isolation
- ✅ **Error Handling**: Consistent JSON error responses
- ✅ **Code Quality**: ESLint, Prettier-ready

---

## 🏗️ Architecture Overview

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js 18+ | JavaScript execution environment |
| **Language** | TypeScript 5.1+ | Type-safe JavaScript with modern features |
| **Framework** | Express.js 4.18+ | Web framework for REST APIs |
| **Database** | PostgreSQL 15 | Relational database with ACID compliance |
| **ORM** | TypeORM 0.3+ | TypeScript-first database toolkit |
| **Validation** | Zod 3.22+ | Runtime type validation |
| **Logging** | Winston 3.10+ | Structured, configurable logging |
| **Security** | Helmet 7.0+ | Security headers and protections |
| **Container** | Docker | Application containerization |
| **Orchestration** | AWS ECS Fargate | Serverless container deployment |

### Application Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │    Services     │    │   Database      │
│                 │    │                 │    │                 │
│ • HTTP Routes   │◄──►│ • Business Logic│◄──►│ • PostgreSQL    │
│ • Request/Resp  │    │ • Data Transform│    │ • TypeORM       │
│ • Validation    │    │ • External APIs │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middleware    │    │    Utils        │    │   Entities      │
│                 │    │                 │    │                 │
│ • Authentication│    │ • Logger        │    │ • Database      │
│ • Error Handling│    │ • Validators    │    │ • Models        │
│ • CORS/Security │    │ • Constants     │    │ • Relations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Patterns Used

- **MVC-ish**: Controllers handle HTTP, Services handle business logic
- **Repository Pattern**: TypeORM provides data access abstraction
- **Middleware Chain**: Express middleware for cross-cutting concerns
- **Error Boundary**: Centralized error handling with consistent responses
- **Validation Pipeline**: Request → Validate → Process → Response
- **Multi-Tenant**: Organization-scoped data isolation

---

## 📁 Project Structure (Explained)

```
stellari-platform-api/
├── src/                          # Source TypeScript code
│   ├── config/
│   │   └── database.ts          # PostgreSQL & TypeORM configuration
│   ├── entities/                # Database models (TypeORM entities)
│   │   ├── Template.ts          # Example entity (COPY THIS)
│   │   └── User.ts              # Your entities go here
│   ├── controllers/             # HTTP request handlers
│   │   ├── template.controller.ts # Example controller (COPY THIS)
│   │   └── user.controller.ts   # Your controllers go here
│   ├── services/                # Business logic layer
│   │   ├── template.service.ts  # Example service (COPY THIS)
│   │   └── user.service.ts      # Your services go here
│   ├── middleware/              # Express middleware
│   │   ├── error.middleware.ts  # Global error handling
│   │   ├── validation.middleware.ts # Zod validation
│   │   └── logging.middleware.ts # Request logging
│   ├── utils/                   # Utility functions
│   │   ├── logger.ts            # Winston logging setup
│   │   └── validators.ts        # Zod validation schemas
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # API response types, DTOs
│   ├── constants/               # Application constants
│   │   └── index.ts             # Magic numbers, enums
│   └── index.ts                 # Express app entry point
├── dist/                        # Compiled JavaScript (generated)
├── node_modules/                # Dependencies (generated)
├── docker-compose.yml           # Local development stack
├── Dockerfile                   # Production container
├── Dockerfile.dev               # Development container
├── buildspec.yml                # AWS CodeBuild configuration
├── jest.config.js               # Testing configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project metadata & scripts
├── package-lock.json            # Exact dependency versions
└── .env.example                 # Environment variables template
```

### File Responsibilities

| Directory | Responsibility | Example |
|-----------|----------------|---------|
| **entities/** | Database schemas | `User.ts`, `Product.ts` |
| **controllers/** | HTTP endpoints | `user.controller.ts` |
| **services/** | Business logic | `user.service.ts` |
| **middleware/** | Cross-cutting concerns | Authentication, logging |
| **utils/** | Helper functions | Validation, logging, formatting |
| **types/** | TypeScript definitions | API responses, request DTOs |
| **config/** | Configuration | Database, external services |

---

## 🚀 Getting Started (Step-by-Step)

### Prerequisites

- **Docker Desktop** (includes Docker Engine + Docker Compose)
- **Git** (to clone and pull changes)
- **Terminal** (zsh/bash/PowerShell)

You do **not** need to install Node.js or PostgreSQL on your host machine for local development in this repo.

### Quick Start with Docker (Required)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd stellari-platform-api

# 2. Create local env file
cp .env.example .env

# 3. Start the full development stack
docker-compose up -d

# 4. Check that everything is running
curl http://localhost:3000/health
```

**What happens:**
- PostgreSQL database starts on port 5432
- Your API starts on port 3000
- pgAdmin starts on port 8080 (database GUI)
- Hot-reload enabled (changes restart server)

### Local Database Setup (Docker PostgreSQL)

The local database is provided by the `postgres` service in `docker-compose.yml`.

```bash
# Open a psql session in the container
docker-compose exec postgres psql -U postgres -d stellari_app

# Run a quick sanity query
docker-compose exec postgres psql -U postgres -d stellari_app -c "SELECT now();"
```

If you need a clean local DB reset:

```bash
docker-compose down -v
docker-compose up -d
```

### Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-04-12T...",
  "uptime": 123.45
}
```

---

## 💻 Development Workflow

### Daily Development Commands (Docker-First)

```bash
# Start all services (api + postgres + pgadmin)
docker-compose up -d

# Rebuild after Dockerfile/dependency changes
docker-compose up -d --build

# Stream API logs
docker-compose logs -f api

# Run tests in API container
docker-compose exec api npm test

# Run lint in API container
docker-compose exec api npm run lint

# Open PostgreSQL shell
docker-compose exec postgres psql -U postgres -d stellari_app

# Stop all services
docker-compose down
```

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Run tests in container
docker-compose exec api npm test

# Access database
docker-compose exec postgres psql -U postgres -d stellari_app

# Stop everything
docker-compose down
```

### Code Changes & Hot Reload

1. **Edit TypeScript files** in `src/`
2. **Server automatically restarts** (thanks to `ts-node`)
3. **Check browser/logs** for changes
4. **Run tests** to ensure nothing broke

### Local Testing Checklist

Use this checklist before opening a PR:

1. `docker-compose up -d --build`
2. `curl http://localhost:3000/health`
3. `docker-compose exec api npm test`
4. `docker-compose exec api npm run lint`
5. `docker-compose exec postgres psql -U postgres -d stellari_app -c "SELECT now();"`

---

## 🗄️ Database & TypeORM

### Database Configuration

Located in `src/config/database.ts`:

```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [/* Your entities */],
  synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Auto-sync in dev only
  logging: process.env.NODE_ENV === 'development',
});
```

### Creating Database Entities

**1. Create entity file** (copy from `Template.ts`):

```typescript
// src/entities/User.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  email: string;

  @Column('varchar', { length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

**2. Register entity** in `src/config/database.ts`:

```typescript
import { User } from '../entities/User';

const entities = [User]; // Add to entities array
```

### Database Migrations (Production)

```bash
# Generate migration from entity changes
npm run migration:generate -- -n CreateUsersTable

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Multi-Tenant Data Isolation

All data is scoped by `organizationId`:

```typescript
// In your service
const users = await userRepository.find({
  where: { organizationId: orgId },
});
```

---

## 🌐 API Design & Routes

### RESTful URL Structure

```
POST   /api/v1/:organizationId/users      # Create user
GET    /api/v1/:organizationId/users      # List users
GET    /api/v1/:organizationId/users/:id  # Get user
PATCH  /api/v1/:organizationId/users/:id  # Update user
DELETE /api/v1/:organizationId/users/:id  # Delete user
```

### Controller Structure

```typescript
// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  constructor(private userService = new UserService()) {}

  async create(req: Request, res: Response) {
    const { organizationId } = req.params;
    const user = await this.userService.create(organizationId, req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  }

  async findAll(req: Request, res: Response) {
    const { organizationId } = req.params;
    const users = await this.userService.findAll(organizationId);
    res.json({
      success: true,
      data: users,
    });
  }
}
```

### Service Layer (Business Logic)

```typescript
// src/services/user.service.ts
import { Repository } from 'typeorm';
import { User } from '../entities/User';

export class UserService {
  constructor(private userRepo: Repository<User>) {}

  async create(organizationId: string, data: CreateUserDto): Promise<User> {
    const user = this.userRepo.create({
      ...data,
      organizationId,
      id: uuidv4(),
    });
    return this.userRepo.save(user);
  }

  async findAll(organizationId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

### Route Registration

In `src/index.ts`:

```typescript
import { UserController } from './controllers/user.controller';

const userController = new UserController();

// Routes with organization scoping
app.post('/api/v1/:organizationId/users', userController.create);
app.get('/api/v1/:organizationId/users', userController.findAll);
app.get('/api/v1/:organizationId/users/:id', userController.findById);
```

---

## ✅ Validation & Error Handling

### Request Validation with Zod

```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
  }),
  params: z.object({
    organizationId: z.string().uuid(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
  }),
});
```

### Using Validation Middleware

```typescript
// In controller
import { validateRequest } from '../middleware/validation.middleware';

router.post('/', validateRequest(createUserSchema), userController.create);
router.patch('/:id', validateRequest(updateUserSchema), userController.update);
```

### Error Response Format

All errors return consistent JSON:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format"
  },
  "timestamp": "2026-04-12T10:30:00Z"
}
```

### Custom Errors

```typescript
// src/middleware/error.middleware.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
  }
}

// Usage in services
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
```

---

## 📝 Logging & Monitoring

### Structured Logging with Winston

```typescript
// src/utils/logger.ts
import { logger } from './logger';

// Info logging
logger.info('User created', {
  userId: '123',
  organizationId: 'org-456',
  action: 'create'
});

// Error logging
logger.error('Database connection failed', {
  error: error.message,
  host: process.env.DB_HOST,
  retryCount: 3
});
```

### Log Levels

- **error**: Serious problems
- **warn**: Warning conditions
- **info**: Important milestones (login, purchases)
- **debug**: Detailed debugging info

### Request Logging Middleware

Automatically logs all HTTP requests:

```
2026-04-12 10:30:00 INFO: GET /api/v1/org-123/users 200 - 45ms
2026-04-12 10:30:01 INFO: POST /api/v1/org-123/users 201 - 120ms
```

---

## 🐳 Docker & Containerization

### Containerization Pipeline (Dev to Prod)

1. **Local development (Docker Compose):**
  - `api` uses `Dockerfile.dev` for hot-reload and fast iteration.
  - `postgres` provides local PostgreSQL for development/testing.

2. **Continuous Integration (CodeBuild):**
  - `buildspec.yml` installs dependencies, runs lint/tests, and builds the production image using `Dockerfile`.

3. **Container Registry (Amazon ECR):**
  - CodeBuild tags and pushes versioned images to ECR.

4. **Runtime Deployment (ECS Fargate):**
  - ECS pulls the new image and rolls out updated tasks.
  - Health checks and task orchestration keep the service available.

### Development Container (`Dockerfile.dev`)

- **Single stage** with all dev tools
- **Hot reload** enabled
- **Source mounted** as volume
- **All dependencies** installed

### Production Container (`Dockerfile`)

- **Multi-stage build** for smaller images
- **Security hardened** (non-root user)
- **Only production dependencies**
- **Compiled JavaScript** only

### Local Development Stack

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:          # Your API (hot-reload)
  postgres:     # PostgreSQL database
  pgadmin:      # Database GUI (optional)
```

### Building & Running

```bash
# Development
docker-compose up -d

# Production build
docker build -t stellari-api .
docker run -p 3000:3000 stellari-api
```

---

## 🚀 AWS Deployment (CI/CD)

### Architecture

```
GitHub Push → CodePipeline → CodeBuild → ECR → ECS Fargate
```

### What `buildspec.yml` Does

1. **Install** dependencies
2. **Lint** code quality
3. **Test** with Jest
4. **Build** Docker image
5. **Push** to ECR
6. **Deploy** to ECS (automatic)

### Required Environment Variables

In AWS CodeBuild:

```
AWS_ACCOUNT_ID = your-aws-account-id
IMAGE_REPO_NAME = stellari-api
AWS_DEFAULT_REGION = us-east-1
```

### Production Environment Variables

Store in AWS Secrets Manager:

```json
{
  "DB_HOST": "your-rds-endpoint",
  "DB_PASSWORD": "{{resolve:secretsmanager:stellari/prod/db-password}}",
  "NODE_ENV": "production"
}
```

---

## 🧪 Testing & Quality Assurance

### Test Structure

```
src/
├── controllers/
│   ├── user.controller.ts
│   └── user.controller.test.ts    # Unit tests
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts       # Unit tests
└── integration/
    └── api.test.ts                # API integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test user.controller.test.ts
```

### Example Unit Test

```typescript
// src/controllers/user.controller.test.ts
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
    } as any;

    controller = new UserController(mockService);
  });

  it('should create user', async () => {
    const mockUser = { id: '1', name: 'John' };
    mockService.create.mockResolvedValue(mockUser);

    const req = { body: { name: 'John' }, params: { organizationId: 'org-1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.create(req as any, res as any);

    expect(mockService.create).toHaveBeenCalledWith('org-1', { name: 'John' });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type check
npx tsc --noEmit
```

---

## 🔧 Configuration & Environment

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `stellari_app` |

### AWS Secrets Manager (Production)

For production, use AWS Secrets Manager:

```bash
# Create secret
aws secretsmanager create-secret \
  --name stellari/prod/db-password \
  --secret-string "your-secure-password"
```

Reference in environment:

```yaml
DB_PASSWORD: "{{resolve:secretsmanager:stellari/prod/db-password}}"
```

---

## 🐛 Troubleshooting

### Common Issues

**"Port 3000 already in use"**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**"Database connection failed"**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# Restart database
docker-compose restart postgres
```

**"TypeORM entity not found"**
- Check entity is registered in `src/config/database.ts`
- Ensure `@Entity()` decorator is present
- Verify table name matches database

**"Validation errors"**
- Check Zod schema matches request body
- Use `validateRequest()` middleware
- Check TypeScript types match validation schema

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database connections
docker-compose exec postgres psql -U postgres -d stellari_app -c "SELECT * FROM users;"
```

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Database connectivity
docker-compose exec api npm run migration:run
```

---

## 📚 Learning Resources

### TypeScript & Node.js
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### TypeORM
- [TypeORM Documentation](https://typeorm.io/)
- [Entity Decorators](https://typeorm.io/entities)
- [Migrations Guide](https://typeorm.io/migrations)

### Validation & Security
- [Zod Documentation](https://zod.dev/)
- [Helmet Security](https://helmetjs.github.io/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

### Docker & AWS
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)
- [AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/)

---

## 🚦 Next Steps

### Immediate (First Day)
1. **Clone and run** the boilerplate
2. **Explore the code structure**
3. **Create your first entity** (copy from Template.ts)
4. **Add a simple endpoint**

### Week 1
1. **Set up your entities** and database schema
2. **Implement CRUD operations** for main resources
3. **Add validation** and error handling
4. **Write unit tests**

### Week 2
1. **Add authentication** middleware
2. **Implement business logic** in services
3. **Add API documentation** (Swagger/OpenAPI)
4. **Set up monitoring** and logging

### Production Ready
1. **Security audit** and penetration testing
2. **Performance optimization**
3. **Load testing**
4. **Deploy to production**

---

## 🤝 Contributing

### Development Process
1. **Create feature branch** from `main`
2. **Write tests first** (TDD approach)
3. **Implement feature** with proper error handling
4. **Update documentation**
5. **Create pull request**

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint** rules enforced
- **Prettier** for consistent formatting
- **Jest** for testing
- **Conventional commits** for git messages

### Commit Message Format
```
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
test: add integration tests for user service
```

---

## 📞 Support

### Getting Help
1. **Check this README** first
2. **Search existing issues** on GitHub
3. **Check logs** with `docker-compose logs`
4. **Run tests** to isolate issues

### Common Questions
- *"How do I add a new entity?"* → Copy `Template.ts` and register in database config
- *"How do I add validation?"* → Create Zod schema in `validators.ts`
- *"How do I add middleware?"* → Add to `src/middleware/` and register in `index.ts`
- *"How do I deploy?"* → Push to GitHub, CodePipeline handles the rest

---

*This boilerplate is designed to get you from idea to production API quickly and safely. Start small, iterate often, and deploy confidently!* 🚀
