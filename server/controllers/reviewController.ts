import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';

async function submitReviewAsync(data: any) {

    //TODO: add tags
    
    const review = {...data.body.review} as IReview;

    //check if specific fields are null
    const isValidReview = validateReview(review);

    if(!isValidReview) {
        throw new Error('Review is not valid as some values are null. Please fill in those values and try again.');
    }

    //add review
    const [currCompany] = await db.query<RowDataPacket[]>(`SELECT * FROM company WHERE name = ?`, [review.company]);

    if(!currCompany.length) {
        throw new Error('The company entered could not be retrieved');
    }

    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO review (title, userId, companyId, description, startDate, endDate, gradeLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            review.title, 
            review.userId, 
            currCompany[0].companyId, 
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

function validateReview(review: IReview): boolean {
    if(review.title == null 
        || review.company == null 
        || review.description == null 
        || review.startDate == null 
        || review.endDate == null 
        || review.gradeLevel == null) {

        return false;
    }

    return true;
}

export default {
    submitReviewAsync, 
    getReviewsAsync
}