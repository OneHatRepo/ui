const downloadWithFetch = (url, options = {}, win = null) => {
	let obj = {};
	fetch(url, options)
		.then( res => res.blob() )
		.then( blob => {
			if (!win) {
				const
					winName = 'Download',
					opts = 'location=0,menubar=0,scrollbars=0';
				win = window.open('', winName, opts);
			}

			const file = win.URL.createObjectURL(blob);
			obj.window = win;
			win.location.assign(file);
		});
	return obj;
};
export default downloadWithFetch;