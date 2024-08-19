/// <reference types="vite/client" />

import type { JSONSchema7 } from "json-schema-to-ts";
import type { TSchema } from "@sinclair/typebox";

declare global {
  const Html: typeof import("@kitajs/html");
}

declare module "fastify" {
  type SchemaValidator = ZodTypeAny | TSchema | JSONSchema7 | undefined;
  export interface FastifySchema {
    readonly body?: SchemaValidator;
    readonly querystring?: SchemaValidator;
    readonly params?: SchemaValidator;
    readonly headers?: SchemaValidator;
    readonly response?: Record<number, SchemaValidator>;
  }
}

type Readable<T> = {
  [P in keyof T]: T[P];
};
