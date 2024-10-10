import {
	Box,
	Text,
} from '@gluestack-ui/themed';
import {
	Modal,
	View,
} from 'react-native';
import {
	UI_MODE_REACT_NATIVE,
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import Loading from './Loading.js';

const
	height = 50,
	width = 200;

// NOTE: This component does NOT use the native-base Modal
// because we need it to appear on top of all other Modals.
// Therefore, we're using the ReactNative Modal, which at least for web
// we can control the zIndex of.

export default function WaitMessage(props) {
	let {
			text,
		} = props;
	if (!text) { // do this here instead of setting default value in deconstructor, so we can use the default for text, even if text is defined and passed as null or empty string
		text = 'Please wait...';
	}

	let transform;
	if (UiGlobals.mode === UI_MODE_WEB) {
		transform = 'translateX(-50%) translateY(-50%)';
	}
	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		const
			translatePercentage = -50,
			translateY = (height * translatePercentage) / 100,
			translateX = (width * translatePercentage) / 100;
		transform = [
			{
				translateX,
			},
			{
				translateY,
			},
		];
	}

	return <Modal visible={true} transparent={true} {...props}>
				<View style={{
					flex: 1,
					backgroundColor: 'rgba(0, 0, 0, 0.3)',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<View style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform,
						height: height + 'px',
						width: width + 'px',
						zIndex: 100000, // should be the highest modal
					}}>
						<Box
							borderTopWidth={0}
							bg="#fff"
							p={3}
							h={height + 'px'}
							w={width + 'px'}
							justifyContent="center"
							alignItems="center"
							borderRadius={5}
							flexDirection="row"
						>
							<Loading minHeight="auto" h={5} w={5} mr={2} />
							<Text color="#000">{text}</Text>
						</Box>
					</View>
				</View>
			</Modal>;
}
