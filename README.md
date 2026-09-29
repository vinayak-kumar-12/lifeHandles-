# lifeHandles-

Full-stack application consisting of an Expo / React Native frontend and a Node.js / Express backend.

## Project Structure

```
├── Frontend/      # Expo / React Native client application
├── backend/       # Express.js API server & PostgreSQL database integration
└── README.md
```

## Getting Started

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in your database and configuration values.
4. Run the server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and adjust the API URL.
4. Start Expo:
   ```bash
   npx expo start
   ```
