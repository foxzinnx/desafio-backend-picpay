import { InsufficientFundsError, InvalidAmountError, MerchantCannotSendMoneyError } from "../errors/DomainError.js";
import type { UserType } from "./User.js";

export class Wallet{
    constructor(
        public readonly id: string,
        public readonly userId: string,
        private _balance: number,
        public readonly ownerType: UserType
    ){}

    get balance(): number{
        return this._balance
    }

    public debit(amount: number): void{
        if(this.ownerType === 'MERCHANT'){
            throw new MerchantCannotSendMoneyError()
        }

        if(amount <= 0){
            throw new InvalidAmountError()
        }

        if(this._balance < amount){
            throw new InsufficientFundsError()
        }

        this._balance -= amount;
    }

    public credit(amount: number): void{
        if(amount <= 0){
            throw new InvalidAmountError()
        }
        this._balance += amount;
    }
}