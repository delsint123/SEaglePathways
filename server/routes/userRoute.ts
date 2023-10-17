import express from 'express';
import userController from '../controllers/userController';
import IUserRequestModel from '../models/userRequestModel';
import IUserLoginModel from '../models/userLoginModel';

const router = express.Router();

router.post('/register', async (request: IUserRequestModel, res: any, next: any) => {
    try {
        const result = await userController.registerAsync(request);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (request: IUserLoginModel, res: any, next: any) => {
    try {
        const result = await userController.loginAsync(request);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;