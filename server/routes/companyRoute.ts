import express, {Request, Response} from 'express';
import companyController from '../controllers/companyController';

const router = express.Router();

router.post('/add', async (req: Request, res: Response) => 
    await companyController.addCompanyAsync(req.body.company, res)
);

router.get('/allCompanies', async (req: Request, res: Response) => 
    await companyController.getAllCompaniesAsync(res)
);

export default router;