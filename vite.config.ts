import dotenv from "dotenv";
import { createServer, defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

import FastifyDevPlugin from "./dev.ts";

dotenv.config();

export default defineConfig({
  plugins: [
    FastifyDevPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: "public",
          dest: ".",
        },
      ],
    }),
  ],
  esbuild: {
    jsxInject: `import Html from "@kitajs/html"`,
    jsxFactory: "Html.createElement",
    jsxFragment: "Html.Fragment",
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  publicDir: false,
  build: {
    target: "esnext",
    ssrEmitAssets: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      treeshake: true,
    },
  },
});
