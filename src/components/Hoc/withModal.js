import React, { useState, useRef, useEffect, } from 'react';
import {
	Box,
	Button,
	Column,
	Icon,
	Modal,
	Row,
	Text,
} from 'native-base';
import Panel from '../Panel/Panel.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

// This HOC enables easy usage of more complex dialogs in the wrapped component.
// Add en embedded Form, 

// Use withAlert for simple alerts, confirmations, and custom dialogs.

export default function withModal(WrappedComponent) {
	return (props) => {

		if (props.disableWithModal || props.showModal) {
			return <WrappedComponent {...props} />;
		}

		const
			[title, setTitle] = useState(''),
			[message, setMessage] = useState(''),
			[canClose, setCanClose] = useState(true),
			[includeCancel, setIncludeCancel] = useState(false),
			[isModalShown, setIsModalShown] = useState(false),
			[h, setHeight] = useState(250),
			[w, setWidth] = useState(400),
			[onOk, setOnOk] = useState(),
			[onYes, setOnYes] = useState(),
			[onNo, setOnNo] = useState(),
			[customButtons, setCustomButtons] = useState(),
			[color, setColor] = useState('#000'),
			[body, setBody]	= useState(), 
			autoFocusRef = useRef(null),
			cancelRef = useRef(null),
			[width, height] = useAdjustedWindowSize(w, h),
			onCancel = () => {
				setIsModalShown(false);
			},
			showModal = (args) => {
				const {
					title = '',
					message = '',
					canClose = true,
					includeCancel = false,
					onOk,
					onYes,
					onNo,
					customButtons,
					color,
					// formItems = {},
					body,
					h,
					w,
				} = args;

				if (!message && !body) {
					throw new Error('Either message or body is required for showModal');
				}

				if (title) {
					setTitle(title);
				}
				if (message) {
					setMessage(message);
				}
				setCanClose(canClose);
				setIncludeCancel(includeCancel);
				if (onNo) {
					setOnNo(() => onNo);
				}
				if (onOk) {
					setOnOk(() => onOk);
				}
				if (onYes) {
					setOnYes(() => onYes);
				}
				if (customButtons) {
					setCustomButtons(customButtons);
				}
				if (color) {
					setColor(color);
				}
				if (body) {
					setBody(body);
				}
				if (h) {
					setHeight(h);
				}
				if (w) {
					setWidth(w);
				}

				setIsModalShown(true);
			};

		let buttons = [];
		if (isModalShown) {
			// assemble buttons
			if (includeCancel) {
				buttons.push(<Button
									{...testProps('cancelBtn')}
									key="cancelBtn"
									onPress={onCancel}
									colorScheme="coolGray"
									variant="ghost" // or unstyled
									ref={cancelRef}
								>Cancel</Button>);
			}
			if (onNo) {
				buttons.push(<Button
								{...testProps('noBtn')}
								key="noBtn"
								onPress={onNo}
								color="trueGray.800"
								variant="ghost"
								mr={2}
							>No</Button>);
			}
			if (onOk) {
				buttons.push(<Button
								{...testProps('okBtn')}
								key="okBtn"
								ref={autoFocusRef}
								onPress={onOk}
							>OK</Button>);
			}
			if (onYes) {
				buttons.push(<Button
								{...testProps('yesBtn')}
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
							>Yes</Button>);
			}
			if (customButtons) {
				_.each(customButtons, (button) => {
					buttons.push(button);
				});
			}
		}

		return <>
					<WrappedComponent
						{...props}
						disableWithModal={false}
						showModal={showModal}
						hideModal={onCancel}
					/>
					{isModalShown && 
						<Modal
							isOpen={true}
							onClose={onCancel}
						>
							<Panel
								{...props}
								reference="modal"
								isCollapsible={false}
								bg="#fff"
								w={width}
								h={height}
								flex={null}
							>
								{canClose && <Modal.CloseButton />}
								{title && <Modal.Header>{title}</Modal.Header>}
								<Modal.Body
									borderTopWidth={0}
									bg="#fff"
									p={3}
									justifyContent=" center"
									alignItems="center"
									borderRadius={5}
									flexDirection="row"
								>
									{body || 
										<>
											<Box w="50px" mx={2}>
												<Icon as={TriangleExclamation} color={color} size="10" />
											</Box>
											<Text flex={1} color={color} fontSize="18px">{message}</Text>
										</>}
								</Modal.Body>
								<Modal.Footer py={2} pr={4} justifyContent="flex-end">
									{buttons}
								</Modal.Footer>
							</Panel>
						</Modal>}
					
				</>;
	};
}