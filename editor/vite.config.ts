import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPublic = path.resolve(__dirname, "../frontend/public");

export default defineConfig({
  plugins: [
    react(),
    {
      name: "serve-frontend-assets",
      configureServer(server) {
        // Serve /assets/* from ../frontend/public/assets/
        server.middlewares.use("/assets", (req, res, next) => {
          const filePath = path.join(frontendPublic, "assets", req.url ?? "");
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              ".png": "image/png",
              ".jpg": "image/jpeg",
              ".json": "application/json",
            };
            res.setHeader("Content-Type", mimeTypes[ext] ?? "application/octet-stream");
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
    },
  ],
  server: {
    port: 3001,
    fs: { allow: ["..", frontendPublic] },
  },
});
