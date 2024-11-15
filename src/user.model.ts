import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        unique: true,
        required: [true, "Telegram id is required "]
    },
    username: String,
    balance: {
        type: Number,
        default: 0
    },
    
}, {
    timestamps: true
})

export const User = mongoose.model("User", userSchema)