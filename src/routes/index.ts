import { FastifyInstance } from "../server";
import { z } from "zod";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/password/:user",
    {
      schema: {
        params: z.object({
          user: z.enum(["admin", "user"]),
        }),
        body: z.object({
          password: z.string().min(8).max(32),
        }),
        response: {
          200: z
            .object({
              user: z.enum(["admin", "user"]).describe("Type of user"),
              password: z.string().min(8).max(32).describe("Password"),
            })
            .describe("Credentials confirmation"),
          400: z
            .literal("Invalid password")
            .describe("Password was incorrect or invalid"),
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
