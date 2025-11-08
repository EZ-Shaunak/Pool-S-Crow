#!/usr/bin/env node

import dotenv from 'dotenv';
import { startAPIServer } from './api-server.js';
import { startMCPServer } from './mcp-server.js';

// Load environment variables
dotenv.config();

/**
 * Main entry point
 *
 * This server can run in two modes:
 * 1. MCP mode (default): When run via MCP client (stdio transport)
 * 2. API mode: When run with --api flag (HTTP server)
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--api') ? 'api' : 'mcp';

  if (mode === 'api') {
    // Run as HTTP API server
    const port = process.env.PORT || 3000;
    startAPIServer(port);
  } else {
    // Run as MCP server (stdio transport)
    await startMCPServer();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nShutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
