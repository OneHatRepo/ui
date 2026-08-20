import { forwardRef, useRef, useState } from 'react';
import {
	Box,
	Icon,
	Modal, ModalHeader, ModalContent, ModalCloseButton, ModalFooter,
	Pressable,
	Text,
} from '@onehat-gluestack';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
	UI_MODE_NATIVE,
} from '../../Constants/UiModes.js';
import clsx from 'clsx';
import Button from '../Buttons/Button.js';
import Panel from '../Panel/Panel.js';
import Footer from '../Layout/Footer.js';
import useAdjustedWindowSize from '../../Hooks/useAdjustedWindowSize.js';
import testProps from '../../Functions/testProps.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';
import _ from 'lodash';

const WITH_MODAL_MARKER = Symbol.for('alreadyHasWithModal');

// This HOC enables usage of more complex dialogs in the wrapped component.
// Use withAlert for simple alerts, confirmations, and info dialogs.
//
// Runtime modes (single public API, dual internal behavior):
// 1) Owner mode: withModal manages local modal state and renders the modal stack.
//    This is used when no parent modal API is available.
// 2) Delegate mode: withModal reuses a parent-provided modal API and does not
//    render a second local modal stack.
//
// Why both exist:
// - If every nested component owned modals, multiple modal roots/backdrops could
//   compete, causing focus, layering, and pointer-event issues.
// - If every component only delegated, standalone components without a parent
//   modal provider could not open modals.
//
// So withModal keeps one external contract (showModal/hideModal/...) while
// choosing ownership internally based on whether parent modal controls exist.

/*
 * withModal usage:
 *
 * const modalId = props.showModal({
 *   title: 'Example',
 *   body: <MyContent />,
 *   canClose: true,
 *   includeCancel: true,
 *   onCancel: () => props.hideModal({ modalId }),
 *   onOk: () => {
 *     console.log('OK');
 *     props.hideModal({ modalId });
 *   },
 *   h: 420,
 *   w: 640,
 *   showBackdrop: true,
 *   stackMode: 'push',
 * });
 *
 * // Close just one modal in the queue, even if another modal is above it.
 * props.hideModal(underlyingModalId); // equivalent to props.hideModal({ modalId: underlyingModalId })
 *
 * // Or close the top modal, or close the whole stack.
 * props.hideModal();
 * props.hideModal({ closeAll: true });
 *
 * stackMode options:
 * - 'push': append this modal to the existing stack so multiple modals can remain open (default)
 * - 'replace': replace the current modal queue with this modal
 */

