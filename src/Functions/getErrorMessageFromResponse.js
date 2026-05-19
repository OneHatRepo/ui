const getErrorMessageFromResponse = async (response) => {
	const contentType = response.headers.get('Content-Type') || '';

	if (contentType.includes('application/json')) {
		const errorData = await response.json().catch(() => null);
		if (typeof errorData === 'string' && errorData.trim()) {
			return errorData;
		}
		if (errorData?.message) {
			return errorData.message;
		}
		if (errorData?.error) {
			return errorData.error;
		}
	}

	const text = await response.text().catch(() => '');
	return text?.trim() || null;
};

export default getErrorMessageFromResponse;
