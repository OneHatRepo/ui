import { useCallback } from 'react';
import {
	Fab, FabIcon, FabLabel,
	VStack,
} from '@project-components/Gluestack';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import IconButton from '../Buttons/IconButton.js';
import FabWithTooltip from './FabWithTooltip.js';
import EllipsisVertical from '../Icons/EllipsisVertical.js';
import Xmark from '../Icons/Xmark.js';

// This component creates a floating action button (FAB)
// that can expand and collapse to show multiple buttons beneath it.

export default function DynamicFab(props) {
	const {
			icon,
			buttons, // to show when expanded
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
		buttonSpacing = 45,
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
				{buttons
					.slice() // clone, so we don't mutate the original array
					.reverse() // so buttons appear in the correct order
					.map((btnConfig, ix) => {
						const {
								tooltipPlacement = 'left',
								onPress,
								key,
								...btnConfigToPass
							} = btnConfig,
							animatedStyle = useAnimatedStyle(() => {
								return {
									opacity: withTiming(isExpanded.value, { duration: 200 }),
									pointerEvents: isExpanded.value ? 'auto' : 'none', // Disable interaction when collapsed
								};
							});

						return <Animated.View
									key={ix}
									style={[
										animatedStyle,
										{
											position: 'absolute',
											bottom: buttonSpacing * (ix + 1) + verticalOffset, // Static vertical positioning
											right: 0,
										},
									]}
								>
									<IconButton
										className={`
											bg-primary-600
											text-white
											hover:bg-primary-700
											active:bg-primary-800
										`}
										tooltipPlacement={tooltipPlacement}
										onPress={() => {
											onPress();
											if (collapseOnPress) {
												isExpanded.value = 0;
											}
										}}
										{...btnConfigToPass}
									/>
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
