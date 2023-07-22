import { Type } from "@sinclair/typebox";
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
        params: Type.Object({
          name: Type.Union([
            Type.Literal("apple"),
            Type.Literal("banana"),
          ]),
        }),
        response: {
          200: Type.Object({
            name: Type.Union([
              Type.Literal("apple"),
              Type.Literal("banana"),
            ]),
            color: Type.Union([
              Type.Literal("red"),
              Type.Literal("yellow")
            ])
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
