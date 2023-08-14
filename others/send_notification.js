const Notification = require('../models/notification');
const admin = require('./firebase');

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
const sendNotification = async ({ token, titleAr, bodyAr, titleEn, bodyEn, userId, resId, orderId }) => {
    try {
        const n = await Notification.create({ reservationId: resId, userId, titleAr, bodyAr, titleEn, bodyEn, orderId: orderId });
        const message_notification = {
            notification: {
                title: titleAr,
                body: bodyAr
            }
        };
        if (token) {
            await admin.messaging().sendToDevice(token, message_notification, notification_options);
        }
    } catch(error){
        console.log(e);
    }
}


module.exports = sendNotification;