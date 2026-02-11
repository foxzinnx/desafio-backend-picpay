import { InvalidAmountError, InvalidTransactionError } from "../errors/DomainError.js";

export class Transaction{
    constructor(
        public readonly id: string,
        public readonly payerId: string,
        public readonly payeeId: string,
        public readonly value: number,
        public readonly createdAt: Date
    ){
        this.validate()
    }

    private validate(): void{
        if(this.value <= 0){
            throw new InvalidAmountError()
        }

        if(this.payerId === this.payeeId){
            throw new InvalidTransactionError('Payer and Payee cannot be the same user.')
        }
    }

    static create(payerId: string, payeeId: string, value: number){
        const id = crypto.randomUUID();
        return new Transaction(id, payerId, payeeId, value, new Date());
    }
}