import React, {Component} from "react";
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';
import PostEditorView from "./PostEditorView";
import {CSSTransitionGroup} from "react-transition-group";
import './PostsListingView.css';
import PostView from "./PostView";

const postsQuery = gql`
  query currentOrder {
    currentOrder {
      id
      subtotal
      status
      productsCount
      itemsCount
      orderBundles {
        company {
          name
        }
        orderItems {
          quantity
          total
          lastInStock
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

// const postsSubscription = gql`
// subscription orderUpdated {
//   orderUpdated {
//     id
//     status
//     orderItems {
//       id
//       lastInStock
//       productVariant {
//         id
//         price
//         inventory
//       }
//     }
//   }
// }
// `;

const postsSubscription = gql`
subscription orderUpdated {
  orderChanged {
    type
    product {
      name
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

                const newPost = subscriptionData.data.orderUpdated;
                if (!previous.orderUpdated.find((post) => post.id === newPost.id)) {
                    return Object.assign({}, previous, {orderUpdated: [newPost, ...previous.orderUpdated]});
                } else {
                    return previous;
                }
            }
        });
    }

    render() {
        let content = (<div>&nbsp;</div>);
        console.log(this.props.data);
        if (this.props.data) {
            if (this.props.data.loading) {
                content = (<div key={'data-loading'}>Data loading! Please wait...</div>);
            } else if (this.props.data.error) {
                content = (<div key={'error'}>An error occurred. {this.props.data.error}</div>);
            } else if (this.props.data.orderUpdated) {
                content = <PostView post={this.props.data.orderUpdated} key={this.props.data.orderUpdated.id}/>
            }
        }

        return (
            <div>
                {/* <h1>Posts</h1> */}
                {/* <PostEditorView/> */}
                <CSSTransitionGroup
                    transitionName="orderUpdated"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    {content}
                </CSSTransitionGroup>

            </div>
        );
    }
}

export default withPostsData(PostsListingView);
