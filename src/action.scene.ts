import { Composer, Scenes } from "telegraf";
import { Action } from "./action";
import { User } from "./user.model";

const amount = new Composer<Scenes.WizardContext>();

const reason = new Composer()

const description = new Composer()


amount.on('text', (ctx: any)=>{
    ctx.scene.session.state.amount = parseFloat(ctx.message.text);
    ctx.reply("Please enter the reason")
    ctx.wizard.next()
})

reason.on("text", (ctx: any) => {
  ctx.scene.session.state.reason = ctx.message.text
  ctx.reply("Please enter the description");
  ctx.wizard.next();
});

description.on("text", (ctx: any) => {
  const {amount, description, reason, type } = ctx.scene.session.state
  ctx.scene.session.state.description = ctx.message.text
  ctx.reply(ctx.scene.session.state.description);
  try{
    Action.create({
        type: type,
        telegramId: ctx.chat.id,
        amount: amount, 
        reason: reason,
        description: description
    }).then(res=>{

        ctx.reply(type + " successful")
        if(type == "deposit"){
            User.findOneAndUpdate({telegramId: ctx.chat.id}, {$inc: {balance: amount}}).then(res=>{
                ctx.scene.leave()
            })
        }

        else{
          User.findOneAndUpdate({telegramId: ctx.chat.id}, {$inc: {balance: -amount}}).then(res=>{
            ctx.scene.leave()
          })
        }
    })
  }
  catch(er){
        console.log(er)
  }
  
});

export const depositWizard = new Scenes.WizardScene("action-scene", amount, reason, description);


depositWizard.enter(async(ctx: any)=>{
    ctx.reply("Enter the amount you want to " + ctx.scene.session.state.type)
})