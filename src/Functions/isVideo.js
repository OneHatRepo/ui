export default function isVideo(mimetype) {
	switch(mimetype) {
		case 'video/quicktime':
		case 'video/mp4':
		case 'video/mpeg':
		case 'video/ogg':
		case 'video/webm':
		case 'video/mp2t':
		case 'video/3gpp':
		case 'video/3gpp2':
		case 'video/x-msvideo':
		case 'video/x-ms-wmv':
		case 'video/x-flv':
		case 'application/x-mpegURL':
			return true;
	}
	return false;
}
