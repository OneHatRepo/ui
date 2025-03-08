import * as ImageManipulator from 'expo-image-manipulator';

export default async function processImage(uri, width = 1000) {
	const file = await ImageManipulator.manipulateAsync(uri,
		[{
			resize: {
				width,
			}
		}],
		{
			compress: 0.3,
			format: ImageManipulator.SaveFormat.JPEG,
			base64: true,
		});
	return file;
}