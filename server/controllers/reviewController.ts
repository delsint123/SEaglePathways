import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import IReview from '../models/reviewModel';
import IReviewViewModel from '../viewModels/reviewViewModel';
import dateFormat from 'dateformat';
import tagController from './tagController';
import { Request, Response } from 'express';
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

    //add review        
    let res: ResultSetHeader = {} as ResultSetHeader;

    try {
        const result = await db.query<ResultSetHeader>(queries.addReview, [
            review.title, 
            review.userId, 
            review.companyId, 
            review.description, 
            dateFormat(review.startDate, "isoDate"), 
            dateFormat(review.endDate, "isoDate"), 
            review.gradeLevel]
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
        const reviewRes = await db.query<RowDataPacket[]>(queries.reviewById, [reviewId]);

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

    //get tags
    let tags: RowDataPacket[] = [];
    try {
        const tagsRes = await db.query<RowDataPacket[]>(queries.tagsForAReview, [reviewId]);

        if(!tagsRes) {
            throw new Error('The tags could not be retrieved');
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
        const completeReview = {
            reviewId: review[0].reviewId,
            title: review[0].title, 
            company: review[0].name,
            description: review[0].description, 
            startDate: review[0].startDate,
            endDate: review[0].endDate,
            gradeLevel: review[0].gradeLevel,
            tags: tags
        } as IReviewViewModel;

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

async function getQueueReviewsAsync(data: Request, response: Response): Promise<void> {
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
        || review.companyId == null 
        || review.description == null 
        || review.startDate == null 
        || review.endDate == null 
        || review.gradeLevel == null) {

        throw new Error('Review is not valid as some values are null. Please fill in those values and try again.');
    }

    return true;
}

function getQuery(queueFilterRequest: IReviewFilterRequest, count: boolean): {query: string, params: any[]} {
    const { tagId, companyId, startDate, endDate, queue } = queueFilterRequest;
    const { page, limit } = queue;

    const defaultQuery = !count ? queries.queueReviews : queries.queueReviewsCount;

    const filterOptions = [
        { 
            condition: tagId && companyId && startDate && endDate, 
            query: !count ? queries.queueReviewsAllFilters : queries.queueReviewsAllFiltersCount,
            params: [tagId, companyId, dateFormat(startDate, "isoDate"), dateFormat(endDate, "isoDate")]
        },
        { 
            condition: companyId && startDate && endDate, 
            query: !count ? queries.queueReviewsCompanyDateFilter : queries.queueReviewsCompanyDateFilterCount,
            params: [companyId, dateFormat(startDate, "isoDate"), dateFormat(endDate, "isoDate")]
        },
        { 
            condition: companyId && tagId, 
            query: !count ? queries.queueReviewsCompanyTagFilter : queries.queueReviewsCompanyTagFilterCount,
            params: [tagId, companyId]
        },
        { 
            condition: tagId && startDate && endDate, 
            query: !count ? queries.queueReviewsDateTagFilter : queries.queueReviewsDateTagFilterCount,
            params: [tagId, dateFormat(startDate, "isoDate"), dateFormat(endDate, "isoDate")]
        },
        { 
            condition: startDate && endDate, 
            query: !count ? queries.queueReviewsDateFilter : queries.queueReviewsDateFilterCount,
            params: [dateFormat(startDate, "isoDate"), dateFormat(endDate, "isoDate")]
        },
        { 
            condition: tagId, 
            query: !count ? queries.queueReviewsTagFilter : queries.queueReviewsTagFilterCount,
            params: [tagId]
        },
        { 
            condition: companyId, 
            query: !count ? queries.queueReviewsCompanyFilter : queries.queueReviewsCompanyFilterCount,
            params: [companyId]
        },
    ];

    const matchingFilter = filterOptions.find(option => option.condition);

    const result = {
        query: matchingFilter ? matchingFilter.query : defaultQuery,
        params: matchingFilter ? matchingFilter.params : [],
    };

    if (!count) {
        result.params.push((page - 1) * limit, limit);
    }

    return result;
}

//-----------------------------------------------------------------------------------

export default {
    submitReviewAsync, 
    getReviewCountAsync, 
    getReviewByIdAsync,
    getQueueReviewsAsync
}