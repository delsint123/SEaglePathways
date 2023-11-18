const addTag = `INSERT INTO tag (name, description) VALUES (?, ?)`;
const allTags = `SELECT * FROM tag`;
const addTagToReview = `INSERT INTO reviewTags (reviewId, tagId) VALUES (?, ?)`;

export default {
    addTag,
    allTags,
    addTagToReview
}