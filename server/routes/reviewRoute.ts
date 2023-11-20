import express, {Request, Response} from 'express';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (req: Request, res: Response) => 
    await reviewController.submitReviewAsync(req, res)
);

router.post('/totalReviewCount', async (req: Request, res: Response) =>
    await reviewController.getReviewCountAsync(req, res)
);

router.get('/:reviewId', async (req: Request, res: Response) =>
    await reviewController.getReviewByIdAsync(req, res)
);

router.post('/queueReviews', async (req: Request, res: Response) =>
    await reviewController.getQueueReviewsAsync(req, res)
);

router.get('/user/:userId', async (req: Request, res: Response) => 
    await reviewController.getReviewsByUserIdAsync(req, res)
);

export default router;