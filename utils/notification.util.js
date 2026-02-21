const notify = require('../model/user/notification')

const sendNotification = async (userId, message, status) => {
  try {
    const current = new Date()
    let notificationDoc = await notify.findOne({ UserId: userId })

    if (notificationDoc) {
      notificationDoc.notification.push({ message, status, createdAt: current })
      await notificationDoc.save()
      return
    }

    notificationDoc = new notify({
      UserId: userId,
      notification: [{ message, status, createdAt: current }],
    })
    await notificationDoc.save()
  } catch (error) {
    console.error('Error sending notification:', error.message)
  }
}

module.exports = {
  sendNotification,
}
