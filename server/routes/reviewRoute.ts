import express, {Request, Response, NextFunction} from 'express';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (req: Request, res: Response) => {
    await reviewController.submitReviewAsync(req, res);
    console.log("Review submission complete!");
});

router.get('/allReviews', async (req: Request, res: Response) => {
    await reviewController.getReviewsAsync(res);
    console.log("Reviews retrieval complete!");
});

export default router;