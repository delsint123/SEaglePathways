import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import ICompany from '../models/companyModel';

async function addCompanyAsync(request: string) {

    //integrate validation for data
    if(!request.length) {
        throw new Error('Company entered is not valid.');
    }

    const [currentCompanies] = await db.query<RowDataPacket[]>(
        `SELECT * FROM company WHERE name = ?`, 
        [request]
    )

    //validation for duplicates
    if(currentCompanies.length) {
        throw new Error('This company already exists, please search for it in the dropdown.');
    }

    //insert company
    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO company (name) VALUES (?)`,
        [request]
    )

    if (result.affectedRows) {
        return {
            companyId: result.insertId,
            name: request
        } as ICompany;
    }

    throw new Error('Company could not be added.');
}

async function getAllCompaniesAsync() {
    const [companies] = await db.query<RowDataPacket[]>(`SELECT * FROM company`)

    if(companies.length) {
        return companies as ICompany[];
    }

    throw new Error('Companies could not be retrieved.');
}

export default {
    addCompanyAsync,
    getAllCompaniesAsync
}