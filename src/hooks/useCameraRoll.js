import { useCallback, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
// import { CameraRoll } from 'react-native';
// import CameraRoll from '@react-native-community/cameraroll';

// This is taken from https://dev.to/atalkwithdev/resolving-expo-multi-select-photos-with-react-hooks-487k
export default function useCameraRoll({
	first = 40,
	assetType = 'Photos',
	groupTypes = 'All',
}) {
	const [photos, setPhotos] = useState([]),
		[after, setAfter] = useState(null),
		[hasNextPage, setHasNextPage] = useState(true);

	const getPhotos = useCallback(async () => {
		if (!hasNextPage) {
			return;
		}

		// BUG::This dies because the RN library isn't linked to Native CameraRoll code.
		const { edges, page_info: pageInfo } = await CameraRoll.getPhotos({
			first,
			assetType,
			groupTypes,
			...(after && { after }),
		});

		if (after === pageInfo.end_cursor) {
			return;
		}

		const images = edges.map(i => i.node).map(i => i.image);

		setPhotos([...photos, ...images]);
		setAfter(pageInfo.end_cursor);
		setHasNextPage(pageInfo.has_next_page);
	}, [after, hasNextPage, photos]);

	return [photos, getPhotos];
}