import { Request } from "express";

export interface IAuth {
    readonly loginOrEmail: string;
    readonly password: string;
}

export interface IEmail {
    readonly email: string;
}

export interface IRegistration extends IEmail {
    readonly login: string;
    readonly password: string;
}

export interface INewPassword {
    readonly newPassword: string;
    readonly recoveryCode: string;
}

export interface RequestWithUser extends Request {
    user: {
        readonly userId: string;
        readonly email: string;
        readonly deviceId: string;
    };
}

export interface ICode {
    readonly code: string;
}
