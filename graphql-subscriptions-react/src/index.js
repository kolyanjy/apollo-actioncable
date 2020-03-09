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
  // const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODM3Njk5NDEsImFjY291bnRfaWQiOiI2MjdjMjI0Mi1jZDQ0LTQxNTUtOGM5Zi1jOTMyN2JmMjRhZTYiLCJhY2NvdW50X3R5cGUiOiJCdXllckFjY291bnQiLCJ1aWQiOiJiODQ1MGE4NC03NDQ5LTRhZmYtYWQ3NS1iMmMyMDJkNGM3YzYiLCJleHAiOjE1ODM3Njk5NDF9.52SwDb3nbgWBv8qxgP431g8_jxqfjT9-V7rNyY06i8I';
  const authToken = '';

  const orderId = '7285b998-fd38-4256-909e-2255967eb1f7';
  // const orderId = '';
  // const cable = ActionCable.createConsumer(`ws://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/cable?token=${authToken}&order_id=${orderId}`);
  const cable = ActionCable.createConsumer(`ws://localhost:${RAILS_PORT}/cable?token=${authToken}&order_id=${orderId}`);
  webSocketLink = new ActionCableLink({cable});
  httpLink = new HttpLink({ uri: `http://localhost:${RAILS_PORT}/graphql`, headers: { 'Order-ID': orderId }});
  // httpLink = new HttpLink({ uri: `http://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/graphql`, headers: { 'Order-ID': orderId }});
  // httpLink = new HttpLink({ uri: `http://localhost:${RAILS_PORT}/graphql`, headers: { 'Authorization': `Bearer ${authToken}` }});

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
