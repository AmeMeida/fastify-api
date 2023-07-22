import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function (fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.register(import("./routes/index"));

  fastify.register(import("./routes/animals"), { prefix: "/animal" });
  fastify.register(import("./routes/fruits"), { prefix: "/fruit" });
  fastify.register(import("./routes/user"), { prefix: "/user" });
}
