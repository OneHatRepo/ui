import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Column,
	Pressable,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
} from '../../Constants/UiModes';
import UiConfig from '../../UiConfig';
import inArray from '../../Functions/inArray';
import emptyFn from '../../Functions/emptyFn';
import _ from 'lodash';

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
			touchableProps = {},
			...propsToPass
		} = props,
		scrollViewRef = useRef(),
		[containerInitialHeight, setContainerInitialHeight] = useState(0),
		items = _.map(sections, (section, ix) => {
			const
				isActive = inArray(ix, activeSections),
				header = renderHeader(section, ix, isActive),
				content = renderContent(section, ix, isActive),
				rowProps = {};
			
			// TODO: Animate height. Possible help here: https://stackoverflow.com/a/57333550 and https://stackoverflow.com/a/64797961
			if (isActive) {
				rowProps.flex = 1;
			} else {
				rowProps.h = 0;
			}

			return <Column key={ix}>
						<Pressable
							onPress={(e) => {
								let newActiveSections,
									animateMe = true;
								if (onlyOne) {
									if (isActive) {
										newActiveSections = [];
										animateMe = false;
									} else {
										newActiveSections = [ix];
									}
								} else {
									if (isActive) {
										newActiveSections = _.without(activeSections, ix);
										animateMe = false;
									} else {
										newActiveSections = _.clone(activeSections);
										newActiveSections.push(ix);
									}
								}
								setActiveSections(newActiveSections);

								setTimeout(() => { // Delay it so we scroll *after* new render

									const
										scrollView = scrollViewRef.current,
										sectionsLength = sections.length;
									let scrollTo;

									if (onlyOne) {
										const
											sectionHeight = containerInitialHeight / sectionsLength;
										scrollTo = sectionHeight * ix;
									} else {
										if (UiConfig.mode === UI_MODE_REACT_NATIVE) {
											// TODO: Not sure how to do this one yet.

											// const 
											// 	sectionsLength = sections.length,
											// 	categoryHeight = parseInt(containerInitialHeight / sectionsLength),
											// 	ix = getDivisionIxByTitle(title) -1,
											// 	headerHeight = 100,
											// 	isActive = inArray(ix, activeSections);
											// 	// scrollTo = (categoryHeight * ix) - headerHeight;
											// scrollTo = categoryHeight * ix;
										} else if (UiConfig.mode === UI_MODE_WEB) {
											const
												rowsContainer = scrollView.childNodes[0].childNodes[0],
												rowsContainerRect = rowsContainer.getBoundingClientRect();
											scrollTo = e.target.getBoundingClientRect().top - rowsContainerRect.top;
										}
									}

									if (animateMe) {
										scrollView.scrollTo({ x: 0, y: scrollTo, animated: true });
									}
								}, 150);

							}}
							{...touchableProps}
						>
							{header}
						</Pressable>
						<Row {...rowProps}>
							{content}
						</Row>
					</Column>;
		});

console.log('activeSections', activeSections);
	return <ScrollView ref={scrollViewRef}>
				<Column {...propsToPass} onLayout={(e) => {
					if (!containerInitialHeight) {
						const { height } = e.nativeEvent.layout;
						setContainerInitialHeight(height);
					}
					if (onLayout) {
						onLayout(e);
					}
				}}>
					{items}
				</Column>
			</ScrollView>;
}
