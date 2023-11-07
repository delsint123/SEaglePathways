import express, {Request, Response} from 'express';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (req: Request, res: Response) => 
    await reviewController.submitReviewAsync(req, res)
);

router.get('/allReviews', async (req: Request, res: Response) => 
    await reviewController.getReviewsAsync(res)
);

export default router;