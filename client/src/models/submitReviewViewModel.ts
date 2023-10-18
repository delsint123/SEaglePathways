import {Dayjs} from "dayjs";

export default interface ISubmitReviewViewModel {
    title: string, 
    company: string,
    description: string, 
    datesAttended: Dayjs[],
    gradeLevel: string,
}