// FAVOR NÃO ENCOSTAR NESSE ARQUIVO.
// NEM EU ENTENDO O QUE TA ACONTECENDO AQUI

import Fastify, { FastifyTypeProvider } from "fastify";
import path from "path";
import { fileURLToPath } from "url";
import { Static, TSchema } from "@fastify/type-provider-typebox";
import type {
  FromSchema,
  FromSchemaOptions,
  FromSchemaDefaultOptions,
  JSONSchema7,
} from "json-schema-to-ts";
import { z } from "zod";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import zodToJsonSchema from "zod-to-json-schema";
import { acceptedTypes, compileSerializer } from "./serializer";
import { compileParser } from "./validators";
import YAML from "yamljs";

interface TypeProvider<
  Options extends FromSchemaOptions = FromSchemaDefaultOptions,
> extends FastifyTypeProvider {
  output: this["input"] extends z.Schema
    ? z.infer<this["input"]>
    : this["input"] extends TSchema
    ? Static<this["input"]>
    : this["input"] extends JSONSchema7
    ? FromSchema<this["input"], Options>
    : unknown;
}

const fastify = Fastify({
  ajv: {
    customOptions: {
      keywords: ["media"],
    },
  },
}).withTypeProvider<TypeProvider>();

fastify.setValidatorCompiler((obj) => {
  const [parser] = compileParser(obj.schema);

  return (data: any) => {
    try {
      return { value: parser(data) };
    } catch (error) {
      return { error: error as Error | undefined };
    }
  };
});

export const negotiated = Symbol("negotiated");

fastify.register(import("@fastify/accepts"))

fastify.addHook("preSerialization", (request, _, payload, done) => {
  if (request.url.startsWith("/documentation")) return done(null, payload);

  const contentType = request.type(acceptedTypes()) ?? "application/json"; 

  const wrappedPayload = {
    payload,
    contentType,
    [negotiated]: true
  }

  done(null, wrappedPayload);
});

fastify.setSerializerCompiler(compileSerializer);

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
  addToBody: true
});

fastify.addContentTypeParser(["text/yml", "text/yaml"], { parseAs: "string" }, (_, payload, done) => {
  try {
    done(null, YAML.parse(payload as string));
  } catch (error) {
    (error as unknown & { statusCode: number }).statusCode = 400;
    done(error as Error);
  }
})

function transform({
  schema,
  url,
}: {
  schema: Record<string, any>;
  url: string;
}) {
  if (
    !schema ||
    ("hide" in schema && schema.hide) ||
    url.startsWith("/documentation")
  ) {
    if (schema) schema.hide = true;
    return { schema, url };
  }

  for (const prop in schema) {
    const zodSchema: unknown = schema[prop];

    if (zodSchema instanceof z.Schema) {
      schema[prop] = zodToJsonSchema(zodSchema);
    }
  }

  if ("response" in schema && schema.response) {
    for (const response in schema.response) {
      const zodSchema: unknown = schema.response[response];

      if (zodSchema instanceof z.Schema) {
        schema.response[response] = zodToJsonSchema(zodSchema, {
          target: "jsonSchema7",
          $refStrategy: "none",
        });
      }
    }
  }

  return { schema, url };
}

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
    consumes: ["application/json", "multipart/form-data", "application/x-www-form-urlencoded"],
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
  transform,
  prefix: "/documentation",
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
