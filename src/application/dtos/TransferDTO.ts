export interface TransferInput{
    payerId: string;
    payeeId: string;
    amount: number;
}

export interface TransferOutput{
    transactionId: string;
    success: boolean;
    message: string;
}