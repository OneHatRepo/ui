import { useState, useRef, } from 'react';
import {
	Box,
	Column,
	Row,
	Text,
} from 'native-base';
import FieldSetContext from '../../Contexts/FieldSetContext.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import UiGlobals from '../../UiGlobals.js';
import IconButton from '../Buttons/IconButton.js';
import CheckboxButton from '../Buttons/CheckboxButton.js';
import CaretUp from '../Icons/CaretUp.js';
import CaretDown from '../Icons/CaretDown.js';
import _ from 'lodash';

export default function FieldSet(props) {
	const {
			title,
			helpText,
			children,
			isCollapsed,
			hasErrors,
			showToggleAllCheckbox = false,
			...propsToPass
		} = props,
		styles = UiGlobals.styles,
		forceUpdate = useForceUpdate(),
		childRefs = useRef([]),
		isAllCheckedRef = useRef(false),
		[localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed),
		getIsAllChecked = () => {
			return isAllCheckedRef.current;
		},
		setIsAllChecked = (bool) => {
			isAllCheckedRef.current = bool;
			forceUpdate();
		},
		onToggleCollapse = () => {
			setLocalIsCollapsed(!localIsCollapsed);
		},
		onToggleAllChecked = () => {
			const bool = !getIsAllChecked();
			setIsAllChecked(bool);

			_.each(childRefs.current, (child) => {
				if (child.value !== bool) {
					child.value = bool;
					child.setValue(bool);
				}
			});
		},
		registerChild = (child) => {
			childRefs.current.push(child);
			checkChildren();
		},
		onChangeValue = (value, childRef) => {
			const child = _.find(childRefs.current, child => child.childRef === childRef);
			child.value = value;
			checkChildren();
		},
		checkChildren = () => {
			let isAllChecked = true;
			_.each(childRefs.current, (child) => {
				if (!child.value) {
					isAllChecked = false;
					return false; // break
				}
			});

			if (isAllChecked !== getIsAllChecked()) {
				setIsAllChecked(isAllChecked);
			}
		};
		
	return <Box
				borderWidth={1}
				borderColor="trueGray.400"
				bg={styles.FORM_FIELDSET_BG}
				mb={4}
				pb={1}
				{...propsToPass}
			>
				{title &&
					<Row
						w="100%"
						borderBottomWidth={1}
						borderBottomColor="trueGray.200"
						mb={2}
						style={{ userSelect: 'none', }}
					>
						<Text
							fontSize={styles.FORM_FIELDSET_FONTSIZE}
							fontWeight="bold"
							py={1}
							px={3}
							flex={1}
							numberOfLines={1}
							ellipsizeMode="head"
						>{title}</Text>
						{showToggleAllCheckbox && <Row alignSelf="right">
														<Text
															fontSize={styles.FORM_FIELDSET_FONTSIZE}
															py={1}
															px={3}
															flex={1}
															numberOfLines={1}
														>Toggle All?</Text>
														<CheckboxButton
															isChecked={getIsAllChecked()}
															onPress={onToggleAllChecked}
															_icon={{
																size: 'lg',
															}}
														/>
													</Row>}
						<IconButton
							_icon={{
								as: localIsCollapsed ? <CaretDown /> : <CaretUp />,
								size: 'sm',
								color: 'trueGray.300',
							}}
							onPress={onToggleCollapse}
						/>
					</Row>}
				{helpText && <Text>{helpText}</Text>}
				{!localIsCollapsed && <FieldSetContext.Provider value={{ registerChild, onChangeValue, }}>
											{children}
										</FieldSetContext.Provider>}
			</Box>;
}
