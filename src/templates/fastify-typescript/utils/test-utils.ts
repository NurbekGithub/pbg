import Fastify from "fastify";

export  function buildApp() {
  const app = Fastify();
  app.register(import("../app"));

  return app;
}