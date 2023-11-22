const isEmailUsed = `SELECT * FROM user WHERE email = ?`;
const createUser = `INSERT INTO user (firstName, lastName, email, password, graduationYear) VALUES (?, ?, ?, ?, ?)`;
const getUser = `SELECT * FROM user WHERE email = ?`;
const userDetails = `SELECT * FROM user WHERE userId = ?`;

export default {
    isEmailUsed,
    createUser,
    getUser,
    userDetails
}