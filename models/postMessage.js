import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    username: String,
    creator: String,
    mode: String,
    tags: [String],
    likes: { 
        type: [String], 
        default: [] },
    comments: { 
        type: [String], 
        default: [] },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    // "__v" is a version key. Default 0.
})

var PostMessage = mongoose.model('Posts', postSchema);

export default PostMessage;