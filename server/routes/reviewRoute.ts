import express, {Request, Response, NextFunction} from 'express';
import IReview from '../models/reviewModel';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewController.submitReviewAsync(req, res);
        console.log("Review submitted!");
    } catch (err) {
        next(err);
    }
});

router.get('/allReviews', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await reviewController.getReviewsAsync(res);
        console.log("Reviews Retrieved!");
    } catch (err) {
        next(err);
    }
});

export default router;