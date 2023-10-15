import db from '../database';
import IReview from '../models/reviewModel';
import companyController from './companyController';
import tagController from './tagController';

async function submitReviewAsync(request: IReview) {

    //add tags

    const addedCompany = await companyController.addCompanyAsync(request.company);

    const [result] = db.query(
        `INSERT INTO review (title, userId, companyId, description, startDate, endDate, gradeLevel)`,
        [
            request.title, 
            request.userId, 
            addedCompany.companyId, 
            request.description, 
            request.startDate, 
            request.endDate, 
            request.gradeLevel
        ]
    )

    if (result[0].affectedRows) {
        return {
            reviewId: result[0].insertId,
            ...request
        } as IReview;
    }

    throw new Error('Review could not be submitted. Please try again.');
}

export default {
    submitReviewAsync
}