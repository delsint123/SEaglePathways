import express from 'express';
import companyController from '../controllers/companyController';

const router = express.Router();

router.post('/add', async (req: any, res: any, next: any) => {
    try {
        const result = await companyController.addCompanyAsync(req.body.company);
        res.json(result);
        console.log("Company saved!", result);
    } catch (err) {
        next(err);
    }
});

router.get('/allCompanies', async (req: any, res: any, next: any) => {
    try {
        const result = await companyController.getAllCompaniesAsync();
        res.json(result);
        console.log("Companies Retrieved!", result);
    } catch (err) {
        next(err);
    }
})

export default router;