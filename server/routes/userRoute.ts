import express, {Response, Next} from 'express';
import userController from '../controllers/userController';
import IUserRequestModel from '../models/userRequestModel';
import IUser from '../models/userModel';
import IUserLoginModel from '../models/userLoginModel';

const router = express.Router();

router.post('/register', async (request: IUserRequestModel, res: Response, next: Next) => {
    try {
        const result = await userController.registerAsync(request);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (request: IUserLoginModel, res: Response, next: Next) => {
    try {
        const result = await userController.loginAsync(request);
        res.json(result);
    } catch (err) {
        next(err);
    }
});