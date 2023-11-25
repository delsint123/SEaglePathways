import IQueueReviewRequest from "./queueReviewRequestModel"

export default interface IReviewFilterRequest {
    queue: IQueueReviewRequest,
    companyId: number, 
    tagId: number, 
    startDate: Date,
    endDate: Date
}