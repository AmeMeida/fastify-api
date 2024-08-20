import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin, ViteDevServer } from "vite";

const PATH = "./src/server.ts";

async function createMiddleware(server: ViteDevServer) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let app: any = undefined;
  let stale = true;

  server.watcher.on("all", () => {
    stale = true;
  });

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    _next: Connect.NextFunction,
  ) => {
    if (stale || !app) {
      app = (await server.ssrLoadModule(PATH)).app;
      stale = false;
    }

    app.routing(req, res);
  };
}

export default function FastifyVitePlugin(): Plugin[] {
  return [
    {
      name: "Fastify Dev",
      config: () => {
        return {
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
