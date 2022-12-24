import { useState, } from 'react';
import {
	Column,
	Row,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import Draggable from 'react-draggable';
import styles from '../../styles/styles.js';
import useBlocking from '../../hooks/useBlocking';
import {
	v4 as uuid,
} from 'uuid';

// Note on modes:
// HORIZONTAL means the Splitter moves along the X axis.
// VERTICAL means the Splitter moves along the Y axis.

export default function Splitter(props) {
	const {
			mode = HORIZONTAL, // HORIZONTAL, VERTICAL
			onResize = (delta) => {},
			left = 0,
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
				headerContainer = node.parentElement.parentElement;

			if (!headerContainer.id) {
				headerContainer.id = 'a' + uuid().replace(/-/g, '');
				setBounds(headerContainer.getBoundingClientRect());
			}
			
			// temporarily make node invisible
			const nodeRect = node.getBoundingClientRect();
			node.style.visibility = 'hidden';
			setNode(node);

			// clone node for proxy, append to DOM
			let proxy = node.cloneNode(true);
			proxy = document.body.appendChild(proxy);
			proxy.style.zIndex = 10000;
			proxy.style.position = 'absolute';
			proxy.style.visibility = 'visible';
			proxy.style.top = nodeRect.top + 'px';
			proxy.style.left = nodeRect.left + 'px';
			proxy.style.height = nodeRect.height + 'px';
			proxy.style.width = nodeRect.width + 'px';
			proxy.id = 'dragproxy';
			proxy.className = '';
			// debugger;

			setIsDragging(true);
		},
		isWithinBounds = ({ pageX, pageY }) => {
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
		},
		handleStop = (e, info) => {
			if (!isDragging) {
				return;
			}

console.log('end', info);
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

			// show node
			node.style.visibility = 'visible';

			block();
			if (mode === HORIZONTAL) {
				onResize(info.x, e);
			} else {
				onResize(info.y, e);
			}
			setIsDragging(false);
		};

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
						<Row
							testID="Splitter"
							bg={isDragging ? 'secondary.600' : 'primary.600'}
							h="3px"
							w="100%"
							alignItems="center"
							justifyContent="center"
							left={left}
						>
							<Row testID="handle" h="2px" w="10%" bg="#ccc"></Row>
						</Row>
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
					<Column
						testID="Splitter"
						bg={isDragging ? 'secondary.600' : 'primary.600'}
						w="3px"
						h="100%"
						alignItems="center"
						justifyContent="center"
						style={styles.ewResize}
						left={left}
							position="absolute"
					>
						<Column testID="handle" w="2px" h="10%" bg="#ccc"></Column>
					</Column>
				</div>
			</Draggable>;
}
