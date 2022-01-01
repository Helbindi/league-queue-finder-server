import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";
import mongoose from "mongoose";

import UserModal from "../models/user.js";

const router = express.Router();
const secret = 'test';

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await UserModal.findOne({ email });

        if(!existingUser) return res.status(404).json({ message: "User does not exist..." });

        const isValid = await bcrypt.compare(password, existingUser.password);

        if(!isValid) return res.status(404).json({ message: "Invalid credentials! Try again..." });

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: '1h'});

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong..." });
        console.log(error);
    }
}

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const existingUser = await UserModal.findOne({ email });
        
        if(existingUser) return res.status(400).json({ message: `User with ${email} already exists...` });

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await UserModal.create({  username, email, password: hashedPassword});

        const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h"});

        res.status(201).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await UserModal.find();
        
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ messege: error });
    }
}

export const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await UserModal.findById(id);

        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error });
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, message } = req.body;
    var isExist = false;

    // check if username or email is already used...
    const users = await UserModal.find();

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`User with id: ${id} does not exist...`);
    
    {users.map((user) => {
        if(user._id.toString() !== id) {
            // if username or email already exists.
            if(user.username.toLowerCase() === username.toLowerCase()) {
                isExist = true;
                return;
            }
            if(user.email.toLowerCase() === email.toLowerCase()) {
                isExist = true;
                return;
            }
        }
    })}

    if(isExist) {
        res.status(404).json({ message: `User with requested values already exist...` });
    } else {
        // username or email is not in use, update User.
        const updateUser = { username, email, message, _id: id };
    
        await UserModal.findByIdAndUpdate(id, updateUser, { new: true });
    
        res.json(updateUser);
    }


};