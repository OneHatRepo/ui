const downloadWithFetch = (url, options = {}, win = null) => {
	let obj = {};
	fetch(url, options)
		.then( res => res.blob() )
		.then( blob => {
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
			// link.download = true;
			link.target = "_blank";
			link.click();


			// win.URL.revokeObjectURL(file);

			// const newWin = win.open(file);
			// win.location.assign(file);
			// setTimeout(() => {
			//	win.close();
			// }, 2000);

		});
	return obj;
};
export default downloadWithFetch;