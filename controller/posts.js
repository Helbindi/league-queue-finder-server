import express from "express";
import mongoose from "mongoose";

import PostMessage from "../models/postMessage.js";

const router = express.Router();

// CRUD - Create, Read, Update, Delete
export const createPost = async (req, res) => {
    const post = req.body;

    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });

    try {
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({ message: error });
    }
};

export const getPost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error });
    }
};

export const getPosts = async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT;
    
        const total = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error});
    }
};

export const getPostsBySearch = async (req, res) => {
    const { page, searchQuery, tags } = req.query;

    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT;
        const mode = new RegExp(searchQuery, "i");

        const total = await PostMessage.countDocuments({ $or: [ { mode }, { tags: { $in: tags.split(',') } } ]});
        const posts = await PostMessage.find({ $or: [ { mode }, { tags: { $in: tags.split(',') } } ]}).sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error });
    }
}

export const getPostsByUser = async (req, res) => {
    const { id } = req.query;

    try {
        const posts = await PostMessage.find({creator: id}).sort({ _id: -1 });

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { username, creator, title, message, tags, likes } = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`Post with id: ${id} does not exist...`);

    const updatePost = { username, creator, title, message, tags, likes, _id: id};

    await PostMessage.findByIdAndUpdate(id, updatePost, { new: true });

    res.json(updatePost);
};

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`Post with id: ${id} does not exist...`);

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully..." });
};

export const likePost = async (req, res) => {
    const { id } = req.params;

    if(!req.userId) {
        return res.json({ message: "Unauthenticated" });
    }

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`Post with id: ${id} does not exist...`);

    const post = await PostMessage.findById(id);

    // check if user has already liked this post.
    const index = post.likes.findIndex((id) => id === String(req.userId));

    if(index === -1) {
        // add userID to list of Likes
        post.likes.push(req.userId);
    } else {
        // remove userID from list of Likes
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updateLike = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updateLike);
};

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    if(!req.userId) {
        return res.json({ message: "Unauthenticated" });
    }

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`Post with id: ${id} does not exist...`);

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatePost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatePost);
};

export default router;