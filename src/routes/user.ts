import { z } from "zod";
import type { FastifyInstance } from "../server";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/login",
    {
      schema: {
        body: z.object({
          username: z.string().min(3).max(32).describe("Username"),
          password: z.string().min(8).max(32).describe("Password"),
        }),
        response: {
          200: z.object({
            logged: z.boolean().describe("Logged in"),
          }),
        },
        summary: "Login",
        tags: ["user", "login", "auth"],
        externalDocs: {
          url: "https://www.wikipedia.org/",
          description: "Find more info here",
        }        
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const logged = username.length + password.length > 13;

      return reply.send({ logged });
    },
  );
}
