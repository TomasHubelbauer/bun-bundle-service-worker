import Bun from 'bun';
import index from './index.html';
import SqliteStorage from './SqliteStorage';

const storage = new SqliteStorage();

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
      GET: async () => Response.json(await storage.getAll()),
      POST: async request => Response.json(await storage.add(await request.json())),
      DELETE: async () => Response.json(await storage.clear()),
    },
    '/api/items/:id': {
      PUT: async request => Response.json(await storage.update(+request.params.id, await request.json())),
      DELETE: async request => Response.json(await storage.remove(+request.params.id)),
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
