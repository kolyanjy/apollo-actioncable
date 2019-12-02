import React, {Component} from "react";
import PropTypes from "prop-types";
import CommentsListingView from "./CommentsListingView";
import './PostView.css';

class PostView extends Component {
    render() {
        const {post} = this.props;

        return (
            <div className="card-holder" key={post.id}>
                <div className="card">
                    <div className="card-header">
                        <h4>{JSON.stringify(post)}</h4>
                    </div>
                </div>
            </div>
        );
    }
}

PostView.propTypes = {
    post: PropTypes.object.isRequired
};

export default PostView;
