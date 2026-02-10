import { Transaction } from "../../domain/entities/Transaction.js";
import { UnauthorizedTransferError, WalletNotFound } from "../../domain/errors/DomainError.js";
import type { TransferInput, TransferOutput } from "../dtos/TransferDTO.js";
import type { IAuthorizerGateway } from "../repositories/IAuthorizerGateway.js";
import type { INotificationGateway } from "../repositories/INotificationGateway.js";
import type { IWalletRepository } from "../repositories/IWalletRepository.js";


export class TransferUseCase{
    constructor(
        private walletRepository: IWalletRepository,
        private authorizerGateway: IAuthorizerGateway,
        private notifierGateway: INotificationGateway
    ){}

    async execute(input: TransferInput): Promise<TransferOutput> {
        const payerWallet = await this.walletRepository.findById(input.payerId);
        const payeeWallet = await this.walletRepository.findById(input.payeeId);

        if(!payerWallet){
            throw new WalletNotFound(input.payerId)
        }

        if(!payeeWallet){
            throw new WalletNotFound(input.payeeId)
        }

        const transaction = Transaction.create(
            input.payerId,
            input.payeeId,
            input.amount
        )

        payerWallet.debit(input.amount);
        payeeWallet.credit(input.amount);

        const isAuthorized = await this.authorizerGateway.authorize();

        if(!isAuthorized){
            payerWallet.credit(input.amount);
            payeeWallet.debit(input.amount);
            throw new UnauthorizedTransferError();
        }

        try {
            await this.walletRepository.performTransfer(
                payerWallet,
                payeeWallet,
                input.amount
            );
        } catch (error) {
            throw new Error('Failed to persist transfer');
        }


        try {
            await this.notifierGateway.send(
                input.payeeId,
                `You received R$ ${input.amount.toFixed(2)} from ${input.payerId}`
            )
        } catch (error) {
            console.error('Failed to send notification:', error)
        }

        return {
            transactionId: transaction.id,
            success: true,
            message: 'Transfer completed successfully'
        }
    }
}