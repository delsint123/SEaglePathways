import express from 'express';
import IReview from '../models/reviewModel';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (request: IReview, res: any, next: any) => {

    try {
        const result = await reviewController.submitReviewAsync(request);
        res.json(result);
        console.log("Review submitted!", result);
    } catch (err) {
        next(err);
    }
});

export default router;