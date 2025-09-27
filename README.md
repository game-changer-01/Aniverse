# AnimeVerse

A modern, full-stack anime streaming platform built with Next.js and Node.js.

## 🚀 Features

- **Full-Stack Architecture**: React/Next.js frontend with Node.js/Express backend
- **User Authentication**: Secure JWT-based authentication system
- **Anime Catalog**: Browse featured and trending anime with detailed information
- **Video Streaming**: HLS video streaming with progress tracking
- **Personalized Recommendations**: AI-powered content suggestions
- **Responsive Design**: Mobile-first design with beautiful animations
- **Cloud Storage**: Cloudflare R2 integration for media files
- **CI/CD Pipeline**: Automated deployment to Vercel and Render

## 📁 Project Structure

```
aniverse/
├── backend/                 # Node.js/Express API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── seed.js            # Database seeding
│   └── package.json
├── frontend/               # Next.js React app
│   ├── pages/             # Next.js pages
│   ├── src/
│   │   ├── components/    # React components
│   │   └── styles/        # Global styles
│   └── package.json
├── .github/
│   └── workflows/         # CI/CD pipelines
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudflare R2 account (optional, for file storage)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key
   - Cloudflare R2 credentials (if using)

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your backend URL

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running at `http://localhost:3000`

## 🚀 Deployment

### Automated Deployment

The project includes GitHub Actions workflows for automated deployment:

- **Frontend**: Deploys to Vercel
- **Backend**: Deploys to Render

### Required Secrets

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel deployment token
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key

### Manual Deployment

#### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

#### Backend (Render)
Connect your GitHub repository to Render and configure:
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Anime
- `GET /api/anime` - Get all anime (with pagination)
- `GET /api/anime/featured` - Get featured anime
- `GET /api/anime/trending` - Get trending anime
- `GET /api/anime/:id` - Get specific anime
- `GET /api/anime/:id/episodes` - Get anime episodes

### Streaming
- `GET /api/stream/:animeId/episode/:episodeNum` - Get stream URL

### Recommendations
- `GET /api/recommend` - Get personalized recommendations

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting (recommended for production)

## 🎨 Frontend Components

### Core Components
- `AnimeCard`: Displays anime with poster and title
- `AnimeRow`: Horizontal scrollable row of anime cards

### Styling
- Dark theme optimized for media consumption
- Smooth hover animations
- Responsive design for all screen sizes
- Custom scrollbars

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (375px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Performance Optimizations

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for better performance
- Efficient database queries with MongoDB indexes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [GitHub Issues](https://github.com/your-username/aniverse/issues)
2. Create a new issue with detailed information
3. Include error logs and reproduction steps

---

**Made with ❤️ by the AnimeVerse Team**
