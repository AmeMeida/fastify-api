import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.get("", async (_request, _reply) => {
    return [
      {
        name: "cat",
        legs: 4,
      },
      {
        name: "dog",
        legs: 4,
      },
    ];
  });
}
