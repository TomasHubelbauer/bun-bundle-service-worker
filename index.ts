import Bun from 'bun';
import index from './index.html';
import worker from './worker.html';

Bun.serve({
  routes: {
    '/*': new Response(null, { status: 404 }),
    '/': index,
    '/worker': worker,
    '/api/test': new Response('Hello, world!'),
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
