# Deployment Guide

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/multi-agent-app-builder.git
cd multi-agent-app-builder
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Add your Together AI API key to .env
npm start
```

3. **Frontend Setup**
```bash
# In a new terminal, from project root
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🔧 Environment Configuration

### Required Environment Variables

Create `backend/.env` with:
```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# AI Service Configuration
OPENAI_API_KEY=your_together_ai_api_key_here

# Optional Configuration
NODE_ENV=development
MAX_FILE_SIZE=5242880
MAX_VERSIONS=10
MAX_PROJECTS=100
```

### API Key Setup

1. Get Together AI API key from https://api.together.xyz/
2. Add to `backend/.env` file
3. Restart backend server

## 📦 Production Deployment

### Option 1: Traditional Hosting

**Backend (Node.js)**
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

**Frontend (Static Build)**
```bash
npm run build
# Deploy dist/ folder to static hosting
```

### Option 2: Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Option 3: Cloud Platforms

**Vercel (Frontend)**
```bash
npm install -g vercel
vercel --prod
```

**Railway/Heroku (Backend)**
```bash
# Add Procfile: web: npm start
git push heroku main
```

## 🔒 Security Considerations

### Production Settings
- Set `NODE_ENV=production`
- Use HTTPS in production
- Secure API keys
- Configure CORS properly
- Set up rate limiting

### Environment Security
```env
# Production .env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
OPENAI_API_KEY=your_secure_api_key
```

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Frontend: Application loads successfully
- WebSocket: Real-time connection works

### Log Monitoring
- Check console logs for errors
- Monitor API response times
- Track WebSocket connections

### Updates
```bash
# Update dependencies
npm update
cd backend && npm update

# Test after updates
npm test
npm run build
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check Node.js version (14+)
- Verify .env file exists
- Check port availability

**Frontend connection issues**
- Verify backend is running
- Check CORS configuration
- Confirm WebSocket connection

**AI service errors**
- Verify API key is valid
- Check API rate limits
- Review error logs

### Debug Mode
```bash
# Backend debug
DEBUG=* npm start

# Frontend debug
npm run dev -- --debug
```

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Dependencies installed
- [ ] Build process tested
- [ ] Health checks passing
- [ ] CORS configured
- [ ] HTTPS enabled (production)
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Error handling tested

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment configuration
3. Test with minimal setup
4. Review documentation
5. Create GitHub issue if needed

**Status: Production Ready** ✅
