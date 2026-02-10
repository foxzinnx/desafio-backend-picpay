export interface IAuthorizerGateway{
    authorize(): Promise<Boolean>;
}