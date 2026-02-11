import { Wallet } from "@/domain/entities/Wallet.js";
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IWalletRepository } from "../repositories/IWalletRepository.js";
import type { IAuthorizerGateway } from "../repositories/IAuthorizerGateway.js";
import type { INotificationGateway } from "../repositories/INotificationGateway.js";
import { TransferUseCase } from "./TransferUseCase.js";
import { InsufficientFundsError, UnauthorizedTransferError, WalletNotFound } from "@/domain/errors/DomainError.js";

const makeWallet = (id: string, balance: number, type: "COMMON" | "MERCHANT" = "COMMON"): Wallet => {
    return new Wallet(id, 'user-' + id, balance, type);
}

describe('TransferUseCase', () => {
    let walletRepo: IWalletRepository;
    let authorizer: IAuthorizerGateway;
    let notifier: INotificationGateway;
    let sut: TransferUseCase;

    beforeEach(() => {
        walletRepo = {
            findById: vi.fn(),
            performTransfer: vi.fn(),
        };

        authorizer = {
            authorize: vi.fn()
        }

        notifier = {
            send: vi.fn()
        };

        sut = new TransferUseCase(walletRepo, authorizer, notifier);
    })

    it('Must successfully complete a transfer between regular users', async () => {
        const payer = makeWallet('payer-id', 100);
        const payee = makeWallet('payee-id', 50);

        vi.spyOn(walletRepo, 'findById')
            .mockResolvedValueOnce(payer)
            .mockResolvedValueOnce(payee);

        vi.spyOn(authorizer, 'authorize').mockResolvedValueOnce(true);

         const output = await sut.execute({
            payerId: 'payer-id',
            payeeId: 'payee-id',
            amount: 50
         });

         expect(output.success).toBe(true);

         expect(walletRepo.performTransfer).toHaveBeenCalledWith(
            expect.objectContaining({balance: 50}),
            expect.objectContaining({balance: 100}),
            50
         );

         expect(notifier.send).toHaveBeenCalledWith('payee-id', expect.stringContaining('R$ 50.00'));
    });

    it('It should throw a WalletNotFound error if the payer does not exist', async () => {
        vi.spyOn(walletRepo, 'findById').mockResolvedValueOnce(null);

        const promise = sut.execute({
            payerId: 'invalid-id',
            payeeId: 'payee-id',
            amount: 10
        });

        await expect(promise).rejects.toThrow(WalletNotFound);
    });

    it('It should throw an error if the payer does not have sufficient funds', async () => {
        const payer = makeWallet('payer-id', 10);
        const payee = makeWallet('payee-id', 50);

        vi.spyOn(walletRepo, 'findById')
            .mockResolvedValueOnce(payer)
            .mockResolvedValueOnce(payee);

        const promise = sut.execute({
            payerId: 'payer-id',
            payeeId: 'payee-id',
            amount: 20
        });

        await expect(promise).rejects.toThrow(InsufficientFundsError)
    })

    it('Must reverse the transaction (manual rollback) and throw an error if it is not authorized', async () => {
        const payer = makeWallet('payer-id', 100);
        const payee = makeWallet('payee-id', 50);

        vi.spyOn(walletRepo, 'findById')
            .mockResolvedValueOnce(payer)
            .mockResolvedValueOnce(payee)

        vi.spyOn(authorizer, 'authorize').mockResolvedValueOnce(false);

        const creditSpy = vi.spyOn(payer, 'credit');
        const debitSpy = vi.spyOn(payee, 'debit');

        const promise = sut.execute({
            payerId: 'payer-id',
            payeeId: 'payee-id',
            amount: 50,
        });

        await expect(promise).rejects.toThrow(UnauthorizedTransferError);

        expect(payer.balance).toBe(100);
        expect(payee.balance).toBe(50);
    })

    it('The transfer should not fail if the notification fails', async () => {
        const payer = makeWallet('payer-id', 100);
        const payee = makeWallet('payee-id', 50);

        vi.spyOn(walletRepo, 'findById')
            .mockResolvedValueOnce(payer)
            .mockResolvedValueOnce(payee);

        vi.spyOn(authorizer, 'authorize').mockResolvedValueOnce(true);

        vi.spyOn(notifier, 'send').mockRejectedValueOnce(new Error('Service error.'));

        const output = await sut.execute({
            payerId: 'payer-id',
            payeeId: 'payee-id',
            amount: 50,
        });

        expect(output.success).toBe(true);
        expect(walletRepo.performTransfer).toHaveBeenCalled();
    })
})