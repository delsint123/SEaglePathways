import ITag from "./tagModel";

export default interface IReview {
    reviewId?: number,
    userId: number,
    title: string, 
    company: string,
    description: string, 
    startDate: Date,
    endDate: Date,
    gradeLevel: string,
    tagIds: number[]
}