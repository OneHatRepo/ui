import { forwardRef, useState, useRef, } from 'react';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	UI_MODE_WEB,
	UI_MODE_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import useBlocking from '../../Hooks/useBlocking.js';
import {
	v4 as uuid,
} from 'uuid';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';

const WITH_DRAGGABLE_MARKER = Symbol.for('alreadyHasWithDraggable');

// Note on modes in this codebase:
// HORIZONTAL means a horizontal splitter bar, so it moves along the Y axis.
// VERTICAL means a vertical splitter bar, so it moves along the X axis.

export default function withDraggable(WrappedComponent) {
	if (WrappedComponent?.[WITH_DRAGGABLE_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithDraggable = forwardRef((props, ref) => {

		if (!props.isDraggable) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
				// extract and pass
				onDragStart,
				onDrag,
				onDragStop,
				onChangeIsDragging,
				getDraggableNodeFromNode = (node) => node,
				getParentNode = (node) => node.parentElement.parentElement,
				getProxy,
				proxyParent,
				proxyPositionRelativeToParent = false,
				handle,
				draggableProps = {},
				...propsToPass
			} = props,
			{
				// for local use
				mode = HORIZONTAL, // HORIZONTAL, VERTICAL
			} = props,
			Draggable = getComponentFromType('Draggable'),
			[isDragging, setIsDraggingRaw] = useState(false),
			[node, setNode] = useState(false),
			[bounds, setBounds] = useState(null),
			isDraggingRef = useRef(false),
			draggedNodeRef = useRef(null),
			dragStartPointRef = useRef({ x: null, y: null }),
			dragLastPointRef = useRef({ x: null, y: null }),
			nodeRef = useRef(null), // to get around React Draggable bug // https://stackoverflow.com/a/63603903
			{ block } = useBlocking(),
			getPointerPosition = (evt) => {
				if (!evt) {
					return { x: null, y: null };
				}

				const touch = evt.touches?.[0] || evt.changedTouches?.[0];
				if (touch) {
					return {
						x: touch.pageX,
						y: touch.pageY,
					};
				}

				return {
					x: evt.pageX,
					y: evt.pageY,
				};
			},
			setIsDragging = (value) => {
				setIsDraggingRaw(value);
				if (onChangeIsDragging) {
					onChangeIsDragging(value);
				}
			},
			handleStart = (e, info) => {
				if (isDraggingRef.current) {
					return;
				}

				// console.log('start x', info.x);
				
				const
					node = getDraggableNodeFromNode(info.node),
					parentContainer = getParentNode && getParentNode(node);

				setNode(node);
				draggedNodeRef.current = node;

				if (parentContainer && !parentContainer.id) {
					parentContainer.id = 'a' + uuid().replace(/-/g, '');
					setBounds(parentContainer.getBoundingClientRect());
				}

				// clone node for proxy, append to DOM
				let proxy;
				if (getProxy) {
					proxy = getProxy(node);
				} else {
					proxy = node.cloneNode(true);
					const nodeRect = node.getBoundingClientRect();
					proxy.style.top = nodeRect.top + 'px';
					proxy.style.left = nodeRect.left + 'px';
					proxy.style.height = nodeRect.height + 'px';
					proxy.style.width = nodeRect.width + 'px';
				}
				proxy = proxyParent ? proxyParent.appendChild(proxy) : document.body.appendChild(proxy);
				proxy.style.zIndex = 10000;
				proxy.style.position = 'absolute';
				proxy.style.visibility = 'visible';
				proxy.style.backgroundColor = '#fff';
				proxy.id = 'dragproxy';
				proxy.className = '';
				
				node.style.visibility = 'hidden';

				const startPos = getPointerPosition(e);
				dragStartPointRef.current = startPos;
				dragLastPointRef.current = startPos;

				isDraggingRef.current = true;
				setIsDragging(true);

				if (onDragStart) {
					onDragStart(info, e, proxy, node)
				}
			},
			isWithinBounds = ({ pageX, pageY }) => {
				if (!bounds) {
					return true;
				}
				const {
					left,
					right,
					top,
					bottom,
				} = bounds;
				
				if (mode === HORIZONTAL) {
					return pageX >= left && pageX <= right;
				} else if (mode === VERTICAL) {
					return pageY >= top && pageY <= bottom;
				} else {
					return pageX >= left && pageX <= right && pageY >= top && pageY <= bottom;
				}
			},
			handleDrag = (e, info) => {
				if (!isDraggingRef.current) {
					return;
				}

				const activeNode = draggedNodeRef.current || node;
				if (!activeNode) {
					return;
				}

				// Move proxy to new page coords
				if (!isWithinBounds(e)) {
					return;
				}

				dragLastPointRef.current = getPointerPosition(e);

				const {
					deltaX,
					deltaY,
				} = info;


				// console.log('drag x', info.x);

				// Move the proxy to where it should be
				const
					proxy = document.getElementById('dragproxy'),
					currentLeft = parseInt(proxy.style.left),
					currentTop = parseInt(proxy.style.top);
				if (mode === HORIZONTAL) {
					const left = proxyPositionRelativeToParent ? e.pageX - proxyParent.getBoundingClientRect().left : e.pageX;
					proxy.style.left = left + 'px';
				} else if (mode === VERTICAL) {
					const top = proxyPositionRelativeToParent ? e.pageY - proxyParent.getBoundingClientRect().top : e.pageY;
					proxy.style.top = top + 'px';
				} else {
					proxy.style.left = currentLeft + deltaX + 'px';
					proxy.style.top = currentTop + deltaY + 'px';
				}
				if (onDrag) {
					onDrag(info, e, proxy, activeNode);
				}

			},
			handleStop = (e, info) => {
				if (!isDraggingRef.current) {
					return;
				}

				const activeNode = draggedNodeRef.current || node;
				if (!activeNode) {
					isDraggingRef.current = false;
					setIsDragging(false);
					return;
				}

				// console.log('end x', info.x);

				// remove proxy
				const proxy = document.getElementById('dragproxy');
				if (proxy) {
					proxy.remove();
				}

				// constrain node to bounds
				if (!isWithinBounds(e)) {
					const {
						left,
						right,
						top,
						bottom,
					} = bounds,
					{ pageX, pageY } = e;
					let newX = pageX,
						newY = pageY;


					if (mode === HORIZONTAL) {
						if (left > pageX) {
							newX = left;
						} else if (pageX > right) {
							newX = right;
						}
						activeNode.style.left = newX + 'px';
					} else if (mode === VERTICAL) {
						if (top > pageY) {
							newX = top;
						} else if (pageY > bottom) {
							newX = bottom;
						}
						activeNode.style.top = newY + 'px';
					} else {
						if (left > pageX) {
							newX = left;
						} else if (pageX > right) {
							newX = right;
						}
						activeNode.style.left = newX + 'px';

						if (top > pageY) {
							newX = top;
						} else if (pageY > bottom) {
							newX = bottom;
						}
						activeNode.style.top = newY + 'px';
					}
				}

				// show original node
				activeNode.style.visibility = 'visible';

				block();
				if (onDragStop) {
					const
						stopPos = getPointerPosition(e),
						startPos = dragStartPointRef.current,
						fallbackPos = dragLastPointRef.current,
						resolvedX = stopPos.x ?? fallbackPos.x,
						resolvedY = stopPos.y ?? fallbackPos.y,
						deltaX = (resolvedX ?? 0) - (startPos.x ?? resolvedX ?? 0),
						deltaY = (resolvedY ?? 0) - (startPos.y ?? resolvedY ?? 0);

					if (mode === HORIZONTAL) {
						onDragStop(deltaX, e, activeNode);
					} else if (mode === VERTICAL) {
						onDragStop(deltaY, e, activeNode);
					} else {
						onDragStop(info, e, activeNode);
					}
				}
				dragStartPointRef.current = { x: null, y: null };
				dragLastPointRef.current = { x: null, y: null };
				isDraggingRef.current = false;
				draggedNodeRef.current = null;
				setNode(false);
				setIsDragging(false);
			};
		const wrappedComponentProps = withInjectedHocProps(propsToPass, {
			isDragging,
		});

		
		if (CURRENT_MODE === UI_MODE_WEB) {
			if (mode === VERTICAL) {
				return <Draggable
							axis="x"
							onStart={handleStart}
							onDrag={handleDrag}
							onStop={handleStop}
							position={{ x: 0, y: 0, /* reset to dropped position */ }}
							nodeRef={nodeRef}
							// bounds={bounds}
							{...draggableProps}
						>
							<div ref={nodeRef} className="nsResize">
								<WrappedComponent
									{...wrappedComponentProps}
									ref={ref}
								/>
							</div>
						</Draggable>;
			} else if (mode === HORIZONTAL) {
				return <Draggable
							axis="y"
							onStart={handleStart}
							onDrag={handleDrag}
							onStop={handleStop}
							position={{ x: 0, y: 0, /* reset to dropped position */ }}
							// bounds={bounds}
							nodeRef={nodeRef}
							{...draggableProps}
						>
							<div ref={nodeRef} className="ewResize" style={{ height: '100%', }}>
								<WrappedComponent
									{...wrappedComponentProps}
									ref={ref}
								/>
							</div>
						</Draggable>;
			}

			// can drag in all directions
			return <Draggable
						axis="both"
						onStart={handleStart}
						onDrag={handleDrag}
						onStop={handleStop}
						position={{ x: 0, y: 0, /* reset to dropped position */ }}
						handle={handle}
						nodeRef={nodeRef}
						{...draggableProps}
					>
						<WrappedComponent
							{...wrappedComponentProps}
							ref={nodeRef}
						/>
					</Draggable>;
		} else if (CURRENT_MODE === UI_MODE_NATIVE) {

			// NOT YET IMPLEMENTED
			// Really need to replace most of this, as much of it is web-centric.

			return <WrappedComponent
						{...wrappedComponentProps}
						ref={ref}
					/>;

		}
	});

	ComponentWithDraggable[WITH_DRAGGABLE_MARKER] = true;
	return ComponentWithDraggable;
}
