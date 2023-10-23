import { Request, Response } from 'express';
import db from '../database';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import IUserLoginModel from '../models/userLoginModel';
import { RowDataPacket } from "mysql2";

async function registerAsync(request: Request): Promise<IUser> {

    const [...user] = await db.query<RowDataPacket[]>(
        `SELECT * FROM user WHERE email = ?`, 
        [request.body.email]
    );

    if(user.length) {
        throw new Error('An account has already been created with this email.');
    }

    const [firstName, lastName] = request.body.name.split(' ');

    const [result] = await db.query<RowDataPacket[]>(
        `INSERT INTO user (firstName, lastName, email, password, graduationYear)`,
        [firstName, lastName, request.body.email, request.body.password, request.body.graduationYear]
    );

    if (result[0].affectedRows) {
        return {
            userId: result[0].insertId,
            ...request.body
        } as IUser;
    }

    throw new Error('User could not be created');
}

async function loginAsync(request: Request): Promise<IUser> {

    const [result] = await db.query<RowDataPacket[]>(
        `SELECT * FROM user WHERE email = ?`, [request.body.email]
    );

    if(result.length && result[0].password == request.body.password) {
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