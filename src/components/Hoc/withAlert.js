import React, { useState, useRef, useEffect, } from 'react';
import {
	AlertDialog,
	Button,
	Column,
	Icon,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	ALERT_MODE_OK,
	ALERT_MODE_YES,
	ALERT_MODE_YES_NO,
	ALERT_MODE_CUSTOM,
} from '../../Constants/Alert.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import _ from 'lodash';

export default function withAlert(WrappedComponent) {
	return (props) => {

		if (props.disableWithAlert || props.alert) {
			return <WrappedComponent {...props} />;
		}

		const
			[isAlertShown, setIsAlertShown] = useState(false),
			[title, setTitle] = useState(''),
			[message, setMessage] = useState(''),
			[canClose, setCanClose] = useState(true),
			[includeCancel, setIncludeCancel] = useState(false),
			[okCallback, setOkCallback] = useState(),
			[yesCallback, setYesCallback] = useState(),
			[noCallback, setNoCallback] = useState(),
			[customButtons, setCustomButtons] = useState(),
			[mode, setMode] = useState(ALERT_MODE_OK),
			autoFocusRef = useRef(null),
			cancelRef = useRef(null),
			onAlert = (arg1, okCallback, includeCancel = false, canClose = true) => {
				clearAll();
				if (_.isString(arg1)) {
					setMode(ALERT_MODE_OK);
					setTitle('Alert');
					setMessage(arg1);
					setOkCallback(() => okCallback);
					setIncludeCancel(includeCancel);
					setCanClose(canClose);
				} else if (_.isPlainObject(arg1)) {
					// custom
					const {
							title = 'Alert',
							message,
							buttons,
							includeCancel,
							canClose,
						} = arg1;
					setMode(ALERT_MODE_CUSTOM);
					setTitle(title);
					setMessage(message);
					setCustomButtons(buttons);
					setIncludeCancel(includeCancel);
					setCanClose(canClose);
				}
				showAlert();
			},
			onConfirm = (message, callback, includeCancel = false) => {
				clearAll();
				setMode(ALERT_MODE_YES_NO);
				setTitle('Confirm');
				setMessage(message);
				setIncludeCancel(includeCancel);
				setYesCallback(() => callback);
				setNoCallback(null);
				showAlert();
			},
			onCancel = () => {
				setIsAlertShown(false);
			},
			onOk = () => {
				if (okCallback) {
					okCallback();
				}
				hideAlert();
			},
			onYes = () => {
				if (yesCallback) {
					yesCallback();
				}
				hideAlert();
			},
			onNo = () => {
				if (noCallback) {
					noCallback();
				}
				hideAlert();
			},
			showAlert = () => {
				setIsAlertShown(true);
			},
			hideAlert = () => {
				setIsAlertShown(false);
				clearAll();
			},
			clearAll = () => {
				setOkCallback();
				setYesCallback();
				setNoCallback();
				setCustomButtons();
			};

		let buttons = [];
		if (includeCancel) {
			buttons.push(<Button
								key="cancelBtn"
								onPress={onCancel}
								color="#fff"
								colorScheme="coolGray"
								variant="ghost" // or unstyled
								ref={cancelRef}
							>Cancel</Button>);
		}
		switch(mode) {
			case ALERT_MODE_OK:
				buttons.push(<Button
								key="okBtn"
								ref={autoFocusRef}
								onPress={onOk}
								color="#fff"
							>OK</Button>);
				break;
			case ALERT_MODE_YES:
				buttons.push(<Button
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
								color="#fff"
								colorScheme="danger"
							>Yes</Button>);
				break;
			case ALERT_MODE_YES_NO:
				buttons.push(<Button
								key="noBtn"
								onPress={onNo}
								color="#fff"
								variant="ghost"
							>No</Button>);
				buttons.push(<Button
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
								color="#fff"
								colorScheme="danger"
							>Yes</Button>);
				break;
			case ALERT_MODE_CUSTOM:
				_.each(customButtons, (button) => {
					buttons.push(button);
				});
				break;
			default:
		}

		return <>
					<WrappedComponent
						{...props}
						disableWithAlert={false}
						alert={onAlert}
						confirm={onConfirm}
						hideAlert={hideAlert}
					/>

					<AlertDialog
						leastDestructiveRef={cancelRef}
						isOpen={isAlertShown}
						onClose={() => setIsAlertShown(false)}
					>
						<AlertDialog.Content>
							{canClose && <AlertDialog.CloseButton />}
							<AlertDialog.Header>{title}</AlertDialog.Header>
							<AlertDialog.Body>
								<Row>
									<Column w="40px" p={0} mr={5}>
										<Icon as={TriangleExclamation} size={10} color="#f00" />
									</Column>
									<Text flex={1}>{message}</Text>
								</Row>
							</AlertDialog.Body>
							<AlertDialog.Footer>
								{buttons}
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog>
				</>;
	};
}