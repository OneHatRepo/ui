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
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import emptyFn from '../../../../Functions/emptyFn.js';
import { Grid, WindowedGridEditor } from '../../../Grid/Grid.js';
import IconButton from '../../../Buttons/IconButton.js';
import CaretDown from '../../../Icons/CaretDown.js';
import Xmark from '../../../Icons/Xmark.js';
import _ from 'lodash';

export function ComboComponent(props) {
	const {
			additionalButtons,
			autoFocus = false,
			tooltipRef = null,
			tooltip = null,
			menuMinWidth = 150,
			disableDirectEntry = false,
			hideMenuOnSelection = true,
			showXButton = false,
			_input = {},
			isEditor = false,
			isDisabled = false,
			tooltipPlacement = 'bottom',
			onRowPress,

			// withComponent
			self,

			// withAlert
			confirm,
			
			// withData
			Repository,
			data,
			idIx,
			displayIx,

			// withValue
			value,
			setValue,
		} = props,
		styles = UiGlobals.styles,
		inputRef = useRef(),
		triggerRef = useRef(),
		menuRef = useRef(),
		displayValueRef = useRef(null),
		savedSearch = useRef(null),
		typingTimeout = useRef(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[isReady, setIsReady] = useState(false),
		[isSearchMode, setIsSearchMode] = useState(false),
		[gridSelection, setGridSelection] = useState(null),
		[textInputValue, setTextInputValue] = useState(''),
		[newEntityDisplayValue, setNewEntityDisplayValue] = useState(null),
		[width, setWidth] = useState(0),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		showMenu = async () => {
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
				} else {
					// Menu is above the combo
					const rectTop = rect.top - styles.FORM_COMBO_MENU_HEIGHT;
					if (rectTop !== top) {
						setTop(rectTop);
					}
				}
				if (rect.left !== left) {
					setLeft(rect.left);
				}
				if (rect.width !== width) {
					setWidth(rect.width);
				}
			}
			if (Repository && !Repository.isLoaded) {
				await Repository.load();
			}
			setIsMenuShown(true);
		},
		hideMenu = () => {
			if (!isMenuShown) {
				return;
			}
			setIsMenuShown(false);
		},
		toggleMenu = () => {
			setIsMenuShown(!isMenuShown);
		},
		getSavedSearch = () => {
			return savedSearch.current;
		},
		setSavedSearch = (val) => {
			savedSearch.current = val;
		},
		resetInputTextValue = () => {
			setTextInputValue(getDisplayValue());
		},
		onInputKeyPress = (e, inputValue) => {
			if (disableDirectEntry) {
				return;
			}
			switch(e.key) {
				case 'Escape':
					setIsSearchMode(false);
					resetInputTextValue();
					hideMenu();
					break;
				case 'Enter':
					e.preventDefault();
					if (_.isEmpty(inputValue) && !_.isNull(value)) {
						// User pressed Enter on an empty text field, but value is set to something
						// This means the user cleared the input and pressed enter, meaning he wants to clear the value
						setValue(null);
						hideMenu();
						return;
					}
					
					if (_.isEmpty(gridSelection)) {
						confirm('You have nothing selected in the dropdown menu. Clear value?', doIt, true);
						return;
					}

					doIt();

					function doIt() {
						setValue(gridSelection?.id);
						hideMenu();
					}
					break;
				// case 'ArrowDown':
				// 	e.preventDefault();
				// 	showMenu();
				// 	selectNext();
				// 	setTimeout(() => {
				// 		if (!self.children?.dropdownGrid?.selectPrev) {
				// 			debugger;
				// 		}
				// 		self.children.dropdownGrid.selectNext();
				// 	}, 10);
				// 	break;
				// case 'ArrowUp':
				// 	e.preventDefault();
				// 	showMenu();
				// 	selectPrev();
				// 	setTimeout(() => {
				// 		self.children.dropdownGrid.selectPrev();
				// 	}, 10);
				// 	break;
				default:
			}
		},
		onInputChangeText = (value) => {
			if (disableDirectEntry) {
				return;
			}

			if (_.isEmpty(value)) {
				// text input is cleared
				hideMenu();
				return;
			}

			setTextInputValue(value);
			showMenu();

			clearTimeout(typingTimeout.current);
			typingTimeout.current = setTimeout(() => {
				searchForMatches(value);
			}, 300);
		},
		onInputFocus = (e) => {
			inputRef.current.select();
		},
		onInputBlur = (e) => {
			if (isEventStillInComponent(e)) {
				// ignore the blur
				return;
			}

			setIsSearchMode(false);
			resetInputTextValue();
			hideMenu();
		},
		onTriggerPress = (e) => {
			if (!isRendered) {
				return;
			}
			clearGridFilters();
			showMenu();
		},
		onTriggerBlur = (e) => {
			if (!isMenuShown) {
				return;
			}

			if (isEventStillInComponent(e)) {
				// ignore the blur
				return;
			}

			setIsSearchMode(false);
			resetInputTextValue();
			hideMenu();
		},
		onClearBtn = () => {
			setTextInputValue('');
			setValue(null);
		}
		isEventStillInComponent = (e) => {
			const {
					relatedTarget
				} = e;
			return !relatedTarget ||
					!menuRef.current ||
					!triggerRef.current ||
					triggerRef.current === relatedTarget ||
					triggerRef.current.contains(relatedTarget) || 
					menuRef.current === relatedTarget || 
					menuRef.current?.contains(relatedTarget);
		},
		clearGridFilters = async () => {
			if (Repository) {
				if (Repository.isLoading) {
					await Repository.waitUntilDoneLoading();
				}
				
				// clear filter
				if (Repository.isRemote) {
					let searchField = 'q';
					const searchValue = null;

					// Check to see if displayField is a real field
					const
						schema = Repository.getSchema(),
						displayFieldName = schema.model.displayProperty,
						displayFieldDef = schema.getPropertyDefinition(displayFieldName);
					if (!displayFieldDef.isVirtual) {
						searchField = displayFieldName + ' LIKE';
					}

					Repository.clear();
					await Repository.filter(searchField, searchValue);
					if (!this.isAutoLoad) {
						await Repository.reload();
					}

				} else {
					throw Error('Not yet implemented');
				}

				setSavedSearch(null);
			
			} else {
				// throw Error('Not yet implemented');
			}
		},
		searchForMatches = async (value) => {
			if (!isMenuShown) {
				showMenu();
			}

			setIsSearchMode(true);

			let found;
			if (Repository) {
				if (Repository.isLoading) {
					await Repository.waitUntilDoneLoading();
				}
				
				// Set filter
				let filter = {};
				if (Repository.isRemote) {
					let searchField = 'q';
					const searchValue = _.isEmpty(value) ? null : value + '%';

					// Check to see if displayField is a real field
					const
						schema = Repository.getSchema(),
						displayFieldName = schema.model.displayProperty,
						displayFieldDef = schema.getPropertyDefinition(displayFieldName);
					if (!displayFieldDef.isVirtual) {
						searchField = displayFieldName + ' LIKE';
					}

					await Repository.filter(searchField, searchValue);
					if (!this.isAutoLoad) {
						await Repository.reload();
					}

				} else {
					throw Error('Not yet implemented');

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
				setNewEntityDisplayValue(value); // capture the search query so we can tell Grid what to use for a new entity's displayValue
			
			} else {

				throw Error('Not yet implemented'); // NOTE: When implementing this, also implement clearGridFilters

				// Search through data
				found = _.find(data, (item) => {
					if (_.isString(item[displayIx]) && _.isString(value)) {
						return item[displayIx].toLowerCase() === value.toLowerCase();
					}
					return item[displayIx] === value;
				});
				// if (found) {
				// 	const
				// 		newSelection = [found];

				// 	setTextInputValue(newTextValue);
				// }
			}
		},
		getDisplayValue = () => {
			return displayValueRef.current;
		},
		setDisplayValue = async (value) => {
			let displayValue = '';
			if (_.isNil(value)) {
				// do nothing
			} else if (_.isArray(value)) {
				displayValue = [];
				if (Repository) {
					if (!Repository.isLoaded) {
						throw Error('Not yet implemented'); // Would a Combo ever have multiple remote selections? Shouldn't that be a Tag field??
					}
					if (Repository.isLoading) {
						await Repository.waitUntilDoneLoading();
					}
					displayValue = _.each(value, (id) => {
						const entity = Repository.getById(id);
						if (entity) {
							displayValue.push(entity.displayValue)
						}
					});
				} else {
					displayValue = _.each(value, (id) => {
						const item = _.find(data, (datum) => datum[idIx] === id);
						if (item) {
							displayValue.push(item[displayIx]);
						}
					});
				}
				displayValue = displayValue.join(', ');
			} else {
				if (Repository) {
					let entity;
					if (!Repository.isLoaded) {
						entity = await Repository.getSingleEntityFromServer(value);
					} else {
						if (Repository.isLoading) {
							await Repository.waitUntilDoneLoading();
						}
						entity = Repository.getById(value);
					}
					displayValue = entity?.displayValue || '';
				} else {
					const item = _.find(data, (datum) => datum[idIx] === value);
					displayValue = (item && item[displayIx]) || '';
				}
			}

			displayValueRef.current = displayValue;
		};

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
		(async () => {
			setIsSearchMode(false);
			await setDisplayValue(value);
			resetInputTextValue();
			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, [value]);

	if (!isReady) {
		return null;
	}

	if (self) {
		self.clear = onClearBtn;
	}

	const refProps = {};
	if (tooltipRef) {
		refProps.ref = tooltipRef;
	}

	const gridProps = _.pick(props, [
		'Editor',
		'model',
		'Repository',
		'data',
		'idIx',
		'displayIx',
		'value',
		'disableView',
		'disableCopy',
		'disableDuplicate',
		'disablePrint',
	]);

	const WhichGrid = isEditor ? WindowedGridEditor : Grid;
	
	let comboComponent = <Row {...refProps} justifyContent="center" alignItems="center" h={styles.FORM_COMBO_HEIGHT} flex={1} onLayout={() => setIsRendered(true)}>
								{showXButton && !_.isNil(value) && 
									<IconButton
										_icon={{
											as: Xmark,
											color: 'trueGray.600',
											size: 'sm',
										}}
										isDisabled={isDisabled}
										onPress={onClearBtn}
										h="100%"
										bg={styles.FORM_COMBO_TRIGGER_BG}
										_hover={{
											bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
										}}
									/>}
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
										>{textInputValue}</Text>
									</Pressable> :
									<Input
										ref={inputRef}
										value={textInputValue}
										autoSubmit={true}
										isDisabled={isDisabled}
										onChangeValue={onInputChangeText}
										onKeyPress={onInputKeyPress}
										onFocus={onInputFocus}
										onBlur={onInputBlur}
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
									isDisabled={isDisabled}
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
										minWidth={menuMinWidth}
										overflow="auto"
										bg="#fff"
									>
										<Popover.Body
											ref={menuRef}
											borderWidth={1}
											borderColor='trueGray.400'
											borderTopWidth={0}
											p={0}
										>
											<WhichGrid
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
														w: '100%',
													};
												}}
												autoAdjustPageSizeToHeight={false}
												{...gridProps}
												reference="dropdownGrid"
												parent={self}
												h={styles.FORM_COMBO_MENU_HEIGHT + 'px'}
												newEntityDisplayValue={newEntityDisplayValue}
												disablePresetButtons={!isEditor}
												onChangeSelection={(selection) => {

													if (Repository && selection[0]?.isPhantom) {
														// do nothing
														return;
													}

													setGridSelection(selection);

													if (Repository) {

														// When we first open the menu, we try to match the selection to the value, ignore this
														if (selection[0]?.displayValue === getDisplayValue()) {
															return;
														}

														// when user selected the record matching the current value, kill search mode
														if (selection[0]?.id === value) {
															setIsSearchMode(false);
															resetInputTextValue();
															if (hideMenuOnSelection) {
																hideMenu();
															}
															return;
														}

														setValue(selection[0] ? selection[0].id : null);

													} else {

														// When we first open the menu, we try to match the selection to the value, ignore this
														if (selection[0] && selection[0][displayIx] === getDisplayValue()) {
															return;
														}

														// when user selected the record matching the current value, kill search mode
														if (selection[0] && selection[0][idIx] === value) {
															setIsSearchMode(false);
															resetInputTextValue();
															if (hideMenuOnSelection) {
																hideMenu();
															}
															return;
														}

														setValue(selection[0] ? selection[0][idIx] : null);

													}

													if (_.isEmpty(selection)) {
														return;
													}

													if (hideMenuOnSelection && !isEditor) {
														hideMenu();
													}

												}}
												onSave={(selection) => {
													const entity = selection[0];
													if (entity?.id !== value) {
														// Either a phantom record was just solidified into a real record, or a new (non-phantom) record was added.
														// Select it and set the value of the combo.
														setGridSelection([entity]);
														const id = entity.id;
														setValue(id);
													}
												}}
												onRowPress={(item, e) => {
													if (onRowPress) {
														onRowPress(item, e);
														return;
													}
													const id = Repository ? item.id : item[idIx];
													if (id === value) {
														hideMenu();
														onInputFocus();
													}
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

export const Combo = withComponent(
						withAlert(
							withData(
								withValue(
									ComboComponent
								)
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