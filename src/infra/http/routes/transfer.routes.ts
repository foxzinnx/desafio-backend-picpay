import { makeTransferController } from "@/main/factories/makeTransferController.js";
import type { FastifyInstance } from "fastify";

export async function transferRoutes(app: FastifyInstance){
    app.post('/transfer', async (request, reply) => {
        const controller = makeTransferController();

        return controller.handle(request, reply);
    });
}