import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

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
    }
  },
  transform: jsonSchemaTransform,
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
