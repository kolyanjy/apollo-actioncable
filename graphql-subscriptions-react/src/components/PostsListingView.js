import React, {Component} from "react";
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import PostEditorView from "./PostEditorView";
import {CSSTransitionGroup} from "react-transition-group";
import './PostsListingView.css';
import PostView from "./PostView";

const postsQuery = gql`
        query order {
          order {
            id
            subtotal
            status
            productsCount
            itemsCount
            orderItems {
              quantity
              total
              lastInStock
              company {
                name
              }
              productVariant {
                id
                price
                salePrice
                discount
                mainImage {
                  imageVariants {
                    variantUrl(dimensions: w32_h32)
                  }
                }
                product {
                  name
                }
                options {
                  productOptionType {
                    position
                    prototypeOptionType {
                      optionType {
                        name
                      }
                    }
                  }
                  productOptionValue {
                    position
                    prototypeOptionValue {
                      optionValue {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
`;

// const postsSubscription = gql`
//     subscription orderItemUpdated {
//       orderItemUpdated {
//         id
//         lastInStock
//         productVariant {
//           id
//           price
//           inventory
//         }
//       }
//     }
// `;

const postsSubscription = gql`
subscription orderUpdated {
  orderUpdated {
    id
    status
    orderItems {
      id
      lastInStock
      productVariant {
        id
        price
        inventory
      }
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

                if (!previous.orderItemUpdated.find((post) => post.id === newPost.id)) {
                    return Object.assign({}, previous, {orderItemUpdated: [newPost, ...previous.orderItemUpdated]});
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
            } else if (this.props.data.orderItemUpdated) {
                content = <PostView post={this.props.data.orderItemUpdated} key={this.props.data.orderItemUpdated.id}/>
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
