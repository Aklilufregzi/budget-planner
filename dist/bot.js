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
const dotenv_1 = require("dotenv");
const telegraf_1 = require("telegraf");
const mainMenu_1 = require("./mainMenu");
const db_1 = require("./db");
const user_model_1 = require("./user.model");
const action_scene_1 = require("./action.scene");
const action_1 = require("./action");
(0, dotenv_1.config)();
const stage = new telegraf_1.Scenes.Stage([action_scene_1.depositWizard]);
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
bot.use((0, telegraf_1.session)());
bot.use(stage.middleware());
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let firstName = ctx.message.from.username;
    try {
        let user = yield user_model_1.User.findOne({ telegramId: ctx.chat.id });
        if (user) {
            ctx.reply(`${firstName}, welcome back to the budget tracker bot!`, mainMenu_1.mainMenu.reply());
        }
        else {
            ctx.reply(`${firstName}, welcome to the budget tracker bot!`, mainMenu_1.mainMenu.reply());
            user_model_1.User.create({
                telegramId: ctx.chat.id,
                username: ctx.message.from.username,
            });
        }
    }
    catch (err) {
        ctx.reply("an error occured " + err.message);
    }
}));
bot.hears("💰 View Balance", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.User.findOne({ telegramId: ctx.chat.id });
    if (user) {
        ctx.reply(`Your balance is ${user.balance} ETB`);
    }
    else {
        ctx.reply("You have no balance. creating you a wallet now");
    }
}));
bot.command('report', (ctx) => {
    ctx.reply("Generating the report");
});
bot.hears("💸 Deposit", (ctx) => {
    ctx.scene.enter('action-scene', {
        type: 'deposit'
    });
});
bot.hears("🤑 Cash Out", (ctx) => {
    ctx.scene.enter("action-scene", {
        type: "cash-out",
    });
});
bot.hears("🗎 Report", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let telegramId = ctx.chat.id;
    let user = yield user_model_1.User.findOne({ telegramId });
    if (!user)
        return;
    ctx.reply("Generating the report");
    let actions = yield action_1.Action.find({
        telegramId,
    }).sort({
        createdAt: -1
    });
    let message = "";
    message += `<strong>Balance: ${user.balance.toFixed(2)} </strong>\n`;
    message += `==========Report=============\n`;
    actions.forEach((action) => {
        let date = new Date(action.createdAt).toDateString();
        let sign = action.type === "deposit" ? "💵" : "⛔";
        message += `<strong>Date: ${date}</strong>\n<strong>Amount: </strong>${sign} ${action.amount}\n<strong>Reason: </strong>${action.reason}\n<strong>Description: </strong>${action.description}\n\n`;
    });
    ctx.reply(message, {
        parse_mode: "HTML",
    });
}));
bot.launch(() => {
    console.log("Bot is running");
    (0, db_1.connectDB)().then(() => {
        console.log("MONGODB connected");
    });
});
