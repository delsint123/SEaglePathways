const isEmailUsed = `SELECT * FROM user WHERE email = ?`;
const createUser = `INSERT INTO user (firstName, lastName, email, password, graduationYear) VALUES (?, ?, ?, ?, ?)`;
const getUser = `SELECT * FROM user WHERE email = ?`;

export default {
    isEmailUsed,
    createUser,
    getUser
}