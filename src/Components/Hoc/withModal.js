import { forwardRef, useRef, useState, useSyncExternalStore } from 'react';
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

function LiveModalBody(props) {
	// LiveModalBody subscribes to the bodyStore and re-renders whenever the snapshot changes.
	const {
			bodyStore,
		} = props,
		subscribe = bodyStore?.subscribe || (() => () => {}),
		getSnapshot = bodyStore?.getSnapshot || (() => null),
		body = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	return body;
}

// This HOC enables richer dialogs while preserving one consistent modal API.
// Use withAlert for simple alerts/confirmations where no custom body is needed.
//
// Runtime modes (same API in both modes):
// 1) Owner mode:
//    - withModal stores modal entries in local state and renders the stack itself.
// 2) Delegate mode:
//    - withModal forwards to parent showModal/hideModal APIs so one shared modal
//      stack can be used across nested feature boundaries.
//
// Why this dual behavior exists:
// - Owner mode keeps standalone components functional.
// - Delegate mode prevents competing modal roots/backdrops and keeps stacking,
//   focus, and pointer behavior centralized.
//
// Body rendering strategies:
// 1) body (snapshot)
//    - React node captured at showModal call time.
// 2) bodyFactory (lazy)
//    - Function invoked during render to generate body.
// 3) bodyStore (live subscription)
//    - Object with subscribe(listener) and getSnapshot() used by LiveModalBody
//      through useSyncExternalStore, so open modal content can react to upstream
//      state changes without reopening modal. Use this when the modal content 
//      needs to stay in sync with dynamic parent state.
//
// Cancel/close contract:
// - onCancel handlers run before close.
// - If onCancel returns false, close is vetoed.
// - Otherwise the modal is closed by default.

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
					bodyStore = null, // live mode provider: { subscribe(listener), getSnapshot() }
					bodyFactory = null, // fn that will be called to generate the body content each time the modal is rendered
					bodyFactoryProps = null, // props to pass to the bodyFactory function when it is called
					resolveBodyFactoryOnShow = false, // whether to immediately resolve the bodyFactory when the modal is shown
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
				if (!body && !bodyFactory && !bodyStore) {
					throw new Error('withModal: body is required for showModal');
				}
				if (bodyFactory && !_.isFunction(bodyFactory)) {
					throw new Error('withModal: bodyFactory must be a function');
				}
				if (bodyStore && (!_.isFunction(bodyStore.subscribe) || !_.isFunction(bodyStore.getSnapshot))) {
					throw new Error('withModal: bodyStore must provide subscribe(listener) and getSnapshot() functions');
				}

				if (_.isFunction(body)) {
					// eager execution of body functions remains for backward compatibility.
					// Prefer bodyFactory for dynamic render-time content.
					console.warn('withModal: body function will be executed eagerly. Use bodyFactory for render-time body creation.');
					body = body();
				}

				const
					modalId = nextModalId.current++;

				if (bodyFactory && resolveBodyFactoryOnShow) {
					body = bodyFactory({
						...(bodyFactoryProps || {}),
						modalId,
						isTopModal: true,
					});
					bodyFactory = null;
					bodyFactoryProps = null;
				}

				const modalConfig = {
					id: modalId,
					title,
					body, // snapshot mode
					bodyStore,
					bodyFactory,
					bodyFactoryProps,
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
				// Update the body of an existing modal.
				// If the modalId is not specified in options, the top modal is updated.
				setModals((previous) => {
					if (!previous.length) {
						return previous;
					}
					const
						modalId = options?.modalId || previous[previous.length - 1].id,
						resolvedBody = _.isFunction(newBody) ? newBody() : newBody;
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
			invokeCancelAndHide = (modal) => {
				if (!modal) {
					return;
				}

				const result = modal.onCancel ? modal.onCancel() : undefined;

				// Default-close policy with explicit veto support.
				if (result !== false) {
					hideModal({ modalId: modal.id });
				}
			},
			hideModalOverride = (args = null) => {
				// Determine if the hideModal call has explicit arguments (modalId or closeAll).
				// If there are no explicit arguments and the top modal has an onCancel handler, call it.
				// Otherwise, proceed to hide the modal using the provided arguments.
				const hasExplicitArgs = _.isPlainObject(args) && (args.modalId || args.closeAll);
				if (!hasExplicitArgs && topModal?.onCancel && _.isNil(args)) {
					invokeCancelAndHide(topModal);
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
									onPress={() => invokeCancelAndHide(modal)}
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
					hideModal: hideModalOverride,
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
				let modalBody;
				if (modal.bodyStore) {
					// Live mode: bodyStore subscriber drives updates while modal remains open.
					modalBody = <LiveModalBody bodyStore={modal.bodyStore} />;
				} else {
					// Snapshot/lazy modes: resolve body from static node or factory.
					modalBody = modal.bodyFactory
						? modal.bodyFactory({
							...(modal.bodyFactoryProps || {}),
							modalId: modal.id,
							isTopModal,
						})
						: modal.body;
				}
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
				return <Pressable
							pointerEvents="auto"
							onPress={() => {
								if (isTopModal) {
									invokeCancelAndHide(modal);
								}
							}}
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
								? ((modal.onCancel || modal.canClose) ? () => invokeCancelAndHide(modal) : null)
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