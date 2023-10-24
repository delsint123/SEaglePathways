import express, {Request, Response, NextFunction} from 'express';
import companyController from '../controllers/companyController';

const router = express.Router();

router.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await companyController.addCompanyAsync(req.body.company, res);
        console.log("Company saved!");
    } catch (err) {
        next(err);
    }
});

router.get('/allCompanies', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await companyController.getAllCompaniesAsync(res);
        console.log("Companies Retrieved!");
    } catch (err) {
        next(err);
    }
})

export default router;