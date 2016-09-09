'use strict';
 
let Botkit = require('botkit');
let utils = require('./utils.js');
let server = require('./server.js');
let Promise = require('bluebird');
const config = require("./config.js");
const attachments = require('./attachments.js');

console.log(attachments.buttonPayload)

let channelStore = {};

let slackbot = Botkit.slackbot({
  interactive_replies: true
});

// Configure slackbot
slackbot.configureSlackApp({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
  scopes: ['bot'],
});

let bot = slackbot.spawn({});
let _bots = {};
let spawnbot;

function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

slackbot
.createWebhookEndpoints(server)
.createOauthEndpoints(server, (err,req,res) => { 
  if (err) return res.status(500).send('Error:' + err);
  res.send('Success!');
 });

slackbot.on('create_bot', (bot,config) => {
  spawnbot = bot;
  if (_bots[bot.config.token]) {
    // already online! do nothing.
    // create loyalty logic
  } else {
    bot.startRTM((err) => {
      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy}, (err,convo) => {
        if (err) {
          console.log(err);
        } else {
          convo.say('Runner Bot is ONLINE!!!');
        }
      });

    });
  }

});

slackbot.on('rtm_open', (bot) => {
  console.log('** The RTM api just connected!');
});

slackbot.on('bot_group_join', (bot, message) => {
  Promise.promisifyAll(bot);
  Promise.promisifyAll(spawnbot);

  let customer = channelStore[message.channel];
  console.log(customer)
  // send slack channel order payload
  let orderMessage = {
    text: "Order Details - Diet Coke x1",
    attachments: `${attachments.orderPayload(customer)}`
  };

  spawnbot.replyAsync(message, attachments.orderPayload(customer))
  .then(() => {
    let buttonMessage = {
      text: "Order Status - Fulfill   Cancel",
      attachments: attachments.buttonPayload
    };
    bot.reply(message, attachments.buttonPayload);
  })
})

slackbot.on('interactive_message_callback', (bot,message) => {
  let status = message.actions[0].name;

  if(status === "fulfill") {

    // update revel db
    utils.submitOrders({

    })
  }
  bot.replyInteractive(message, attachments[status]);
});

slackbot.on('slash_command', (bot, message) => {
  if (message.command === '/post_msg') {
    channelStore[message.channel] = message.customer;
    console.log(channelStore[message.channel])
  }
   bot.res.send('');
});
