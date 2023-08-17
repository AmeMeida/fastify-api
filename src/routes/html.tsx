import { JSONSchema7 } from "json-schema";
import { FastifyInstance } from "../server";
import { Attributes } from "typed-html";

function HelloWorld({ children, ...props }: Attributes) {
  return (
    <html {...props}>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>{children}</h1>
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
            contentMediaType: "text/html"
          } satisfies JSONSchema7
        },
        produces: ["text/html"]
      } as const
    },
    async (_request, reply) => {
      reply.view(
        <HelloWorld>
          <p>hiii</p>
        </HelloWorld>
      );
    }
  );

  fastify.get(
    "/teste",
    {
      schema: {
        response: {
          200: {
            type: "string",
            contentMediaType: "text/html"
          }
        },
        produces: ["text/html"]
      }
    },
    (_request, reply) => {
      reply.view(<p>Teste</p>);
    }
  );
}
