import { Router } from "express";
import {teamReferralManagement,geTeamReferralCoin,directReferralAddCoins,getDirectReferal} from '../controllers/adminController/referralManagment.js';

const routes=Router();

routes.post('/direct-referral/coin',directReferralAddCoins)
routes.get('/direct-referral/coin',getDirectReferal)

routes.post('/team/coins',teamReferralManagement);
routes.get('/team/coins',geTeamReferralCoin);

export default routes;