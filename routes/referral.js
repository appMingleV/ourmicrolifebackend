import { Router } from "express";
import {teamReferralManagement,geTeamReferralCoin} from '../controllers/adminController/referralManagment.js';

const routes=Router();

routes.post('/team/coins',teamReferralManagement);
routes.get('/team/coins',geTeamReferralCoin);

export default routes;