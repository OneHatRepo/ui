const downloadWithFetch = (url, options = {}) => {
	let obj = {};
	fetch(url, options)
		.then( res => res.blob() )
		.then( blob => {
			const
				winName = 'ReportWindow',
				opts = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1',
				win = window.open('', winName, opts),
				file = win.URL.createObjectURL(blob);
			obj.window = win;
			win.location.assign(file);
		});
	return obj;
};
export default downloadWithFetch;