import express, {Request, Response} from 'express';
import tagController from '../controllers/tagController';

const router = express.Router();

router.post('/add', async (req: Request, res: Response) => 
    await tagController.addTagAsync(req, res)
);

router.get('/allTags', async (req: Request, res: Response) =>
    await tagController.getAllTagsAsync(res)
);

export default router;