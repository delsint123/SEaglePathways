const companies=`SELECT * FROM company;`
const company=`SELECT * FROM company WHERE companyId=?;`
const allTagsForReviews=`SELECT * FROM tag JOIN reviewTags rt ON rt.tagId = tag.tagId;`
const queueReviews=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     LIMIT ?, ?;`

const queueReviewsCompanyFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE r.companyId = ? 
     LIMIT ?, ?;`
const queueReviewsTagFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
     WHERE t.tagId = ?
     LIMIT ?, ?;`
const queueReviewsDateFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE startDate >= ? 
       AND endDate <= ? 
     LIMIT ?, ?;`

const queueReviewsCompanyDateFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE r.companyId = ? 
       AND startDate >= ? 
       AND endDate <= ? 
     LIMIT ?, ?;`
const queueReviewsCompanyTagFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND r.companyId = ?
    LIMIT ?, ?;`
const queueReviewsDateTagFilter=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND startDate >= ? 
      AND endDate <= ?
    LIMIT ?, ?;`

const queueReviewsAllFilters=`
    SELECT r.reviewId, r.title, r.userId, c.name, r.description, r.startDate, r.endDate, r.gradeLevel
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND r.companyId = ?
      AND startDate >= ? 
      AND endDate <= ?
    LIMIT ?, ?;`


const queueReviewsCount=`SELECT COUNT(*) as count FROM review;`
const queueReviewsCompanyFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE r.companyId = ?;`
const queueReviewsTagFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
     WHERE t.tagId = ?;`
const queueReviewsDateFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE startDate >= ? 
       AND endDate <= ?;`

const queueReviewsCompanyDateFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN company as c on c.companyId = r.companyId
     WHERE r.companyId = ? 
       AND startDate >= ? 
       AND endDate <= ? ;`
const queueReviewsCompanyTagFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND r.companyId = ?;`
const queueReviewsDateTagFilterCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND startDate >= ? 
      AND endDate <= ?;`

const queueReviewsAllFiltersCount=`
    SELECT COUNT(*) as count
      FROM review as r
           JOIN reviewTags as rt on r.reviewId = rt.reviewId
           JOIN tag as t on t.tagId = rt.tagId
           JOIN company as c on c.companyId = r.companyId
    WHERE t.tagId = ?
      AND r.companyId = ?
      AND startDate >= ? 
      AND endDate <= ?;`

export default {
    companies,
    company,
    allTagsForReviews,
    queueReviews,

    queueReviewsCompanyFilter,
    queueReviewsTagFilter,
    queueReviewsDateFilter,
    queueReviewsCompanyDateFilter,
    queueReviewsCompanyTagFilter,
    queueReviewsDateTagFilter,
    queueReviewsAllFilters,

    queueReviewsCount,
    queueReviewsCompanyFilterCount,
    queueReviewsTagFilterCount,
    queueReviewsDateFilterCount,
    queueReviewsCompanyDateFilterCount,
    queueReviewsCompanyTagFilterCount,
    queueReviewsDateTagFilterCount,
    queueReviewsAllFiltersCount
}