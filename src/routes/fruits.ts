import { FastifyInstance } from "./../server";
import { z } from "zod";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/fruits",
    {
      schema: {
        response: {
          200: z.array(
            z.object({
              name: z.enum(["apple", "banana"]),
              color: z.enum(["red", "yellow"]),
            }),
          ),
        },
      },
    },
    (_request, reply) => {
      reply.send([
        {
          name: "apple",
          color: "red",
        },
        {
          name: "banana",
          color: "yellow",
        },
      ]);
    },
  );

  fastify.get(
    "/:name",
    {
      schema: {
        params: z.object({
          name: z.enum(["apple", "banana"]),
        }),
        response: {
          200: z.object({
            name: z.enum(["apple", "banana"]),
            color: z.enum(["red", "yellow"]),
          }),
        },
      },
    },
    (request, reply) => {
      const { name } = request.params;
      const color = name === "apple" ? "red" : "yellow";

      reply.send({
        name,
        color,
      });
    },
  );
}
