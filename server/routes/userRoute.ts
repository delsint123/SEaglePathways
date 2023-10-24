import express, {Request, Response, NextFunction} from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.registerAsync(req, res);
        console.log("User saved!")
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.loginAsync(req, res);
        console.log("User logged in!")
    } catch (err) {
        next(err);
    }
});

export default router;