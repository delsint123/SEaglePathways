import db from '../database';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import IUserLoginModel from '../models/userLoginModel';
import { RowDataPacket } from "mysql2";

async function registerAsync(request: IUserRequestModel): Promise<IUser> {

    const [...user] = await db.query(`SELECT * FROM user WHERE email = ?`, [request.email]);

    if(user.length) {
        throw new Error('An account has already been created with this email.');
    }

    const [firstName, lastName] = request.name.split(' ');

    const [result] = await db.query<RowDataPacket[]>(
        `INSERT INTO user (firstName, lastName, email, password, graduationYear)`,
        [firstName, lastName, request.email, request.password, request.graduationYear]
    );

    if (result[0].affectedRows) {
        return {
            userId: result[0].insertId,
            ...request
        } as IUser;
    }

    throw new Error('User could not be created');
}

async function loginAsync(request: IUserLoginModel): Promise<IUser> {

    const [result] = await db.query<RowDataPacket[]> (
        `SELECT * FROM user WHERE email = ?`, [request.email]
    );

    if(result.length && result[0].password == request.password) {
        return {
            ...result[0]
        } as IUser;
    }
    else if(result.length) {
        throw new Error('Your password is incorrect. Try Again.');
    }

    throw new Error('An error occurred while logging in. Try Again.');
}

export default {
    registerAsync,
    loginAsync
}