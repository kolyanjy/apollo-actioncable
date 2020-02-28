import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {split} from 'apollo-link';
import {ApolloClient} from 'apollo-client';
import {ApolloProvider} from 'react-apollo';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import ActionCable from 'actioncable';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';
import {WebSocketLink} from 'apollo-link-ws';
import {getMainDefinition} from 'apollo-utilities';

const RAILS_PORT = 3000;

let webSocketLink = undefined;
let httpLink = undefined;

if (process.env.REACT_APP_BACKEND === 'rails') {
  const authToken = '';
  // const orderId = '2a7af378-e7bc-4260-8e7e-91b47a89efc8';
  const orderId = '6b5a50c9-a915-475a-a18c-8105dea7f269';
  // const cable = ActionCable.createConsumer(`ws://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/cable?token=${authToken}&order_id=${orderId}`);
  const cable = ActionCable.createConsumer(`ws://localhost:${RAILS_PORT}/cable?token=${authToken}&order_id=${orderId}`);
  webSocketLink = new ActionCableLink({cable});
  httpLink = new HttpLink({ uri: `http://localhost:${RAILS_PORT}/graphql`, headers: { 'Order-ID': orderId }});

  // console.log(cable);
  // console.log(webSocketLink);
  // console.log(httpLink);

  // httpLink = new HttpLink({ uri: `http://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/graphql`, headers: { 'Order-ID': orderId } });
}

// using the ability to split links, you can send data to each link depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({query}) => {
        const {kind, operation} = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    webSocketLink,
    httpLink,
);
// console.log(link);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache({addTypename: false})
});
// console.log(client);




ReactDOM.render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>,
    document.getElementById('root')
);

registerServiceWorker();
