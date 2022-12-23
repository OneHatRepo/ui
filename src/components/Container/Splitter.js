import { useState, } from 'react';
import {
	View,
} from 'react-native';
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

export default function Splitter(props) {
	const {
			mode = HORIZONTAL, // HORIZONTAL, VERTICAL
			onResize = (delta) => {},
		} = props,
		[isDragging, setIsDragging] = useState(false),
		handleStart = (e, info) => {
			info.node.style.zIndex = 1000;
			setIsDragging(true);
		},
		handleDrag = () => {},
		handleStop = (e, info) => {
			if (mode === HORIZONTAL) {
				onResize(info.y);
			} else {
				onResize(info.x);
			}
			setIsDragging(false);
			info.node.style.zIndex = null;
		};

	if (mode === HORIZONTAL) {
		return <Draggable
					axis="y"
					onStart={handleStart}
					onDrag={handleDrag}
					onStop={handleStop}
					position={{ x: 0, y: 0, /* reset to dropped position */ }}
				>
					<div className="nsResize">
						<Row
							testID="Splitter"
							bg={isDragging ? 'secondary.600' : 'primary.600'}
							h="3px"
							w="100%"
							alignItems="center"
							justifyContent="center"
							
						>
							<Row testID="handle" h="2px" w="10%" bg="#ccc"></Row>
						</Row>
					</div>
				</Draggable>;
	}
	return <Draggable
				axis="x"
				onStart={handleStart}
				onDrag={handleDrag}
				onStop={handleStop}
				position={{ x: 0, y: 0, /* reset to dropped position */ }}
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
					>
						<Column testID="handle" w="2px" h="10%" bg="#ccc"></Column>
					</Column>
				</div>
			</Draggable>;
}
