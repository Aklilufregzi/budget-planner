"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositWizard = void 0;
const telegraf_1 = require("telegraf");
const action_1 = require("./action");
const user_model_1 = require("./user.model");
const amount = new telegraf_1.Composer();
const reason = new telegraf_1.Composer();
const description = new telegraf_1.Composer();
amount.on('text', (ctx) => {
    ctx.scene.session.state.amount = parseFloat(ctx.message.text);
    ctx.reply("Please enter the reason");
    ctx.wizard.next();
});
reason.on("text", (ctx) => {
    ctx.scene.session.state.reason = ctx.message.text;
    ctx.reply("Please enter the description");
    ctx.wizard.next();
});
description.on("text", (ctx) => {
    const { amount, description, reason, type } = ctx.scene.session.state;
    ctx.scene.session.state.description = ctx.message.text;
    ctx.reply(ctx.scene.session.state.description);
    try {
        action_1.Action.create({
            type: type,
            telegramId: ctx.chat.id,
            amount: amount,
            reason: reason,
            description: description
        }).then(res => {
            ctx.reply(type + " successful");
            if (type == "deposit") {
                user_model_1.User.findOneAndUpdate({ telegramId: ctx.chat.id }, { $inc: { balance: amount } }).then(res => {
                    ctx.scene.leave();
                });
            }
            else {
                user_model_1.User.findOneAndUpdate({ telegramId: ctx.chat.id }, { $inc: { balance: -amount } }).then(res => {
                    ctx.scene.leave();
                });
            }
        });
    }
    catch (er) {
        console.log(er);
    }
});
exports.depositWizard = new telegraf_1.Scenes.WizardScene("action-scene", amount, reason, description);
exports.depositWizard.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply("Enter the amount you want to " + ctx.scene.session.state.type);
}));
