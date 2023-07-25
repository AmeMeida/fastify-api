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
          }
        }
      } as const
    },
    async (_request, reply) => {
      reply.view(<b>Hello World</b>);
    }
  );
}
