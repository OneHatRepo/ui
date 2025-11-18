import { forwardRef, useRef, useState, useEffect, } from 'react';
import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import UiGlobals from '../../UiGlobals.js';
import Button from '../Buttons/Button.js';
import testProps from '../../Functions/testProps.js';
import _ from 'lodash';

export default function withContextMenu(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.alreadyHasWithContextMenu) {
			return <WrappedComponent {...props} ref={ref} />;
		}
		
		const {
				// extract and pass
				disableContextMenu = false,
				contextMenuItems,
				...propsToPass
			} = props,
			{
				// for local use
				selection,
				setSelection,

				// withModal
				showModal,
				hideModal,
				isModalShown,
				whichModal,
			} = props,
			styles = UiGlobals.styles,
			[doShowContextMenu, setDoShowContextMenu] = useState(false),
			[left, setLeft] = useState(0),
			[top, setTop] = useState(0),
			onContextMenu = (entity, e, selection) => {
				if (disableContextMenu) {
					return;
				}
				if (!selection.length && entity) {
					// No current selections, so select this row so operations apply to it
					setSelection([entity]);
				}

				setDoShowContextMenu(true);
				setLeft(e.nativeEvent.pageX);
				setTop(e.nativeEvent.pageY);
			},
			createContextMenuItemComponents = () => {
				const contextMenuItemComponents = _.map(contextMenuItems, (config, ix) => {
					let {
						text,
						handler,
						icon = null,
						isDisabled = false,
					} = config;
	
					return <Button
								{...testProps('contextMenuBtn-' + text)}
								key={ix}
								onPress={() => {
									hideModal();
									handler(selection);
								}}
								isDisabled={isDisabled}
								icon={icon}
								_icon={{
									className: clsx(
										'ml-2',
										'self-center',
									),
								}}
								text={text}
								_text={{
									className: clsx(
										'flex-1',
										'select-none',
										'text-black',
									),
								}}
								className={clsx(
									'flex-row',
									'border-b-2',
									'border-b-grey-200',
									'py-2',
									'px-4',
									'select-none',
									'rounded-none',
								)}
								variant="outline"
								action="secondary"
							/>;
				});
				if (UiGlobals.isLocal) {
					contextMenuItemComponents.push(<Text key="idViewer" className="flex-1 py-2 px-4 select-none">id: {selection?.[0]?.actualId || selection?.[0]?.id}</Text>);
				}
				return contextMenuItemComponents;
			};
			
		useEffect(() => {
			// First time after onContextMenu is called, doShowContextMenu will be true.
			// Next times, it will be false, whichModal will be 'contextMenu'
			if (!doShowContextMenu) {
				if (!isModalShown) {
					// Do not update if no modal is shown
					return;
				}
				if (whichModal !== 'contextMenu') {
					// Do not update the contextMenu when other types of modals are shown
					return;
				}
			}

			// useEffect() will be called once when doShowContextMenu is set,
			// (this will show the context menu), and then again if the 
			// contextMenuItems change. This is necessary because they
			// may change based on the selection; and this is why we're using 
			// useEffect to show the context menu instead of onContextMenu.

			// TODO: There might be a bug here. As the comment above suggests, useEffect()
			// was running if contextMenuItems changed. But the comment next to the args
			// for useEffect() says we're not including contextMenuItems in the args
			// to avoid infinite loops. Is this a problem??

			const contextMenuItemComponents = createContextMenuItemComponents();
			if (contextMenuItemComponents.length === 0) {
				// No items to show
				return;
			}
			
			// show context menu
			const
				className = clsx(
					'context-menu-container',
					'absolute',
					'border',
					'border-grey-400',
					'shadow-lg',
					'bg-white',
				),
				screenWidth = window.innerWidth,
				screenHeight = window.innerHeight;
			let l = left,
				t = top;
			if (screenWidth - styles.CONTEXT_MENU_WIDTH < l) {
				l = screenWidth - styles.CONTEXT_MENU_WIDTH;
			}
			if (screenHeight - (contextMenuItemComponents.length * styles.CONTEXT_MENU_ITEM_HEIGHT) < t) {
				t = screenHeight - (contextMenuItemComponents.length * styles.CONTEXT_MENU_ITEM_HEIGHT);
			}
			const style = {
				left: l,
				top: t,
				width: styles.CONTEXT_MENU_WIDTH,
			};

			showModal({
				body: <VStack
							className={className}
							style={style}
						>{contextMenuItemComponents}</VStack>,
				onCancel: hideModal,
				whichModal: 'contextMenu',
			});

			if (doShowContextMenu) {
				setDoShowContextMenu(false);
			}
		
		}, [doShowContextMenu, isModalShown, whichModal]); // don't include contextMenuItems, as it will cause infinite loop

		return <WrappedComponent
					{...propsToPass}
					alreadyHasWithContextMenu={true}
					ref={ref}
					onContextMenu={onContextMenu}
				/>;
	});
}