import React, { useState, useEffect, useRef, } from 'react';
import {
	Icon,
	Modal,
	Popover,
	Pressable,
	Row,
	Text,
	Tooltip,
} from 'native-base';
import {
	UI_MODE_REACT_NATIVE,
	UI_MODE_WEB,
} from '../../../../Constants/UiModes.js';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../../Constants/Editor.js';
import UiGlobals from '../../../../UiGlobals.js';
import Input from '../Input.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import emptyFn from '../../../../Functions/emptyFn.js';
import testProps from '../../../../Functions/testProps.js';
import { Grid, WindowedGridEditor } from '../../../Grid/Grid.js';
import IconButton from '../../../Buttons/IconButton.js';
import CaretDown from '../../../Icons/CaretDown.js';
import Check from '../../../Icons/Check.js';
import Xmark from '../../../Icons/Xmark.js';
import Eye from '../../../Icons/Eye.js';
import _ from 'lodash';

const FILTER_NAME = 'q';

export function ComboComponent(props) {
	const {
			additionalButtons,
			autoFocus = false,
			tooltipRef = null,
			tooltip = null,
			menuMinWidth,
			disableDirectEntry = false,
			hideMenuOnSelection = true,
			showXButton = false,
			showEyeButton = false,
			viewerProps = {}, // popup for eyeButton
			_input = {},
			_editor = {},
			isEditor = false,
			isDisabled = false,
			isInTag = false,
			tooltipPlacement = 'bottom',
			placeholder,
			onRowPress,
			icon,
			Editor, // only used for the eyeButton
			onGridAdd, // to hook into when menu adds (ComboEditor only)
			onGridSave, // to hook into when menu saves (ComboEditor only)
			onGridDelete, // to hook into when menu deletes (ComboEditor only)
			newEntityDisplayProperty,
			testID,

			// withComponent
			self,

			// withAlert
			alert,
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
		displayValueRef = useRef(),
		typingTimeout = useRef(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isViewerShown, setIsViewerShown] = useState(false),
		[viewerSelection, setViewerSelection] = useState([]),
		[isRendered, setIsRendered] = useState(false),
		[isReady, setIsReady] = useState(false),
		[isSearchMode, setIsSearchMode] = useState(false),
		[isNavigatingViaKeyboard, setIsNavigatingViaKeyboard] = useState(false),
		[containerWidth, setContainerWidth] = useState(),
		[gridSelection, setGridSelection] = useState(null),
		[textInputValue, setTextInputValue] = useState(''),
		[newEntityDisplayValue, setNewEntityDisplayValue] = useState(null),
		[filteredData, setFilteredData] = useState(data),
		[width, setWidth] = useState(0),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		onLayout = (e) => {
			setIsRendered(true);
			setContainerWidth(e.nativeEvent.layout.width);
		},
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

				let widthToSet = rect.width,
					minWidthToUse = menuMinWidth || styles.FORM_COMBO_MENU_MIN_WIDTH;
				if (widthToSet < minWidthToUse) {
					widthToSet = minWidthToUse;
				}
				if (widthToSet !== width) {
					setWidth(widthToSet);
				}
			}
			if (Repository && !Repository.isLoaded) {
				// await Repository.load(); // this breaks when the menu (Grid) has selectorSelected
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
		temporarilySetIsNavigatingViaKeyboard = () => {
			setIsNavigatingViaKeyboard(true);
			setTimeout(() => {
				setIsNavigatingViaKeyboard(false);
			}, 1000);
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
						debugger;
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
			resetTextInputValue();
		},
		resetTextInputValue = () => {
			setTextInputValue(getDisplayValue());
		},
		onInputKeyPress = (e, inputValue) => {
			if (disableDirectEntry) {
				return;
			}
			switch(e.key) {
				case 'Escape':
					e.preventDefault();
					setIsSearchMode(false);
					resetTextInputValue();
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
						hideMenu();
						return;
					}

					let id = null;
					if (gridSelection.length && gridSelection[0].id) {
						id = gridSelection[0].id;
					}
					setValue(id);
					hideMenu();
					break;
				case 'ArrowDown':
					e.preventDefault();
					showMenu();
					temporarilySetIsNavigatingViaKeyboard();
					setTimeout(() => {
						self.children.grid.selectNext();
					}, 10);
					break;
				case 'ArrowUp':
					e.preventDefault();
					showMenu();
					temporarilySetIsNavigatingViaKeyboard();
					setTimeout(() => {
						self.children.grid.selectPrev();
					}, 10);
					break;
				default:
			}
		},
		onInputChangeText = (value) => {
			if (disableDirectEntry) {
				return;
			}

			if (_.isEmpty(value)) {
				setValue(null);
			}

			setTextInputValue(value);

			clearTimeout(typingTimeout.current);
			typingTimeout.current = setTimeout(() => {
				searchForMatches(value);
			}, 300);
		},
		onInputFocus = (e) => {
			if (inputRef.current?.select) {
				inputRef.current?.select();
			}
		},
		onInputBlur = (e) => {
			if (isEventStillInComponent(e)) {
				// ignore the blur
				return;
			}

			setIsSearchMode(false);
			resetTextInputValue();
			hideMenu();
		},
		onTriggerPress = (e) => {
			if (!isRendered) {
				return;
			}
			clearGridFilters();
			if (isMenuShown) {
				hideMenu();
			} else {
				showMenu();
			}
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
			resetTextInputValue();
			hideMenu();
		},
		onXButtonPress = () => {
			setValue(null);
			clearGridFilters();
			clearGridSelection();
		},
		onEyeButtonPress = async () => {
			const id = value;
			if (!Repository.isLoaded) {
				await Repository.load();
			}
			if (Repository.isLoading) {
				await Repository.waitUntilDoneLoading();
			}
			let record = Repository.getById(id); // first try to get from entities in memory
			if (!record && Repository.getSingleEntityFromServer) {
				record = await Repository.getSingleEntityFromServer(id);
			}

			if (!record) {
				alert('Record could not be found!');
				return;
			}

			setViewerSelection([record]);
			setIsViewerShown(true);
		},
		onViewerClose = () => setIsViewerShown(false),
		onCheckButtonPress = () => {
			hideMenu();
		},
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
		getFilterName = (isId) => {
			// Only used for remote repositories
			// Gets the filter name of the query, which becomes the condition sent to server 
			let filterName = FILTER_NAME;
			if (Repository.isRemote) {
				const
					schema = Repository.getSchema(),
					displayFieldName = schema.model.displayProperty,
					displayFieldDef = schema.getPropertyDefinition(displayFieldName);
	
				// Verify displayField is a real field
				if (isId) {
					const idFieldName = schema.model.idProperty;
					filterName = idFieldName;
				} else if (!displayFieldDef.isVirtual) {
					filterName = displayFieldName + ' LIKE';
				}
			}
			return filterName;
		},
		clearGridFilters = async () => {
			if (Repository) {
				if (Repository.isLoading) {
					await Repository.waitUntilDoneLoading();
				}
				const filterName = getFilterName();
				if (Repository.hasFilter(filterName)) {
					Repository.clearFilters(filterName);
					if (Repository.isRemote && !Repository.isAutoLoad) {
						await Repository.reload();
					}
				}
			} else {
				setFilteredData(data);
			}
		},
		clearGridSelection = () => {
			if (self?.children.grid?.deselectAll) {
				self?.children.grid?.deselectAll();
			}
		},
		searchForMatches = async (value) => {
			let found;
			if (Repository) {
				if (Repository.isLoading) {
					await Repository.waitUntilDoneLoading();
				}

				if (_.isEmpty(value)) {
					clearGridFilters();
					return;
				}

				// Set filter
				const
					idRegex = /^id:(.*)$/,
					isId = _.isString(value) && !!value.match(idRegex),
					filterName = getFilterName(isId);
				if (Repository.isRemote) {
					// remote
					const filterValue = _.isEmpty(value) ? null : (isId ? value.match(idRegex)[1] : value + '%');
					await Repository.filter(filterName, filterValue);
					if (!Repository.isAutoLoad) {
						await Repository.reload();
					}
				} else {
					// local
					Repository.filter({
						name: filterName,
						fn: (entity) => {
							const
								displayValue = entity.displayValue,
								regex = new RegExp('^' + value);
							return displayValue.match(regex);
						},
					});
				}

				setNewEntityDisplayValue(value); // capture the search query so we can tell Grid what to use for a new entity's displayValue
			
			} else {
				// Search through data
				const regex = new RegExp('^' + value);
				found = _.filter(data, (item) => {
					if (_.isString(item[displayIx]) && _.isString(value)) {
						return item[displayIx].match(regex);
					}
					return item[displayIx] == value; // equality, not identity
				});
				setFilteredData(found);
			}

			if (!isMenuShown) {
				showMenu();
			}
			setIsSearchMode(true);
		};

	useEffect(() => {
		// on render, focus the input
		if (!isRendered) {
			return () => {};
		}
		if (autoFocus && !inputRef.current.isFocused()) {
			inputRef.current.focus();
		}

		return () => {
			if (Repository && !Repository.isUnique && !Repository.isDestroyed) {
				clearGridFilters();
			}
		};

	}, [isRendered]);

	useEffect(() => {
		(async () => {
			setIsSearchMode(false);
			await setDisplayValue(value);
			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, [value]);

	if (!isReady) {
		return null;
	}

	const inputIconElement = icon ? <Icon as={icon} color="trueGray.300" size="md" ml={2} mr={3} /> : null;
	let xButton = null,
		eyeButton = null,
		inputAndTrigger = null,
		checkButton = null,
		grid = null,
		dropdownMenu = null,
		assembledComponents = null;
	
	if (showXButton && !_.isNil(value)) {
		xButton = <IconButton
						{...testProps('xBtn')}
						_icon={{
							as: Xmark,
							color: 'trueGray.600',
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={onXButtonPress}
						h="100%"
						bg={styles.FORM_COMBO_TRIGGER_BG}
						_hover={{
							bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
						}}
						mr={1}
					/>;
	}
	if (showEyeButton && Editor && !_.isNil(value)) {
		eyeButton = <IconButton
						{...testProps('eyeBtn')}
						_icon={{
							as: Eye,
							color: 'trueGray.600',
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={onEyeButtonPress}
						h="100%"
						bg={styles.FORM_COMBO_TRIGGER_BG}
						_hover={{
							bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
						}}
						mr={1}
					/>;
	}

	if (UiGlobals.mode === UI_MODE_WEB) {
		inputAndTrigger = <>
							{disableDirectEntry ?
								<Pressable
									{...testProps('toggleMenuBtn')}
									onPress={toggleMenu}
									flex={1}
									h="100%"
									flexDirection="row"
									justifyContent="center"
									alignItems="center"
									borderWidth={1}
									borderColor="trueGray.400"
									borderTopRightRadius={0}
									borderBottomRightRadius={0}
									bg={styles.FORM_COMBO_INPUT_BG}
									m={0}
									p={2}
								>
									{inputIconElement}
									<Text
										ref={inputRef}
										flex={1}
										h="100%"
										numberOfLines={1}
										ellipsizeMode="head"
										fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
										color={_.isEmpty(textInputValue) ? 'trueGray.400' : '#000'}
									>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</Text>
								</Pressable> :
								<Input
									{...testProps('input')}
									ref={inputRef}
									reference="ComboInput"
									value={textInputValue}
									autoSubmit={true}
									isDisabled={isDisabled}
									onChangeValue={onInputChangeText}
									onKeyPress={onInputKeyPress}
									onFocus={onInputFocus}
									onBlur={onInputBlur}
									flex={1}
									h="100%"
									m={0}
									InputLeftElement={inputIconElement}
									autoSubmitDelay={500}
									borderTopRightRadius={0}
									borderBottomRightRadius={0}
									fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
									bg={styles.FORM_COMBO_INPUT_BG}
									_focus={{
										bg: styles.FORM_COMBO_INPUT_FOCUS_BG,
									}}
									placeholder={placeholder}
									{..._input}
								/>}
							<IconButton
								{...testProps('trigger')}
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
						</>;
	}

	if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
		// This input and trigger are for show
		// They just show the current getDisplayValue and open the menu
		const displayValue = getDisplayValue();
		inputAndTrigger = <>
							<Pressable
								{...testProps('showMenuBtn')}
								onPress={showMenu}
								flex={1}
								flexDirection="row"
								justifyContent="center"
								alignItems="center"
								borderWidth={1}
								borderColor="trueGray.400"
								borderTopRightRadius={0}
								borderBottomRightRadius={0}
								bg={styles.FORM_COMBO_INPUT_BG}
								h="100%"
							>
								{inputIconElement}
								<Text
									flex={1}
									h="100%"
									numberOfLines={1}
									ellipsizeMode="head"
									m={0}
									p={2}
									color={_.isEmpty(displayValue) ? 'trueGray.400' : '#000'}
									fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
								>{_.isEmpty(displayValue) ? placeholder : displayValue}</Text>
							</Pressable>
							<IconButton
								{...testProps('trigger')}
								ref={triggerRef}
								_icon={{
									as: CaretDown,
									color: 'primary.800',
									size: 'sm',
								}}
								isDisabled={isDisabled}
								onPress={onTriggerPress}
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
						</>;
	}

	if (isMenuShown) {
		const gridProps = _.pick(props, [
			'Editor',
			'model',
			'Repository',
			// 'data',
			'idIx',
			'displayIx',
			'value',
			'disableView',
			'disableCopy',
			'disableDuplicate',
			'disablePrint',
			'selectorId',
			'selectorSelected',
			'usePermissions',
		]);
		const WhichGrid = isEditor ? WindowedGridEditor : Grid;
		grid = <WhichGrid
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
					data={filteredData}
					reference="grid"
					parent={self}
					h={UiGlobals.mode === UI_MODE_WEB ? styles.FORM_COMBO_MENU_HEIGHT + 'px' : null}
					newEntityDisplayValue={newEntityDisplayValue}
					newEntityDisplayProperty={newEntityDisplayProperty}
					disablePresetButtons={!isEditor}
					alternateRowBackgrounds={false}
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
								resetTextInputValue();
								if (hideMenuOnSelection && !isNavigatingViaKeyboard && !isEditor) {
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
								resetTextInputValue();
								if (hideMenuOnSelection && !isNavigatingViaKeyboard) {
									hideMenu();
								}
								return;
							}

							setValue(selection[0] ? selection[0][idIx] : null);

						}

						if (_.isEmpty(selection)) {
							return;
						}

						if (hideMenuOnSelection && !isNavigatingViaKeyboard && !isEditor) {
							hideMenu();
						}

					}}
					onAdd={(selection) => {
						const entity = _.isArray(selection) ? selection[0] : selection;
						if (entity.id !== value && !isInTag) {
							// Select it and set the value of the combo.
							setGridSelection(selection);
							setValue(entity.id);
						}
						if (onGridAdd) {
							onGridAdd(selection);
						}
					}}
					onSave={(selection) => {
						const entity = _.isArray(selection) ? selection[0] : selection;
						if (!isInTag) {
							if (entity?.id !== value) { // Tag doesn't use value, so don't do this comparison in the Tag
								// Either a phantom record was just solidified into a real record, or a new (non-phantom) record was added.
								// Select it and set the value of the combo.
								setGridSelection(selection);
								setValue(entity.id);
							} else {
								// we're not changing the Combo's value, but we might still need to change its displayValue
								setDisplayValue(entity.id);
							}
						}
						if (onGridSave) {
							onGridSave(selection);
						}
					}}
					onDelete={onGridDelete}
					onRowPress={(item, e) => {
						if (onRowPress) {
							onRowPress(item, e);
							return;
						}
						const id = Repository ? item.id : item[idIx];
						if (id === value && !isEditor) {
							hideMenu();
							onInputFocus();
						}
					}}
					{..._editor}
				/>;
		if (UiGlobals.mode === UI_MODE_WEB) {
			dropdownMenu = <Popover
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
										{grid}
									</Popover.Body>
								</Popover.Content>
							</Popover>;
		}
		if (UiGlobals.mode === UI_MODE_REACT_NATIVE) {
			if (isEditor) {
				// in RN, an editor has no way to accept the selection of the grid, so we need to add a check button to do this
				checkButton = <IconButton
								{...testProps('checkBtn')}
								_icon={{
									as: Check,
									color: 'trueGray.600',
									size: 'sm',
								}}
								onPress={onCheckButtonPress}
								isDisabled={!value}
								h="100%"
								borderWidth={1}
								borderColor="#bbb"
								borderRadius="md"
								bg={styles.FORM_COMBO_TRIGGER_BG}
								_hover={{
									bg: styles.FORM_COMBO_TRIGGER_HOVER_BG,
								}}
							/>;
			}
			const inputAndTriggerClone = // for RN, this is the actual input and trigger, as we need them to appear up above in the modal
				<Row h={10}>
					{xButton}
					{eyeButton}
					{disableDirectEntry ?
						<Text
							ref={inputRef}
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
						>{textInputValue}</Text> :
						<Input
							{...testProps('input')}
							ref={inputRef}
							reference="ComboInput"
							value={textInputValue}
							autoSubmit={true}
							isDisabled={isDisabled}
							onChangeValue={onInputChangeText}
							onKeyPress={onInputKeyPress}
							onFocus={onInputFocus}
							onBlur={onInputBlur}
							flex={1}
							h="100%"
							m={0}
							InputLeftElement={inputIconElement}
							autoSubmitDelay={500}
							borderTopRightRadius={0}
							borderBottomRightRadius={0}
							fontSize={styles.FORM_COMBO_INPUT_FONTSIZE}
							bg={styles.FORM_COMBO_INPUT_BG}
							_focus={{
								bg: styles.FORM_COMBO_INPUT_FOCUS_BG,
							}}
							placeholder={placeholder}
							{..._input}
						/>}
					<IconButton
						{...testProps('hideMenuBtn')}
						_icon={{
							as: CaretDown,
							color: 'primary.800',
							size: 'sm',
						}}
						isDisabled={isDisabled}
						onPress={() => hideMenu()}
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
					{checkButton}
				</Row>;
			dropdownMenu = <Modal
								isOpen={true}
								safeAreaTop={true}
								onClose={() => setIsMenuShown(false)}
								mt="auto"
								mb="auto"
								w="100%"
								h={400}
								p={5}
							>
								{inputAndTriggerClone}
								{grid}
							</Modal>;
		}
	}

	const refProps = {};
	if (tooltipRef) {
		refProps.ref = tooltipRef;
	}

	if (isRendered && additionalButtons?.length && containerWidth < 500) {
		// be responsive for small screen sizes and bump additionalButtons to the next line
		assembledComponents = 
			<Column testID={testID}>
				<Row {...refProps} justifyContent="center" alignItems="center" flex={1} h="100%">
					{xButton}
					{eyeButton}
					{inputAndTrigger}
					{dropdownMenu}
				</Row>
				<Row mt={2}>
					{additionalButtons}
				</Row>
			</Column>;
	} else {
		assembledComponents = 
			<Row testID={testID} {...refProps} justifyContent="center" alignItems="center" flex={1} h="100%" onLayout={onLayout}>
				{xButton}
				{eyeButton}
				{inputAndTrigger}
				{additionalButtons}
				{dropdownMenu}
			</Row>;
	}
	
	if (isViewerShown && Editor) {
		const propsForViewer = _.pick(props, [
			'disableCopy',
			'disableDuplicate',
			'disablePrint',
			'disableView',
			'value',
			'Repository',
			'data',
			'displayField',
			'displayIx',
			'fields',
			'idField',
			'idIx',
			'model',
			'name',
		]);
		assembledComponents = 
				<>
					{assembledComponents}
					<Modal
						isOpen={true}
						onClose={onViewerClose}
					>
						<Editor
							{...propsForViewer}
							editorType={EDITOR_TYPE__WINDOWED}
							isEditorViewOnly={true}
							{...viewerProps}
							px={0}
							py={0}
							w="100%"
							parent={self}
							reference="viewer"
							selection={viewerSelection}
							onEditorClose={onViewerClose}
						/>
					</Modal>
				</>;
	}
	
	if (tooltip) {
		assembledComponents = <Tooltip label={tooltip} placement={tooltipPlacement} h="100%">
								{assembledComponents}
							</Tooltip>;
	}
	
	return assembledComponents;
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