import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, ViteDevServer, Plugin } from "vite";

const PATH = "./src/server.ts";

async function createMiddleware(server: ViteDevServer) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    _next: Connect.NextFunction,
  ) => {
    const { app } = await server.ssrLoadModule(PATH);

    app.routing(req, res);
  };
}

export default function FastifyVitePlugin(): Plugin[] {
  return [
    {
      name: "Fastify Dev",
      config: () => {
        return {
          server: {
            hmr: false,
          },
          optimizeDeps: {
            noDiscovery: true,
            include: undefined,
          },
          build: {
            ssr: PATH,
            rollupOptions: {
              input: PATH,
            },
          },
        };
      },
      configureServer: async (server) => {
        server.middlewares.use(await createMiddleware(server));
      },
    },
  ];
}
