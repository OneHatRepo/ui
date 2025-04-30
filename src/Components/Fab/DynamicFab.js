import { useCallback } from 'react';
import {
	Fab, FabIcon, FabLabel,
	VStack,
} from '@project-components/Gluestack';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
} from 'react-native-reanimated';
import IconButton from '../Buttons/IconButton.js';
import FabWithTooltip from './FabWithTooltip.js';
import EllipsisVertical from '../Icons/EllipsisVertical.js';
import Xmark from '../Icons/Xmark.js';

// This component creates a floating action button (FAB)
// that can expand and collapse to show multiple FABs beneath it.

export default function DynamicFab(props) {
	const {
			icon, // for the main FAB
			fabs, // additional FABs to show when expanded
			label,
			tooltip,
			tooltipPlacement = 'left',
			tooltipClassName,
			tooltipTriggerClassName,
			collapseOnPress = true,
		} = props,
		isExpanded = useSharedValue(0),
		toggleFab = useCallback(() => {
			isExpanded.value = isExpanded.value ? 0 : 1;
		}, []),
		fabSpacing = 45,
		verticalOffset = 50; // to shift the entire expanded group up

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
									tooltip,
									tooltipPlacement = 'left',
									tooltipClassName,
									tooltipTriggerClassName,
									onPress,
								} = fab,
								animatedStyle = useAnimatedStyle(() => {
									return {
										opacity: withTiming(isExpanded.value, { duration: 200 }),
										pointerEvents: isExpanded.value ? 'auto' : 'none', // Disable interaction when collapsed
									};
								});

							if (!icon) {
								throw Error('DynamicFab: icon prop is required for all fabs!');
							}

							let fabComponent = <IconButton
													icon={icon}
													className={`
														bg-primary-600
														text-white
														hover:bg-primary-700
														active:bg-primary-800
													`}
													tooltip={tooltip}
													tooltipPlacement={tooltipPlacement}
													tooltipClassName={tooltipClassName}
													tooltipTriggerClassName={tooltipTriggerClassName}
													onPress={() => {
														onPress();
														if (collapseOnPress) {
															isExpanded.value = 0;
														}
													}}
												/>;

							return <Animated.View
										key={index}
										style={[
											animatedStyle,
											{
												position: 'absolute',
												bottom: fabSpacing * (index + 1) + verticalOffset, // Static vertical positioning
												right: 0,
											},
										]}
									>
										{fabComponent}
									</Animated.View>;
						})}
				<FabWithTooltip
					size="lg"
					onPress={toggleFab}
					className="z-100 bg-primary-600"
					tooltip={tooltip}
					tooltipPlacement={tooltipPlacement}
					tooltipClassName={tooltipClassName}
					tooltipTriggerClassName={tooltipTriggerClassName}
				>
					<FabIcon as={isExpanded.value ? Xmark : icon || EllipsisVertical} />
					{label ? <FabLabel>{label}</FabLabel> : null}
				</FabWithTooltip>
			</VStack>;
};
