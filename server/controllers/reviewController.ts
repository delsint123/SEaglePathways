import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';
import { Request, Response } from 'express';

async function submitReviewAsync(data: Request, response: Response) {

    //TODO: add tags
    
    const review = {...data.body.review} as IReview;

    //check if specific fields are null
    const isValidReview = validateReview(review);

    if(!isValidReview) {
        response.status(400).send('Review is not valid as some values are null. Please fill in those values and try again.');
    }

    //add review
    const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company WHERE name = ?`, [review.company]);
    let currCompany: RowDataPacket[] = [];

    if(!companyRes[0].length) {
        response.status(400).send('The company entered could not be retrieved');
    }
    else {
        currCompany = companyRes[0];
    }

    const result = await db.query<ResultSetHeader>(
        `INSERT INTO review (title, userId, companyId, description, startDate, endDate, gradeLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            review.title, 
            review.userId, 
            currCompany[0]?.companyId, 
            review.description, 
            dateFormat(review.startDate, "isoDate"), 
            dateFormat(review.endDate, "isoDate"), 
            review.gradeLevel
        ]
    )

    let res: ResultSetHeader = {} as ResultSetHeader;

    if(!result) {
        response.status(400).send('Review could not be submitted. Please try again.');
    }
    else {
        res = result[0];
    }

    if (res.affectedRows) {
        response.status(200).json({
            reviewId: res.insertId,
            ...review
        } as IReview);
    }
}

async function getReviewsAsync(response: Response) {
    const reviewRes = await db.query<RowDataPacket[]>(`SELECT * FROM review`);
    let review: RowDataPacket[] = [];

    if(!reviewRes[0].length) {
        response.status(400).send('Reviews could not be retrieved. Please try again.');
    } 
    else {
        review = reviewRes[0];
    }

    //get company name
    const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company`);
    let company: RowDataPacket[] = [];

    if(!companyRes) {
        response.status(400).send('The companies could not be retrieved');
    }
    else {
        company = companyRes[0];
    }

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
        response.status(200).json(reviewsWithCompany);
    }
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