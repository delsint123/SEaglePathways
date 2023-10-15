import db from '../database';
import ITag from '../models/tagModel';

async function addTagsAsync(request: ITag[]) {
    
    // const [result] = await db.query(
    //     `INSERT INTO tags (name, description)`,
    //     [request.name, request.description]
    // );
}

export default {
    addTagsAsync
}

