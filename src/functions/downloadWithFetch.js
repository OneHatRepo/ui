const downloadWithFetch = (url, options = {}) => {
	fetch(url, options)
		.then( res => res.blob() )
		.then( blob => {
			const
				winName = 'ReportWindow',
				opts = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1',
				externalWindow = window.open('', winName, opts),
				file = externalWindow.URL.createObjectURL(blob);
			externalWindow.location.assign(file);
		});
};
export default downloadWithFetch;