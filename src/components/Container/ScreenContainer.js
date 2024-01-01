import {
	Platform,
	RefreshControl,
	useWindowDimensions,
} from 'react-native';
import {
	VStack,
	ScrollView,
	KeyboardAvoidingView,
} from '@gluestack-ui/themed';
import withComponent from '../Hoc/withComponent.js';
// import { useHeaderHeight } from '@react-navigation/elements';
// import testProps from '../OneHat/functions/testProps';

function ScreenContainer(props) {
	const {
			screenName = 'ScreenContainer',
			p = 0,
			safeArea = false,
			bg = '#fff',
			scrollEnabled = false,
			keyboardAvoiding = false,
			subtractHeaderHeight = true,
			setScrollViewRef = () => {},
			onLayout = () => {},
			onRefresh = () => {},
			isRefreshing,
		} = props,
		{
			height,
		} = useWindowDimensions(),
		headerHeight = 0,//subtractHeaderHeight ? useHeaderHeight() : 0,
		safeAreaProps = {};
	if (safeArea !== false) {
		safeAreaProps.safeArea = true;
	}

	const column = <VStack
						// {...testProps(screenName)}
						alignItems="center"
						justifyContent="flex-start"
						flex={1}
						w="100%"
						p={p}
						bg={bg}
						overflow="visible"
						onLayout={onLayout}
						{...safeAreaProps}
					>
						{props.children}
					</VStack>;
	
	if (scrollEnabled) {
		const scrollViewProps = {};
		if (onRefresh && typeof isRefreshing !== 'undefined') {
			scrollViewProps.refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
		}
		const scrollView = <ScrollView
								ref={(ref) => {
									setScrollViewRef(ref);
								}}
								keyboardShouldPersistTaps="handled"
								_contentContainerStyle={{
									minHeight: height - headerHeight,
								}}
								{...scrollViewProps}
							>{column}</ScrollView>;
		if (keyboardAvoiding) {
			return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} flex={1} width="100%">
						{scrollView}
					</KeyboardAvoidingView>
		} else {
			return scrollView;
		}
	}
	if (keyboardAvoiding) {
		return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} flex={1} width="100%">
					{column}
				</KeyboardAvoidingView>;
	}
	return column;
}

export default withComponent(ScreenContainer);