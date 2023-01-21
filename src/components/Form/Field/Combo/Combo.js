import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	// Input,
	Popover,
	Row,
	Tooltip,
} from 'native-base';
import Input from '../Input';
import styles from '../../../../Constants/Styles';
import withSelection from '../../../Hoc/withSelection';
import withData from '../../../Hoc/withData';
import withEvents from '../../../Hoc/withEvents';
import withValue from '../../../Hoc/withValue';
import emptyFn from '../../../../Functions/emptyFn';
import { Grid } from '../../../Grid/Grid';
import IconButton from '../../../Buttons/IconButton';
import CaretDown from '../../../Icons/CaretDown';
import _ from 'lodash';
import inArray from '../../../../Functions/inArray';

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
			menuMinWidth = 150,

			// withData
			Repository,
			data,
			idIx,
			displayIx,

			// withEvents
			onEvent,

			// withSelection
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

			tooltipPlacement = 'bottom',
		} = props,
		inputRef = useRef(),
		triggerRef = useRef(),
		menuRef = useRef(),
		// isTyping = useRef(false),
		// typingTimeout = useRef(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isManuallyEnteringText, setIsManuallyEnteringText] = useState(false), // when typing a value, not using trigger/grid
		[textValue, setTextValue] = useState(''),
		[width, setWidth] = useState(0),
		[height, setHeight] = useState(null),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showMenu = () => {
			if (isMenuShown) {
				return;
			}
			if (inputRef.current.getBoundingClientRect) {
				// For web, ensure it's in the proper place
				const
					rect = inputRef.current.getBoundingClientRect(),
					bodyRect = document.body.getBoundingClientRect(),
					isUpper = rect.top < bodyRect.height / 2;
					
				if (isUpper) {
					// Menu is below the combo
					const rectTop = rect.top + rect.height;
					if (rectTop !== top) {
						setTop(rectTop);
					}
					setHeight(null);
				} else {
					// Menu is above the combo

					const rectTop = rect.top -200;
					if (rectTop !== top) {
						setTop(rectTop);
					}

					setHeight(200);
				}
				if (rect.left !== left) {
					setLeft(rect.left);
				}
				if (rect.width !== width) {
					setWidth(rect.width);
				}
			}
			if (Repository && !Repository.isLoaded) {
				Repository.reload();
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
			searchForMatches(value);
			// setIsManuallyEnteringText(true);

			// isTyping.current = true;
			// if (typingTimeout.current) {
			// 	clearTimeout(typingTimeout.current);
			// }
			// typingTimeout.current = setTimeout(() => {
			// 	isTyping.current = false;
			// }, 300);
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

					// TODO: Want to build a search functionality that shows results in combo grid

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
				found = _.find(data, (item) => {
					if (_.isString(item[displayIx]) && _.isString(value)) {
						return item[displayIx].toLowerCase() === value.toLowerCase();
					}
					return item[displayIx] === value;
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
					const found = Repository.getById(value);
					if (found) {
						newSelection.push(found);
					}
				}
			}
		} else {
			// Get data item or items that match value
			if (!_.isNil(value) && (_.isBoolean(value) || _.isNumber(value) || !_.isEmpty(value))) {
				let currentValue = value;
				if (!_.isArray(currentValue)) {
					currentValue = [currentValue];
				}
				_.each(currentValue, (val) => {
					// Search through data
					const found = _.find(data, (item) => {
						if (_.isString(item[idIx]) && _.isString(val)) {
							return item[idIx].toLowerCase() === val.toLowerCase();
						}
						return item[idIx] === val;
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
	
	let comboComponent = <Row {...refProps} justifyContent="center" alignItems="center" h={styles.FORM_COMBO_HEIGHT} flex={1} onLayout={() => setIsRendered(true)}>
								<Input
									ref={inputRef}
									value={textValue}
									autoSubmit={true}
									onChangeValue={onInputChangeText}
									onKeyPress={onInputKeyPress}
									onBlur={onInputBlur}
									onClick={onInputClick}
									onLayout={(e) => {
										// On web, this is not needed, but on RN it might be, so leave it in for now
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
									flex={1}
									h="100%"
									m={0}
									borderTopRightRadius={0}
									borderBottomRightRadius={0}
									fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
									bg={styles.FORM_COMBO_INPUT_BG}
									_focus={{
										bg: styles.FORM_COMBO_INPUT_FOCUS_BG,
									}}
									{...props._input}
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
									bg={styles.FORM_COMBO_TRIGGER_BG}
									_hover={{
										bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
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
										h={height ? height + 'px' : null}
										minWidth={menuMinWidth}
										overflow="scroll"
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
												fireEvent={onEvent}
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
		comboComponent = <Tooltip label={tooltip} placement={tooltipPlacement}>
							{comboComponent}
						</Tooltip>;
	}
	
	return comboComponent;
}

export default withEvents(
					withData(
						withValue(
							withSelection(
								Combo
							)
						)
					)
				);
