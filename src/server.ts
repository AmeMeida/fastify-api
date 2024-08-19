import Fastify from "fastify";
import type { FastifyReply, FastifyTypeProvider } from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Static, TSchema } from "@fastify/type-provider-typebox";
import type {
  FromSchema,
  FromSchemaOptions,
  FromSchemaDefaultOptions,
  JSONSchema,
} from "json-schema-to-ts";
import { HOST, PORT } from "./enviroment";
import fs from "node:fs/promises";
import router from "./router";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TypeProvider<
  Options extends FromSchemaOptions = FromSchemaDefaultOptions,
> extends FastifyTypeProvider {
  output: this["input"] extends TSchema
    ? Static<this["input"]>
    : this["input"] extends JSONSchema
      ? FromSchema<this["input"], Options>
      : never;
}

const fastify = Fastify({
  ajv: {
    customOptions: {
      keywords: ["media"],
    },
    plugins: [(await import("@fastify/multipart")).ajvFilePlugin],
  },
}).withTypeProvider<TypeProvider>();

fastify.register(import("@fastify/accepts"));

fastify.register(import("@fastify/static"), {
  root: import.meta.env.PROD ? __dirname : path.join(__dirname, ".."),
  wildcard: false,
  serve: false,
});

fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, import.meta.env.PROD ? "./public" : "../public"),
  wildcard: true,
  decorateReply: false,
});

fastify.register(import("@fastify/formbody"));
fastify.register(import("@fastify/multipart"), {
  attachFieldsToBody: "keyValues",
});

declare module "fastify" {
  interface FastifyReply {
    view: (element: string | Promise<string>) => FastifyReply;
  }
}

fastify.decorateReply("view", function (element: string | Promise<string>) {
  (this as unknown as FastifyReply).type("text/html");
  return this.send(element);
});

fastify.register(import("@fastify/swagger"), {
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
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
  prefix: "/documentation",
});

fastify.register(async (fastify: FastifyInstance) => {
  fastify.get(
    "/openapi",
    {
      schema: {
        summary: "OpenAPI Docs",
        description: "OpenAPI documentation for the API",
        tags: ["documentation"],
        produces: ["application/json", "text/yaml"],
        consumes: ["application/json"],
      } as const,
    },
    (request, reply) => {
      const validType =
        request.type([
          "application/json",
          "application/yaml",
          "text/yaml",
          "text/yml",
        ]) || "application/json";
      const type = Array.isArray(validType) ? validType[0] : validType;

      if (type === "application/json") {
        if (import.meta.env.PROD) {
          return reply.sendFile("/public/openapi.json");
        }

        return reply.type("application/json").send(openAPIJson);
      }

      if (import.meta.env.PROD) {
        return reply.sendFile("/public/openapi.yaml");
      }

      return reply.type("text/yaml").send(openAPIYaml);
    },
  );

  fastify.get(
    "/openapi/json",
    {
      schema: {
        summary: "OpenAPI Docs JSON",
        description: "OpenAPI documentation for the API in JSON format",
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: ["documentation"],
      },
    },
    (_, reply) => {
      if (import.meta.env.PROD) {
        return reply.sendFile("/public/openapi.json");
      }

      return reply.type("application/json").send(openAPIJson);
    },
  );

  fastify.get(
    "/openapi/yaml",
    {
      schema: {
        summary: "OpenAPI Docs YAML",
        description: "OpenAPI documentation for the API in YAML format",
        consumes: ["application/yaml", "text/yaml", "text/yml"],
        produces: ["text/yaml"],
        tags: ["documentation"],
      },
    },
    (_, reply) => {
      if (import.meta.env.PROD) {
        return reply.sendFile("/public/openapi.yaml");
      }

      return reply.type("text/yaml").send(openAPIYaml);
    },
  );

  if (import.meta.env.DEV) {
  }
});

fastify.register(router);

if (import.meta.env.PROD) {
  await fastify.ready();

  console.log("a");

  fs.writeFile(
    path.join(__dirname, "public/openapi.json"),
    JSON.stringify(fastify.swagger()),
    {
      encoding: "utf8",
    },
  );

  fs.writeFile(
    path.join(__dirname, "public/openapi.yaml"),
    fastify.swagger({ yaml: true }),
    {
      encoding: "utf8",
    },
  );

  fastify.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
} else {
  await fastify.register(import("@fastify/swagger-ui"));

  fastify.get("/openapi.json", { schema: { hide: true } }, (_, reply) => {
    return reply.type("application/json").send(openAPIJson);
  });

  fastify.get("/openapi.yaml", { schema: { hide: true } }, (_, reply) => {
    return reply.type("text/yaml").send(openAPIYaml);
  });

  await fastify.ready();

  // biome-ignore lint: var actually makes sense here
  var openAPIJson = JSON.stringify(fastify.swagger());
  // biome-ignore lint: var actually makes sense here
  var openAPIYaml = fastify.swagger({ yaml: true });
}

export type FastifyInstance = typeof fastify;

export const app = fastify;
