import mongoose from 'mongoose';
const { Schema } = mongoose;

export const userSchema = new Schema({
  name: String,
  email: String,
  password: {
    type: String,
    select: false
  },
})
