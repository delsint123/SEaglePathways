import { Request, Response } from 'express';
import db from '../database';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import queries from './queries/userQueries';
import bcrypt from 'bcryptjs';

async function registerAsync(request: Request, response: Response): Promise<void> {

    const user = request.body.user as IUserRequestModel;

    try {
        validateEmail(user.email);
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

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
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const [result] = await db.query<ResultSetHeader>(queries.createUser, 
            [firstName, lastName, user.email, hashedPassword, user.graduationYear]);

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

        const storedHashedPassword = result[0].password;
        const isPasswordCorrect = await bcrypt.compare(user.password, storedHashedPassword);

        if(result.length && isPasswordCorrect) {
            request.session.userId = result[0].userId;

            response.status(200).json({
                ...result[0],
                password: undefined
            } as IUser);
            
            console.log("User logged in!")
        }
        else if(result.length) {
            throw new Error('Your password is incorrect. Try Again.');
        }
        else {
            throw new Error('Your account could not be found. Please register or try again.');
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

async function getUserDetailsAsync(request: Request, response: Response): Promise<void> {
    const userId = request.session.userId || request.params.userId;

    try {
        const [result] = await db.query<RowDataPacket[]>(queries.userDetails, [userId]);

        if(result.length) {
            response.status(200).json({
                userId: result[0].userId,
                name: `${result[0].firstName} ${result[0].lastName}`,
                email: result[0].email,
                graduationYear: result[0].graduationYear
            } as IUser);
            console.log("User details retrieved!");
        }
        else {
            throw new Error('User details could not be retrieved');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

function validateEmail(email: string): void {
    // Regex for FGCU email addresses
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(eagle\.)?fgcu\.edu$/;

    if(!emailRegex.test(email)) {
        throw new Error('Email is not valid. Please use an FGCU email address');
    }
}

export default {
    registerAsync,
    loginAsync,
    logoutAsync,
    getUserDetailsAsync
}