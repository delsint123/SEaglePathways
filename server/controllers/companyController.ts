import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import ICompany from '../models/companyModel';
import queries from './queries/companyQueries';

async function addCompanyAsync(request: string, response: Response): Promise<void> {

    //integrate validation for data
    try {
        if(!request.length) {
            throw new Error('Company entered is not valid.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //validation for duplicates; check if company already exists
    try {
        const [currentCompanies] = await db.query<RowDataPacket[]>(queries.companyExists, [request])

        if(currentCompanies.length) {
            throw new Error('This company already exists, please search for it in the dropdown.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //insert company
    try {
        const [result] = await db.query<ResultSetHeader>(queries.addCompany, [request])
    
        if (result.affectedRows) {
            response.status(200).json({
                companyId: result.insertId,
                name: request
            } as ICompany);

            console.log("Company saved!");
        }
        else {
            throw new Error('Company could not be added.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

async function getAllCompaniesAsync(response: Response): Promise<void> {
    try {
        const [companies] = await db.query<RowDataPacket[]>(queries.allCompanies)

        if(companies.length) {
            response.status(200).json(companies as ICompany[]);
            console.log("Companies Retrieved!");
        }
        else {
            throw new Error('Companies could not be retrieved.');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

export default {
    addCompanyAsync,
    getAllCompaniesAsync
}