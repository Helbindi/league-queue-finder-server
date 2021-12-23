import express from "express";
const router = express.Router();

import { signin, signup, getUsers, getUser, updateUser } from "../controller/user.js";
import auth from "../middleware/auth.js";

router.post('/signin', signin);
router.post('/signup', signup);

router.get('/all', getUsers);
router.get('/:id', getUser);
router.patch('/:id', auth, updateUser);

export default router;