import express from 'express';
import cors from 'cors';

/**
 * Create and configure the Express API server
 */
export function createAPIServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Example API endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      message: 'API server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Example POST endpoint
  app.post('/api/echo', (req, res) => {
    const { message } = req.body;
    res.json({
      echo: message,
      timestamp: new Date().toISOString(),
    });
  });

  // MongoDB placeholder endpoints (to be implemented later)
  app.get('/api/data', (req, res) => {
    res.json({
      message: 'MongoDB integration coming soon',
      data: [],
    });
  });

  app.post('/api/data', (req, res) => {
    res.json({
      message: 'MongoDB integration coming soon',
      received: req.body,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  });

  return app;
}

/**
 * Start the API server
 */
export function startAPIServer(port = 3000) {
  const app = createAPIServer();

  const server = app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });

  return server;
}
