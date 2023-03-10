import React, { useState, useRef, useEffect, } from 'react';
import {
	Button,
	Column,
	Icon,
	Modal,
	Row,
	Text,
} from 'native-base';
import {
	ALERT_MODE_OK,
	ALERT_MODE_YES_NO,
	ALERT_MODE_CUSTOM,
} from '../../Constants/Alert.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Panel/Footer.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import _ from 'lodash';

export default function withAlert(WrappedComponent) {
	return (props) => {
		const
			[isAlertShown, setIsAlertShown] = useState(false),
			[title, setTitle] = useState(''),
			[message, setMessage] = useState(''),
			[includeCancel, setIncludeCancel] = useState(false),
			[okCallback, setOkCallback] = useState(),
			[yesCallback, setYesCallback] = useState(),
			[noCallback, setNoCallback] = useState(),
			[customButtons, setCustomButtons] = useState(),
			[mode, setMode] = useState(ALERT_MODE_OK),
			autoFocusRef = useRef(null),
			onAlert = (arg1, callback, includeCancel = false) => {
				clearAll();
				if (_.isString(arg1)) {
					setMode(ALERT_MODE_OK);
					setTitle('Alert');
					setMessage(arg1);
					setOkCallback(() => callback);
				} else if (_.isPlainObject(arg1)) {
					// custom
					const {
							title = 'Alert',
							message,
							buttons,
						} = arg1;
					setMode(ALERT_MODE_CUSTOM);
					setTitle(title);
					setMessage(message);
					setCustomButtons(buttons);
				}
				setIncludeCancel(includeCancel);
				showAlert();
			},
			onConfirm = (message, callback, includeCancel = false) => {
				clearAll();
				setMode(ALERT_MODE_YES_NO);
				setTitle('Confirm');
				setMessage(message);
				setIncludeCancel(includeCancel);
				setYesCallback(() => callback);
				showAlert();
			},
			onCancel = () => {
				setIsAlertShown(false);
			},
			onOk = () => {
				const callback = okCallback;
				hideAlert();
				if (callback) {
					callback();
				}
			},
			onYes = () => {
				const callback = yesCallback;
				hideAlert();
				if (callback) {
					callback();
				}
			},
			onNo = () => {
				const callback = noCallback;
				hideAlert();
				if (callback) {
					callback();
				}
			},
			showAlert = () => {
				setIsAlertShown(true);
			},
			hideAlert = () => {
				setIsAlertShown(false);
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
								variant="ghost"
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
							>Yes</Button>);
				break;
			case ALERT_MODE_CUSTOM:
				buttons = customButtons;
				break;
			default:
		}

		return <>
					<WrappedComponent
						{...props}
						alert={onAlert}
						confirm={onConfirm}
					/>
					<Modal
						isOpen={isAlertShown}
						onOpen={() => {debugger;}}
						onClose={() => setIsAlertShown(false)}
					>
						<Column bg="#fff" w={400} onLayout={() => {
							if (autoFocusRef.current) {
								autoFocusRef.current.focus();
							}
						}}>
							<Panel
								title={title}
								isCollapsible={false}
								p={5}
								footer={<Footer justifyContent="flex-end" >
											<Button.Group space={2}>
												{buttons}
											</Button.Group>
										</Footer>}
								>
								<Row flex={1}>
									<Column w={50} p={0} mr={5}>
										<Icon as={TriangleExclamation} size={10}/>
									</Column>
									<Text>{message}</Text>
								</Row>
							</Panel>
						</Column>
					</Modal>
				</>;
	};
}