import type { Document } from "../value-objects/Document.js";

export type UserType = 'COMMON' | 'MERCHANT';

export class User{
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly document: Document,
        public readonly email: string,
        private _password: string,
        public readonly type: UserType
    ){
        if(this.type === 'MERCHANT' && this.document.type === 'CPF'){
            throw new Error('Logistas devem ter CNPJ');
        }
    }

    get password(): string{
        return this._password;
    }
}