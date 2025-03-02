import Bun from 'bun';
import { Database } from "bun:sqlite";
import index from './index.html';

const db = new Database("data.sqlite");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");

Bun.serve({
  development: true,
  routes: {
    '/*': new Response(null, { status: 404 }),
    '/': index,
    '/worker': async () => {
      const build = await Bun.build({ entrypoints: ['worker.ts'] });
      if (!build.success || build.logs.length || build.outputs.length !== 1) {
        throw new Error('Build failed' + (build.logs ? ':\n' + build.logs.join('\n') : ''));
      }

      return new Response(await build.outputs[0].text(), { headers: { 'Content-Type': 'application/javascript' } });
    },
    '/api/items': {
      GET: async () => {
        const items = db.query("SELECT * FROM items").all();
        return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
      },
      POST: async request => {
        const { name } = await request.json();
        const { lastInsertRowid } = db.run("INSERT INTO items (name) VALUES (?)", [name]);
        return new Response(JSON.stringify({ id: lastInsertRowid, name }), { headers: { 'Content-Type': 'application/json' } });
      },
      DELETE: async () => {
        db.run("DELETE FROM items");
        return new Response(null, { status: 204 });
      },
    },
    '/api/items/:id': {
      PUT: async request => {
        const id = Number(request.params.id);
        const { name } = await request.json();
        db.run("UPDATE items SET name = ? WHERE id = ?", [name, id]);
        return new Response(null, { status: 204 });
      },
      DELETE: async request => {
        const id = Number(request.params.id);
        db.run("DELETE FROM items WHERE id = ?", [id]);
        return new Response(null, { status: 204 });
      },
    },
    '/api/status': request => new Response(
      async function* () {
        while (!request.signal.aborted) {
          yield `data: ${new Date().toISOString()}\n\n`;
          await Bun.sleep(1000);
        }
      },
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }
    )
  },
});
