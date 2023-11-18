import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';
import { Request, Response } from 'express';
import ICompany from '../models/companyModel';
import IQueueReviewRequest from '../models/queueReviewRequestModel';
import ITagReviewRequestViewModel from '../models/tagReviewRequestViewModel';
import IReviewFilterRequest from '../models/reviewFilterRequestModel';
import queries from './queries/reviewQueries';

async function submitReviewAsync(data: Request, response: Response): Promise<void> {
    
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
    //TODO: why didnt my idiot self just pass the companyId from the front end? Pls refactor
    let currCompany: ICompany = {} as ICompany;

    try {
        currCompany = await retrieveCompanyForReviewAsync(review.company);
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //add review        
    let res: ResultSetHeader = {} as ResultSetHeader;

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

        if(!result) {
            throw new Error('Review could not be submitted. Please try again.');
        }
        else {
            res = result[0];
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }

    //add tags
    try {
        if (res.affectedRows) {    
            const tagRequest = {
                reviewId: res.insertId,
                tagIds: review.tagIds
            } as ITagReviewRequestViewModel; 

            await tagController.addTagsToReviewAsync(tagRequest, response);

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

    //get all tags
    let tags: RowDataPacket[] = [];

    try {
        const tagRes = await db.query<RowDataPacket[]>(`SELECT * FROM tag JOIN reviewTags rt ON rt.tagId = tag.tagId`);

        if(!tagRes) {
            throw new Error('The tags could not be retrieved');
        }
        else {
            tags = tagRes[0];
        }
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }    

    try {
        const completeReview = reviews.map(async review => {
            const companyForReview = companies.find(comp => comp.companyId === review.companyId);
            const tagsForReview = tags.filter(tag => tag.reviewId === review.reviewId);

            if(companyForReview) {
                return {
                    reviewId: review.reviewId,
                    title: review.title, 
                    company: companyForReview.name,
                    description: review.description, 
                    startDate: review.startDate,
                    endDate: review.endDate,
                    gradeLevel: review.gradeLevel,
                    tags: tagsForReview
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
                    tags: tagsForReview
                } as IReviewViewModel;
            }
        })

        if(reviews.length) {
            response.status(200).json(completeReview);
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

async function getReviewCountAsync(data: Request, response: Response): Promise<void> {
    const queueFilterRequest = {...data.body.filterRequest} as IReviewFilterRequest;

    const {query, params} = getQuery(queueFilterRequest, true);

    try {
        const reviewResCount = await db.query<RowDataPacket[]>(query, params);
        
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

    //get tags
    let tags: RowDataPacket[] = [];
    try {
        const tagsRes = await db.query<RowDataPacket[]>(
            `SELECT * FROM tag t
            INNER JOIN reviewTags rt ON rt.tagId = t.tagId
            WHERE rt.reviewId = ?`,
            [reviewId]
        );

        if(!tagsRes) {
            throw new Error('The companies could not be retrieved');
        }
        else {
            tags = tagsRes[0];
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
                tags: tags
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
                tags: tags
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

async function getQueueReviewsWithFiltersAsync(data: Request, response: Response): Promise<void> {
    const queueFilterRequest = {...data.body.filterRequest} as IReviewFilterRequest;

    let tags: RowDataPacket[] = [];

    try {
        const tagRes = await db.query<RowDataPacket[]>(queries.allTagsForReviews);

        if(!tagRes) {
            throw new Error('The tags could not be retrieved');
        }
        else {
            tags = tagRes[0];
        }
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }    
    
    //retrieve reviews
    const {query, params} = getQuery(queueFilterRequest, false);

    try {
        const reviewRes = await db.query<RowDataPacket[]>(query, params);

        if(!reviewRes[0].length) {
            throw new Error('There are no reviews with this filter. Please try again.');
        } 
        else {
            const reviews = reviewRes[0].map(review => {
                return {
                    reviewId: review.reviewId,
                    title: review.title, 
                    company: review.name,
                    description: review.description, 
                    startDate: review.startDate,
                    endDate: review.endDate,
                    gradeLevel: review.gradeLevel,
                    tags: tags.filter(tag => tag.reviewId === review.reviewId)
                } as IReviewViewModel;
            });

            response.status(200).json(reviews);
            console.log("Review retrieval complete!");
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

//TODO: remove this in controller refactor
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

function getQuery(queueFilterRequest: IReviewFilterRequest, count: boolean): {query: string, params: any[]} {
    let result = {query: "", params: []} as {query: string, params: any[]};

    if(queueFilterRequest.tagId && queueFilterRequest.companyId && queueFilterRequest.startDate && queueFilterRequest.endDate){
        result.query = !count ? queries.queueReviewsAllFilters : queries.queueReviewsAllFiltersCount;
        result.params.push(queueFilterRequest.tagId);
        result.params.push(queueFilterRequest.companyId);
        result.params.push(dateFormat(queueFilterRequest.startDate, "isoDate"));
        result.params.push(dateFormat(queueFilterRequest.endDate, "isoDate"));
    }
    else if(queueFilterRequest.companyId && queueFilterRequest.startDate && queueFilterRequest.endDate) {
        result.query = !count ? queries.queueReviewsCompanyDateFilter : queries.queueReviewsCompanyDateFilterCount;
        result.params.push(queueFilterRequest.companyId);
        result.params.push(dateFormat(queueFilterRequest.startDate, "isoDate"));
        result.params.push(dateFormat(queueFilterRequest.endDate, "isoDate"));
    }
    else if(queueFilterRequest.companyId && queueFilterRequest.tagId) {
        result.query = !count ? queries.queueReviewsCompanyTagFilter : queries.queueReviewsCompanyTagFilterCount;
        result.params.push(queueFilterRequest.tagId);
        result.params.push(queueFilterRequest.companyId);
    }
    else if(queueFilterRequest.tagId && queueFilterRequest.startDate && queueFilterRequest.endDate) {
        result.query = !count ? queries.queueReviewsDateTagFilter : queries.queueReviewsDateTagFilterCount;
        result.params.push(queueFilterRequest.tagId);
        result.params.push(dateFormat(queueFilterRequest.startDate, "isoDate"));
        result.params.push(dateFormat(queueFilterRequest.endDate, "isoDate"));
    }    
    else if(queueFilterRequest.startDate && queueFilterRequest.endDate) {
        result.query = !count ? queries.queueReviewsDateFilter : queries.queueReviewsDateFilterCount;
        result.params.push(dateFormat(queueFilterRequest.startDate, "isoDate"));
        result.params.push(dateFormat(queueFilterRequest.endDate, "isoDate"));
    }
    else if(queueFilterRequest.tagId) {
        result.query = !count ? queries.queueReviewsTagFilter : queries.queueReviewsTagFilterCount;
        result.params.push(queueFilterRequest.tagId);
    }
    else if(queueFilterRequest.companyId) {
        result.query = !count ? queries.queueReviewsCompanyFilter : queries.queueReviewsCompanyFilterCount;
        result.params.push(queueFilterRequest.companyId);
    }
    else {
        result.query = !count ? queries.queueReviews : queries.queueReviewsCount;
    }

    if(!count) {
        result.params.push((queueFilterRequest.queue.page - 1) * queueFilterRequest.queue.limit);
        result.params.push(queueFilterRequest.queue.limit);
    }

    return result;
}

//-----------------------------------------------------------------------------------

export default {
    submitReviewAsync, 
    getReviewsAsync,
    getReviewCountAsync, 
    getReviewByIdAsync,
    getQueueReviewsWithFiltersAsync
}