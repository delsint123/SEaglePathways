import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import ICompany from '../models/companyModel';

async function addCompanyAsync(request: string) {

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

export default {
    addCompanyAsync
}