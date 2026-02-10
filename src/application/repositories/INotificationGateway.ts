export interface INotificationGateway{
    send(userId: string, message: string): Promise<void>;
}