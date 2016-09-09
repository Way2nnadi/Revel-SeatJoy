'use strict';

let express = require('express');
let server = express();     
let bodyParser = require('body-parser');
let path = require('path');
let utils = require('./utils.js');
let shellDb = require('./db.js');
let config = require('./config.js');
let attachments = require('./attachments.js');
let cors = require('express-cors')

// MIDDLEWARE
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(cors({
    allowedOrigins: [
        'localhost'
    ]
}))

// HOMEPAGE MIDDLEWARE
server.use('/', express.static(__dirname + '/public'));

// ROUTES
server.get('/retrieve/order', (req, res) => {
  utils.retrieveOrders()
  .then((data) => {
    // console.log(data);
    // parse data and send to the bot
    // res.send(utils.parseData(data));
    res.send('ok');
  })
  .catch((err) => {
    console.log(err);
  });
})

server.post('/create/order', (req, res) => {

  /**
  {
    first_name: "",
    last_name: "",
    orders: [], \\ example item in orders => {details: ""}
    phone_number: ""
  }
  **/
  // let body = req.body;
  let body = {
    first_name: 'uche',
    last_name: 'nnadi',
    orders: [{details: "Diet Coke 1x"}],
    phone_number: '1-805-637-1990'
  }
  let date = new Date();
  let attendant = shellDb.attendants[0];

  let customerOpts = {
    first_name: body.first_name,
    last_name: body.last_name,
    channel_name: `${body.first_name.slice(0,4)} ${body.last_name.slice(0,4)}_${date.getTime()}`,
    orders: body.orders || [],
    phone_number: body.phone_number || "1-888-888-8888",
  };

  // create slack channel
  utils.createPrivateChannel(customerOpts.channel_name)
  .then((slack) => {
    let botOpts = {
      channel: slack.group.id,
      user: config.botId
    }

    // invite bot
    return utils.inviteUser(botOpts);
  })
  .then((bot) => {
    // send slack channel order payload
    let orderOpts = {
      channel: bot.group.id,
      text: "Order Details",
      attachments: `${attachments.orderPayload(customerOpts)}`
    };
    utils.sendSlackMessage(orderOpts)
    .then((data) => {
      console.log(data);
      let buttonOpts = {
        channel: bot.group.id,
        text: "Order Status",
        attachments: `${attachments.buttonPayload}`
      };
      utils.sendSlackMessage(buttonOpts);
    })
  })
  .then(() => {

    // update db with customer data
    attendant.customers_serviced.push(customerOpts);
    res.send('ok');
  })
  .catch((err) => {
    console.log(err);
  })
})

server.listen(3000, () => {
  console.log('Listening on Port: 3000');
})

module.exports = server;