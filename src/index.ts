import Fastify, { FastifyTypeProvider } from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import { Static, TSchema } from "@fastify/type-provider-typebox";
import type {
  FromSchema,
  FromSchemaOptions,
  FromSchemaDefaultOptions,
  JSONSchema7
} from "json-schema-to-ts";
import YAML from "js-yaml";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TypeProvider<
  Options extends FromSchemaOptions = FromSchemaDefaultOptions
> extends FastifyTypeProvider {
  output: this["input"] extends TSchema
    ? Static<this["input"]>
    : this["input"] extends JSONSchema7
    ? FromSchema<this["input"], Options>
    : never;
}

const fastify = Fastify({
  ajv: {
    customOptions: {
      keywords: ["media"]
    },
    plugins: [(await import("@fastify/multipart")).ajvFilePlugin]
  }
}).withTypeProvider<TypeProvider>();

fastify.register(import("@fastify/accepts"));

fastify.register(import("@fastify/static"), {
  root: import.meta.env.PROD ? __dirname : path.join(__dirname, ".."),
  wildcard: false,
  serve: false
});

fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, import.meta.env.PROD ? "./public" : "../public"),
  wildcard: true,
  decorateReply: false
});

fastify.register(import("@fastify/formbody"));
fastify.register(import("@fastify/multipart"), { addToBody: true });
fastify.addContentTypeParser(
  ["application/yaml", "application/yml", "text/yaml", "text/yml"],
  { parseAs: "string" },
  (_, body, done) => {
    try {
      done(null, YAML.load(body as string));
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  }
);

fastify.register(import("@fastify/swagger"), {
  swagger: {
    info: {
      title: "Fastify API",
      description: "Testing the Fastify swagger API",
      version: "0.1.0"
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here"
    },
    host: import.meta.url,
    schemes: ["http"],
    consumes: [
      "application/json",
      "multipart/form-data",
      "application/x-www-form-urlencoded"
    ],
    produces: ["application/json"]
  },
  openapi: {
    info: {
      title: "Fastify API",
      description: "Testing the Fastify openapi API",
      version: "0.1.0"
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here"
    }
  },
  prefix: "/documentation"
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
