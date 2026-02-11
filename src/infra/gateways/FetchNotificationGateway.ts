import type { INotificationGateway } from "@/application/repositories/INotificationGateway.js";

export class FetchNotificationGateway implements INotificationGateway {
    async send(userId: string, message: string): Promise<void> {
        const response = await fetch('https://util.devi.tools/api/v1/notify', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ userId, message }),
        });

        if(!response.ok){
            throw new Error('Notification service not working.');
        }
    }

}