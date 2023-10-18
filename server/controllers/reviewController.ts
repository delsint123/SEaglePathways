import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import companyController from './companyController';
import dateFormat from 'dateformat';
import tagController from './tagController';

async function submitReviewAsync(data: any) {

    //add tags
    const review = {...data.body.review} as IReview

    const addedCompany = await companyController.addCompanyAsync(review.company);

    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO review (title, userId, companyId, description, startDate, endDate, gradeLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            review.title, 
            review.userId, 
            addedCompany.companyId, 
            review.description, 
            dateFormat(review.startDate, "isoDate"), 
            dateFormat(review.endDate, "isoDate"), 
            review.gradeLevel
        ]
    )

    if (result.affectedRows) {
        return {
            reviewId: result.insertId,
            ...review
        } as IReview;
    }

    throw new Error('Review could not be submitted. Please try again.');
}

export default {
    submitReviewAsync
}