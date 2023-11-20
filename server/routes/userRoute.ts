import express, {Request, Response} from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => 
    await userController.registerAsync(req, res)
);

router.post('/login', async (req: Request, res: Response) => 
    await userController.loginAsync(req, res)
);

router.get('/logout', async (req: Request, res: Response) => 
    await userController.logoutAsync(req, res)
);

router.get('/details/:userId', async (req: Request, res: Response) =>
    await userController.getUserDetailsAsync(req, res)
);

export default router;