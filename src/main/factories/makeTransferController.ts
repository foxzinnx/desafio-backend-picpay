import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaWalletRepository } from "@/infra/database/prisma/repositories/PrismaWalletRepository.js";

export function makeTransferController(){
    const prisma = new PrismaClient()

    const walletRepo = new PrismaWalletRepository(prisma);

    return walletRepo;
}