import React from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3'; 
import Layout from '../../components/Layout';
import { Router } from '../../routes';

export default class CampaignNew extends React.Component {
    state = {
        minimumContribution: '',
        errorMessage: '',
        loading: false
    }
    
    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({ 
            loading: true,
            errorMessage: ''
        });
        const accounts = await web3.eth.getAccounts();
        try {
            await factory.methods
                .createCampaign(this.state.minimumContribution)
                .send({
                    from: accounts[0]
                });
            Router.pushRoute('/');
        } catch (error) {
            this.setState({ errorMessage: error.message });
        }
        this.setState({ loading: false });
    }

    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input 
                            label="wei" 
                            labelPosition="right"
                            value={this.state.minimumContribution}
                            onChange={(event) => this.setState({ minimumContribution: event.target.value })}
                        />
                    </Form.Field>
                    <Message 
                        error
                        header="Oops!"
                        content={this.state.errorMessage}
                    />
                    <Button loading={this.state.loading} primary>Create!</Button>
                </Form>
            </Layout>
        );
    }
};