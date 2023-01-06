import { useState, } from 'react';
import {
	HORIZONTAL,
	VERTICAL,
} from '../Constants/Directions';
import Draggable from 'react-draggable';
import useBlocking from '../Hooks/useBlocking';
import {
	v4 as uuid,
} from 'uuid';

// Note on modes:
// HORIZONTAL means the component moves along the X axis.
// VERTICAL means the component moves along the Y axis.

export default function withDraggable(WrappedComponent) {
	return (props) => {
		const {
				// extract and pass
				onDrag,
				onDragStop,
				getParentNode,
				getProxy,
				...propsToPass
			} = props,
			{
				// for local use
				mode = HORIZONTAL, // HORIZONTAL, VERTICAL
			} = props,
			[isDragging, setIsDragging] = useState(false),
			[node, setNode] = useState(false),
			[bounds, setBounds] = useState(null),
			{ block } = useBlocking(),
			handleStart = (e, info) => {
				if (isDragging) {
					return;
				}
				
				const
					node = info.node,
					headerContainer = getParentNode && getParentNode(node);

				setNode(node);

				if (!headerContainer.id) {
					headerContainer.id = 'a' + uuid().replace(/-/g, '');
					setBounds(headerContainer.getBoundingClientRect());
				}

				// clone node for proxy, append to DOM
				let proxy;
				if (getProxy) {
					proxy = getProxy(node);
				} else {
					const nodeRect = node.getBoundingClientRect();
					proxy = node.cloneNode(true);
					proxy.styles.top = nodeRect.top + 'px';
					proxy.styles.left = nodeRect.left + 'px';
					proxy.styles.height = nodeRect.height + 'px';
					proxy.styles.width = nodeRect.width + 'px';
				}
				proxy = document.body.appendChild(proxy);
				proxy.styles.zIndex = 10000;
				proxy.styles.position = 'absolute';
				proxy.styles.visibility = 'visible';
				proxy.id = 'dragproxy';
				proxy.className = '';
				
				node.styles.visibility = 'hidden';

				setIsDragging(true);
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
				} else {
					return pageY <= bottom && pageX >= top;
				}
			},
			handleDrag = (e, info) => {
				// Move proxy to new page coords
				if (!isWithinBounds(e)) {
					return;
				}

				const proxy = document.getElementById('dragproxy');
				if (mode === HORIZONTAL) {
					proxy.styles.left = e.pageX + 'px';
				} else {
					proxy.styles.top = e.pageY + 'px';
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
						node.styles.left = newX + 'px';
					} else {
						if (top > pageY) {
							newX = top;
						} else if (pageY > bottom) {
							newX = bottom;
						}
						node.styles.top = newY + 'px';
					}
				}

				// show original node
				node.styles.visibility = 'visible';

				block();
				if (onDragStop) {
					if (mode === HORIZONTAL) {
						onDragStop(info.x, e, node);
					} else {
						onDragStop(info.y, e, node);
					}
				}
				setIsDragging(false);
			};

		propsToPass.isDragging = isDragging;
	
		if (mode === VERTICAL) {
			return <Draggable
						axis="x"
						onStart={handleStart}
						onDrag={handleDrag}
						onStop={handleStop}
						position={{ x: 0, y: 0, /* reset to dropped position */ }}
						// bounds={bounds}
					>
						<div className="nsResize">
							<WrappedComponent {...propsToPass} />
						</div>
					</Draggable>;
		}
		return <Draggable
					axis="y"
					onStart={handleStart}
					onDrag={handleDrag}
					onStop={handleStop}
					position={{ x: 0, y: 0, /* reset to dropped position */ }}
					// bounds={bounds}
				>
					<div className="ewResize">
						<WrappedComponent {...propsToPass} />
					</div>
				</Draggable>;
	};
}
