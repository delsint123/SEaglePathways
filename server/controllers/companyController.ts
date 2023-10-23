import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import ICompany from '../models/companyModel';

async function addCompanyAsync(request: string, response: Response) {

    //integrate validation for data
    if(!request.length) {
        response.status(400).send('Company entered is not valid.');
    }

    const [currentCompanies] = await db.query<RowDataPacket[]>(
        `SELECT * FROM company WHERE name = ?`, 
        [request]
    )

    //validation for duplicates
    if(currentCompanies.length) {
        response.status(400).send('This company already exists, please search for it in the dropdown.');
    }

    //insert company
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO company (name) VALUES (?)`,
        [request]
    )

    if (result.affectedRows) {
        response.status(200).json({
            companyId: result.insertId,
            name: request
        } as ICompany);
    }
    else {
        response.status(400).send('Company could not be added.');
    }
}

async function getAllCompaniesAsync(response: Response) {
    const [companies] = await db.query<RowDataPacket[]>(`SELECT * FROM company`)

    if(companies.length) {
        response.status(200).json(companies as ICompany[]);
    }
    else {
        response.status(400).send('Companies could not be retrieved.');
    }
}

export default {
    addCompanyAsync,
    getAllCompaniesAsync
}