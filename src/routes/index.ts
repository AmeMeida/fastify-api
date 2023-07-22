import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "../server";
import { z } from "zod";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/password/:user",
    {
      schema: {
        params: Type.Object({
          user: Type.Union([
            Type.Literal("admin"),
            Type.Literal("user"),
          ])
        }),
        body: Type.Object({
          password: Type.String({ minLength: 8, maxLength: 32 })
        }),
        response: {
          200: Type.Object({
            user: Type.Union([
              Type.Literal("admin"),
              Type.Literal("user"),
            ]),
            password: Type.String({ minLength: 8, maxLength: 32 }),
          }),
          400: Type.Literal("Invalid password"),
        },
      },
    },
    async (request, _reply) => {
      const { password } = request.body;
      const { user } = request.params;

      return {
        password,
        user,
      };
    },
  );

  fastify.post(
    "/picture",
    {
      schema: {
        body: z.object({
          picture: z
            .string()
            .regex(/^data:image\/(png|jpg|jpeg);base64,/)
            .refine((x) => {
              try {
                const buffer = Buffer.from(x, "base64");
                return buffer.length > 0;
              } catch (e) {
                return false;
              }
            })
            .describe("Base64 encoded picture"),
        }),
      },
    },
    async (_request, reply) => {
      return reply.send("ok");
    },
  );
}
