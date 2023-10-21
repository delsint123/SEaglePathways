import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import companyController from './companyController';
import dateFormat from 'dateformat';
import tagController from './tagController';

async function submitReviewAsync(data: any) {

    //add tags

    //integrate validation for data
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

async function getReviewsAsync() {
    const [review] = await db.query<RowDataPacket[]>(`SELECT * FROM review`);

    //get company name
    const [company] = await db.query<RowDataPacket[]>(`SELECT * FROM company`);

    console.log(review);

    const reviewsWithCompany = review.map(review => {
        const companyForReview = company.find(comp => comp.companyId === review.companyId);

        if(companyForReview) {
            return {
                reviewId: review.reviewId,
                title: review.title, 
                company: companyForReview.name,
                description: review.description, 
                startDate: review.startDate,
                endDate: review.endDate,
                gradeLevel: review.gradeLevel,
            } as IReviewViewModel;
        }
        else {
            return {
                reviewId: review.reviewId,
                title: review.title, 
                description: review.description, 
                startDate: review.startDate,
                endDate: review.endDate,
                gradeLevel: review.gradeLevel,
            } as IReviewViewModel;
        }
    })

    if(review.length) {
        return reviewsWithCompany
    }

    throw new Error('Reviews could not be retrieved. Please try again.');
}

export default {
    submitReviewAsync, 
    getReviewsAsync
}