const addTag = `INSERT INTO tag (name, description) VALUES (?, ?)`;
const allTags = `SELECT * FROM tag`;
const addTagToReview = `INSERT INTO reviewTags (reviewId, tagId) VALUES (?, ?)`;
const deleteTagsForReview = `DELETE FROM reviewTags WHERE reviewId = ?`;

export default {
    addTag,
    allTags,
    addTagToReview,
    deleteTagsForReview
}