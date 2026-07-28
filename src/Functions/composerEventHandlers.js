export default function composeEventHandlers(primaryHandler, secondaryHandler) {
	if (!primaryHandler) {
		return secondaryHandler;
	}
	if (!secondaryHandler) {
		return primaryHandler;
	}
	return async (...args) => {
		await primaryHandler(...args);
		return secondaryHandler(...args);
	};
}