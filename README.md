# 🌍 Globe Trotter

<div align="center">

![Globe Trotter](https://img.shields.io/badge/Globe-Trotter-blue?style=for-the-badge&logo=globe&logoColor=white)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**A comprehensive travel planning platform that helps you organize, plan, and manage your trips with ease.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🗺️ Trip Planning
- **Create and manage trips** with customizable titles, dates, and descriptions
- **Add multiple stops** to your itinerary with flexible scheduling
- **Activity management** - Plan activities for each destination
- **Budget tracking** - Track transport, stay, food, and activity costs

### 🔍 Destination Discovery
- **Search places** using Google Places API integration
- **View top regions** and featured destinations
- **Explore nearby attractions** with location-based recommendations
- **Get detailed place information** including ratings and reviews

### 👤 User Management
- **Secure authentication** with JWT-based login/signup
- **Password recovery** via OTP-based email verification
- **User profiles** with customizable information
- **Session management** with secure token handling

### 🤝 Collaboration
- **Share trips** with friends and family via email
- **Permission-based access** for shared trips
- **Public/private trip visibility** controls

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **React Router v7** | Client-side Routing |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express 5** | Server Framework |
| **Prisma ORM** | Database Management |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **Bcrypt** | Password Hashing |
| **Nodemailer** | Email Services |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/globe-trotter.git
   cd globe-trotter
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/globetrotter"
   JWT_SECRET="your-super-secret-jwt-key"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   GOOGLE_PLACES_API_KEY="your-google-places-api-key"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the backend server**
   ```bash
   npm start
   ```

6. **Set up the Frontend**
   ```bash
   cd ../frontend/globe-trotter
   npm install
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173` to access the application.

---

## 📁 Project Structure

```
odoo-hackathon/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   │   ├── tripcontroller.js
│   │   └── usercontroller.js
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── routes/           # API routes
│   │   ├── triproutes.js
│   │   └── userroutes.js
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
│
└── frontend/globe-trotter/
    ├── public/           # Static assets
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Page components
        │   ├── LandingPage.tsx
        │   ├── LoginScreen.tsx
        │   ├── RegistrationScreen.tsx
        │   ├── ForgotPasswordScreen.tsx
        │   ├── ProfilePage.tsx
        │   ├── TripPlannerPage.tsx
        │   ├── TripDetailPage.tsx
        │   └── MyTripsPage.tsx
        ├── services/     # API services
        └── styles/       # CSS styles
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/signup` | Register new user |
| `POST` | `/api/users/login` | User login |
| `POST` | `/api/users/logout` | User logout |
| `GET` | `/api/users/me/:id` | Get user profile |
| `POST` | `/api/users/forgot-password-otp` | Request password reset OTP |
| `POST` | `/api/users/reset-password-otp` | Reset password with OTP |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trips/user/:userId` | Get user's trips |
| `GET` | `/api/trips/:tripId` | Get trip details |
| `POST` | `/api/trips/` | Create new trip |
| `PUT` | `/api/trips/:tripId` | Update trip |
| `DELETE` | `/api/trips/:tripId` | Delete trip |

### Trip Stops

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/:tripId/stops` | Add stop to trip |
| `PUT` | `/api/trips/:tripId/stops/:stopId` | Update stop |
| `DELETE` | `/api/trips/:tripId/stops/:stopId` | Delete stop |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/:tripId/stops/:stopId/activities` | Add activity |
| `PUT` | `/api/trips/:tripId/stops/:stopId/activities/:activityId` | Update activity |
| `DELETE` | `/api/trips/:tripId/stops/:stopId/activities/:activityId` | Delete activity |

### Places (Google API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trips/places/search` | Search places |
| `GET` | `/api/trips/places/details/:placeId` | Get place details |
| `GET` | `/api/trips/places/nearby` | Get nearby places |
| `GET` | `/api/trips/banner` | Get promotional banners |
| `GET` | `/api/trips/regions/top` | Get featured destinations |

---

## 📊 Database Schema

The application uses the following data models:

- **User** - User accounts with authentication
- **Trip** - Travel plans with dates and descriptions
- **TripStop** - Destinations within a trip
- **City** - City information with cost index
- **Activity** - Available activities in cities
- **TripActivity** - Scheduled activities for trips
- **TripBudget** - Budget breakdown per trip
- **TripShare** - Trip sharing with permissions

---

## 🎨 Screenshots

| Landing Page | Trip Planner | My Trips |
|:------------:|:------------:|:--------:|
| Discover destinations | Plan your itinerary | View past trips |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for the **Odoo Hackathon**

---

<div align="center">

**[⬆ Back to Top](#-globe-trotter)**

</div>
