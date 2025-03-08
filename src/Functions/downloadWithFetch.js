const downloadWithFetch = (url, options = {}, win = null) => {
	let obj = {};
	fetch(url, options)
		.then((res) => {
			const contentDisposition = res.headers.get('Content-Disposition');
			let filename = 'download';
			if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
				const matches = /filename="([^"]*)"/.exec(contentDisposition);
				if (matches != null && matches[1]) { 
					filename = matches[1];
				}
			}
			return res.blob().then((blob) => ({ blob, filename }));
		})
		.then(({ blob, filename }) => {
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

		});
	return obj;
};
export default downloadWithFetch;