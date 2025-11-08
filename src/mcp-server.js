import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Create and configure the MCP server
 */
export function createMCPServer() {
  const server = new Server(
    {
      name: "mcp-api-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_server_status",
          description: "Get the current status of the server",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "echo",
          description: "Echo back a message",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The message to echo back",
              },
            },
            required: ["message"],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_server_status":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "running",
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                memory: process.memoryUsage(),
              }, null, 2),
            },
          ],
        };

      case "echo":
        return {
          content: [
            {
              type: "text",
              text: `Echo: ${args.message}`,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startMCPServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("MCP server running on stdio");
}
