// backend/middleware/errorHandler.js
/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Provide more detailed errors in development
  const error = {
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.details || {} 
    })
  };

  res.status(statusCode).json({ error });
};

module.exports = errorHandler;