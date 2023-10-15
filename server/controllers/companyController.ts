import db from '../database';
import ICompany from '../models/companyModel';

async function addCompanyAsync(request: string) {

    const [result] = db.query(
        `INSERT INTO company (name)`,
        request
    )

    if (result[0].affectedRows) {
        return {
            companyId: result[0].insertId,
            name: request
        } as ICompany;
    }

    throw new Error('Company could not be added.');
}

export default {
    addCompanyAsync
}