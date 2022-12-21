import * as ImageManipulator from 'expo-image-manipulator';

export default async function processImage(uri) {
	const file = await ImageManipulator.manipulateAsync(uri,
		[{
			resize: {
				width: 1000
			}
		}],
		{
			compress: 0.3,
			format: ImageManipulator.SaveFormat.JPEG,
			base64: true,
		});
	return file;
}