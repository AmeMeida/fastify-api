import { FastifyInstance } from ".";

export default async function (fastify: FastifyInstance) {
  const routes = import.meta.glob("./routes/**/*.ts", {
    eager: false,
  });

  await Promise.all(
    Object.entries(routes).map(async ([path, route]) => {
      const routeModule = (await route()) as {
        default: (fastify: FastifyInstance) => Promise<void>;
        prefix?: string;
      };
      const prefix =
        routeModule.prefix ?? path.match(/\.\/routes(.*?)(\/index)?\.ts/)![1];

      console.log("Mounting route", prefix);

      await fastify.register(routeModule.default, { prefix });
    }),
  );
}
