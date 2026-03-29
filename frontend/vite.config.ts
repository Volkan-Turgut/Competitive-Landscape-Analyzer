import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function debugSavePlugin() {
  return {
    name: "debug-save",
    configureServer(server: any) {
      server.middlewares.use("/__debug/save", (req: any, res: any) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
        let body = "";
        req.on("data", (chunk: string) => { body += chunk; });
        req.on("end", () => {
          try {
            const { filename, data } = JSON.parse(body);
            const dir = path.resolve(__dirname, "src/data/debug");
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
            res.statusCode = 200;
            res.end("ok");
          } catch {
            res.statusCode = 400;
            res.end("bad request");
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), debugSavePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});
