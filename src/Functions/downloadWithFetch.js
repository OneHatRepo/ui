import getErrorMessageFromResponse from './getErrorMessageFromResponse.js';

const downloadWithFetch = async (url, options = {}, win = null) => {
	const res = await fetch(url, options);

	if (!res.ok) {
		const errorMessage = await getErrorMessageFromResponse(res);
		throw new Error(errorMessage || `HTTP error! status: ${res.status}`);
	}

	const contentDisposition = res.headers.get('Content-Disposition');
	let filename = 'download';
	if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
		const matches = /filename="([^"]*)"/.exec(contentDisposition);
		if (matches != null && matches[1]) {
			filename = matches[1];
		}
	}

	const blob = await res.blob();

	// if (!win) {
	// 	const
	// 		winName = 'Download',
	// 		opts = 'location=0,menubar=0,scrollbars=0';
	// 	win = window.open('about:blank', winName, opts);
	// }

	// const file = win.URL.createObjectURL(blob);
	// obj.window = win;
	const file = URL.createObjectURL(blob);

	// const link = win.document.createElement('a');
	const link = document.createElement('a');
	link.href = file;
	link.download = filename; // Set the filename from the Content-Disposition header
	link.target = "_blank";
	link.click();

	// win.URL.revokeObjectURL(file); // if you revoke it, the PDF viewer will not be able to download the PDF.

	// const newWin = win.open(file);
	// win.location.assign(file);
	// setTimeout(() => {
	//	win.close();
	// }, 2000);

	return { window: win };
};
export default downloadWithFetch;