import Bun from 'bun';
import index from './index.html';

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
