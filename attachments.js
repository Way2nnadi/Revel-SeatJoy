'use strict';

module.exports = {
  orderPayload: (opts) => {
    let payload = {
      "text": "Order Details",
      "attachments": [
        {
          "text": `First Name: ${opts.first_name}, Last Name: ${opts.last_name}, Phone Number: ${opts.phone_number}`,
          "fallback": "message was not sent",
          "callback_id": "seat_address",
          "color": "#b56969"
        }
      ]
    }

    opts.orders.forEach((order) => {
      payload.attachments.push({
        "text": `${order.details}`,
        "fallback": "message was not sent",
        "callback_id": "order_details",
        "color": "#e6cf8b"
      });
    })

    return payload;
  },
  buttonPayload: {
    "text": "Order Status",
    "attachments": [
        {
            "text": "Choose order status",
            "fallback": "You are unable to choose status",
            "callback_id": "order_status",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "fulfill",
                    "text": "Fulfill",
                    "type": "button",
                    "value": "fulfill"
                },
                {
                    "name": "cancel",
                    "text": "Cancel",
                    "style": "danger",
                    "type": "button",
                    "value": "cancel",
                    "confirm": {
                        "title": "Confirm Cancel",
                        "text": "Are you sure you want to cancel?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        }
    ]
  },
  fulfill: "Thank you, the order has been fulfilled",
  cancel: "Order has been canceled"
}