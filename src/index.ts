/**
 * ============================================================================
 * MAIN APPLICATION FILE
 * ============================================================================
 *
 * WHAT IS THIS?
 * - Entry point for the entire Express application
 * - Sets up middleware, routes, and error handling
 * - Initializes database connection
 * - Starts the HTTP server
 *
 * HOW TO RUN?
 *
 *   npm start        → Run compiled JavaScript (production)
 *   npm run dev      → Run with ts-node (development)
 *   npm run build    → Compile TypeScript first
 *
 * REQUEST FLOW:
 *
 *   Request comes in
 *   ↓
 *   Middleware: helmet (security headers)
 *   ↓
 *   Middleware: cors (cross-origin support)
 *   ↓
 *   Middleware: express.json (parse JSON)
 *   ↓
 *   Middleware: logging
 *   ↓
 *   Route handlers (health check, API routes)
 *   ↓
 *   If no route matches → 404 handler
 *   ↓
 *   If error thrown → Error middleware handles
 *   ↓
 *   Response sent to client
 *
 * ============================================================================
 * MIDDLEWARE SETUP
 * ============================================================================
 *
 * helmet()
 *   - Adds security headers to responses
 *   - Protects against XSS, clickjacking, etc
 *   - Essential for production
 *
 * cors()
 *   - Allows requests from other domains
 *   - Configured in your frontend deployment
 *   - Without this: frontend can't call your API
 *
 * express.json()
 *   - Parses incoming JSON request bodies
 *   - Converts JSON strings to JavaScript objects
 *   - So req.body is available in controllers
 *
 * Custom logging middleware
 *   - Logs every incoming request with method + path
 *   - Useful for debugging and monitoring
 *
 * ============================================================================
 * ADDING ROUTES (HOW TO)
 * ============================================================================
 *
 * STEP 1: Create entity, service, controller
 *   src/entities/User.ts
 *   src/services/user.service.ts
 *   src/controllers/user.controller.ts
 *
 * STEP 2: Register entity in database.ts
 *   entities: [User, ...]
 *
 * STEP 3: Create router and add routes below the health check
 *
 *   import { UserController } from './controllers/user.controller';
 *   import { createUserSchema } from './utils/validators';
 *   import { validateRequest } from './middleware/validation.middleware';
 *
 *   const userController = new UserController();
 *   const userRouter = express.Router();
 *
 *   // POST /api/v1/org-123/users
 *   userRouter.post(
 *     '/',
 *     validateRequest(createUserSchema),  // Validate request
 *     userController.create
 *   );
 *
 *   // GET /api/v1/org-123/users
 *   userRouter.get('/', userController.findAll);
 *
 *   // GET /api/v1/org-123/users/:id
 *   userRouter.get('/:id', userController.findById);
 *
 *   // PATCH /api/v1/org-123/users/:id
 *   userRouter.patch(
 *     '/:id',
 *     validateRequest(updateUserSchema),
 *     userController.update
 *   );
 *
 *   // DELETE /api/v1/org-123/users/:id
 *   userRouter.delete('/:id', userController.delete);
 *
 *   app.use('/api/v1/:organizationId/users', userRouter);
 *
 * ROUTE NAMING CONVENTION:
 *   /api/v1/:organizationId/RESOURCE_NAME
 *
 *   Examples:
 *   /api/v1/:organizationId/users
 *   /api/v1/:organizationId/rewards
 *   /api/v1/:organizationId/orders
 *
 * MULTI-TENANT PATTERN:
 *   All routes include /:organizationId in path
 *   This isolates data per organization
 *   Controllers extract organizationId from req.params
 *   Services query with organizationId for data safety
 *
 * ============================================================================
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import { HTTP_STATUS } from "./constants";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

/**
 * ============================================================================
 * MIDDLEWARE SETUP
 * ============================================================================
 */

// Security headers
app.use(helmet());

// Cross-origin resource sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: Function) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/**
 * ============================================================================
 * ROUTES
 * ============================================================================
 */

/**
 * Health Check Endpoint
 * Used by load balancers to verify server is running
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API ROUTES - Add your controllers here
 *
 * EXAMPLE:
 *
 *   import { UserController } from './controllers/user.controller';
 *   import { validateRequest } from './middleware/validation.middleware';
 *   import { createUserSchema, updateUserSchema } from './utils/validators';
 *
 *   const userController = new UserController();
 *   const userRouter = express.Router();
 *
 *   userRouter.post('/', validateRequest(createUserSchema), userController.create);
 *   userRouter.get('/', userController.findAll);
 *   userRouter.get('/:id', userController.findById);
 *   userRouter.patch('/:id', validateRequest(updateUserSchema), userController.update);
 *   userRouter.delete('/:id', userController.delete);
 *
 *   app.use('/api/v1/:organizationId/users', userRouter);
 */

// TODO: Import and add your route handlers here
//
// ─── Auth Routes ─────────────────────────────────────────────────────────────
import { AuthController } from "./controllers/auth.controller";
import { requireAuth } from "./middleware/auth.middleware";

const authController = new AuthController();
const authRouter = express.Router();

// POST /api/v1/auth/setup
// Called after owner signs up via Cognito
// requireAuth verifies the token and sets req.user
authRouter.post("/setup", requireAuth, authController.setup);

app.use("/api/v1/auth", authRouter);
/**
 * ============================================================================
 * ERROR HANDLERS
 * ============================================================================
 */

/**
 * 404 Not Found Handler
 * Handles all requests that don't match any route
 */
app.use((req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Error Handling Middleware
 * Must be added AFTER all other middleware and routes
 * Catches all errors thrown in controllers/services
 */
app.use(errorHandler);

/**
 * ============================================================================
 * SERVER STARTUP
 * ============================================================================
 */

const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();

    // Start HTTP server
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
      logger.info(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
