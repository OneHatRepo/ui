import { useState, useRef, } from 'react';
import {
	Box,
	HStack,
	Text,
	TextNative,
} from '../Gluestack';
import FieldSetContext from '../../Contexts/FieldSetContext.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import testProps from '../../Functions/testProps.js';
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
			isCollapsible = true,
			isCollapsed,
			hasErrors,
			showToggleAllCheckbox = false,
		} = props,
		styles = UiGlobals.styles,
		forceUpdate = useForceUpdate(),
		childRefs = useRef([]),
		isAllCheckedRef = useRef(false),
		[isLocalCollapsed, setIsLocalCollapsed] = useState(isCollapsed),
		getIsAllChecked = () => {
			return isAllCheckedRef.current;
		},
		setIsAllChecked = (bool) => {
			isAllCheckedRef.current = bool;
			forceUpdate();
		},
		onToggleCollapse = () => {
			setIsLocalCollapsed(!isLocalCollapsed);
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
			if (child.value !== value) {
				child.value = value;
				checkChildren();
			}
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

	const className = `
		FieldSet-Box
		mb-4
		mx-0
		p-1
		border
		border-grey-400
		${styles.FORM_FIELDSET_BG}
	`;
	if (props.className) {
		props.className += className;
	}

	
	return <Box
				className={className}
				style={props.style || {}}
			>
				{title &&
					<HStack
						style={{ userSelect: 'none', }}
						className={`
							FieldSet-title-HStack
							w-full
							mb-1
							border
							border-b-grey-200
						`}
					>
						<TextNative
							numberOfLines={1}
							ellipsizeMode="head"
							className={`
								FieldSet-title-Text
								flex-1
								py-1
								px-3
								font-bold
								${styles.FORM_FIELDSET_FONTSIZE}
							`}
						>{title}</TextNative>

						{showToggleAllCheckbox && 
							<HStack className="self-right">
								<TextNative
									numberOfLines={1}
									className={`
										flex-1
										py-1
										px-3
										${styles.FORM_FIELDSET_FONTSIZE}
									`}
								>Toggle All?</TextNative>
								<CheckboxButton
									{...testProps('toggleAllBtn')}
									isChecked={getIsAllChecked()}
									onPress={onToggleAllChecked}
									_icon={{
										size: 'lg',
									}}
								/>
							</HStack>}
						
						{isCollapsible && 
							<IconButton
								{...testProps('toggleCollapseBtn')}
								icon={isLocalCollapsed ? CaretDown : CaretUp}
								_icon={{
									size: 'sm',
									className: 'text-grey-300',
								}}
								onPress={onToggleCollapse}
							/>}
					</HStack>}

				{helpText && <Text>{helpText}</Text>}

				{!isLocalCollapsed &&
					<FieldSetContext.Provider value={{ registerChild, onChangeValue, }}>
						{children}
					</FieldSetContext.Provider>}
			</Box>;
}