export default function withModal(WrappedComponent) {
	if (WrappedComponent?.[WITH_MODAL_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithModal = forwardRef((props, ref) => {
		const {
				disableWithModal = false,
				showModal: parentShowModal,
				hideModal: parentHideModal,
				updateModalBody: parentUpdateModalBody,
				isModalShown: parentIsModalShown,
				whichModal: parentWhichModal,
				...incomingProps
			} = props;

		if (disableWithModal) {
			return <WrappedComponent {...incomingProps} ref={ref} />;
		}

		const
			[modals, setModals] = useState([]), // array of modal config objects, each representing a queued modal dialog
			nextModalId = useRef(1),
			[windowWidth, windowHeight] = useAdjustedWindowSize(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
			clampModalSize = (width, height) => {
				let adjustedWidth = width,
					adjustedHeight = height;
				if (adjustedWidth && windowWidth && adjustedWidth > windowWidth) {
					adjustedWidth = windowWidth;
				}
				if (adjustedHeight && windowHeight && adjustedHeight > windowHeight) {
					adjustedHeight = windowHeight;
				}
				return [adjustedWidth, adjustedHeight];
			},
			hideModal = (args = null) => {
				const effectiveArgs = _.isNumber(args)
					? { modalId: args }
					: _.isPlainObject(args)
						? args
						: {};
				setModals((previous) => {
					if (!previous.length) {
						return previous;
					}
					// closeAll is a global reset when the caller wants to dismiss every
					// queued modal at once (for example, when leaving a nested flow).
					if (effectiveArgs.closeAll) {
						return [];
					}
					// Removing a specific modal ID lets us dismiss one dialog from the stack
					// without disturbing the rest of the queue.
					if (effectiveArgs.modalId !== undefined && effectiveArgs.modalId !== null) {
						return previous.filter((entry) => entry.id !== effectiveArgs.modalId);
					}
					// Default behavior is to dismiss the top-most modal, preserving the stack
					// order while keeping older dialogs visible underneath it.
					return previous.slice(0, -1);
				});
			},
			showModal = (args = {}) => {
				let {
					title = null,
					body = null,
					bodyFactory = null, // fn that will be called to generate the body content each time the modal is rendered
					canClose = false,
					includeCancel = false,
					onCancel = null,
					onOk = null,
					okBtnLabel = null,
					onYes = null,
					onNo = null,
					customButtons = null,
					h = null,
					w = null,
					whichModal = null,
					testID = null,
					stackMode = 'push', // 'push' or 'replace'
					showBackdrop = true,
					formProps = null, // deprecated
				} = args;

				if (formProps) {
					// deprecated formProps bc we were getting circular dependencies
					throw new Error('withModal: formProps is deprecated. Instead, insert the <Form> in "body" directly from the component that called showModal.');
				}
				if (!body && !bodyFactory) {
					throw new Error('withModal: body is required for showModal');
				}
				if (bodyFactory && !_.isFunction(bodyFactory)) {
					throw new Error('withModal: bodyFactory must be a function');
				}

				if (_.isFunction(body)) {
					// eager execution of body functions remains for backward compatibility.
					// Prefer bodyFactory for dynamic render-time content.
					console.warn('withModal: body function will be executed eagerly. Use bodyFactory for render-time body creation.');
					body = body();
				}

				const
					modalId = nextModalId.current++,
					modalConfig = {
						id: modalId,
						title,
						body,
						bodyFactory,
						canClose,
						includeCancel,
						onCancel,
						onOk,
						okBtnLabel: okBtnLabel || 'OK',
						onYes,
						onNo,
						customButtons,
						h,
						w,
						whichModal,
						testID: testID || 'Modal',
						showBackdrop,
					};

				setModals((previous) => {
					// 'push' keeps the existing stack and puts the new dialog on top.
					// Any other mode (typically 'replace') clears the queue first.
					if (stackMode === 'push') {
						return [...previous, modalConfig];
					}
					return [modalConfig];
				});

				return modalId;
			},
			updateModalBody = (newBody, options = {}) => {
				setModals((previous) => {
					if (!previous.length) {
						return previous;
					}
					const modalId = options?.modalId || previous[previous.length - 1].id;
					const resolvedBody = _.isFunction(newBody) ? newBody() : newBody;
					return previous.map((entry) => {
						if (entry.id !== modalId) {
							return entry;
						}
						return {
							...entry,
							body: resolvedBody,
						};
					});
				});
			},
			topModal = modals.length ? modals[modals.length - 1] : null,
			isModalShown = modals.length > 0,
			whichModal = topModal?.whichModal,
			hideModalProp = (args = null) => {
				const hasExplicitArgs = _.isPlainObject(args) && (
					args.modalId ||
					args.closeAll
				);
				if (!hasExplicitArgs && topModal?.onCancel && _.isNil(args)) {
					topModal.onCancel();
					return;
				}
				hideModal(args);
			},
			getButtonsForModal = (modal) => {
				const buttons = [];
				if (modal.includeCancel) {
					buttons.push(<Button
									{...testProps('cancelBtn')}
									key={`cancelBtn-${modal.id}`}
									onPress={modal.onCancel || (() => hideModal({ modalId: modal.id }))}
									colorScheme="coolGray"
									className="mr-2"
									text="Cancel"
									variant="outline" // or unstyled
								/>);
				}
				if (modal.onNo) {
					buttons.push(<Button
									{...testProps('noBtn')}
									key={`noBtn-${modal.id}`}
									onPress={modal.onNo}
									className="text-grey-800 mr-2"
									text="No"
									variant="outline"
								/>);
				}
				if (modal.onOk) {
					buttons.push(<Button
									{...testProps('okBtn')}
									key={`okBtn-${modal.id}`}
									onPress={modal.onOk}
									text={modal.okBtnLabel}
									className="text-white"
								/>);
				}
				if (modal.onYes) {
					buttons.push(<Button
									{...testProps('yesBtn')}
									key={`yesBtn-${modal.id}`}
									onPress={modal.onYes}
									text="Yes"
									className="text-white"
								/>);
				}
				if (modal.customButtons) {
					_.each(modal.customButtons, (button, index) => {
						buttons.push(<Box key={`customBtn-${modal.id}-${index}`}>{button}</Box>);
					});
				}
				return buttons;
			},
			ownsModalState = !(_.isFunction(parentShowModal) && _.isFunction(parentHideModal)),
			modalApi = ownsModalState
				? {
					showModal,
					hideModal: hideModalProp,
					updateModalBody,
					isModalShown,
					whichModal,
				}
				: {
					showModal: parentShowModal,
					hideModal: parentHideModal,
					updateModalBody: _.isFunction(parentUpdateModalBody) ? parentUpdateModalBody : updateModalBody,
					isModalShown: _.isBoolean(parentIsModalShown) ? parentIsModalShown : isModalShown,
					whichModal: !_.isNil(parentWhichModal) ? parentWhichModal : whichModal,
				},
			renderModalBody = (modal, isTopModal) => {
				let modalBody = modal.bodyFactory ? modal.bodyFactory() : modal.body;
				const buttons = getButtonsForModal(modal);
				if (modal.h || modal.w || modal.title) {
					let footer = null;
					if (buttons.length > 0) {
						footer = <Footer
									className={clsx(
										'justify-end',
										'py-2',
										'pr-4',
										'bg-grey-100',
									)}
								>{buttons}</Footer>;
					}

					const [adjustedW, adjustedH] = clampModalSize(modal.w, modal.h);
					modalBody =
						<Panel
							title={modal.title}
							isCollapsible={false}
							className="withModal-Panel bg-white"
							h={adjustedH}
							w={adjustedW}
							isWindow={true}
							disableAutoFlex={true}
							onClose={isTopModal && modal.canClose ? () => hideModal({ modalId: modal.id }) : null}
							footer={footer}
							isScrollable={true}
						>{modalBody}</Panel>;
				}
				return modalBody;
			},
			renderModalBackdrop = (modal, isTopModal) => {
				if (!modal.showBackdrop) {
					return null;
				}
				const onBackdropPress = () => {
					if (isTopModal) {
						if (modal.onCancel) {
							modal.onCancel();
							return;
						}
						hideModal({ modalId: modal.id });
					}
				};
				return <Pressable
							pointerEvents="auto"
							onPress={onBackdropPress}
							className={clsx(
								'withModal-ModalBackdrop-replacment',
								'h-full',
								'w-full',
								'absolute',
								'top-0',
								'left-0',
								'bg-black/50',
								'web:pointer-events-auto',
							)}
							style={{
								backgroundColor: 'rgba(0, 0, 0, 0.40)',
							}}
						/>;
			};

		return <>
					<WrappedComponent
						{...withInjectedHocProps(incomingProps, {
							showModal: modalApi.showModal,
							hideModal: modalApi.hideModal,
							updateModalBody: modalApi.updateModalBody,
							isModalShown: modalApi.isModalShown,
							whichModal: modalApi.whichModal,
						})}
						ref={ref}
					/>
					{ownsModalState && modals.map((modal, index) => {
						const
							isTopModal = index === modals.length - 1,
							onCloseHandler = isTopModal
								? (modal.onCancel || (modal.canClose ? () => hideModal({ modalId: modal.id }) : null))
								: null;
						return <Modal
									key={`modal-${modal.id}`}
									isOpen={true}
									onClose={onCloseHandler}
									className="withModal-Modal web:pointer-events-auto"
									{...testProps(modal.testID)}
								>
									{renderModalBackdrop(modal, isTopModal)}
									<ModalContent
										pointerEvents="auto"
										className={clsx(
											'withModal-ModalContent',
											'w-auto',
											'max-w-none',
											'bg-transparent',
											'border-0',
											'shadow-none',
											'p-0',
											'web:pointer-events-auto',
										)}
									>
										{renderModalBody(modal, isTopModal)}
									</ModalContent>
								</Modal>;
					})}
				</>;
	});

	ComponentWithModal[WITH_MODAL_MARKER] = true;
	return ComponentWithModal;
}