import { forwardRef, useState, useEffect, useRef, } from 'react';
import {
	Box,
	HStack,
	HStackNative,
	Icon,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Popover, PopoverBackdrop, PopoverContent, PopoverBody,
	Pressable,
	Text,
	TextNative,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_NATIVE,
	UI_MODE_WEB,
} from '../../../../Constants/UiModes.js';
import {
	EDITOR_TYPE__WINDOWED,
} from '../../../../Constants/Editor.js';
import testProps from '../../../../Functions/testProps.js';
import UiGlobals from '../../../../UiGlobals.js';
import Input from '../Input.js';
import { Grid, WindowedGridEditor } from '../../../Grid/Grid.js';
import withAlert from '../../../Hoc/withAlert.js';
import withComponent from '../../../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import emptyFn from '../../../../Functions/emptyFn.js';
import IconButton from '../../../Buttons/IconButton.js';
import CaretDown from '../../../Icons/CaretDown.js';
import Check from '../../../Icons/Check.js';
import Xmark from '../../../Icons/Xmark.js';
import Eye from '../../../Icons/Eye.js';
import _ from 'lodash';

const FILTER_NAME = 'q';

/**
 * isEmptyValue
 * _.isEmpty returns true for all integers, so we need this instead
 * @param {*} value 
 * @returns boolean
 */
function isEmptyValue(value) {
	return value === null ||
			value === undefined ||
			value === '' ||
			value === 0 ||
			(_.isObject(value) && _.isEmpty(value));
};

function getRowProps() {
	return {
		className: clsx(
			'w-full',
			'pl-4',
			'pr-2',
			'py-1',
			'border-b-1',
			'border-grey-300',
			CURRENT_MODE === UI_MODE_NATIVE ? {
				'min-h-[50px]': true,
				'h-[50px]': true,
			} : {},
		),
	};
}

