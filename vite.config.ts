import { createServer, defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      appPath: "./src/index.ts",
      adapter: "fastify"
    }),
    viteStaticCopy({
      targets: [
        {
          src: "public",
          dest: "."
        }
      ]
    })
  ],
  server: {
    port: 3000
  },
  preview: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  publicDir: false,
  build: {
    target: "esnext",
    ssrEmitAssets: true
  }
});
