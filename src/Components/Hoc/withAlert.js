import { forwardRef, } from 'react';
import {
	Box,
	HStack,
	Icon,
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import withModal from './withModal.js';
import CircleInfo from '../Icons/CircleInfo.js';
import CircleQuestion from '../Icons/CircleQuestion.js';
import TriangleExclamation from '../Icons/TriangleExclamation.js';
import _ from 'lodash';

// This HOC enables easy usage of alert dialogs in the wrapped component.
// It can be used for simple alerts, info boxes, confirmations, and 
// custom dialogs.

function withAlert(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithAlert || props.alreadyHasWithAlert) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
				showModal,
				hideModal,
			} = props,
			getBody = (args) => {
				const {
					icon = TriangleExclamation,
					message,
					textColor = 'text-black',
					fillColor = 'fill-black',
				} = args;
				return <HStack className="withAlert-HStack flex-1 w-full">
							<Box className={clsx(
								'withAlert-Box1',
								'h-full',
								'w-[100px]',
								'flex',
								'items-end',
								'justify-center',
								'pr-3',
							)}>
								<Icon
									as={icon}
									className={clsx(
										'withAlert-Icon',
										'h-[40px]',
										'w-[40px]',
										fillColor,
									)}
								/>
							</Box>
							<Box className={clsx(
								'withAlert-Box2',
								'h-full',
								'flex',
								'flex-1',
								'items-start',
								'justify-center',
							)}>
								<Text className={clsx(
									'withAlert-Text',
									textColor,
									'text-[18px]',
									'flex-none',
									'mr-2',
									'w-full',
									'break-words',
									'whitespace-normal',
									'overflow-wrap-anywhere',
								)}>{message}</Text>
							</Box>
						</HStack>;
			},
			onAlert = (arg1, onOk, includeCancel = false, canClose = true) => {

				hideModal();

				let title = 'Alert',
					message,
					buttons;
				
				if (_.isString(arg1)) {
					// simple alert
					message = arg1;
				} else if (_.isPlainObject(arg1)) {
					// custom
					if (arg1.hasOwnProperty('title')) {
						title = arg1.title;
					}
					message = arg1.message;
					if (arg1.hasOwnProperty('buttons')) {
						buttons = arg1.buttons;
					}
					if (arg1.hasOwnProperty('onOk')) {
						onOk = arg1.onOk;
					}
					if (arg1.hasOwnProperty('includeCancel')) {
						includeCancel = arg1.includeCancel;
					}
					if (arg1.hasOwnProperty('canClose')) {
						canClose = arg1.canClose;
					}
				}
				showModal({
					testID: 'AlertModal',
					title,
					body: getBody({
						icon: TriangleExclamation,
						message,
						fillColor: 'fill-red-500',
					}),
					onOk: () => {
						hideModal();
						if (onOk) {
							onOk();
						}
					},
					includeCancel,
					canClose,
					customButtons: buttons ?? null,
					h: 250,
					w: 400,
					whichModal: 'alert',
				});
			},
			onConfirm = (message, onYes, includeCancel = false, onNo) => {
				hideModal();
				showModal({
					testID: 'ConfirmModal',
					title: 'Confirm',
					body: getBody({
						icon: CircleQuestion,
						message,
					}),
					onYes: () => {
						hideModal();
						onYes();
					},
					onNo: () => {
						hideModal();
						if (onNo) {
							onNo();
						}
					},
					includeCancel,
					h: 250,
					w: 400,
					whichModal: 'confirm',
				});
			},
			onInfo = (message) => {
				hideModal();
				showModal({
					testID: 'InfoModal',
					title: 'Info',
					body: getBody({
						icon: CircleInfo,
						message,
					}),
					onOk: () => hideModal(),
					canClose: true,
					h: 200,
					w: 400,
					whichModal: 'info',
				});
			};

		if (!showModal) {
			throw new Error('withAlert: showModal is not defined in props');
		}

		return <WrappedComponent
					{...props}
					ref={ref}
					disableWithAlert={false}
					alreadyHasWithAlert={true}
					alert={onAlert}
					getAlertBody={getBody}
					confirm={onConfirm}
					hideAlert={hideModal}
					showInfo={onInfo}
				/>;
	});
}

export default function(WrappedComponent) {
	return withModal(withAlert(WrappedComponent));
}
