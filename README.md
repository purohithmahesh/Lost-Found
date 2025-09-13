# Lost & Found Community Web App 🎯

A comprehensive community-driven web application for helping people find lost items and return found items to their owners. Built with modern web technologies and featuring real-time communication, AI-powered matching, and gamification elements.

## ✨ Features

### 🔐 User Authentication
- **Email/Password Registration & Login**
- **Secure JWT Authentication**
- **User Profile Management**
- **Password Change & Recovery**

### 📱 Core Functionality
- **Post Lost/Found Items** with image uploads
- **Advanced Search & Filtering** by category, location, and type
- **Real-time Chat System** between users
- **Interactive Map View** with item locations
- **AI-Powered Matching** for potential item matches

### 🗺️ Location Services
- **Google Maps Integration** for precise location input
- **Geospatial Search** for nearby items
- **Location-based Filtering**

### 💬 Communication
- **Real-time Chat** using Socket.IO
- **Direct Messaging** between users
- **Push Notifications** for matches and messages
- **Email Notifications** for important updates

### 🏆 Gamification
- **Point System** for helpful actions
- **Badges & Achievements**
- **Leaderboard** for top community helpers
- **Level Progression**

### 📱 Progressive Web App
- **Mobile-First Design**
- **Offline Capabilities**
- **App-like Experience**
- **QR Code Generation** for each post

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Cloudinary** for image management
- **Multer** for file uploads

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Socket.IO Client** for real-time features

### Additional Tools
- **Leaflet** for interactive maps
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Date-fns** for date manipulation

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn** package manager
- **Cloudinary** account for image uploads
- **Google Maps API** key for location services

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lost-found-community-app
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lost-found-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Database Setup
Make sure MongoDB is running and accessible at the configured URI.

### 5. Start the Application

#### Development Mode (Both Server & Client)
```bash
npm run dev
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

#### Individual Services
```bash
# Start server only
npm run server

# Start client only
npm run client
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Items
- `GET /api/items` - Get all items with filters
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/nearby/:userId` - Get nearby items
- `GET /api/items/matches/:itemId` - Get potential matches

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat/start` - Start new chat
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message

### Users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/:id` - Get user profile
- `GET /api/users/stats/global` - Get global statistics

## 🎨 Key Components

### Frontend Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── auth/          # Authentication components
│   ├── items/         # Item-related components
│   ├── chat/          # Chat components
│   ├── layout/        # Layout components
│   └── ui/            # Generic UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
└── utils/              # Utility functions
```

### Backend Structure
```
server/
├── models/             # Database models
├── routes/             # API route handlers
├── middleware/         # Custom middleware
├── config/             # Configuration files
└── index.js            # Main server file
```

## 🔧 Configuration

### MongoDB
The application uses MongoDB with Mongoose. Make sure to:
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `lost-found-app`
- Ensure proper indexes are created for geospatial queries

### Cloudinary
For image uploads:
1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Configure the environment variables

### Google Maps
For location services:
1. Get a Google Maps API key
2. Enable the necessary APIs (Maps JavaScript API, Geocoding API)
3. Set the API key in environment variables

## 📱 Progressive Web App Features

The application includes PWA capabilities:
- **Service Worker** for offline functionality
- **Web App Manifest** for app-like experience
- **Responsive Design** for all device sizes
- **Fast Loading** with optimized assets

## 🎯 Gamification System

### Points System
- **+10 points** for posting an item
- **+50 points** for resolving an item
- **+25 points** for helping others

### Badges
- **Level Badges** for reaching milestones
- **Helper Badges** for community contributions
- **Specialty Badges** for specific achievements

### Leaderboard
- **Weekly/Monthly/Yearly** rankings
- **Top Helpers** recognition
- **Community Statistics**

## 🚀 Deployment

### Heroku
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build image
docker build -t lost-found-app .

# Run container
docker run -p 5000:5000 lost-found-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database
- **Socket.IO** for real-time capabilities
- **Community Contributors** for feedback and improvements

## 📞 Support

If you have any questions or need help:

- **Create an Issue** on GitHub
- **Check the Documentation** in the `/docs` folder
- **Join our Community** discussions

## 🔮 Future Enhancements

- [ ] **Machine Learning** for better item matching
- [ ] **Blockchain Integration** for item verification
- [ ] **Multi-language Support** for global communities
- [ ] **Advanced Analytics** and reporting
- [ ] **Integration** with social media platforms
- [ ] **Mobile Apps** for iOS and Android

---

**Made with ❤️ for the community**


<img width="1919" height="855" alt="image" src="https://github.com/user-attachments/assets/984eba66-279f-4da4-9948-fa6c02421157" />
<img width="1876" height="911" alt="image" src="https://github.com/user-attachments/assets/0a9ff480-c6b8-4728-be53-3d236a232da1" />
<img width="1918" height="864" alt="Screenshot 2025-09-13 140732" src="https://github.com/user-attachments/assets/8255d60d-4c7f-4621-88a7-8db1b72d5161" />
<img width="1579" height="887" alt="Screenshot 2025-09-13 140829" src="https://github.com/user-attachments/assets/675eb83e-899a-4ee0-9250-b8726c2c9b25" />

<img width="1770" height="888" alt="image" src="https://github.com/user-attachments/assets/6aa20fba-0051-47c3-9fa0-a8e1f458ce43" />
<img width="1848" height="909" alt="image" src="https://github.com/user-attachments/assets/5477b904-016a-4aa2-898e-7b62534cf9e4" />

