import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  message: {
    type: String,
    default: 'Hope to see you on the Rift soon!'},
});

var User = mongoose.model('User', userSchema);

export default User;