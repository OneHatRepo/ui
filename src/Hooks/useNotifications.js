import { useEffect, useState, } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AppGlobals from '../../AppGlobals';
import { Alert } from 'react-native';
import { BACKGROUND_NOTIFICATION_TASK } from '../../Constants/Tasks';
import moment from 'moment';


// Much of this was adapted from react-native-hook-use-notification found here: https://github.com/dameyerdave/react-native-hook-use-notification#readme

export const askForNotificationPermission = async () => {

	// Get notification permissions
	// (Not sure if I need this code, so it's commented out)
	// const result = await Notifications.requestPermissionsAsync({
	// 	android: {},
	// 	ios: {
	// 		allowAlert: true,
	// 		allowBadge: false,
	// 		allowSound: true,
	// 		allowDisplayInCarPlay: false,
	// 		allowCriticalAlerts: true,
	// 		provideAppNotificationSettings: true,
	// 		allowProvisional: true,
	// 		allowAnnouncements: true,
	// 	},
	// });


	const {
			status: existingStatus
		} = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const {
			status
		} = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		return false;
	}

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			// lightColor: '#FF231F7C',
		});
	}

	return true;
};

export const notify = async (title = 'Notification', body = 'Hello', data = {}, trigger = null, sound = true, vibrate = true) => {
	if (!Array.isArray(trigger)) {
		trigger = [trigger]
	}
	for (let _trigger of trigger) {
		try {
			await Notifications.scheduleNotificationAsync({
				// identifier: title + body + JSON.stringify(data) + JSON.stringify(trigger),
				content: {
					title: title,
					body: body,
					data: data,
					sound: sound,
					vibrate: vibrate,
					// attachments: [
					//     {
					//         // identifier: new Date().getTime().toString(),
					//         url: 'http://www.clipartbest.com/cliparts/ncB/Mrp/ncBMrpy7i.jpg',
					//         // type: 'Image'
					//         // typeHint: 'Image',
					//         hideThumbnail: false,
					//         // thumbnailClipArea: { x: 0, y: 0, width: 10, height: 10 }
					//     }
					// ]
				},
				trigger: _trigger,
			})
		} catch (err) {
			console.log(err)
		}
	}
};

export const getScheduledNotifications = async () => {
	try {
		return Notifications.getAllScheduledNotificationsAsync()
	} catch (err) {
		console.log(err)
	}

};

export const clearScheduledNotifications = async () => {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync()
	} catch (err) {
		console.log(err)
	}
};

export const parseResponse = (notification) => {
	if (notification.notification) {
		notification = notification.notification;
	}
	const body = notification?.request?.content?.body,
		title = notification?.request?.content?.title,
		data = notification?.request?.content?.data;
	return {
		body,
		title,
		data,
	};
};

export const useNotifications = (args) => {

	const {
			onNotificationReceived,
			onNotificationDropped,
			onNotificationResponseReceived,
			onBackgroundNotificationTaskReceived,
			getExpoPushToken,
			options = {
				alert: true,
				sound: true,
				badge: false,
			},
		} = args,
		[askedPermissions, setAskedPermissions] = useState(false);

		// if (onBackgroundNotificationTaskReceived && !TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
		// 	TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, onBackgroundNotificationTaskReceived);
		// 	debugger;
		// 	Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
		// }

	if (Device.isDevice) {

		useEffect(() => {
			
			askForNotificationPermission()
				.then((granted) => {
					if (!granted) {
						Alert.alert('Notifications', 'Notifications are not allowed. This functionality will be disabled until permissions are given.');
						return;
					}

					let responseListener = null,
						responseDroppedListener = null,
						responseReceivedListener = null;
					if (onNotificationReceived) { // For whenever a new notification is received
						responseListener = Notifications.addNotificationReceivedListener((notification) => {
							const response = parseResponse(notification);
							onNotificationReceived(response);
						});
					}
					if (onNotificationDropped) { // For whenever some notifications have been dropped
						responseDroppedListener = Notifications.addNotificationsDroppedListener((notification) => {
							const response = parseResponse(notification);
							onNotificationDropped(response);
						});
					}
					if (onNotificationResponseReceived) { // For whenever user interacts with a notification
						responseReceivedListener = Notifications.addNotificationResponseReceivedListener((notification) => {
							const response = parseResponse(notification);
							onNotificationResponseReceived(response);
						});
					}
					if (getExpoPushToken) {
						Notifications.getExpoPushTokenAsync({
							experienceId: AppGlobals.experienceId,
						}).then((token) => {
							getExpoPushToken(token);
						}).catch((err) => {
							Alert.alert('Debug', err.toString());
							console.log(err);
						});
					}
					
					return () => {
						if (responseListener) {
							Notifications.removeNotificationSubscription(responseListener);
						}
						if (responseDroppedListener) {
							Notifications.removeNotificationSubscription(responseDroppedListener);
						}
						if (responseReceivedListener) {
							Notifications.removeNotificationSubscription(responseReceivedListener);
						}
					};
				}).catch((err) => {
					console.log(err);
				}).finally(() => {
					setAskedPermissions(true);
				});
			
			Notifications.setNotificationHandler({
				handleNotification: async () => ({
					shouldShowAlert: options.alert,
					shouldPlaySound: options.sound,
					shouldSetBadge: options.badge,
				}),
			});
		}, []);
	}

	return [
		notify,
		askedPermissions,
	];
};



// Triggers

export const intervalTrigger = (seconds, repeats = true) => {
	return {
		repeats: repeats,
		seconds: seconds
	}
};

export const dailyTrigger = (hour, minute) => {
	return {
		repeats: true,
		hour: hour,
		minute: minute
	}
};

export const cronTrigger = (cron) => {
	const now = moment().milliseconds(0)

	let triggers = []
	const cron_parts = cron.split(' ')
	if (cron_parts.length === 5) {
		let [__minute, __hour, __dom, __month, __dow] = cron_parts

		const minute = __minute == '*' ? now.minute().toString() : __minute
		const hour = __hour == '*' ? now.hour().toString() : __hour
		const dom = __dom == '*' ? now.date().toString() : __dom
		const month = __month == '*' ? now.month().toString() : __month.split(',').map(m => m - 1).join(',')
		const dow = __dow

		for (let _minute of minute.split(',')) {
			for (let _hour of hour.split(',')) {
				for (let _dom of dom.split(',')) {
					for (let _month of month.split(',')) {
						for (let _dow of dow.split(',')) {
							const runtime = moment(now).minute(_minute).hour(_hour).date(_dom).month(_month)
							triggers.push({
								repeats: true,
								second: 0,
								minute: __minute != '*' ? runtime.minute() : undefined,
								hour: __hour != '*' ? runtime.hour() : undefined,
								day: __dom != '*' ? runtime.date() : undefined,
								month: __month != '*' ? runtime.month() : undefined,
								weekday: __dow != '*' ? Number(_dow) + 1 : undefined
							})
						}
					}
				}
			}
		}
	} else {
		console.log('Error in cron_definition of schedule ' + schedule.description + ' (' + schedule.cron_definition + ')')
	}
	return triggers
};