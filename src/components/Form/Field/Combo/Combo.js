import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Input,
	Popover,
	Row,
	Tooltip,
} from 'native-base';
import {
	STYLE_COMBO_HEIGHT,
	STYLE_COMBO_INPUT_FONTSIZE,
	STYLE_COMBO_INPUT_BG,
	STYLE_COMBO_INPUT_FOCUS_BG,
	STYLE_COMBO_TRIGGER_BG,
	STYLE_COMBO_TRIGGER_HOVER_BG,
} from '../../../../constants/Style';
import withSelection from '../../../Hoc/withSelection';
import withData from '../../../Hoc/withData';
import withValue from '../../../Hoc/withValue';
import emptyFn from '../../../../functions/emptyFn';
import { Grid } from '../../../Grid/Grid';
import IconButton from '../../../Buttons/IconButton';
import CaretDown from '../../../Icons/CaretDown';
import _ from 'lodash';
import inArray from '../../../../functions/inArray';

// Combo requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

export function Combo(props) {
	const {
			value,
			setValue = emptyFn,
			additionalButtons,
			autoFocus = false,
			forceSelection = true,
			tooltipRef = null,
			tooltip = null,

			// data source
			Repository,
			data,
			fields,
			idField,
			displayField,

			// withSelection() HOC
			selection,
			setSelection,
			selectionMode,
			selectNext,
			selectPrev,
			removeFromSelection,
			addToSelection,
			selectRangeTo,
			isInSelection,
			getIdFromSelection,
			getDisplayFromSelection,
		} = props,
		inputRef = useRef(),
		triggerRef = useRef(),
		menuRef = useRef(),
		isTyping = useRef(false),
		typingTimeout = useRef(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isManuallyEnteringText, setIsManuallyEnteringText] = useState(false), // when typing a value, not using trigger/grid
		[textValue, setTextValue] = useState(''),
		[width, setWidth] = useState(0),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showMenu = () => {
			if (isMenuShown) {
				return;
			}
			if (inputRef.current.getBoundingClientRect) {
				// For web, ensure it's in the proper place
				const rect = inputRef.current.getBoundingClientRect(),
					offSet = rect.top + rect.height;
				if (offSet !== top) {
					setTop(offSet);
				}
			}
			setIsMenuShown(true);
		},
		hideMenu = () => {
			if (!isMenuShown) {
				return;
			}
			setIsMenuShown(false);
		},
		onInputKeyPress = (e) => {
			switch(e.key) {
				case 'Escape':
				case 'Enter':
					hideMenu();
					break;
				case 'ArrowDown':
					selectNext();
					break;
				case 'ArrowUp':
					selectPrev();
					break;
				default:
			}
		},
		onInputChangeText = (value) => {
			setTextValue(value);
			setIsManuallyEnteringText(true);

			isTyping.current = true;
			if (typingTimeout.current) {
				clearTimeout(typingTimeout.current);
			}
			typingTimeout.current = setTimeout(() => {
				isTyping.current = false;
				searchForMatches(value);
			}, 300);
		},
		onInputBlur = (e) => {
			const {
					relatedTarget
				} = e;
			if (!relatedTarget ||
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && (!menuRef.current || !menuRef.current.contains(relatedTarget)))) {
				hideMenu();
			}
			if (textValue === '') {
				setSelection([]); // delete current selection
			} else if (isManuallyEnteringText) {
				if (forceSelection) {
					setSelection([]); // delete current selection
					hideMenu();
				} else {
					setValue(textValue);
				}
			}
			if (_.isEmpty(selection)) {
				setTextValue('');
			}
		},
		onInputClick = (e) => {
			if (!isRendered) {
				return;
			}
			showMenu();
		},
		onTriggerPress = (e) => {
			if (!isRendered) {
				return;
			}
			if (isMenuShown) {
				hideMenu();
			} else {
				showMenu();
			}
			inputRef.current.focus();
		},
		onTriggerBlur = (e) => {
			if (!isMenuShown) {
				return;
			}
			const {
					relatedTarget
				} = e;
			if (!relatedTarget || 
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && !menuRef.current.contains(relatedTarget))) {
				hideMenu();
			}
		},
		searchForMatches = (value) => {

			// Do a search for this value
			// TODO: Do fuzzy seach for results
			// Would have to do differently for remote repositories
			// Narrow results in grid to those that match the filter.
			// If filter is cleared, show original results.

			let found;
			if (Repository) {
				
				debugger;
				
				// Set filter
				let filter = {};
				if (value !== '') {

					// LEFT OFF HERE
					// Want to build a search functionality that shows results in combo grid

					if (Repository.isRemote) {
						// 'q' fuzzy search from server 
						
	
					} else {
						// Fuzzy search with getBy filter function
						filter = (entity) => {
							const
								displayValue = entity.displayValue,
								regex = new RegExp('^' + value);
							return displayValue.match(regex);
						};
					}
				}
				Repository.filter(filter);

				// TODO: Auto-select if filter produces only one result

			} else {
				// Search through data
				const ix = fields.indexOf(displayField);
				found = _.find(data, (item) => {
					if (_.isString(item[ix]) && _.isString(value)) {
						return item[ix].toLowerCase() === value.toLowerCase();
					}
					return item[ix] === value;
				});
				if (found) {
					const
						newSelection = [found],
						newTextValue = getDisplayFromSelection(newSelection);

					setTextValue(newTextValue);
					setSelection(newSelection);
				} else {
					if (value === '') { // Text field was cleared, so clear selection
						setSelection([]);
					}
				}
			}
		};

	if (_.isUndefined(selection)) {
		throw new Error('Combo must be used with withSelection hook!');
	}

	useEffect(() => {
		// adjust the selection to match the value
		let newSelection = [];
		if (Repository) {
			// Get entity or entities that match value
			if ((_.isArray(value) && !_.isEmpty(value)) || !!value) {
				if (_.isArray(value)) {
					newSelection = Repository.getBy((entity) => inArray(entity.id, value));
				} else {
					newSelection.push(Repository.getById(value));
				}
			}
		} else {
			// Get data item or items that match value
			if ((_.isArray(value) && !_.isEmpty(value)) || !!value) {
				const ix = fields.indexOf(idField);
				let currentValue = value;
				if (!_.isArray(currentValue)) {
					currentValue = [currentValue];
				}
				_.each(currentValue, (val) => {
					// Search through data
					const found = _.find(data, (item) => {
						if (_.isString(item[ix]) && _.isString(val)) {
							return item[ix].toLowerCase() === val.toLowerCase();
						}
						return item[ix] === val;
					});
					if (found) {
						newSelection.push(found);
					}
				});
			}
		}

		if (!_.isEqual(newSelection, selection)) {
			setSelection(newSelection);
		}
	}, [value]);

	useEffect(() => {
		if (!isRendered) {
			return () => {};
		}

		// Adjust the value to match the selection
		const localValue = getIdFromSelection();
		if (!_.isEqual(localValue, value)) {
			setValue(localValue);
		}
		
		// Adjust text input to match selection
		const localTextValue = getDisplayFromSelection(selection);
		if (!_.isEqual(localTextValue, textValue)) {
			setTextValue(localTextValue);
		}
		setIsManuallyEnteringText(false);
	}, [selection, isRendered]);

	useEffect(() => {
		if (!isRendered) {
			return () => {};
		}
		if (autoFocus && !inputRef.current.isFocused()) {
			inputRef.current.focus();
		}
	}, [autoFocus, isRendered]);

	const refProps = {};
	if (tooltipRef) {
		refProps.ref = tooltipRef;
	}

	let comboComponent = <Row {...refProps} justifyContent="center" alignItems="center" h={STYLE_COMBO_HEIGHT} flex={1} onLayout={() => setIsRendered(true)}>
								<Input
									ref={inputRef}
									value={textValue}
									onChangeText={onInputChangeText}
									onKeyPress={onInputKeyPress}
									onLayout={(e) => {
										const {
												height,
												width,
												top,
												left,
											} = e.nativeEvent.layout;
										setWidth(width);
										setTop(top + height);
										setLeft(left);
									}}
									// onFocus={(e) => {
									// 	if (isBlocked.current) {
									// 		return;
									// 	}
									// 	if (!isRendered) {
									// 		return;
									// 	}
									// 	showMenu();
									// }}
									onBlur={onInputBlur}
									onClick={onInputClick}
									flex={1}
									fontSize={STYLE_COMBO_INPUT_FONTSIZE}
									borderTopRightRadius={0}
									borderBottomRightRadius={0}
									m={0}
									h="100%"
									bg={STYLE_COMBO_INPUT_BG}
									_focus={{
										bg: STYLE_COMBO_INPUT_FOCUS_BG,
									}}
									{...props._text}
								/>
								<IconButton
									ref={triggerRef}
									_icon={{
										as: CaretDown,
										color: 'primary.800',
										size: 'sm',
									}}
									onPress={onTriggerPress}
									onBlur={onTriggerBlur}
									h="100%"
									borderWidth={1}
									borderColor="#bbb"
									borderLeftWidth={0}
									borderLeftRadius={0}
									borderRightRadius="md"
									bg={STYLE_COMBO_TRIGGER_BG}
									_hover={{
										bg: STYLE_COMBO_TRIGGER_HOVER_BG,
									}}
								/>
								{additionalButtons}
								<Popover
									isOpen={isMenuShown}
									onClose={() => {
										hideMenu();
									}}
									trigger={emptyFn}
									trapFocus={false}
									placement={'auto'}
									{...props}
								>
									<Popover.Content
										position="absolute"
										top={top + 'px'}
										left={left + 'px'}
										w={width + 'px'}
									>
										<Popover.Body
											ref={menuRef}
											maxHeight={200}
											borderWidth={1}
											borderColor='trueGray.400'
											borderTopWidth={0}
											p={0}
										>
											<Grid
												showHeaders={false}
												showHovers={true}
												shadow={1}
												getRowProps={() => {
													return {
														borderBottomWidth: 1,
														borderBottomColor: 'trueGray.300',
														py: 1,
														pl: 4,
														pr: 2,
													};
												}}
												{...props}
												setSelection={(selection) => {
													// Decorator fn to add local functionality
													// Close the menu when row is selected on grid
													setSelection(selection);
													hideMenu();
												}}
												selectionMode={selectionMode}
											/>
										</Popover.Body>
									</Popover.Content>
								</Popover>
							</Row>;
	if (tooltip) {
		comboComponent = <Tooltip label={tooltip} placement="bottom">
							{comboComponent}
						</Tooltip>;
	}
	
	return comboComponent;
}

export default withValue(withData(withSelection(Combo)));
