import Bun from 'bun';
import index from './index.html';
import worker from './worker.html';

Bun.serve({
  static: {
    '/': index,
    '/worker': worker,
  },
  fetch(request) {
    return new Response('Hello, world!');
  }
});
