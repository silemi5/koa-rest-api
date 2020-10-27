import mongoose from 'mongoose';
const { Schema } = mongoose;

export const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    select: true
  },
  password: {
    type: String,
    select: false
  },
})
