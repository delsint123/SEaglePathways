import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database';
import ITag from '../models/tagModel';
import { Request, Response } from 'express';
import ITagReviewRequestViewModel from '../models/tagReviewRequestViewModel';
import queries from './queries/tagQueries';

async function addTagAsync(data: Request, response: Response) {

    const tag = {...data.body.tag} as ITag;
    
    try {
        const [result] = await db.query<ResultSetHeader>(queries.addTag, [tag.name, tag.description]);

        if (result.affectedRows) {
            response.status(200).json({
                tagId: result.insertId,
                ...tag
            } as ITag);
            console.log("Tags saved!");
        }
        else {
            throw new Error('User could not be created');
        }

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }
}

async function getAllTagsAsync(response: Response) {
    try {
        const [result] = await db.query<RowDataPacket[]>(queries.allTags);

        if(result) {
            response.status(200).json(result);
            console.log("Tags retrieved!");
        }
        else {
            throw new Error('Tags could not be retrieved');
        }
        
    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
        return;
    }
}

async function addTagsToReviewAsync(request: ITagReviewRequestViewModel, response: Response) {
    const {reviewId, tagIds } = request;

    const result = [] as number[];

    try {
        for (const tagId of tagIds) {
            const [curRes] = await db.query<ResultSetHeader>(queries.addTagToReview, [reviewId, tagId]);

            if (curRes.affectedRows) {
                result.push(tagId);
            }
            else {
                throw new Error('Tags could not be added to review');
            }
        }

        console.log("Tags added to review!");

    } catch (error) {
        response.status(500).json({'error': (error as Error).message});
        console.log(error);
    }
}

export default {
    addTagAsync,
    getAllTagsAsync,
    addTagsToReviewAsync
}

