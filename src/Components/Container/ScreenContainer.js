import {
	Platform,
	RefreshControl,
	useWindowDimensions,
} from 'react-native';
import {
	KeyboardAvoidingView,
	ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import withComponent from '../Hoc/withComponent.js';
// import { useHeaderHeight } from '@react-navigation/elements';
// import testProps from '../OneHat/functions/testProps';

function ScreenContainer(props) {
	const {
			screenName = 'ScreenContainer',
			safeArea = false,
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
	let className = clsx(
		screenName,
		'items-center',
		'justify-start',
		'flex-1',
		'w-full',
		'overflow-visible'
	);
	if (props.className) {
		className += ` ${props.className}`;
	}

	const column = <VStackNative
						onLayout={onLayout}
						{...safeAreaProps}
						className={className}
					>
						{props.children}
					</VStackNative>;
	
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
			return <KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						className="flex-1 w-full"
					>
						{scrollView}
					</KeyboardAvoidingView>;
		} else {
			return scrollView;
		}
	}
	if (keyboardAvoiding) {
		return <KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 w-full"
				>
					{column}
				</KeyboardAvoidingView>;
	}
	return column;
}

export default withComponent(ScreenContainer);