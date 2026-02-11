import type { TransferUseCase } from "@/application/use-cases/TransferUseCase.js";
import { InsufficientFundsError, InvalidAmountError, InvalidTransactionError, MerchantCannotSendMoneyError, UnauthorizedTransferError, WalletNotFound } from "@/domain/errors/DomainError.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import z, { ZodError } from "zod";

const transferSchema = z.object({
    value: z.number().positive(),
    payer: z.string().uuid(),
    payee: z.string().uuid(),
})

export class TransferController {
    constructor( private transferUseCase: TransferUseCase ) {}

    async handle(request: FastifyRequest, reply: FastifyReply){
        try {
            const { value, payer, payee } = transferSchema.parse(request.body);

            const output = await this.transferUseCase.execute({
                payerId: payer,
                payeeId: payee,
                amount: value,
            });

            return reply.code(201).send(output);
        } catch (error: any) {
            if(error instanceof ZodError){
                return reply.code(400).send({
                    error: "Validation Error",
                    issues: error.format()
                });
            }

            if(error instanceof WalletNotFound){
                return reply.code(404).send({ error: error.message });
            }

            if(error instanceof UnauthorizedTransferError){
                return reply.code(403).send({ error: error.message });
            }

            if(
                error instanceof InsufficientFundsError ||
                error instanceof InvalidAmountError ||
                error instanceof MerchantCannotSendMoneyError ||
                error instanceof InvalidTransactionError
            ){
                return reply.code(422).send({ error: error.message });
            }

            console.error(error);
            return reply.code(500).send({ error: "Internal Server Error"})
        }
    }
}