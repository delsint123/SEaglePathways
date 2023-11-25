export default interface IReview {
    reviewId?: number,
    userId: number,
    title: string, 
    companyId?: number,
    description: string, 
    startDate: Date,
    endDate: Date,
    gradeLevel: string,
    tagIds: number[]
}