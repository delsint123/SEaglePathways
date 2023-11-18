import express, {Request, Response} from 'express';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router.post('/submit', async (req: Request, res: Response) => 
    await reviewController.submitReviewAsync(req, res)
);

router.get('/allReviews', async (req: Request, res: Response) => 
    await reviewController.getReviewsAsync(res)
);

router.post('/totalReviewCount', async (req: Request, res: Response) =>
    await reviewController.getReviewCountAsync(req, res)
);

router.get('/:reviewId', async (req: Request, res: Response) =>
    await reviewController.getReviewByIdAsync(req, res)
);

router.post('/queueReviewsWithFilters', async (req: Request, res: Response) =>
    await reviewController.getQueueReviewsWithFiltersAsync(req, res)
);

export default router;