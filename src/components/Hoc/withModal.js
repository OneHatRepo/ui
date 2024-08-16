import React, { useState, useRef } from 'react';
import {
	Box,
	Button,
	Column,
	Icon,
	Modal,
	Row,
	Text,
} from 'native-base';
import Form from '../Form/Form.js';
import Panel from '../Panel/Panel.js';
import IconButton from '../Buttons/IconButton.js';
import Rotate from '../Icons/Rotate.js';
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
			[includeReset, setIncludeReset] = useState(false),
			[isModalShown, setIsModalShown] = useState(false),
			[isValid, setIsValid] = useState(false),
			[isDirty, setIsDirty] = useState(false),
			[h, setHeight] = useState(),
			[w, setWidth] = useState(),
			[onOk, setOnOk] = useState(),
			[okBtnLabel, setOkBtnLabel] = useState(),
			[onYes, setOnYes] = useState(),
			[onNo, setOnNo] = useState(),
			[onSubmit, setOnSubmit] = useState(),
			[submitBtnLabel, setSubmitBtnLabel] = useState(),
			[customButtons, setCustomButtons] = useState(),
			[formProps, setFormProps] = useState(),
			[self, setSelf] = useState(),
			[color, setColor] = useState(),
			[body, setBody]	= useState(), 
			useForm = !!formProps, // convenience flag
			autoFocusRef = useRef(null),
			cancelRef = useRef(null),
			[width, height] = useAdjustedWindowSize(w, h),
			onValidityChange = (isValid) => {
				setIsValid(isValid);
			},
			onDirtyChange = (isDirty) => {
				setIsDirty(isDirty);
			},
			onReset = () => {
				self?.children?.ModalForm?.reset();
			},
			onCancel = () => {
				hideModal();
			},
			hideModal = () => {
				setIsModalShown(false);
			},
			showModal = (args) => {
				let {
					title = null,
					message = null,
					body = null,
					canClose = true,
					includeCancel = false,
					onOk = null,
					okBtnLabel = null,
					onYes = null,
					onNo = null,
					onSubmit = null,
					submitBtnLabel = null,
					customButtons = null,
					includeReset = false,
					formProps = null,
					self = null,
					color = null,
					h = null,
					w = null,
				} = args;

				if (!message && !body && !formProps) {
					throw new Error('Either message, body, or formProps is required for showModal');
				}
				if (includeReset && !self) {
					throw new Error('self is required when using includeReset');
				}

				setTitle(title);
				setMessage(message);
				setBody(body);
				setCanClose(canClose);
				setIncludeCancel(includeCancel);
				setOnOk(onOk ? () => onOk : null);
				setOkBtnLabel(okBtnLabel || 'OK');
				setOnYes(onYes ? () => onYes : null);
				setOnNo(onNo ? () => onNo : null);
				setOnSubmit(onSubmit ? () => onSubmit : null);
				setSubmitBtnLabel(submitBtnLabel);
				setCustomButtons(customButtons);
				setIncludeReset(includeReset);
				setFormProps(formProps);
				setSelf(self);
				setColor(color || '#000');
				setHeight(h || 250);
				setWidth(w || 400);

				setIsModalShown(true);
			};

		let buttons = [];
		if (isModalShown) {
			// assemble buttons
			if (includeReset) {
				buttons.push(<IconButton
								{...testProps('resetBtn')}
								key="resetBtn"
								onPress={onReset}
								icon={Rotate}
								_icon={{
									color: !isDirty ? 'trueGray.400' : '#000',
								}}
								isDisabled={!isDirty}
								mr={2}
							/>);
			}
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
							>{okBtnLabel}</Button>);
			}
			if (onYes) {
				buttons.push(<Button
								{...testProps('yesBtn')}
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
							>Yes</Button>);
			}
			if (useForm && onSubmit) {
				buttons.push(<Button
								{...testProps('submitBtn')}
								key="submitBtn"
								onPress={onSubmit}
								isDisabled={!isValid}
								color="#fff"
							>{submitBtnLabel || 'Submit'}</Button>);
			}
			if (customButtons) {
				_.each(customButtons, (button) => {
					buttons.push(button);
				});
			}
		}

		let modalBody = null;
		if (useForm) {
			modalBody = <Form
							{...formProps}
							parent={self}
							reference="ModalForm"
							onValidityChange={onValidityChange} 
							onDirtyChange={onDirtyChange}
						/>;
		} else if (body) {
			modalBody = body;
		} else {
			modalBody = <>
							<Box w="50px" mx={2}>
								<Icon as={TriangleExclamation} color={color} size="10" />
							</Box>
							<Text flex={1} color={color} fontSize="18px">{message}</Text>
						</>;
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
									{modalBody}
								</Modal.Body>
								<Modal.Footer py={2} pr={4} justifyContent="flex-end">
									{buttons}
								</Modal.Footer>
							</Panel>
						</Modal>}
					
				</>;
	};
}