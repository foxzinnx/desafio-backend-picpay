import type { IAuthorizerGateway } from "@/application/repositories/IAuthorizerGateway.js";
import z from "zod";

const authorizerSchema = z.object({
    status: z.string(),
    data: z.object({
        authorization: z.boolean(),
    }),
});

export class FetchAuthorizerGateway implements IAuthorizerGateway {
    async authorize(): Promise<Boolean> {
        try {
            const response = await fetch('https://util.devi.tools/api/v2/authorize');

            if(!response.ok) return false;

            const json = await response.json()

            const parsedData = authorizerSchema.parse(json);

            return parsedData.status === "success" && parsedData.data.authorization === true;

        } catch (error) {
            console.error("Error in authorizer service:", error)
            return false;
        }
    }

}