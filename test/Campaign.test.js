const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const compiledCampaign = require('../ethereum/build/Campaign.json');
const compiledFactory = require('../ethereum/build/CampaignFactory.json');

const web3 = new Web3(ganache.provider());

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({
            data: compiledFactory.bytecode
        }).send({
            from: accounts[0],
            gas: '1000000'
        });
    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });
    [ campaignAddress ] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Testing CampaignFactory and Campaign', () => {
    it('should deploy a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });
    it('should mark accounts[0] as manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });
    it('should allow accounts[1] to contribute and be marked as approver', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1],
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });
    it('should require a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '100',
                from: accounts[1],
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });
    it('should allow a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Test description', '100', accounts[1]).send({
                from: accounts[0],
                gas: '1000000'
            });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Test description', request.description);
    });
    it('should process a request', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });
        await campaign.methods
            .createRequest('Test description', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        assert(balance > 104);
    });
});
