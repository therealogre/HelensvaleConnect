# Helensvale Connect

A modern web platform connecting local businesses with the Helensvale community. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **Role-based Authentication** - Separate dashboards for customers, vendors, and admins
- **Business Directory** - Comprehensive listing of local services
- **Online Booking System** - Easy appointment scheduling
- **Reviews & Ratings** - Community-driven feedback system
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Notifications** - Stay updated on bookings and activities
- **Payment Integration** - Multiple payment methods supported
- **Geolocation Services** - Find businesses near you

## 🏗️ Architecture

```
helensvale-connect/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── app.js
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   ├── public/
│   └── package.json
└── config/          # Configuration files
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing

### Frontend
- **React** - UI library
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Query** - Data fetching

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd HelensvaleConnect
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### 4. Database Setup
Make sure MongoDB is running and create a database named `helensvale_connect`.

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/helensvale_connect
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_NAME=Helensvale Connect
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Vendors Endpoints
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor (auth required)
- `PUT /api/vendors/:id` - Update vendor (auth required)

### Bookings Endpoints
- `GET /api/bookings` - Get user bookings (auth required)
- `POST /api/bookings` - Create booking (auth required)
- `PUT /api/bookings/:id` - Update booking (auth required)
- `PUT /api/bookings/:id/cancel` - Cancel booking (auth required)

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set up SSL certificates
- Configure reverse proxy (nginx recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email hello@helensvaleconnect.art or join our community Discord.

## 🗺️ Roadmap

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed development milestones and future features.