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
            throw new Error('Merchants cannot send money.');
        }

        if(amount <= 0){
            throw new Error('Amount must be positive.');
        }

        if(this._balance < amount){
            throw new Error('Insufficient funds.');
        }

        this._balance -= amount;
    }

    public credit(amount: number): void{
        if(amount <= 0){
            throw new Error('Amount must be positive');
        }
        this._balance += amount;
    }
}