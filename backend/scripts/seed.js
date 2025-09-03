#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase, clearDatabase } = require('../src/seeders/sampleData');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helensvale_connect', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        console.log('Usage: node scripts/seed.js [seed|clear|reset]');
        console.log('  seed  - Add sample data to the database');
        console.log('  clear - Remove all data from the database');
        console.log('  reset - Clear and then seed the database');
        break;
    }
    
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeder error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runSeeder();
