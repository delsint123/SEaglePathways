import { Dayjs } from "dayjs";

export default interface IReviewFilterViewModel {
    companyId?: number, 
    tagId?: number, 
    startDate?: Dayjs,
    endDate?: Dayjs
}