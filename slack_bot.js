'use strict';
 
let Botkit = require('botkit');
let utils = require('./utils.js');
let server = require('./server.js');
const config = require("./config.js");
const attachments = require('./attachments.js');

let slackbot = Botkit.slackbot({
  interactive_replies: true
});

// Configure slackbot
slackbot.configureSlackApp({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri,
  scopes: ['chat:write:bot', 'bot'],
});

let bot = slackbot.spawn({});
let _bots = {};

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
  console.log(bot)
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
  // console.log(bot + '----------bot---------')
})

slackbot.on('interactive_message_callback', (bot,message) => {
  let status = message.actions[0].name;

  if(status === "fulfill") {
    // update revel db
  }
  bot.replyInteractive(message, attachments[status]);
});