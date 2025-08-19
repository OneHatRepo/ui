import qs from 'qs';

const downloadInBackground = async (url, data, authHeaders = {}) => {
	try {
		// Use fetch to make the request with headers
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				...authHeaders,
			},
			body: qs.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get the blob from the response
		const blob = await response.blob();
		
		// Create a download link
		const downloadUrl = window.URL.createObjectURL(blob);
		const a = document.createElement('A');
		a.href = downloadUrl;
		
		// Try to get filename from response headers
		const contentDisposition = response.headers.get('Content-Disposition');
		let filename = 'download';
		if (contentDisposition) {
			const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
			if (matches != null && matches[1]) {
				filename = matches[1].replace(/['"]/g, '');
			}
		}
		
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		
		// Clean up the object URL
		window.URL.revokeObjectURL(downloadUrl);
		
	} catch (error) {
		console.error('Download failed:', error);
		throw error;
	}
};

export default downloadInBackground;