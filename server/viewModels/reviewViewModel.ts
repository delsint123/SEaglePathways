export default interface IReviewViewModel {
    reviewId?: number,
    userId: number,
    title: string, 
    company: string,
    description: string, 
    startDate: string,
    endDate: string,
    gradeLevel: string,
    tags: string[]
}