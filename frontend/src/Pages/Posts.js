import { divIcon } from "leaflet";
import React from "react";
import {Link} from "react-router";

const postsArr=[
    `{"title":"First Post",
    "author":"Alice",
    "description":"This is the first post."
    }`,
    `{
    "title":"Second Post",
    "author":"Bob",
    "description":"This is the second post."
    }`,
    `{
    "title":"Third Post",
    "author":"Charlie",
    "description":"This is the third post."
    }`
];

const Posts = () => {
    return(
        <div>   
        <Link to ="/" >Home</Link>
        <Link to="/posts">Posts</Link>
,

        
        </div>
    )
}
export default Posts;


