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
	ALERT_MODE_INFO,
} from '../../constants/Alert.js';
import testProps from '../../functions/testProps.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import CircleInfo from '../Icons/CircleInfo.js';
import _ from 'lodash';

// This HOC enables easy usage of alert dialogs in the wrapped component.
// It can be used for simple alerts, confirmations, and custom dialogs. 

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
			onConfirm = (message, yesCallback, includeCancel = false, noCallback) => {
				clearAll();
				setMode(includeCancel ? ALERT_MODE_YES : ALERT_MODE_YES_NO);
				setTitle('Confirm');
				setMessage(message);
				setIncludeCancel(includeCancel);
				setYesCallback(() => yesCallback);
				setNoCallback(noCallback ? () => noCallback : null);
				showAlert();
			},
			onCancel = () => {
				setIsAlertShown(false);
			},
			onInfo = (msg) => {
				clearAll();
				setMode(ALERT_MODE_INFO);
				setTitle('Info');
				setMessage(msg);
				setIncludeCancel(false);
				setCanClose(true);
				showAlert();
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
								{...testProps('cancelBtn')}
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
			case ALERT_MODE_INFO:
				buttons.push(<Button
								{...testProps('okBtn')}
								key="okBtn"
								ref={autoFocusRef}
								onPress={onOk}
								color="#fff"
							>OK</Button>);
				break;
			case ALERT_MODE_YES:
				buttons.push(<Button
								{...testProps('yesBtn')}
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
								color="#fff"
								colorScheme="danger"
							>Yes</Button>);
				break;
			case ALERT_MODE_YES_NO:
				// TODO: need to create a new colorScheme so this can be black with blank background
				buttons.push(<Button
								{...testProps('noBtn')}
								key="noBtn"
								onPress={onNo}
								color="trueGray.800"
								variant="ghost"
								// colorScheme="neutral"
								mr={2}
							>No</Button>);
				buttons.push(<Button
								{...testProps('yesBtn')}
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
						showInfo={onInfo}
					/>
					<AlertDialog
						leastDestructiveRef={cancelRef}
						isOpen={isAlertShown}
						onClose={() => setIsAlertShown(false)}
					>
						<AlertDialog.Content
							{...testProps('AlertDialog')}
						>
							{canClose && <AlertDialog.CloseButton />}
							<AlertDialog.Header>{title}</AlertDialog.Header>
							<AlertDialog.Body>
								<Row alignItems="center">
									<Column w="40px" p={0} mr={5}>
										<Icon as={mode === ALERT_MODE_INFO ? CircleInfo : TriangleExclamation} size={10} color={mode === ALERT_MODE_INFO ? '#000' : '#f00'} />
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