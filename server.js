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
        'https://40394d7a.ngrok.io',
        'https://40394d7a.ngrok.io/retrieve/order'
    ]
}))

// HOMEPAGE MIDDLEWARE
server.use('/', express.static(__dirname + '/public'));

// ROUTES
server.get('/retrieve/order', (req, res) => {
  utils.retrieveOrders()
  .then((data) => {
    // parse data and send to the bot
    // res.send(utils.parseData(data));
    //res.send('ok');
    res.send({
      fuel: "$2.87",
      snack: "$1",
      data: data
    });
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
    orders: [], \\ example item in orders => {details: "", transactionId: ""}
    phone_number: ""
  }
  **/
  // let body = req.body;
  let body = {
    first_name: 'Uche',
    last_name: 'Nnadi',
    orders: [{details: "Diet Coke 1x"}],
    phone_number: '1-805-637-1990'
  }
  let date = new Date();
  // let attendant = shellDb.attendants[0];

  let customer = {
    first_name: body.first_name,
    last_name: body.last_name,
    channel_name: `${body.first_name.slice(0,4)} ${body.last_name.slice(0,4)}_${date.getTime()}`,
    orders: body.orders || [{detail: 'Diet Coke x1', transactionId: "XXXXXXXX"}],
    phone_number: body.phone_number || "1-888-888-8888",
  };

  // create slack channel
  utils.createPrivateChannel(customer.channel_name)
  .then((slack) => {
    customer.channel_id = slack.group.id
    customer.text = "Customer Details"
    // send data to slackbot
    utils.sendDataToSlackBot(customer)
    .then((data) => {
      // invite bot
      utils.inviteUser({
        channel: slack.group.id,
        user: config.botId
      });
    });
  })
  .then(() => {

    // update db with customer data
    // attendant.customers_serviced.push(customer);
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
