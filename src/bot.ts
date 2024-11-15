import { config } from "dotenv";
import { Scenes, session, Telegraf } from "telegraf";
import { mainMenu } from "./mainMenu";
import { connectDB } from "./db";
import { User } from "./user.model";
import { depositWizard } from "./action.scene";
import { Action } from "./action";
config()

const stage = new Scenes.Stage<Scenes.WizardContext>([depositWizard]);

const bot = new Telegraf<Scenes.WizardContext>(process.env.BOT_TOKEN as string);
bot.use(session());
bot.use(stage.middleware());
bot.start(async(ctx)=>{
    let firstName = ctx.message.from.username;

    try{
        let user = await User.findOne({telegramId: ctx.chat.id})
        if(user){
    ctx.reply(
      `${firstName}, welcome back to the budget tracker bot!`,
      mainMenu.reply()
    );

        }

        else {
             ctx.reply(
               `${firstName}, welcome to the budget tracker bot!`,
               mainMenu.reply()
             );
            User.create({
                telegramId: ctx.chat.id,
                username: ctx.message.from.username, 
                
            })
        }
    }
    catch(err: any){ 
        ctx.reply("an error occured " + err.message)
    }


})

bot.hears("💰 View Balance", async(ctx)=>{
    let user = await User.findOne({telegramId: ctx.chat.id})
    if(user){
        ctx.reply(`Your balance is ${user.balance} ETB`)
    }

    else{
        ctx.reply("You have no balance. creating you a wallet now")
    }
});

bot.command('report', (ctx)=>{
    ctx.reply("Generating the report")
})

bot.hears("💸 Deposit", (ctx)=>{
    ctx.scene.enter('action-scene', {
        type: 'deposit'
    })
});

bot.hears("🤑 Cash Out", (ctx) => {
  ctx.scene.enter("action-scene", {
    type: "cash-out",
  });
});

bot.hears("🗎 Report", async(ctx)=>{
    let telegramId = ctx.chat.id;
    let user = await User.findOne({telegramId})
  
        if(!user) return;
        ctx.reply("Generating the report");

        let actions = await Action.find({
          telegramId,
        } ).sort({
          createdAt: -1
        })
        let message =""
        message += `<strong>Balance: ${user.balance.toFixed(2)} </strong>\n`;

         message += `==========Report=============\n`;


        actions.forEach((action: any) => {
          let date = new Date(action.createdAt).toDateString();
          let sign = action.type === "deposit" ? "💵" : "⛔";
          message += `<strong>Date: ${date}</strong>\n<strong>Amount: </strong>${sign} ${action.amount}\n<strong>Reason: </strong>${action.reason}\n<strong>Description: </strong>${action.description}\n\n`;
        });

        ctx.reply(message, {
          parse_mode: "HTML",
        });
    

});


bot.launch(()=>{
    console.log("Bot is running")
    connectDB().then(()=>{
        console.log("MONGODB connected")
    })
})

