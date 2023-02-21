import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	Pressable,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import inArray from '../../Functions/inArray.js';
import emptyFn from '../../Functions/emptyFn.js';
import _ from 'lodash';

// The Accordion has two modes.
// In the first (onlyOne), only one section can be expanded at a time.
// Otherwise, any section can be expanded—multiple at a time.
// In the first, the section which is newly expanded will scroll to the top,
// and extra padding down below will be added. In the other mode,
// no auto scrolling will take place
//
// If you want to scroll in the second mode…
// Every time I expand or collapse a section, get the new height of each section.
// That way you can still calculate the top position for any sections scrolling
// Might be able to do a delta since last calsulation.

export default function Accordion(props) {
	const {
			sections = [],
			activeSections = [],
			setActiveSections = emptyFn,
			renderHeader = emptyFn,
			renderContent = emptyFn,
			onAnimationEnd = emptyFn,
			onLayout,
			onlyOne = true,
			...propsToPass
		} = props,
		scrollViewRef = useRef(),
		refs = {},
		[isRendered, setIsRendered] = useState(false),
		[containerInitialHeight, setContainerInitialHeight] = useState(0),
		sectionHeight = containerInitialHeight / (sections?.length || 1), // protect against divide by zero
		calculateExtraPadding = () => {
			// this adds extra padding to the bottom, depending on what's active
			// so that scrollTo can scroll the active header all the way downto the top
			let extraPadding = 0;
			const activeIx = activeSections[0];
			if (isRendered && activeIx) {
				// when the first section is active, we don't need to add any padding.
				// For each subsequent section, we need to add more and more padding
				// until when the last section is active, we need to add padding equal to
				// the container height
				extraPadding = (activeIx +2) * sectionHeight;
			}
			return extraPadding;
		},
		items = _.map(sections, (section, ix) => {

			const itemVar = 'item' + ix;
			refs[itemVar] = useRef(); // so we have refs for each section - e.g. refs.item0

			const
				isActive = inArray(ix, activeSections),
				header = renderHeader(section, ix, isActive),
				content = renderContent(section, ix, isActive, refs[itemVar]),
				rowProps = {};

			// TODO: Animate height. Possible help here: https://stackoverflow.com/a/57333550 and https://stackoverflow.com/a/64797961
			if (isActive) {
				rowProps.flex = 1;
			} else {
				rowProps.h = 0;
				rowProps.overflow = 'hidden'; // otherwise some elements mistakenly show
			}

			return <Column key={ix}>
						<Pressable
							onPress={(e) => {
								let newActiveSections = [];
								if (onlyOne) {
									if (!isActive) {
										newActiveSections = [ix];
									}
								} else {
									if (isActive) {
										newActiveSections = _.without(activeSections, ix);
									} else {
										newActiveSections = _.clone(activeSections);
										newActiveSections.push(ix);
									}
								}
								setActiveSections(newActiveSections);
							}}
						>
							{header}
						</Pressable>
						<Row {...rowProps} bg="#f00">
							{content}
						</Row>
					</Column>;
		});

	useEffect(() => {
		if (!isRendered) {
			return () => {};
		}
		if (!onlyOne) {
			return () => {}; // Don't animate if !onlyOne
		}

		const
			scrollView = scrollViewRef.current,
			activeIx = activeSections[0];
			
		let scrollTo = 0;
		if (activeSections?.length && sections?.length) {
			scrollTo = sectionHeight * activeIx;
		}
		setTimeout(()=> {
			scrollView.scrollTo({ x: 0, y: scrollTo, animated: true });
		}, 10); // delay so render can finish

	}, [activeSections, isRendered]);
	
	return <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="always" flex={1} w="100%">
				<Column
					{...propsToPass}
					pb={(onlyOne ? calculateExtraPadding() : 0) + 'px'}
					onLayout={(e) => {
						if (!containerInitialHeight) {
							const { height } = e.nativeEvent.layout;
							setContainerInitialHeight(height);
							console.log('height', height);
						}
						if (onLayout) {
							onLayout(e);
						}
						setIsRendered(true);
					}}
				>
					{items}
				</Column>
			</ScrollView>;
}
