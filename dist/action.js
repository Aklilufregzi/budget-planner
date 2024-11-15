"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const actionSchema = new mongoose_1.default.Schema({
    type: String,
    reason: String,
    amount: String,
    description: String,
    telegramId: Number,
}, {
    timestamps: true
});
exports.Action = mongoose_1.default.model("Action", actionSchema);
