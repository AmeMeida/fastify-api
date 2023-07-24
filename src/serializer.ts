import { JSONSchema7 } from "json-schema-to-ts";
import fastJson, { Schema } from "fast-json-stringify";
import { FastifyRouteSchemaDef } from "fastify/types/schema";
import { compileParser } from "./validators";
import { negotiated } from ".";
import YML from "yamljs"

const serializers: Record<
  string,
  (schema?: JSONSchema7) => (payload: unknown) => string
> = {};

serializers["application/json"] = (schema?: JSONSchema7) => {
  if (schema) {
    return fastJson(schema as Schema);
  } else {
    return JSON.stringify;
  }
};

serializers["text/yml"] = () => {
  return (payload: unknown) => YML.stringify(payload);
}

function getSerializer(contentType: string | undefined, schema?: JSONSchema7) {
  const serializerCompiler =
    serializers[contentType ?? "application/json"] ??
    serializers["application/json"];
  return serializerCompiler(schema);
}

export function acceptedTypes() {
  return Object.keys(serializers);
}

export function compileSerializer<T extends object>(
  schemaDef: FastifyRouteSchemaDef<T>,
) {
  const [parser, schema] = compileParser(schemaDef.schema);
  const serializer = getSerializer(schemaDef.contentType, schema);

  return (data: any) => {
    if (negotiated in data) {
      const { payload, contentType } = data;
      console.log("has negotiated, decided on ", contentType)

      const parsed = parser(payload);
      return getSerializer(contentType, schema)(parsed);
    }
    
    const parsed = parser(data);
    return serializer(parsed);
  };
}
