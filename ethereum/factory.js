import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xC5dF98984eDe2696C212D1416C44571C1f2CAf18'
);

export default instance;