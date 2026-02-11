import 'dotenv/config';
import { transferRoutes } from "@/infra/http/routes/transfer.routes.js";
import fastify from "fastify";

const app = fastify();

app.register(transferRoutes, { prefix: '/api' });

app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    console.error(error);
    reply.code(500).send({ error: "Internal Server Error" });
});

const start = async () => {
    try {
        const PORT = 3000;
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${PORT}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

start();
