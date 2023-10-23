import express, {Request, Response, NextFunction} from 'express';
import userController from '../controllers/userController';
import IUserRequestModel from '../models/userRequestModel';
import IUserLoginModel from '../models/userLoginModel';

const router = express.Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userController.registerAsync(req);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userController.loginAsync(req);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;