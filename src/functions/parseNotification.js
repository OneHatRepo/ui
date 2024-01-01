export default function parseNotification(notification) {
	if (notification.notification) {
		notification = notification.notification;
	}
	const
		body = notification?.request?.content?.body,
		title = notification?.request?.content?.title,
		data = notification?.request?.content?.data;
	return {
		body,
		title,
		data,
	};
};