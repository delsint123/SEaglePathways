import {Dayjs} from "dayjs";
import ITag from "../../../server/models/tagModel";

export default interface ISubmitReviewViewModel {
    title: string, 
    company: string,
    description: string, 
    datesAttended: Dayjs[],
    tagIds: number[],
    gradeLevel: string,
}