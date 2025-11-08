# MCP API Server

A Node.js server that functions as both a REST API server and an MCP (Model Context Protocol) server.

## Features

- REST API endpoints with Express
- MCP server capabilities for AI clients
- Ready for MongoDB integration
- Dual-mode operation (API or MCP)

## Installation

```bash
cd /path/to/Pool-S-Crow
npm install
```

## Usage

### Running as API Server

Start the HTTP API server:

```bash
npm start -- --api
```

Or for development with auto-reload:

```bash
npm run dev -- --api
```

The API server will be available at `http://localhost:3000`

Available endpoints:
- `GET /health` - Health check
- `GET /api/status` - API status
- `POST /api/echo` - Echo message back
- `GET /api/data` - Placeholder for MongoDB data (coming soon)
- `POST /api/data` - Placeholder for MongoDB data creation (coming soon)

### Running as MCP Server

The server runs as an MCP server by default (using stdio transport):

```bash
npm start
```

To use with an MCP client like Claude Code, add to your MCP settings:

**For Claude Code** (`claude_desktop_config.json` or MCP settings):

```json
{
  "mcpServers": {
    "mcp-api-server": {
      "command": "node",
      "args": ["/absolute/path/to/Pool-S-Crow/src/index.js"],
      "env": {}
    }
  }
}
```

Available MCP tools:
- `get_server_status` - Get server status, uptime, and memory usage
- `echo` - Echo back a message

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
NODE_ENV=development
```
## Project Structure

```
Pool-S-Crow/
├── src/
│   ├── index.js         # Main entry point
│   ├── api-server.js    # Express API server
│   └── mcp-server.js    # MCP server implementation
├── package.json
├── .env
├── .env.example
└── README.md
```

## Development

The server supports two modes:

1. **API Mode** (`--api` flag): Runs Express HTTP server for traditional REST API access
2. **MCP Mode** (default): Runs as MCP server for AI client integration via stdio

You can extend both modes independently:
- Add new Express routes in `src/api-server.js`
- Add new MCP tools in `src/mcp-server.js`

## License

ISC
