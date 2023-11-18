const companyExists = `SELECT * FROM company WHERE name = ?`;
const addCompany = `INSERT INTO company (name) VALUES (?)`;
const allCompanies = `SELECT * FROM company`;

export default {
    companyExists,
    addCompany,
    allCompanies
}