export const ComboComponent = forwardRef((props, ref) => {

	const {
			additionalButtons,
			autoFocus = false,
			menuMinWidth,
			disableDirectEntry = false,
			hideMenuOnSelection = true,
			showXButton = false,
			showEyeButton = false,
			viewerProps = {}, // popup for eyeButton
			_input = {},
			_editor = {},
			_grid = {},
			isEditor = false,
			isDisabled = false,
			isInTag = false,
			minimizeForRow = false,
			reloadOnTrigger = false,
			searchHasInitialPercent = false,
			menuHeight,
			placeholder,
			onRowPress,
			icon,
			Editor, // only used for the eyeButton
			onGridAdd, // to hook into when menu adds (ComboEditor only)
			onGridSave, // to hook into when menu saves (ComboEditor only)
			onGridDelete, // to hook into when menu deletes (ComboEditor only)
			onSubmit, // when Combo is used in a Tag, call this when the user submits the Combo value (i.e. presses Enter or clicks a row)
			newEntityDisplayProperty,
			tooltip = null,
			tooltipPlacement = 'bottom',
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
		inputCloneRef = useRef(),
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
		[inputHeight, setInputHeight] = useState(0),
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
			if (CURRENT_MODE === UI_MODE_WEB && inputRef.current?.getBoundingClientRect) {
				// For web, ensure it's in the proper place
				const
					rect = inputRef.current.getBoundingClientRect(),
					inputRect = inputRef.current.getBoundingClientRect();

				if (rect.top !== top) {
					setTop(rect.top);
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

				setInputHeight(inputRect.height);
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
					if (!Repository.isDestroyed) {
						if (!Repository.isLoaded) {
							throw Error('Not yet implemented'); // Would a Combo ever have multiple remote selections? Shouldn't that be a Tag field??
						}
						if (Repository.isLoading) {
							await Repository.waitUntilDoneLoading();
						}
						displayValue = _.each(value, (id) => {
							const entity = Repository.getById(id);
							if (entity) {
								displayValue.push(entity.displayValue);
							}
						});
					}
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
					if (!Repository.isDestroyed) {
						let entity;
						if (!isEmptyValue(value)) {
							if (!Repository.isLoaded) {
								entity = await Repository.getSingleEntityFromServer(value);
							} else {
								if (Repository.isLoading) {
									await Repository.waitUntilDoneLoading();
								}
								entity = Repository.getById(value);
								if (!entity) {
									entity = await Repository.getSingleEntityFromServer(value);
								}
							}
						}
						displayValue = entity?.displayValue || '';
					}
				} else {
					const item = _.find(data, (datum) => datum[idIx] === value);
					displayValue = (item && item[displayIx]) || '';
				}
			}

			if (isInTag) {
				displayValue = '';
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
					if (gridSelection.length) {
						id = Repository ? gridSelection[0].id : gridSelection[0][idIx];
					}
					if (id !== value) {
						setValue(id);
					}
					if (onSubmit) {
						onSubmit(id);
					}
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
		onTriggerPress = async (e) => {
			if (!isRendered) {
				return;
			}
			clearGridFilters();
			if (reloadOnTrigger && Repository) {
				await Repository.reload();
			}
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
				if (!Repository.isDestroyed) {
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
				if (!Repository.isDestroyed) {
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
						const filterValue = _.isEmpty(value) ? null : (isId ? value.match(idRegex)[1] : (searchHasInitialPercent ? '%' : '') + value + '%');
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
									regex = new RegExp('^' + value, 'i'); // case-insensitive
								return displayValue.match(regex);
							},
						});
					}

					if (!isId) {
						setNewEntityDisplayValue(value); // capture the search query so we can tell Grid what to use for a new entity's displayValue
					}
				}
			} else {
				// Search through data
				const regex = new RegExp('^' + value, 'i'); // case-insensitive
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

	const inputIconElement = icon ? <Icon as={icon} size="md" className="text-grey-300 ml-1 mr-2" /> : null;
	let xButton = null,
		eyeButton = null,
		trigger = null,
		input = null,
		inputClone = null,
		checkButton = null,
		grid = null,
		dropdownMenu = null,
		assembledComponents = null;
	
	if (showXButton) {
		xButton = <IconButton
						{...testProps('xBtn')}
						icon={Xmark}
						_icon={{
							size: 'sm',
							className: 'text-grey-600',
						}}
						isDisabled={isDisabled || _.isNil(value)}
						onPress={onXButtonPress}
						tooltip="Clear selection"
						className={clsx(
							'h-full',
							'mr-1',
							styles.FORM_COMBO_TRIGGER_CLASSNAME
						)}
					/>;
	}
	if (showEyeButton && Editor) {
		eyeButton = <IconButton
						{...testProps('eyeBtn')}
						icon={Eye}
						_icon={{
							size: 'sm',
							className: 'text-grey-600',
						}}
						isDisabled={isDisabled || _.isNil(value)}
						onPress={onEyeButtonPress}
						tooltip="View selected record"
						className={clsx(
							'h-full',
							'mr-1',
							styles.FORM_COMBO_TRIGGER_CLASSNAME
						)}
					/>;
	}
	const triggerClassName = clsx(
		'Combo-trigger',
		'self-stretch',
		'h-auto',
		'border',
		'border-l-0',
		'border-gray-400',
		'rounded-l-none',
		'rounded-r-md',
		styles.FORM_COMBO_TRIGGER_CLASSNAME,
	);
	trigger = <IconButton
				{...testProps('trigger')}
				ref={triggerRef}
				icon={CaretDown}
				_icon={{
					size: 'md',
					className: 'text-grey-500',
				}}
				isDisabled={isDisabled}
				onPress={onTriggerPress}
				onBlur={onTriggerBlur}
				className={triggerClassName}
			/>;

	if (CURRENT_MODE === UI_MODE_WEB) {
		input = disableDirectEntry ?
					<Pressable
						{...testProps('toggleMenuBtn')}
						ref={inputRef}
						onPress={toggleMenu}
						className={clsx(
							'Combo-toggleMenuBtn',
							'h-auto',
							'self-stretch',
							'flex-1',
							'flex-row',
							'justify-center',
							'items-center',
							'm-0',
							'p-2',
							'bg-white',
							'border',
							'border-grey-400',
							'rounded-r-none',
							styles.FORM_COMBO_INPUT_BG
						)}
					>
						{inputIconElement}
						<TextNative
							numberOfLines={1}
							ellipsizeMode="head"
							className={clsx(
								'Combo-TextNative',
								'flex-1',
								_.isEmpty(textInputValue) ? 'text-grey-400' : 'text-black',
								styles.FORM_COMBO_INPUT_CLASSNAME
							)}
						>{_.isEmpty(textInputValue) ? placeholder : textInputValue}</TextNative>
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
						InputLeftElement={inputIconElement}
						autoSubmitDelay={500}
						placeholder={placeholder}
						tooltip={tooltip}
						tooltipPlacement={tooltipPlacement}
						tooltipTriggerClassName={clsx(
							'grow',
							'h-auto',
							'self-stretch',
							'flex-1'
						)}
						className={clsx(
							'Combo-Input',
							'grow',
							'h-auto',
							'self-stretch',
							'flex-1',
							'm-0',
							'rounded-tr-none',
							'rounded-br-none',
							styles.FORM_COMBO_INPUT_CLASSNAME
						)}
						{..._input}
					/>;
	}
	if (CURRENT_MODE === UI_MODE_NATIVE) {
		// This input and trigger are for show
		// They just show the current getDisplayValue and open the menu
		const displayValue = getDisplayValue();
		input = <Pressable
					{...testProps('showMenuBtn')}
					onPress={showMenu}
					className={clsx(
						'h-full',
						'flex-1',
						'flex-row',
						'justify-center',
						'items-center',
						'bg-white',
						'border',
						'border-grey-400',
						'rounded-r-none',
						styles.FORM_COMBO_INPUT_BG,
					)}
				>
					{inputIconElement}
					<TextNative
						numberOfLines={1}
						ellipsizeMode="head"
						className={clsx(
							// 'h-full',
							// 'flex-1',
							'm-0',
							'p-2',
							_.isEmpty(displayValue) ? 'text-grey-400' : 'text-black',
							styles.FORM_COMBO_INPUT_CLASSNAME,
						)}
					>{_.isEmpty(displayValue) ? placeholder : displayValue}</TextNative>
				</Pressable>;
	}

	if (isMenuShown) {
		const gridProps = _.pick(props, [
			'Editor',
			'model',
			'Repository',
			// 'data',
			'idIx',
			'displayIx',
			// 'value',
			'disableView',
			'disableCopy',
			'disableDuplicate',
			'disablePrint',
			'selectorId',
			'selectorSelected',
			'selectorSelectedField',
			'usePermissions',
		]);
		if (!_.isEmpty(_grid)){
			_.assign(gridProps, _grid);
		}
		if (!isInTag) {
			gridProps.value = props.value;
		}
		if (!Repository) {
			gridProps.data = filteredData;
		}
		const WhichGrid = isEditor ? WindowedGridEditor : Grid;
		const gridStyle = {};
		if (CURRENT_MODE === UI_MODE_WEB) {
			gridStyle.height = menuHeight || styles.FORM_COMBO_MENU_HEIGHT;
		}
		let gridClassName = clsx(
			'h-full',
			'w-full',
		);
		if (CURRENT_MODE === UI_MODE_NATIVE) {
			gridClassName += ' h-[400px] max-h-[100%]';
		}
		grid = <WhichGrid
					showHeaders={false}
					showHovers={true}
					getRowProps={getRowProps}
					autoAdjustPageSizeToHeight={false}
					newEntityDisplayValue={newEntityDisplayValue}
					newEntityDisplayProperty={newEntityDisplayProperty}
					disablePresetButtons={!isEditor}
					alternateRowBackgrounds={false}
					showSelectHandle={false}
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
						if (onSubmit) {
							onSubmit(id);
						}
					}}
					reference="grid"
					parent={self}
					className={gridClassName}
					style={gridStyle}
					{...gridProps}
					{..._editor}
				/>;
		if (CURRENT_MODE === UI_MODE_WEB) {
			if (!disableDirectEntry) {
				inputClone = <Box
								className="Combo-inputClone-Box"
								style={{
									height: inputHeight,
								}}
							>
								<Input
									{...testProps('input')}
									ref={inputCloneRef}
									reference="ComboInputClone"
									value={textInputValue}
									autoSubmit={true}
									isDisabled={isDisabled}
									onChangeValue={onInputChangeText}
									onKeyPress={onInputKeyPress}
									onFocus={onInputFocus}
									onBlur={onInputBlur}
									InputLeftElement={inputIconElement}
									autoSubmitDelay={500}
									placeholder={placeholder}
									tooltip={tooltip}
									tooltipPlacement={tooltipPlacement}
									tooltipTriggerClassName={clsx(
										'grow',
										'h-full',
										'flex-1'
									)}
									className={clsx(
										'Combo-inputClone-Input',
										'grow',
										'h-full',
										'flex-1',
										'm-0',
										'rounded-tr-none',
										'rounded-br-none',
										styles.FORM_COMBO_INPUT_CLASSNAME,
									)}
									{..._input}
								/>
							</Box>;
			}
			dropdownMenu = <Popover
								isOpen={isMenuShown}
								onClose={() => {
									hideMenu();
								}}
								trigger={emptyFn}
								className="dropdownMenu-Popover block"
								initialFocusRef={inputCloneRef}
							>
								<PopoverBackdrop className="PopoverBackdrop bg-[#000]" />
								<Box
									ref={menuRef}
									className={clsx(
										'dropdownMenu-Box',
										'flex-1',
										'overflow-auto',
										'bg-white',
										'p-0',
										'rounded-none',
										'border',
										'border-grey-400',
										'shadow-md',
										'max-w-full',
									)}
									style={{
										top,
										left,
										width,
										height: (menuHeight || styles.FORM_COMBO_MENU_HEIGHT) + inputHeight,
										minWidth: 100,
									}}
								>
									{inputClone}
									{grid}
								</Box>
							</Popover>;
		}
		if (CURRENT_MODE === UI_MODE_NATIVE) {
			if (isEditor) {
				// in RN, an editor has no way to accept the selection of the grid, so we need to add a check button to do this
				checkButton = <IconButton
								{...testProps('checkBtn')}
								icon={Check}
								_icon={{
									size: 'sm',
									className: 'text-grey-600',
								}}
								onPress={onCheckButtonPress}
								isDisabled={!value}
								className={clsx(
									'h-full',
									'border',
									'border-grey-400',
									'rounded-md',
									styles.FORM_COMBO_TRIGGER_CLASSNAME,
								)}
							/>;
			}
			const inputAndTriggerClone = // for RN, this is the actual input and trigger, as we need them to appear up above in the modal
				<HStack
					className={clsx(
						'h-[40px]',
						'bg-white',
					)}
				>
					{xButton}
					{eyeButton}
					{disableDirectEntry ?
						<TextNative
							ref={inputRef}
							numberOfLines={1}
							ellipsizeMode="head"
							className={clsx(
								'h-full',
								'flex-1',
								'm-0',
								'p-2',
								'border',
								'border-grey-400',
								'rounded-r-none',
								styles.FORM_COMBO_INPUT_CLASSNAME
							)}
						>{textInputValue}</TextNative> :
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
							InputLeftElement={inputIconElement}
							autoSubmitDelay={500}
							placeholder={placeholder}
							tooltip={tooltip}
							tooltipPlacement={tooltipPlacement}
							tooltipTriggerClassName={clsx(
								'h-full',
								'flex-1'
							)}
							className={clsx(
								'h-full',
								'flex-1',
								'm-0',
								'rounded-r-none',
								styles.FORM_COMBO_INPUT_CLASSNAME,
							)}
							{..._input}
						/>}
					<IconButton
						{...testProps('hideMenuBtn')}
						icon={CaretDown}
						_icon={{
							size: 'sm',
							className: 'text-primary-800',
						}}
						isDisabled={isDisabled}
						onPress={() => hideMenu()}
						className={clsx(
							'h-full',
							'border',
							'border-grey-400',
							'rounded-l-none',
							'rounded-r-md',
							styles.FORM_COMBO_TRIGGER_CLASSNAME,
						)}
					/>
					{checkButton}
				</HStack>;
			dropdownMenu = <Modal
								isOpen={true}
								safeAreaTop={true}
								onClose={() => setIsMenuShown(false)}
								className={clsx(
									'h-full',
									'w-full',
								)}
							>
								<ModalBackdrop />
								<VStackNative
									className={clsx(
										'h-[400px]',
										'w-[80%]',
										'max-w-[400px]',
									)}
								>
									{inputAndTriggerClone}
									{grid}
								</VStackNative>
							</Modal>;
		}
	}

	let className = clsx(
		'Combo-HStack',
		'flex-1',
		'items-stretch',
		'h-auto',
		'self-stretch',
		'justify-center',
		'items-stretch'
	);
	if (props.className) {
		className += ' ' + props.className;
	}
	if (minimizeForRow) {
		className += ' h-auto min-h-0';
	}
	
	if (isRendered && additionalButtons?.length && containerWidth < 500) {
		// be responsive for small screen sizes and bump additionalButtons to the next line
		assembledComponents = 
			<VStackNative
				testID={testID}
				className="Combo-VStack"
			>
				<HStack
					className={className}
				>
					{xButton}
					{eyeButton}
					{input}
					{trigger}
					{dropdownMenu}
				</HStack>
				<HStack className="mt-1">
					{additionalButtons}
				</HStack>
			</VStackNative>;
	} else {
		assembledComponents = 
			<HStackNative
				testID={testID}
				onLayout={onLayout}
				className={className}
			>
				{xButton}
				{eyeButton}
				{input}
				{trigger}
				{additionalButtons}
				{dropdownMenu}
			</HStackNative>;
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
							editorType={EDITOR_TYPE__WINDOWED}
							isEditorViewOnly={true}
							parent={self}
							reference="viewer"
							selection={viewerSelection}
							onEditorClose={onViewerClose}
							className={clsx(
								'w-full',
								'p-0',
							)}
							{...propsForViewer}
							{...viewerProps}
						/>
					</Modal>
				</>;
	}
	
	return assembledComponents;
	
});

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