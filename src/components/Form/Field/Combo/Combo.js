import React, { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import {
	UI_MODE_WEB,
} from '../../../../Constants/UiModes.js';
import UiGlobals from '../../../../UiGlobals.js';
import Input from '../Input.js';
import withData from '../../../Hoc/withData.js';
import withSelection from '../../../Hoc/withSelection.js';
import withValue from '../../../Hoc/withValue.js';
import emptyFn from '../../../../Functions/emptyFn.js';
import { Grid, WindowedGridEditor } from '../../../Grid/Grid.js';
import IconButton from '../../../Buttons/IconButton.js';
import CaretDown from '../../../Icons/CaretDown.js';
import _ from 'lodash';

// Combo requires the use of HOC withSelection() whenever it's used.
// The default export is *with* the HOC. A separate *raw* component is
// exported which can be combined with many HOCs for various functionality.

export function ComboComponent(props) {
	const {
			additionalButtons,
			autoFocus = false,
			forceSelection = true,
			tooltipRef = null,
			tooltip = null,
			menuMinWidth = 150,
			disableDirectEntry = false,
			disablePagination = true,
			hideMenuOnSelection = true,
			_input = {},
			isEditor = false,

			// withValue
			value,
			setValue,
			
			// withData
			Repository,
			data,
			idIx,
			displayIx,

			// withSelection
			selection,
			setSelection,
			selectionMode,
			selectNext,
			selectPrev,
			getDisplayFromSelection,

			tooltipPlacement = 'bottom',
		} = props,
		styles = UiGlobals.styles,
		inputRef = useRef(),
		triggerRef = useRef(),
		menuRef = useRef(),
		isManuallyEnteringText = useRef(false),
		savedSearch = useRef(null),
		typingTimeout = useRef(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[textValue, setTextValue] = useState(''),
		[width, setWidth] = useState(0),
		[height, setHeight] = useState(null),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showMenu = () => {
			if (isMenuShown) {
				return;
			}
			if (UiGlobals.mode === UI_MODE_WEB && inputRef.current.getBoundingClientRect) {
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
		getIsManuallyEnteringText = () => {
			return isManuallyEnteringText.current;
		},
		setIsManuallyEnteringText = (bool) => {
			isManuallyEnteringText.current = bool;
		},
		getSavedSearch = () => {
			return savedSearch.current;
		},
		setSavedSearch = (val) => {
			savedSearch.current = val;
		},
		toggleMenu = () => {
			setIsMenuShown(!isMenuShown);
		},
		onInputKeyPress = (e, inputValue) => {
			if (disableDirectEntry) {
				return;
			}
			switch(e.key) {
				case 'Escape':
					hideMenu();
					break;
				case 'Enter':
					e.preventDefault();
					if (_.isEmpty(inputValue) && !_.isNull(value)) {
						// User pressed Enter on an empty text field, but value is set to something
						// This means the user cleared the input and pressed enter, meaning he wants to clear the value

						// clear the value
						setValue(null);
						if (isMenuShown) {
							hideMenu();
						}
					} else {
						toggleMenu();
					}
					break;
				case 'ArrowDown':
					e.preventDefault();
					selectNext();
					break;
				case 'ArrowUp':
					e.preventDefault();
					selectPrev();
					break;
				default:
			}
		},
		onInputChangeText = (value) => {
			if (disableDirectEntry) {
				return;
			}
			setTextValue(value);

			setIsManuallyEnteringText(true);
			clearTimeout(typingTimeout.current);
			typingTimeout.current = setTimeout(() => {
				searchForMatches(value);
			}, 300);
		},
		onInputBlur = (e) => {
			const {
					relatedTarget
				} = e;

			setIsManuallyEnteringText(false);

			// If user focused on the trigger and text is blank, clear the selection and close the menu
			if ((triggerRef.current === relatedTarget || triggerRef.current.contains(relatedTarget)) && (_.isEmpty(textValue) || _.isNil(textValue))) {
				setSelection([]); // delete current selection
				hideMenu();
				return;
			}
			
			// If user focused on the menu or trigger, ignore this blur
			if (triggerRef.current === relatedTarget ||
				triggerRef.current.contains(relatedTarget) || 
				menuRef.current=== relatedTarget || 
				menuRef.current?.contains(relatedTarget)) {
				return;
			}

			if (!relatedTarget ||
					(
						!inputRef.current.contains(relatedTarget) && 
						triggerRef.current !== relatedTarget && 
						(!menuRef.current || !menuRef.current.contains(relatedTarget))
					)
				) {
				hideMenu();
			}
			if (_.isEmpty(textValue) || _.isNil(textValue)) {
				setSelection([]); // delete current selection

			} else if (getIsManuallyEnteringText()) {
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
			const {
					relatedTarget
				} = e;
			
			if (_.isEmpty(textValue) || _.isNil(textValue)) {
				setSelection([]); // delete current selection
			}

			if (!isMenuShown) {
				return;
			}
			if (!relatedTarget || 
					(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && !menuRef.current.contains(relatedTarget))) {
				hideMenu();
			}
		},
		searchForMatches = async (value) => {

			let found;
			if (Repository) {
				
				// Set filter
				let filter = {};
				if (Repository.isRemote) {
					let searchField = 'q';

					// Check to see if displayField is a real field
					const
						schema = Repository.getSchema(),
						displayFieldName = schema.model.displayProperty;
						displayFieldDef = schema.getPropertyDefinition(displayFieldName);
					if (!displayFieldDef.isVirtual) {
						searchField = displayFieldName + ' LIKE';
					}

					if (!_.isEmpty(value)) {
						value += '%';
					}

					await Repository.filter(searchField, value);
					if (!this.isAutoLoad) {
						await Repository.reload();
					}

				} else {
					throw Error('Not sure if this works yet!');

					// Fuzzy search with getBy filter function
					filter = (entity) => {
						const
							displayValue = entity.displayValue,
							regex = new RegExp('^' + value);
						return displayValue.match(regex);
					};
					Repository.filter(filter);
				}

				setSavedSearch(value);
				const numResults = Repository.entities.length;
				if (!numResults) {
					setSelection([]);
				} else if (numResults === 1) {
					const selection = Repository.entities[0];
					setSelection([selection]);
					setSavedSearch(null);
				}
			
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
		// on render, focus the input
		if (!isRendered) {
			return () => {};
		}
		if (autoFocus && !inputRef.current.isFocused()) {
			inputRef.current.focus();
		}

	}, [isRendered]);

	useEffect(() => {
		if (getIsManuallyEnteringText() && getSavedSearch()) {
			return
		}

		// Adjust text input to match selection
		let localTextValue = getDisplayFromSelection(selection);
		if (!_.isEqual(localTextValue, textValue)) {
			setTextValue(localTextValue);
		}
		setIsManuallyEnteringText(false);
	}, [selection]);


	const refProps = {};
	if (tooltipRef) {
		refProps.ref = tooltipRef;
	}

	const WhichGrid = isEditor ? WindowedGridEditor : Grid;
	
	let comboComponent = <Row {...refProps} justifyContent="center" alignItems="center" h={styles.FORM_COMBO_HEIGHT} flex={1} onLayout={() => setIsRendered(true)}>
								{disableDirectEntry ?
									<Pressable
										onPress={toggleMenu}
										flex={1}
										h="100%"
									>
										<Text
											ref={inputRef}
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
											flex={1}
											h="100%"
											numberOfLines={1}
											ellipsizeMode="head"
											m={0}
											p={2}
											borderWidth={1}
											borderColor="trueGray.400"
											borderTopRightRadius={0}
											borderBottomRightRadius={0}
											fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
											bg={styles.FORM_COMBO_INPUT_BG}
											_focus={{
												bg: styles.FORM_COMBO_INPUT_FOCUS_BG,
											}}
										>{textValue}</Text>
									</Pressable> :
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
										autoSubmitDelay={0}
										borderTopRightRadius={0}
										borderBottomRightRadius={0}
										fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
										bg={styles.FORM_COMBO_INPUT_BG}
										_focus={{
											bg: styles.FORM_COMBO_INPUT_FOCUS_BG,
										}}
										{..._input}
									/>}
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
									// _fade={{
									// 	entryDuration: 0, // Doesn't work, as Popover doesn't have animation controls like Modal does. See node_modules/native-base/src/components/composites/Popover/Popover.tsx line 99 (vs .../composites/Modal/Modal.tsx line 113 which has ..._fade) I added a feature request to NativeBase https://github.com/GeekyAnts/NativeBase/issues/5651
									// }}
									{...props}
								>
									<Popover.Content
										position="absolute"
										top={top + 'px'}
										left={left + 'px'}
										w={width + 'px'}
										h={height ? height + 'px' : null}
										minWidth={menuMinWidth}
										overflow="auto"
										bg="#fff"
									>
										<Popover.Body
											ref={menuRef}
											maxHeight={200}
											borderWidth={1}
											borderColor='trueGray.400'
											borderTopWidth={0}
											p={0}
										>
											<WhichGrid
												showHeaders={false}
												showHovers={true}
												pageSize={100}
												disableAdjustingPageSizeToHeight={true}
												shadow={1}
												getRowProps={() => {
													return {
														borderBottomWidth: 1,
														borderBottomColor: 'trueGray.300',
														py: 1,
														pl: 4,
														pr: 2,
														w: '100%',
													};
												}}
												{...props}
												disablePresetButtons={!isEditor}
												disablePagination={disablePagination}
												setSelection={(selection) => {
													// Decorator fn to add local functionality
													// Close the menu when row is selected on grid
													setSelection(selection);
													if (hideMenuOnSelection) {
														hideMenu();
													}
												}}
												selectionMode={selectionMode}
												setValue={(value) => {
													setValue(value);
												}}
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

export const Combo = withData(
						withValue(
							withSelection(
								ComboComponent
							)
						)
					);



function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					isEditor={true}
					hideMenuOnSelection={false}
					disableView={true}
					disableCopy={true}
					disableDuplicate={true}
					disablePrint={true}
					{...props}
				/>;
	};
}

export const ComboEditor = withAdditionalProps(Combo);

export default Combo;