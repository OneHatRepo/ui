import { forwardRef, useState, useRef } from 'react';
import {
	Box,
	Icon,
	Modal, ModalBackdrop, ModalHeader, ModalContent, ModalCloseButton, ModalBody, ModalFooter,
	Text,
} from '@project-components/Gluestack';
import Button from '../Buttons/Button.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Layout/Footer.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

// This HOC enables usage of more complex dialogs in the wrapped component.
// Use withAlert for simple alerts, confirmations, and info dialogs.

export default function withModal(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithModal || props.showModal) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		const
			[title, setTitle] = useState(''),
			[canClose, setCanClose] = useState(true),
			[includeCancel, setIncludeCancel] = useState(false),
			[isModalShown, setIsModalShown] = useState(false),
			[h, setHeight] = useState(),
			[w, setWidth] = useState(),
			[onOk, setOnOk] = useState(),
			[okBtnLabel, setOkBtnLabel] = useState(),
			[onYes, setOnYes] = useState(),
			[onNo, setOnNo] = useState(),
			[customButtons, setCustomButtons] = useState(),
			[body, setBody] = useState(),
			[whichModal, setWhichModal] = useState(),
			[testID, setTestID] = useState('Modal'),
			autoFocusRef = useRef(null),
			cancelRef = useRef(null),
			[windowWidth, windowHeight] = useAdjustedWindowSize(w, h),
			onCancel = () => {
				hideModal();
			},
			hideModal = () => {
				setIsModalShown(false);
			},
			showModal = (args) => {
				let {
					title = null,
					body = null,
					canClose = false,
					includeCancel = false,
					onOk = null,
					okBtnLabel = null,
					onYes = null,
					onNo = null,
					customButtons = null,
					h = null,
					w = null,
					whichModal = null,
					testID = null,
					formProps = null, // deprecated
				} = args;
				
				if (formProps) {
					// deprecated formProps bc we were getting circular dependencies
					throw new Error('withModal: formProps is deprecated. Instead, insert the <Form> in "body" directly from the component that called showModal.');
				}
				if (!body) {
					throw new Error('withModal: body is required for showModal');
				}

				setTitle(title);
				setBody(body);
				setCanClose(canClose);
				setIncludeCancel(includeCancel);
				setOnOk(onOk ? () => onOk : null);
				setOkBtnLabel(okBtnLabel || 'OK');
				setOnYes(onYes ? () => onYes : null);
				setOnNo(onNo ? () => onNo : null);
				setCustomButtons(customButtons);
				setHeight(h); // || 250
				setWidth(w); // || 400
				setWhichModal(whichModal);
				setIsModalShown(true);
				if (testID) {
					setTestID(testID);
				}
			},
			updateModalBody = (newBody) => {
				setBody(newBody);
			};

		let modalBody,
			buttons = [];
		if (isModalShown) {
			// assemble buttons
			if (includeCancel) {
				buttons.push(<Button
									{...testProps('cancelBtn')}
									key="cancelBtn"
									onPress={onCancel}
									colorScheme="coolGray"
									ref={cancelRef}
									className="mr-2"
									text="Cancel"
									variant="outline" // or unstyled
								/>);
			}
			if (onNo) {
				buttons.push(<Button
								{...testProps('noBtn')}
								key="noBtn"
								onPress={onNo}
								className="text-grey-800 mr-2"
								text="No"
								variant="outline"
							/>);
			}
			if (onOk) {
				buttons.push(<Button
								{...testProps('okBtn')}
								key="okBtn"
								ref={autoFocusRef}
								onPress={onOk}
								text={okBtnLabel}
								className="text-white"
							/>);
			}
			if (onYes) {
				buttons.push(<Button
								{...testProps('yesBtn')}
								key="yesBtn"
								ref={autoFocusRef}
								onPress={onYes}
								text="Yes"
								className="text-white"
							/>);
			}
			if (customButtons) {
				_.each(customButtons, (button) => {
					buttons.push(button);
				});
			}
			
			// assemble body
			modalBody = body;
			if (h || w || title) {
				let footer = null;
				if (buttons && buttons.length > 0) {
					footer = <Footer
								className={`
									justify-end
									py-2
									pr-4
									bg-grey-100
								`}
							>{buttons}</Footer>;
				}
				modalBody =
					<Panel
						title={title}
						isCollapsible={false}
						className="withModal-Panel bg-white"
						h={h > windowHeight ? windowHeight : h}
						w={w > windowWidth ? windowWidth : w}
						isWindow={true}
						disableAutoFlex={true}
						onClose={canClose ? hideModal : null}
						footer={footer}
						isScrollable={true}
					>{modalBody}</Panel>
			}
		}
		
		return <>
					<WrappedComponent
						{...props}
						disableWithModal={false}
						showModal={showModal}
						hideModal={onCancel}
						updateModalBody={updateModalBody}
						isModalShown={isModalShown}
						whichModal={whichModal}
						ref={ref}
					/>
					{isModalShown && 
						<Modal
							isOpen={true}
							onClose={onCancel}
							className="withModal-Modal"
							{...testProps(testID)}
						>
							<ModalBackdrop className="withModal-ModalBackdrop" />
							{modalBody}
						</Modal>}
					
				</>;
	});
}