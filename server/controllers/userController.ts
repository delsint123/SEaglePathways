import { Request, Response } from 'express';
import db from '../database';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import queries from './queries/userQueries';

async function registerAsync(request: Request, response: Response): Promise<void> {

    const user = request.body.user as IUserRequestModel;

    try {
        const [...userEmail] = await db.query<RowDataPacket[]>(queries.isEmailUsed, [user.email]);

        if(userEmail[0].length) {
            throw new Error('An account has already been created with this email.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    try {
        const [firstName, lastName] = user.name.split(' ');

        const [result] = await db.query<ResultSetHeader>(queries.createUser, [firstName, lastName, user.email, user.password, user.graduationYear]);

        if (result.affectedRows) {
            response.status(200).json({
                userId: result.insertId,
                ...request.body
            } as IUser);

            console.log("User saved!")
        }
        else {
            throw new Error('User could not be created');
        }
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }

}

async function loginAsync(request: Request, response: Response): Promise<void> {

    const user = request.body.user as IUserRequestModel;

    try {
        const [result] = await db.query<RowDataPacket[]>(queries.getUser, [user.email]);

        if(result.length && result[0].password == user.password) {
            request.session.userId = result[0].userId;

            response.status(200).json({
                ...result[0]
            } as IUser);
            
            console.log("User logged in!")
        }
        else if(result.length) {
            throw new Error('Your password is incorrect. Try Again.');
        }
        else {
            throw new Error('Your account could not be found. Try Again.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error); 
    }
}

async function logoutAsync(request: Request, response: Response): Promise<void> {
    try {
        request.session.userId = undefined;

        if(request.session.userId != undefined) {
            throw new Error('User could not be logged out');
        }

        response.status(200).json({
            message: 'User logged out. Navigating Home...'
        });

        console.log("User logged out!");
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

export default {
    registerAsync,
    loginAsync,
    logoutAsync
}