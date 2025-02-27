import Bun from 'bun';
import index from './index.html';
import worker from './worker.html';

Bun.serve({
  static: {
    '/': index,
    '/worker': worker,
  },
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api/status') {
      return new Response(
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
      );
    }

    return new Response('Hello, world!');
  }
});
