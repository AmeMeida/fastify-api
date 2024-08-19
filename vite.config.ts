import { createServer, defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      appPath: "./src/server.ts",
      adapter: "fastify",
    }),
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
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsxInject: `import { createElement, Fragment } from "@kitajs/html"`,
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
