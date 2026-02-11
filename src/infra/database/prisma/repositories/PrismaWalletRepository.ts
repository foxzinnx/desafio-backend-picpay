import type { IWalletRepository } from "@/application/repositories/IWalletRepository.js";
import type { UserType } from "@/domain/entities/User.js";
import { Wallet } from "@/domain/entities/Wallet.js";
import { PrismaClient } from '@/generated/prisma/client.js'

export class PrismaWalletRepository implements IWalletRepository {
    constructor( private prisma: PrismaClient){}
    
    async findById(id: string): Promise<Wallet | null>{
        const prismaWallet = await this.prisma.wallet.findFirst({
            where: {
                OR: [
                    { id },
                    { userId: id }
                ]
            },
            include: { user: true },
        });

        if(!prismaWallet) return null;

        const ownerType = prismaWallet.user.type.toUpperCase() as UserType;

        return new Wallet(
            prismaWallet.id,
            prismaWallet.userId,
            Number(prismaWallet.balance),
            ownerType
        )
    }

    async performTransfer(payer: Wallet, payee: Wallet, amount: number): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { id: payer.id },
                data: { balance: { decrement: amount } },
            }),
            
            this.prisma.wallet.update({
                where: { id: payee.id },
                data: { balance: { increment: amount } },
            }),

            this.prisma.transaction.create({
                data: {
                    payerId: payer.id,
                    payeeId: payee.id,
                    value: amount
                }
            })
        ])
    }

}