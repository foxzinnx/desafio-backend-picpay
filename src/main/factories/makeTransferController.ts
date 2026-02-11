import { TransferUseCase } from "@/application/use-cases/TransferUseCase.js";
import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaWalletRepository } from "@/infra/database/prisma/repositories/PrismaWalletRepository.js";
import { FetchAuthorizerGateway } from "@/infra/gateways/FetchAuthorizerGateway.js";
import { FetchNotificationGateway } from "@/infra/gateways/FetchNotificationGateway.js";
import { TransferController } from "@/infra/http/controllers/TransferController.js";

export function makeTransferController(){
    const prisma = new PrismaClient()
    const walletRepo = new PrismaWalletRepository(prisma);
    const authorizer = new FetchAuthorizerGateway();
    const notifier = new FetchNotificationGateway();

    const transferUseCase = new TransferUseCase(walletRepo, authorizer, notifier);

    const controller = new TransferController(transferUseCase);

    return controller;
}