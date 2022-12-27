import { useState, } from 'react';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import Draggable from 'react-draggable';
import useBlocking from '../../hooks/useBlocking';
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
					proxy.style.top = nodeRect.top + 'px';
					proxy.style.left = nodeRect.left + 'px';
					proxy.style.height = nodeRect.height + 'px';
					proxy.style.width = nodeRect.width + 'px';
				}
				proxy = document.body.appendChild(proxy);
				proxy.style.zIndex = 10000;
				proxy.style.position = 'absolute';
				proxy.style.visibility = 'visible';
				proxy.id = 'dragproxy';
				proxy.className = '';
				
				node.style.visibility = 'hidden';

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
					proxy.style.left = e.pageX + 'px';
				} else {
					proxy.style.top = e.pageY + 'px';
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
					} else {
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
