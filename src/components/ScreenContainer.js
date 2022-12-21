import {
	Keyboard,
	Platform,
	TouchableWithoutFeedback,
} from 'react-native';
import {
	Column,
	KeyboardAvoidingView,
	ScrollView,
} from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDimensions } from '@react-native-community/hooks';
import { useHeaderHeight } from '@react-navigation/elements';
import testProps from '../functions/testProps';

export default function ScreenContainer(props) {
	const {
			screenName = 'ScreenContainer',
			p = 0,
			safeArea = false,
			bg = '#fff',
			scrollEnabled = false,
			keyboardAvoiding = false,
			behavior = Platform.OS === 'ios' ? 'padding' : 'height', // for the KeyboardAvoidingView. 'height', 'position', 'padding'
			justifyContent = 'flex-start',
			alignItems = 'center',
			onLayout = () => {},
		} = props,
		screen = useDimensions().screen,
		headerHeight = useHeaderHeight(),
		safeAreaProps = {};
	if (safeArea !== false) {
		safeAreaProps.safeAreaTop = true;
	}

	let content = <Column
						{...testProps(screenName)}
						alignItems={alignItems}
						justifyContent={justifyContent}
						flex={1}
						w="100%"
						p={p}
						bg={bg}
						overflow="visible"
						onLayout={onLayout}
						{...safeAreaProps}
					>
						{props.children}
					</Column>;
	if (keyboardAvoiding && scrollEnabled) {
		content = <KeyboardAwareScrollView behavior={behavior} contentContainerStyle={{ flex: 1, }}>
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							{content}
						</TouchableWithoutFeedback>
					</KeyboardAwareScrollView>;
	} else {
		if (keyboardAvoiding) {
			content = <KeyboardAvoidingView behavior={behavior} flex={1}>
							<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
								{content}
							</TouchableWithoutFeedback>
						</KeyboardAvoidingView>;
		}
		if (scrollEnabled) {
			content = <ScrollView keyboardShouldPersistTaps="always" _contentContainerStyle={{
							minHeight: screen.height - headerHeight,
						}}>{content}</ScrollView>;
		}
	}
	return content;
}
