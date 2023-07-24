import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "..";
import { z } from "zod";

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "",
    {
      schema: {
        response: {
          200: z.array(
            z.object({
              name: z.enum(["cat", "dog"]),
              legs: z.number().positive().int(),
            }),
          ),
        },
      },
    },
    async (_request, reply) => {
      return reply.send([
        {
          name: "cat",
          legs: 4,
        },
        {
          name: "dog",
          legs: 4,
        },
      ]);
    },
  );
}
