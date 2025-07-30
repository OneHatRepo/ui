import { useState, } from 'react';
import {
	HStack,
	ScrollView,
	VStack,
	VStackNative,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import ChartPie from '../Icons/ChartPie.js';
import ScreenHeader from '../Layout/ScreenHeader.js';

const CONTAINER_THRESHOLD = 1100;

export default function ReportsManager(props) {
	const {
			reports = [],
			isActive = false,
		} = props,
		[containerWidth, setContainerWidth] = useState(),
		onLayout = (e) => {
			setContainerWidth(e.nativeEvent.layout.width);
		};

	if (!isActive) {
		return null;
	}

	let reportElements = [];
	if (containerWidth) {
		if (containerWidth >= CONTAINER_THRESHOLD) {
			// two column layout
			const
				reportsPerColumn = Math.ceil(reports.length / 2),
				col1Reports = reports.slice(0, reportsPerColumn),
				col2Reports = reports.slice(reportsPerColumn);
			reportElements = <HStack className="gap-3">
								<VStack className="flex-1">
									{col1Reports}
								</VStack>
								<VStack className="flex-1">
									{col2Reports}
								</VStack>
							</HStack>;
		} else {
			// one column layout
			reportElements = reports;
		}
	}
	
	return <VStack
				className="overflow-hidden flex-1 w-full"
			>
				<ScreenHeader
					title="Reports"
					icon={ChartPie}
				/>
				<ScrollView className="flex-1 w-full">
					<VStackNative className="w-full p-4" onLayout={onLayout}>
						{containerWidth && reportElements}
					</VStackNative>
				</ScrollView>
			</VStack>;
}
