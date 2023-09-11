import React, { useState, useEffect, } from 'react';
import {
	Column,
	Row,
	Text,
} from 'native-base';
import IconButton from '../Buttons/IconButton';
import FullWidth from '../Icons/FullWidth';
import SideBySide from '../Icons/SideBySide';
import getSaved from '../../Functions/getSaved.js';
import setSaved from '../../Functions/setSaved.js';
import _ from 'lodash';

const
	MODE_FULL = 'MODE_FULL',
	MODE_SIDE = 'MODE_SIDE';

export default function ManagerScreen(props) {
	const {
			title,
			sideModeComponent,
			fullModeComponent,
			id,
		} = props,
		[isReady, setIsReady] = useState(false),
		[mode, setModeRaw] = useState(MODE_FULL),
		setMode = (newMode) => {
			if (newMode === mode) {
				return; // no change
			}
			setModeRaw(newMode);
			setSaved(id + '-mode', newMode);
		};

	useEffect(() => {
		// Restore saved settings
		(async () => {

			let key, val;
			key = id + '-mode';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setMode(val);
			}

			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, []);

	if (!isReady) {
		return null;
	}

	let whichComponent;
	if (mode === MODE_FULL) {
		whichComponent = fullModeComponent;
	} else if (mode === MODE_SIDE) {
		whichComponent = sideModeComponent;
	}

	return <Column maxHeight="100vh" overflow="hidden" flex={1} w="100%">
				<Row
					h="80px"
					py={2}
					borderBottomWidth={2}
					borderBottomColor="#ccc"
				>
					<Text p={4} fontSize="26" fontWeight={700}>{title}</Text>
					<IconButton
						icon={FullWidth}
						_icon={{
							size: '30px',
							color: mode === MODE_FULL ? 'primary.100' : '#000',
						}}
						disabled={mode === MODE_FULL}
						onPress={() => setMode(MODE_FULL)}
						tooltip="Full Width"
					/>
					<IconButton
						icon={SideBySide}
						_icon={{
							size: '30px',
							color: mode === MODE_SIDE ? 'primary.100' : '#000',
						}}
						disabled={mode === MODE_SIDE}
						onPress={() => setMode(MODE_SIDE)}
						tooltip="Side Editor"
					/>
				</Row>

				{whichComponent}

			</Column>;
}