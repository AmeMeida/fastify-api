import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { TypeSystem } from "@sinclair/typebox/system";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

TypeSystem.ExactOptionalPropertyTypes = false;

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      keywords: ["media"]
    }
  }
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, import.meta.env.PROD ? "../public" : "./public"),
  wildcard: true,
});

fastify.register(import("@fastify/swagger"), {
  swagger: {
    info: {
      title: "Fastify API",
      description: "Testing the Fastify swagger API",
      version: "0.1.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    host: import.meta.url,
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  openapi: {
    info: {
      title: "Fastify API",
      description: "Testing the Fastify openapi API",
      version: "0.1.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
  },
});

import.meta.env.DEV && fastify.register(import("@fastify/swagger-ui"));

fastify.register(import("./router"));

await fastify.ready();

if (import.meta.env.PROD) {
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
}

export type FastifyInstance = typeof fastify;
export const viteNodeApp = fastify;
