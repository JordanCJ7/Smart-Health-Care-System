/**
 * Jest Setup File
 * Ensures tests use the test database, not production
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test file for testing
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Verify we're using test database
console.log('🧪 Test Environment Loaded');
console.log('📦 Database:', process.env.MONGO_URI);

if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes('test')) {
  console.warn('⚠️  WARNING: You may not be using a test database!');
  console.warn('⚠️  Please ensure MONGO_URI contains "test" in .env.test');
}
