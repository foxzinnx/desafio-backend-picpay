export abstract class DomainError extends Error{
    constructor(message: string){
        super(message)
        this.name = this.constructor.name;
    }
}

export class InsufficientFundsError extends DomainError{
    constructor(){
        super('Insufficient funds for this transaction.');
    }
}

export class UnauthorizedTransferError extends DomainError{
    constructor(){
        super('Transfer not authorized by external service.');
    }
}

export class WalletNotFound extends DomainError{
    constructor(walletId: string){
        super(`Wallet not found: ${walletId}`);
    }
}

export class InvalidAmountError extends DomainError {
    constructor(){
        super('Amount must be positive.');
    }
}

export class MerchantCannotSendMoneyError extends DomainError {
    constructor(){
        super('Merchants cannot send money.');
    }
}

export class InvalidTransactionError extends DomainError {
    constructor(reason: string){
        super(`Invalid transaction: ${reason}`);
    }
}

export class InvalidMerchantsDocumentError extends DomainError {
    constructor(){
        super('Merchants must be have a CNPJ.')
    }
}