import { useCallback } from 'react';
import {
	Fab, FabIcon, FabLabel,
	ScrollView,
	VStack,
} from '@project-components/Gluestack';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
} from 'react-native-reanimated';
import EllipsisVertical from '../Icons/EllipsisVertical.js';
import Xmark from '../Icons/Xmark.js';

// This component creates a floating action button (FAB)
// that can expand and collapse to show multiple FABs beneath it.

export default function DynamicFab(props) {
	const {
			fabs,
			icon = null,
			label = null,
			collapseOnPress = true,
		} = props,
		isExpanded = useSharedValue(0),
		toggleFab = useCallback(() => {
			isExpanded.value = isExpanded.value ? 0 : 1;
		}, []),
		fabSpacing = 50,
		verticalOffset = 15; // to shift the entire expanded group up

	let className = `
		DynamicFab
		fixed
		pb-[20px]
		bottom-4
		right-4
	`;
	if (props.className) {
		className += ` ${props.className}`;
	}

	return <VStack className={className}>
					{fabs
						.slice() // clone, so we don't mutate the original array
						.reverse() // so fabs appear in the correct order
						.map((fab, index) => {
							const {
									icon,
									label,
									onPress,
								} = fab,
								animatedStyle = useAnimatedStyle(() => {
									const translateY = interpolate(
										isExpanded.value,
										[0, 1],
										[0, -(fabSpacing * (index + 1)) - verticalOffset]
									);
									return {
										transform: [{ translateY }],
										opacity: withTiming(isExpanded.value, { duration: 200 }),
									};
								});

							return <Animated.View
										key={index}
										style={animatedStyle}
										className="absolute bottom-0 right-0"
									>
										<Fab
											size="md"
											className="bg-primary-600"
											onPress={() => {
												onPress();
												if (collapseOnPress) {
													isExpanded.value = 0;
												}
											}}
											style={{
												shadowColor: 'transparent', // otherwise, on collapse a bunch of shadows build up for a moment!
											}}
										>
											<FabIcon as={icon} />
											{label && <FabLabel>{label}</FabLabel>}
										</Fab>
									</Animated.View>;
						})}
				<Fab
					size="lg"
					onPress={toggleFab}
					className="z-100 bg-primary-600"
				>
					<FabIcon as={isExpanded.value ? Xmark : icon || EllipsisVertical} />
					{label && <FabLabel>{label}</FabLabel>}
				</Fab>
			</VStack>;
};
