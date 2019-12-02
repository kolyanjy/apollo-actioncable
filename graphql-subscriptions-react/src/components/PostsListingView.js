import React, {Component} from "react";
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import PostEditorView from "./PostEditorView";
import {CSSTransitionGroup} from "react-transition-group";
import './PostsListingView.css';
import PostView from "./PostView";

const postsQuery = gql`
    query orderChanges {
      orderChanges {
        id
        orderWasChanged
        orderItemsChanges {
          orderItemWasChanged
          id
          changes
          product {
            id
            name
            
          }
        }
      }
    }
`;

const postsSubscription = gql`
    subscription OrderChangesSubscription {
      orderChanged {
        id
        orderWasChanged
        orderItemsChanges {
          id
          changes
        }
      }
    }
`;

const withPostsData = graphql(postsQuery);

class PostsListingView extends Component {

    componentWillMount() {
        this.props.data.subscribeToMore({
            document: postsSubscription,
            variables: {},
            updateQuery: (previous, {subscriptionData}) => {
                if (!subscriptionData.data) {
                    return previous;
                }

                const newPost = subscriptionData.data.orderChanged;

                if (!previous.orderChanges.find((post) => post.id === newPost.id)) {
                    return Object.assign({}, previous, {orderChanges: [newPost, ...previous.orderChanges]});
                } else {
                    return previous;
                }
            }
        });
    }

    render() {
        let content = (<div>&nbsp;</div>);
        if (this.props.data) {
            if (this.props.data.loading) {
                content = (<div key={'data-loading'}>Data loading! Please wait...</div>);
            } else if (this.props.data.error) {
                content = (<div key={'error'}>An error occurred. {this.props.data.error}</div>);
            } else if (this.props.data.orderChanges) {
                content = <PostView post={this.props.data.orderChanges} key={this.props.data.orderChanges.id}/>
            }
        }

        return (
            <div>
                {/* <h1>Posts</h1> */}
                {/* <PostEditorView/> */}
                <CSSTransitionGroup
                    transitionName="orderChanges"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    {content}
                </CSSTransitionGroup>

            </div>
        );
    }
}

export default withPostsData(PostsListingView);
