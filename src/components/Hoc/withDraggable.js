import { useState, } from 'react';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	UI_MODE_WEB,
	UI_MODE_REACT_NATIVE,
	CURRENT_MODE,
} from '../../Constants/UiModes.js';
import useBlocking from '../../Hooks/useBlocking.js';
import {
	v4 as uuid,
} from 'uuid';
import getComponentFromType from '../../Functions/getComponentFromType.js';



// Note on modes:
// HORIZONTAL means the component moves along the X axis.
// VERTICAL means the component moves along the Y axis.

export default function withDraggable(WrappedComponent) {
	return (props) => {

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
			{ block } = useBlocking(),
			setIsDragging = (value) => {
				setIsDraggingRaw(value);
				if (onChangeIsDragging) {
					onChangeIsDragging(value);
				}
			},
			handleStart = (e, info) => {
				if (isDragging) {
					return;
				}
				
				const
					node = getDraggableNodeFromNode(info.node),
					parentContainer = getParentNode && getParentNode(node);

				setNode(node);

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
					return pageY <= bottom && pageX >= top;
				} else {
					return pageX >= left && pageX <= right && pageY <= bottom && pageX >= top;
				}
			},
			handleDrag = (e, info) => {
				// Move proxy to new page coords
				if (!isWithinBounds(e)) {
					return;
				}

				const {
					deltaX,
					deltaY,
				} = info;

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
					onDrag(info, e, proxy, node);
				}

			},
			handleStop = (e, info) => {
				if (!isDragging) {
					return;
				}

				// console.log('end', info);
				// remove proxy
				const proxy = document.getElementById('dragproxy');
				proxy.remove();

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
						node.style.left = newX + 'px';
					} else if (mode === VERTICAL) {
						if (top > pageY) {
							newX = top;
						} else if (pageY > bottom) {
							newX = bottom;
						}
						node.style.top = newY + 'px';
					} else {
						if (left > pageX) {
							newX = left;
						} else if (pageX > right) {
							newX = right;
						}
						node.style.left = newX + 'px';

						if (top > pageY) {
							newX = top;
						} else if (pageY > bottom) {
							newX = bottom;
						}
						node.style.top = newY + 'px';
					}
				}

				// show original node
				node.style.visibility = 'visible';

				block();
				if (onDragStop) {
					if (mode === HORIZONTAL) {
						onDragStop(info.x, e, node);
					} else if (mode === VERTICAL) {
						onDragStop(info.y, e, node);
					} else {
						onDragStop(info, e, node);
					}
				}
				setIsDragging(false);
			};
		propsToPass.isDragging = isDragging;

		
		if (CURRENT_MODE === UI_MODE_WEB) {
			if (mode === VERTICAL) {
				return <Draggable
							axis="x"
							onStart={handleStart}
							onDrag={handleDrag}
							onStop={handleStop}
							position={{ x: 0, y: 0, /* reset to dropped position */ }}
							// bounds={bounds}
							{...draggableProps}
						>
							<div className="nsResize">
								<WrappedComponent {...propsToPass} />
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
							{...draggableProps}
						>
							<div className="ewResize" style={{ height: '100%', }}>
								<WrappedComponent {...propsToPass} />
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
						{...draggableProps}
					>
						<WrappedComponent {...propsToPass} />
					</Draggable>;
		} else if (CURRENT_MODE === UI_MODE_REACT_NATIVE) {

			// NOT YET IMPLEMENTED
			// Really need to replace most of this, as much of it is web-centric.

			return <WrappedComponent {...propsToPass} />; // TEMP

		}
	};
}
