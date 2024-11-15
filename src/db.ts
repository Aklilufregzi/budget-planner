import mongoose from "mongoose";

export async function connectDB(){
   return mongoose.connect(process.env.MONGO_URI as string)
}