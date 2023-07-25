import { JSONSchema7 } from "json-schema";
import { FastifyInstance } from "..";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "string",
            contentMediaType: "text/html"
          } satisfies JSONSchema7
        },
        produces: ["text/html"]
      } as const
    },
    async (_request, reply) => {
      reply.view(<b>Hello World</b>);
    }
  );
}
