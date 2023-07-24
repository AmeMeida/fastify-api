import { TSchema, Kind } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import Ajv, { Schema } from "ajv";
import { ResponseValidationError } from "fastify-type-provider-zod";
import { JSONSchema7 } from "json-schema-to-ts";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

type ValidatorCheck = (schema: object) => boolean;
type Parser = (data: unknown) => unknown;
type Validator = (schema: object) => [parser: Parser, schema: JSONSchema7];

const validators: Map<ValidatorCheck, Validator> = new Map();

const ajv = new Ajv({
  useDefaults: true,
  coerceTypes: true,
  removeAdditional: true,
  keywords: ["media"],
});

validators.set(
  (schema) => schema instanceof z.Schema,
  (schema) => {
    return [
      (data: unknown) => {
        const parsed = (schema as z.Schema).safeParse(data);

        if (!parsed.success) {
          throw new ResponseValidationError({
            error: "Invalid response data",
            schema: "Zod",
          });
        }

        return parsed.data;
      },
      zodToJsonSchema(schema as z.Schema) as JSONSchema7,
    ];
  },
);

validators.set(
  (schema) => Kind in schema,
  (schema) => {
    const validator = TypeCompiler.Compile(schema as TSchema);

    return [
      (data: unknown) => {
        if (!validator.Check(data)) {
          throw new ResponseValidationError({
            error: "Invalid response data",
            schema: "TypeBox",
          });
        }

        return data;
      },
      schema as JSONSchema7,
    ];
  },
);

validators.set(
  () => true,
  (schema) => {
    const validator = ajv.compile(schema as Schema);

    return [
      (data: unknown) => {
        if (!validator(data)) {
          throw new ResponseValidationError({
            error: "Invalid response data",
            schema: "Ajv",
          });
        }

        return data;
      },
      schema as JSONSchema7,
    ];
  },
);

export function compileParser(schema: object) {
  for (const [predicate, compiler] of validators) {
    if (predicate(schema)) {
      return compiler(schema);
    }
  }

  throw new Error("No compilers found for the given schema");
}
