import express, {Request, Response} from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => 
    await userController.registerAsync(req, res)
);

router.post('/login', async (req: Request, res: Response) => 
    await userController.loginAsync(req, res)
);

export default router;