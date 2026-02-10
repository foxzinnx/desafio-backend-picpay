import type { Wallet } from "../../domain/entities/Wallet.js";

export interface IWalletRepository{
    findById(id: string): Promise<Wallet | null>;
    performTransfer(payer: Wallet, payee: Wallet, amount: number): Promise<void>;
}