const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
const sendNotification = async (token, title, body, userId, resId, orderId) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    const message_notification = {
        notification: {
            title: title,
            body: body
        }
    };
    admin.messaging().sendToDevice(token, message_notification, notification_options);
}