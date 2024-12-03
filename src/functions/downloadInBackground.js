import qs from 'qs';

const downloadInBackground = (url, data) => {
	const a = document.createElement('A');
	a.href = url + '?' + qs.stringify(data);
	a.download = true;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};
export default downloadInBackground;