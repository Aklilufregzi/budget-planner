import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
    type: String,
    reason: String,
    amount: String,
    description: String,
    telegramId: Number,

}, {
    timestamps: true
})

export const Action = mongoose.model("Action", actionSchema)