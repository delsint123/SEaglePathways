import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';
import { Request, Response } from 'express';
import ICompany from '../models/companyModel';
import IQueueReviewRequest from '../models/queueReviewRequestModel';

async function submitReviewAsync(data: Request, response: Response): Promise<void> {

    //TODO: add tags
    
    const review = {...data.body.review} as IReview;

    //check if specific fields are null
    try {
        validateReview(review);
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //find companyId
    let currCompany: ICompany = {} as ICompany;

    try {
        currCompany = await retrieveCompanyForReviewAsync(review.company);
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
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
            
            console.log("Review submission complete!");
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
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
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //get company name
    let companies: RowDataPacket[] = [];

    try {
        const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company`);

        if(!companyRes) {
            throw new Error('The companies could not be retrieved');
        }
        else {
            companies = companyRes[0];
        }
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    try {
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
            console.log("Reviews retrieval complete!");
        } else {
            throw new Error('An error while processing the retrieved reviews.');
        }
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }
}

async function getQueueReviewsAsync(data: Request, response: Response): Promise<void> {
    const queueRequest = {...data.body.queueRequest} as IQueueReviewRequest;

    const offset = (queueRequest.page - 1) * queueRequest.limit;

    //retrieve reviews
    let reviews: RowDataPacket[] = [];

    try {
        const reviewRes = await db.query<RowDataPacket[]>(`SELECT * FROM review LIMIT ?, ?`, [offset, queueRequest.limit]);

        if(!reviewRes[0].length) {
            throw new Error('Reviews could not be retrieved. Please try again.');
        } 
        else {
            reviews = reviewRes[0];
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }    
    
    //get company name
    let companies: RowDataPacket[] = [];

    try {
        const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company`);

        if(!companyRes) {
            throw new Error('The companies could not be retrieved');
        }
        else {
            companies = companyRes[0];
        }
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    try {
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
            console.log("Reviews retrieval complete!");
        } else {
            throw new Error('An error while processing the retrieved reviews.');
        }
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }
}

async function getReviewCountAsync(response: Response): Promise<void> {
    try {
        const reviewResCount = await db.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM review`);
        
        if(!reviewResCount) {
            throw new Error('Review count could not be retrieved. Please try again.');
        } 

        response.status(200).json(reviewResCount[0][0]);
        console.log("Review Count retrieval complete!")

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

async function getReviewByIdAsync(request: Request, response: Response): Promise<void> {
    const reviewId = request.params.reviewId;

    let review: RowDataPacket[] = [];
    try {
        const reviewRes = await db.query<RowDataPacket[]>(`SELECT * FROM review WHERE reviewId = ?`, [reviewId]);

        if(!reviewRes[0].length) {
            throw new Error('Reviews could not be retrieved. Please try again.');
        } 
        else {
            review = reviewRes[0];
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //get company name
    let company: RowDataPacket[] = [];

    try {
        const companyRes = await db.query<RowDataPacket[]>(`SELECT * FROM company WHERE companyId = ?`, [review[0].companyId]);

        if(!companyRes) {
            throw new Error('The companies could not be retrieved');
        }
        else {
            company = companyRes[0];
        }
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    try {
        let completeReview;
        if(company) {
            completeReview = {
                reviewId: review[0].reviewId,
                title: review[0].title, 
                company: company[0].name,
                description: review[0].description, 
                startDate: review[0].startDate,
                endDate: review[0].endDate,
                gradeLevel: review[0].gradeLevel,
            } as IReviewViewModel;
        }
        else {
            completeReview = {
                reviewId: review[0].reviewId,
                title: review[0].title, 
                description: review[0].description, 
                startDate: review[0].startDate,
                endDate: review[0].endDate,
                gradeLevel: review[0].gradeLevel,
            } as IReviewViewModel;
        }


        if(completeReview) {
            response.status(200).json(completeReview);
            console.log("Review by Id retrieval complete!");
        } else {
            throw new Error('An error while processing the retrieved reviews.');
        }
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }
}

//-----------------------------------------------------------------------------------
//helper functions

function validateReview(review: IReview): boolean {
    if(review.userId == null
        || review.title == null 
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

//-----------------------------------------------------------------------------------

export default {
    submitReviewAsync, 
    getReviewsAsync,
    getQueueReviewsAsync,
    getReviewCountAsync, 
    getReviewByIdAsync
}