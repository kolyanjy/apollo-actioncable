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
  const orderId = '68a71b3a-0edb-4911-949f-77cbcc654446';
  const cable = ActionCable.createConsumer(`ws://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/cable?token=${authToken}&order_id=${orderId}`);
  webSocketLink = new ActionCableLink({cable});
  httpLink = new HttpLink({ uri: `http://product-marketplace-staging-1578308111.us-east-2.elb.amazonaws.com:${RAILS_PORT}/graphql`});
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

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache({addTypename: false})
});



ReactDOM.render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>,
    document.getElementById('root')
);

registerServiceWorker();
