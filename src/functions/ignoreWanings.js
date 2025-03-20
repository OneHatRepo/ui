import { LogBox } from "react-native";

if (__DEV__) {
	const ignoreWarns = [
		'In React 18, SSRProvider', // NativeBase
		"\"textAlignVertical\" style is deprecated. Use \"verticalAlign\".", // NativeBase
		"\"transform\" style array value is deprecated.", // NativeBase
		'props.pointerEvents is deprecated.', // NativeBase
		'accessibilityLabel is deprecated.', // NativeBase
		'accessibilityRole is deprecated.', // NativeBase
		'focusable is deprecated.', // NativeBase
		'editable is deprecated.', // NativeBase
		'"shadow*" style props are deprecated.', // NativeBase
		'BackHandler is not supported on web',
		'A non-serializable value was detected in an action', // e.g. from Redux, especially for user entity being stored.
		'A non-serializable value was detected in the state',
		'Animated: `useNativeDriver` is not supported', // 
		'ignoreWanings.js:28 nativeID is deprecated.',
		'Constants.manifest has been deprecated',
		'StyleSheet.compose', // Slider
	];

	const warn = console.warn;
	console.warn = (...arg) => {
		let ignoreWarn;
		for (ignoreWarn of ignoreWarns) {
			if (arg[0].startsWith(ignoreWarn)) {
				return;
			}
		}
		warn(...arg);
	};

	const error = console.error;
	console.error = (...arg) => {
		let ignoreWarn;
		for (ignoreWarn of ignoreWarns) {
			if (arg[0].startsWith(ignoreWarn)) {
				return;
			}
		}
		error(...arg);
	};

	LogBox.ignoreLogs(ignoreWarns);
}