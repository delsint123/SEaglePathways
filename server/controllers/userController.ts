import { Request, Response } from 'express';
import db from '../database';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import IUserLoginModel from '../models/userLoginModel';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import session from 'express-session';

async function registerAsync(request: Request, response: Response): Promise<void> {

    const user = request.body.user as IUserRequestModel;

    const [...userEmail] = await db.query<RowDataPacket[]>(
        `SELECT * FROM user WHERE email = ?`, 
        [user.email]
    );

    if(userEmail[0].length) {
        response.status(400).send('An account has already been created with this email.');
    }

    const [firstName, lastName] = user.name.split(' ');

    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO user (firstName, lastName, email, password, graduationYear) VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, user.email, user.password, user.graduationYear]
    );

    if (result.affectedRows) {
        response.status(200).json({
            userId: result.insertId,
            ...request.body
        } as IUser);
    }
    else {
        response.status(400).send('User could not be created');
    }
}

async function loginAsync(request: Request, response: Response): Promise<void> {

    const user = request.body.user as IUserRequestModel;

    const [result] = await db.query<RowDataPacket[]>(
        `SELECT * FROM user WHERE email = ?`, [user.email]
    );

    if(result.length && result[0].password == user.password) {
        request.session.id = result[0].userId;

        response.status(200).json({
            ...result[0]
        } as IUser);
    }
    else if(result.length) {
        response.status(400).send('Your password is incorrect. Try Again.');
    }
    else {
        response.status(400).send('Your account could not be found. Try Again.');
    }
}

export default {
    registerAsync,
    loginAsync
}