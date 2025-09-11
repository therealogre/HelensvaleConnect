const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database configuration and connection management
 * Implements connection pooling, retry logic, and monitoring
 */
class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/helensvale_connect';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      };

      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info('Successfully connected to MongoDB', {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      });

      // Set up connection event listeners
      this.setupEventListeners();
      
      return true;
    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;
      
      logger.error(`MongoDB connection failed (attempt ${this.connectionRetries}/${this.maxRetries})`, {
        error: error.message,
        stack: error.stack
      });

      if (this.connectionRetries < this.maxRetries) {
        logger.info(`Retrying connection in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        logger.error('Max connection retries reached. Exiting application.');
        process.exit(1);
      }
      
      return false;
    }
  }

  /**
   * Set up MongoDB connection event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', { error: error.message });
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost');
      this.isConnected = false;
      
      // Attempt to reconnect
      if (this.connectionRetries < this.maxRetries) {
        setTimeout(() => this.connect(), this.retryDelay);
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
      this.connectionRetries = 0;
    });

    // Handle application termination
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  /**
   * Gracefully close database connection
   */
  async gracefulShutdown() {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;
