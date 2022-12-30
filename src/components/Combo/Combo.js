import { useState, useEffect, useRef, } from 'react';
import {
	Box,
	Input,
	Popover,
	Row,
} from 'native-base';
import {
	SELECTION_MODE_SINGLE,
} from '../../constants/Selection';
import oneHatData from '@onehat/data';
import useBlocking from '../../hooks/useBlocking';
import emptyFn from '../../functions/emptyFn';
import Grid from '../Grid/Grid';
import IconButton from '../Buttons/IconButton';
import CaretDown from '../Icons/CaretDown';
import _ from 'lodash';

// Combo requires the use of HOC withSelection() whenever it's used.
// This is the *raw* component that can be combined with many HOCs
// for various functionality.

export default function Combo(props) {
	const {
			selection,
			setSelection,

			Repository,
			model,
			data,
			fields,
			idField,
			displayField,
		} = props,
		inputRef = useRef(),
		triggerRef = useRef(),
		menuRef = useRef(),
		{ block, isBlocked } = useBlocking(),
		[isMenuShown, setIsMenuShown] = useState(false),
		[isRendered, setIsRendered] = useState(false),
		[value, setValue] = useState(''),
		[width, setWidth] = useState(0),
		[top, setTop] = useState(0),
		[left, setLeft] = useState(0),
		onChangeText = (value) => {
			// Do a search for this value
			// TODO: Do fuzzy seach for results
			// Would have to do differently for remote repositories
			// Narrow results in grid to those that match the filter.
			// If filter is cleared, show original results.
			let found;
			if (Repository || model) {
				let Repo = Repository;
				if (!Repository) {
					Repo = oneHatData.getRepository(model);
				}
				// Set filter
				const filter = {};
				// TODO: Build filter to narrow results

				Repo.filter(filter);

				// TODO: Auto-select if filter produces only one result

			} else {
				// Search through data
				const ix = fields.indexOf(displayField);
				found = _.find(data, (item) => {
					return item[ix].toLowerCase() === value.toLowerCase();
				});
			}
			if (found) {
				setSelection([found]);
			} else {
				setValue(value);
				if (value === '') { // Text field was cleared, so clear selection
					setSelection([]);
				}
			}
		};

	useEffect(() => {
		// Whenever the selection changes...
		if (!selection[0]) {
			setValue('');
			return () => {};
		}
		const item = selection[0];
		let value = null;
		if (oneHatData.isEntity(item)) {
			value = item.displayValue;
		} else {
			const ix = fields.indexOf(displayField);
			value = item[ix];
		}
		// Set the input text
		setValue(value);
		if (isRendered && !inputRef.current.isFocused()) {
			inputRef.current.focus();
		}
	}, [selection]);

	return <Row justifyContent="center" alignItems="center" h="40px" onLayout={() => setIsRendered(true)}>
				<Input
					ref={inputRef}
					value={value}
					onChangeText={onChangeText}
					onKeyPress={(e) => {
						switch(e.key) {
							case 'Escape':
							case 'Enter':
								setIsMenuShown(false);
								break;
							default:
						}
					}}
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
					onFocus={(e) => {
						if (isBlocked.current) {
							return;
						}
						setIsMenuShown(true);
					}}
					onBlur={(e) => {
						const {
								relatedTarget
							} = e;
						block();
						if (!relatedTarget || 
								(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && (!menuRef.current || !menuRef.current.contains(relatedTarget)))) {
							setIsMenuShown(false);
						}
					}}
					onClick={() => {
						setIsMenuShown(true);
					}}
					flex={1}
					fontSize={20}
					borderTopRightRadius={0}
					borderBottomRightRadius={0}
					m={0}
					bg="#fff"
					_focus={{
						bg:'#fff'
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
					onPress={() => {
						setIsMenuShown(!isMenuShown);
						inputRef.current.focus();
					}}
					onBlur={(e) => {
						const {
								relatedTarget
							} = e;
						if (!relatedTarget || 
								(!inputRef.current.contains(relatedTarget) && triggerRef.current !== relatedTarget && !menuRef.current.contains(relatedTarget))) {
							setIsMenuShown(false);
						}
					}}
					h="100%"
					borderWidth={1}
					borderColor="#bbb"
					borderLeftWidth={0}
					borderLeftRadius={0}
					borderRightRadius="md"
					bg="#fff"
					_hover={{
						bg: 'trueGray.300',
					}}
				/>
				<Popover
					isOpen={isMenuShown}
					onClose={() => {
						setIsMenuShown(false);
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
						<Popover.Body p={0}>
							<Box
								ref={menuRef}
								maxHeight={200}
								borderWidth={1}
								borderColor='trueGray.400'
								borderTopWidth={0}
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
									selectionMode={SELECTION_MODE_SINGLE}
								/>
							</Box>
						</Popover.Body>
					</Popover.Content>
				</Popover>
			</Row>;
}