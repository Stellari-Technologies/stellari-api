/**
 * ============================================================================
 * DATABASE CONFIGURATION FILE
 * ============================================================================
 * 
 * WHAT DOES THIS FILE DO?
 * - Configures the PostgreSQL database connection using TypeORM
 * - Defines which entities (tables) exist in the database
 * - Handles automatic database initialization on app startup
 * - Manages connection settings (host, port, credentials, etc.)
 * 
 * THIS FILE IS USED IN:
 * 1. src/index.ts         - Calls initDatabase() to connect on startup
 * 2. src/services/*.ts    - Uses AppDataSource to query entities
 * 3. src/entities/*.ts    - Entities are registered here
 * 
 * ============================================================================
 * HOW TO USE THIS FILE
 * ============================================================================
 * 
 * STEP 1: CREATE AN ENTITY
 * Copy src/entities/Template.ts and create your entity, e.g., src/entities/User.ts
 * 
 * STEP 2: REGISTER THE ENTITY HERE
 * Import your entity and add it to the entities array:
 * 
 *   import { User } from '../entities/User';
 *   import { TemplateItem } from '../entities/Template';
 * 
 *   const entities = [TemplateItem, User];
 * 
 * STEP 3: USE IN SERVICES
 * In your service, use AppDataSource to get a repository:
 * 
 *   import { AppDataSource } from '../config/database';
 *   import { User } from '../entities/User';
 * 
 *   export class UserService {
 *     private userRepository = AppDataSource.getRepository(User);
 * 
 *     async create(data: CreateUserDto) {
 *       const user = this.userRepository.create(data);
 *       return this.userRepository.save(user);
 *     }
 *   }
 * 
 * STEP 4: INITIALIZE DATABASE ON STARTUP
 * In src/index.ts:
 * 
 *   import { initDatabase } from './config/database';
 * 
 *   const startServer = async () => {
 *     await initDatabase();  // ← Connects to PostgreSQL
 *     app.listen(port);
 *   };
 * 
 * ============================================================================
 * CONFIGURATION EXPLAINED
 * ============================================================================
 * 
 * type: 'postgres'
 *   - Uses PostgreSQL database
 *   - Change to 'mysql', 'sqlite', etc. for other databases
 * 
 * host, port, username, password
 *   - Connection credentials from .env variables
 *   - Falls back to defaults if not set
 *   - For local dev: localhost:5432 with postgres/postgres
 *   - For AWS: RDS endpoint with your credentials
 * 
 * database: 'stellari_app'
 *   - Which PostgreSQL database to use
 *   - Must exist on server (create with: CREATE DATABASE stellari_app;)
 *   - Change DB_NAME in .env to use different database
 * 
 * synchronize: NODE_ENV !== 'production'
 *   - In development: Auto-create/update tables on startup
 *   - In production: DISABLED (use migrations instead)
 *   - WARNING: Never use synchronize in production!
 * 
 * logging: NODE_ENV !== 'production'
 *   - In development: Log all SQL queries to console
 *   - Helpful for debugging database issues
 *   - In production: Disabled to reduce log noise
 * 
 * entities: [TemplateItem, User, ...]
 *   - Tell TypeORM which classes are database entities
 *   - Each entity = one database table
 *   - IMPORTANT: Must register here or table won't be created
 * 
 * migrations: ['src/migrations/*.ts']
 *   - Production-safe way to change schema
 *   - Run: npm run migration:generate -- -n CreateUsers
 *   - Run: npm run migration:run
 * 
 * ============================================================================
 * COMMON TASKS
 * ============================================================================
 * 
 * ADD A NEW ENTITY:
 * 1. Create src/entities/Article.ts
 * 2. Import in this file: import { Article } from '../entities/Article';
 * 3. Add to entities: const entities = [TemplateItem, User, Article];
 * 4. Tables auto-created on next app startup (in dev mode)
 * 
 * QUERY DATA IN SERVICE:
 *   const users = await this.userRepository.find({ where: { active: true } });
 *   const user = await this.userRepository.findOne({ where: { id } });
 *   const user = this.userRepository.create({ name: 'John' });
 *   await this.userRepository.save(user);
 * 
 * CHECK DATABASE:
 *   docker-compose exec postgres psql -U postgres -d stellari_app
 *   \dt                    // List all tables
 *   \d users               // Show users table schema
 *   SELECT * FROM users;   // Query data
 * 
 * CREATE FOR PRODUCTION:
 *   npm run migration:generate -- -n CreateAllTables
 *   This creates migrations instead of auto-sync
 * 
 * ============================================================================
 */

import { DataSource } from 'typeorm';
import { TemplateItem } from '../entities/Template';

/**
 * ENTITIES ARRAY
 * 
 * List all your database entities (tables) here.
 * Each entity becomes a database table.
 * 
 * After creating a new entity:
 * 1. Import it: import { User } from '../entities/User';
 * 2. Add to array: const entities = [TemplateItem, User];
 * 3. Restart app - table auto-created in dev mode
 */
const entities = [TemplateItem];

/**
 * AppDataSource
 * 
 * This is the TypeORM connection object.
 * Use this to query your database in services/repositories.
 * 
 * Example:
 *   const userRepository = AppDataSource.getRepository(User);
 *   const users = await userRepository.find();
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'stellari_app',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities,
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

/**
 * initDatabase()
 * 
 * Call this function on app startup to connect to PostgreSQL.
 * 
 * Usage in src/index.ts:
 *   import { initDatabase } from './config/database';
 * 
 *   const startServer = async () => {
 *     try {
 *       await initDatabase();  // ← Connects here
 *       app.listen(port);
 *     } catch (error) {
 *       process.exit(1);
 *     }
 *   };
 */
export const initDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
