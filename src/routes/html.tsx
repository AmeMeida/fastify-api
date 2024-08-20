import type html from "@kitajs/html";
import type { FastifyInstance } from "../server";

function HelloWorld({
  children,
  ...props
}: html.PropsWithChildren<{ hi?: string }>) {
  return (
    <html {...props}>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>{children}</h1>
        <p>{props.hi}</p>
      </body>
    </html>
  );
}

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: {
            type: "string",
            contentMediaType: "text/html",
          },
        },
        produces: ["text/html"],
      } as const,
    },
    async (_request, reply) => {
      reply.view(<HelloWorld hi="oiiii">hi</HelloWorld>);
    },
  );

  fastify.get(
    "/teste",
    {
      schema: {
        response: {
          200: {
            type: "string",
            contentMediaType: "text/html",
          },
        },
        produces: ["text/html"],
      },
    },
    (_request, reply) => {
      reply.view(<p>Teste</p>);
    },
  );
}
