const Notification = require('../models/notification');
const admin = require('./firebase');

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
const sendNotification = async ({token, title, body, userId, resId, orderId}) => {
    const n = await Notification.create({ reservationId: resId, userId, title, body, orderId: orderId});
    const message_notification = {
        notification: {
            title: title,
            body: body
        }
    };
    await admin.messaging().sendToDevice(token, message_notification, notification_options);
}


module.exports = sendNotification;