/**
 * Centralized Error Handler Middleware
 * ------------------------------------
 * Catches errors passed via `next(err)` or thrown in async routes/controllers.
 *
 * Logs the error and responds with:
 *  - HTTP status code
 *  - JSON error object
 */

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Log complete error details for backend diagnostics
  console.error('🔴 Error:', err.stack || err.message);

  // Avoid leaking internal stack traces in production
  const response = {
    success: false,
    message: err.message || 'Something went wrong',
  };

  // Optional: include stack only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}