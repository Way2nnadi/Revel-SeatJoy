'use strict';

let rp = require('request-promise');
const config = require("./config.js");

// OPTIONS
function sendSlackMessageOptions(opts) {
  return {
    method: 'POST',
    uri: 'https://slack.com/api/chat.postMessage',
    body: {
      token: config.botToken,
      channel: opts.channel,
      text: opts.text,
      attachments: JSON.stringify(opts.attachments)
    },
    json: true,
    charset: 'utf-8'
  }
}

function inviteUserOptions (opts) {
  return {
    method: 'POST',
    uri: 'https://slack.com/api/groups.invite',
    qs: {
      token: config.token,
      channel: opts.channel,
      user: opts.user
    },
    json: true
  }
}

function createPrivateChannelOptions(name) {
  return {
    method: 'POST',
    uri: 'https://slack.com/api/groups.create',
    qs: {
      token: config.token,
      name: name
    },
    json: true
  };
}

function retrieveOrdersOptions() {
  return {
    method: "GET",
    uri: "https://team7-hackathon.revelup.com/weborders/menu/?establishment=2",
    headers: {
      "API-AUTHENTICATION": config.apiKeySecret, 
    }
  };
}

function submitOrderOptions(data) {
  return {
    method: "POST",
    uri: "https://team7-hackathon.revelup.com/specialresources/cart/submit/",
    headers: {
      "API-AUTHENTICATION": config.apiKeySecret, 
    },
    body: {
      skin: "weborder",
      establishmentId: 2,
      items: [],
      orderInfo: {},
      paymentInfo: {}
    },
    json: true
  };
}

// RESTFUL FUNCTIONS
function retrieveOrders() {
  return rp(retrieveOrdersOptions());
}

function submitOrders(data) {
  return rp(submitOrderOptions(data));
}

function createPrivateChannel(name) {
  return rp(createPrivateChannelOptions(name))
}

function inviteUser(opts) {
  return rp(inviteUserOptions(opts));
}

function sendSlackMessage(opts) {
  return rp(sendSlackMessageOptions(opts));
}

// HELPER FUNCTIONS
function parserData(data) {
  return {};
}

module.exports = { 
  retrieveOrders: retrieveOrders,
  submitOrders: submitOrders,
  parserData: parserData,
  createPrivateChannel: createPrivateChannel,
  inviteUser: inviteUser,
  sendSlackMessage: sendSlackMessage
}