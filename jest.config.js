// ============================================================================
// JEST CONFIGURATION - TypeScript Testing Framework
// ============================================================================
//
// WHAT IS THIS FILE?
// - Configuration for Jest testing framework
// - Enables TypeScript testing in Node.js environment
// - Defines test discovery, execution, and coverage rules
//
// WHY DO WE NEED IT?
// - TypeScript requires transpilation before testing
// - Jest needs to know where to find tests
// - Coverage collection needs file patterns
// - Node.js environment for API testing (no DOM)
//
// HOW IT WORKS:
// 1. ts-jest preset handles TypeScript → JavaScript conversion
// 2. Tests run in Node.js (server-side, no browser)
// 3. Finds tests in __tests__ folders or *.test.ts/*.spec.ts files
// 4. Collects coverage from all TypeScript files except declarations
//
// ============================================================================

module.exports = {
  // PRESET: Use ts-jest for TypeScript support
  // - Handles TypeScript compilation during testing
  // - Provides TypeScript-aware test utilities
  // - Integrates with Jest's expect() assertions
  preset: 'ts-jest',

  // TEST ENVIRONMENT: Node.js runtime
  // - API tests run on server-side (no browser DOM)
  // - Matches production Express.js environment
  // - Faster than jsdom for backend testing
  testEnvironment: 'node',

  // ROOTS: Where to look for tests and source files
  // - <rootDir> = project root directory
  // - Only scan src/ folder (not node_modules, dist, etc.)
  // - Speeds up test discovery
  roots: ['<rootDir>/src'],

  // TEST MATCH: File patterns for test files
  // - **/__tests__/**/*.ts: Any .ts file in __tests__ folders
  // - **/?(*.)+(spec|test).ts: Files ending with .spec.ts or .test.ts
  // - Supports nested folder structures
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  // COVERAGE COLLECTION: Which files to include in coverage reports
  // - src/**/*.ts: All TypeScript files in src/
  // - !src/**/*.d.ts: Exclude TypeScript declaration files (.d.ts)
  // - Declaration files are auto-generated, not user code
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],

  // ============================================================================
  // USAGE EXAMPLES:
  // ============================================================================
  //
  // Test file locations (all valid):
  // - src/controllers/user.controller.test.ts
  // - src/services/__tests__/user.service.ts
  // - src/utils/validators.spec.ts
  //
  // Running tests:
  // - npm test: Run all tests
  // - npm run test:watch: Watch mode for development
  // - npm run test:coverage: Generate coverage reports
  //
  // Coverage reports generated in:
  // - coverage/lcov-report/index.html (HTML)
  // - coverage/coverage-final.json (JSON)
  //
  // ============================================================================
};