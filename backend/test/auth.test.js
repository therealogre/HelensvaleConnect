const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../src/models/User');

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '0412345678',
  password: 'Test@1234',
  confirmPassword: 'Test@1234',
  acceptTerms: true
};

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helensvale_connect_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clean up database after each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 400 with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should return 400 with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });
});
