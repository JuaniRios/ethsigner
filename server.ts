import { serve } from "bun";

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response(Bun.file("index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }
    
    if (url.pathname === "/index.js") {
      const result = await Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './public',
        target: 'browser',
        format: 'esm',
      });
      
      if (!result.success) {
        return new Response("Build failed", { status: 500 });
      }

      return new Response(Bun.file("./public/index.js"), {
        headers: { "Content-Type": "application/javascript" },
      });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);