import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';

import {Project} from './Project.js';

const server = Fastify({
  logger: true,
});

// CORS policy.
server.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
});

server.get('/project/:identifier', async (request, reply) => {
  const project = Project.fetch(request.params.identifier);
  project.hydrate();

  return project.serialize();
});
server.post('/compile', async (request, reply) => {
  const project = new Project('aemfingsyojrhwlkqawbxqgicsqz');
  project.mutateFile('lib.rs', request.body.source);
  await project.compile();
  project.hydrate();

  return project.serialize();
});
server.get('/', async function handler (request, reply) {
  return {hello: 'world'};
});

// Start server.
try {
  await server.listen({port: 3000});
} catch (err) {
  server.log.error(err);
  process.exit(1);
}