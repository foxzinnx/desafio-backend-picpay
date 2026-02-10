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