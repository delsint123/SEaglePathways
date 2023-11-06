import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';
import { Request, Response } from 'express';
import ICompany from '../models/companyModel';

async function submitReviewAsync(data: Request, response: Response): Promise<void> {

    //TODO: add tags
    
    const review = {...data.body.review} as IReview;

    //check if specific fields are null
    try {
        validateReview(review);
    } catch (error) {
        response.status(400).send(error);
    }

    //find companyId
    let currCompany: ICompany = {} as ICompany;

    try {
        currCompany = await retrieveCompanyForReviewAsync(review.company);
    } catch (error) {
        response.status(400).send(error);
    }
    
    //add review
    try {
        const result = await db.query<ResultSetHeader>(
            `INSERT INTO review (title, userId, companyId, description, startDate, endDate, gradeLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                review.title, 
                review.userId, 
                currCompany.companyId, 
                review.description, 
                dateFormat(review.startDate, "isoDate"), 
                dateFormat(review.endDate, "isoDate"), 
                review.gradeLevel
            ]
        )

        let res: ResultSetHeader = {} as ResultSetHeader;

        if(!result) {
            throw new Error('Review could not be submitted. Please try again.');
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

    } catch (error) {
        response.status(400).send(error);
    }
}

async function getReviewsAsync(response: Response): Promise<void> {
    //retrieve reviews

    let reviews: RowDataPacket[] = [];
    try {
        const reviewRes = await db.query<RowDataPacket[]>(`SELECT * FROM review`);

        if(!reviewRes[0].length) {
            throw new Error('Reviews could not be retrieved. Please try again.');
        } 
        else {
            reviews = reviewRes[0];
        }

    } catch (error) {
        response.status(400).send(error);
    }

    //get company name
    let companies: RowDataPacket[] = [];

    try {
        const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company`);

        if(!companyRes) {
            response.status(400).send('The companies could not be retrieved');
        }
        else {
            companies = companyRes[0];
        }
    } catch (error) {
        response.status(400).send(error);
    }

    const reviewsWithCompany = reviews.map(review => {
        const companyForReview = companies.find(comp => comp.companyId === review.companyId);

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

    if(reviews.length) {
        response.status(200).json(reviewsWithCompany);
    } else {
        response.status(400).send('An error while processing the retrieved reviews.');
    }
}

function validateReview(review: IReview): boolean {
    if(review.title == null 
        || review.company == null 
        || review.description == null 
        || review.startDate == null 
        || review.endDate == null 
        || review.gradeLevel == null) {

        throw new Error('Review is not valid as some values are null. Please fill in those values and try again.');
    }

    return true;
}

async function retrieveCompanyForReviewAsync(reqCompany: string): Promise<ICompany> {
    const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company WHERE name = ?`, [reqCompany]);

    if(!companyRes[0].length) {
        throw new Error('The company entered could not be retrieved');
    }
    
    return {
        companyId: companyRes[0][0].companyId,
        name: companyRes[0][0].name
    } as ICompany;
}

export default {
    submitReviewAsync, 
    getReviewsAsync
}