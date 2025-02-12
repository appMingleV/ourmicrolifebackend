import { Router } from "express";
import {teamReferralManagement,geTeamReferralCoin,directReferralAddCoins,getDirectReferal,addDirectPurchased,getDirectPurchased,addTeamPurchased,getTeamPurchased} from '../controllers/adminController/referralManagment.js';
import {getPositionRewards} from '../controllers/refferalController/refferController.js'

const routes=Router();

routes.post('/direct-referral/coin',directReferralAddCoins)
routes.get('/direct-referral/coin',getDirectReferal)

routes.post('/team/coins',teamReferralManagement);
routes.get('/team/coins',geTeamReferralCoin);

//purchased direct referrals-->
routes.post('/directPurchased',addDirectPurchased)
routes.get('/directPurchased',getDirectPurchased)


//purchased team purchased-->
routes.post('/teamPurchased',addTeamPurchased);
routes.get('/teamPurchased',getTeamPurchased)

//get position and award--->
.get('/mlmPosition',getPositionRewards)



export default routes;