/**
 * MongoDB Connection Module
 * 
 * This module provides a singleton connection to MongoDB using Mongoose.
 * It implements connection caching to prevent multiple connections in 
 * serverless environments like Vercel, where each API route invocation
 * could potentially create a new connection.
 */

import mongoose from 'mongoose';
import { env } from '@/env';

// Environment variables validated by @t3-oss/env-nextjs
const MONGODB_URL = env.MONGODB_URL;
const DB_NAME = env.DB_NAME;

/**
 * Global cache for MongoDB connection
 * In serverless environments, we need to cache the connection to avoid
 * creating multiple connections on each function invocation
 */
let cached = global.mongoose;

// Initialize cache if it doesn't exist
if (!cached) cached = global.mongoose = { conn: null, promise: null };

/**
 * Establishes a connection to MongoDB
 * 
 * @returns Promise<mongoose.Connection> - The active MongoDB connection
 * 
 * Features:
 * - Connection pooling with configurable min/max pool sizes
 * - Automatic retry logic with timeout configurations
 * - Singleton pattern to prevent connection leaks
 * - Optimized for serverless environments
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Return existing connection if available
  if (cached!.conn) return cached!.conn;

  // Create new connection promise if none exists
  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      // Disable buffering to fail fast if connection is lost
      bufferCommands: false,
      // Specify the database name
      dbName: DB_NAME,
      // Connection pool configuration
      maxPoolSize: 10,        // Maximum number of sockets the driver will keep open
      minPoolSize: 5,         // Minimum number of sockets to keep open
      // Timeout configurations
      socketTimeoutMS: 45000, // How long to wait for a response from the server
      serverSelectionTimeoutMS: 5000, // How long to wait to find an available server
      maxIdleTimeMS: 10000,   // How long a connection can remain idle before being closed
    };

    // Disable strict query mode for flexible schema queries
    mongoose.set('strictQuery', false);

    // Create connection promise with error handling
    cached!.promise = mongoose
      .connect(MONGODB_URL, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose.connection;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        // Clear promise cache on error to allow retry
        cached!.promise = null;
        throw error;
      });
  }

  // Wait for connection and cache it
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    // Clear promise cache on error to allow retry
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

/**
 * MongoDB Connection Event Listeners
 * These help monitor the connection state throughout the application lifecycle
 */

// Emitted when Mongoose successfully connects to MongoDB
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

// Emitted when Mongoose encounters a connection error
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Emitted when Mongoose loses connection to MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

/**
 * Graceful Shutdown Handler
 * Ensures the MongoDB connection is properly closed when the application terminates
 * This prevents connection leaks and ensures clean shutdown
 */
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default connectDB;

