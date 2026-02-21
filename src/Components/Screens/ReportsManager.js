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
import TabBar from '../Tab/TabBar.js';
import _ from 'lodash';

const CONTAINER_THRESHOLD = 1100;

export default function ReportsManager(props) {
	const {
			reports = [],
			reportTabs,
			initialReportTabIx = 0,
			id,
			self,
			isActive = false,
		} = props,
		[containerWidth, setContainerWidth] = useState(),
		onLayout = (e) => {
			setContainerWidth(e.nativeEvent.layout.width);
		},
		renderReportLayout = (reportsToRender = []) => {
			if (!containerWidth) {
				return null;
			}

			if (containerWidth >= CONTAINER_THRESHOLD) {
				const
					reportsPerColumn = Math.ceil(reportsToRender.length / 2),
					col1Reports = reportsToRender.slice(0, reportsPerColumn),
					col2Reports = reportsToRender.slice(reportsPerColumn);
				return <HStack className="gap-3">
							<VStack className="flex-1">
								{col1Reports}
							</VStack>
							<VStack className="flex-1">
								{col2Reports}
							</VStack>
						</HStack>;
			}

			return reportsToRender;
		};

	if (!isActive) {
		return null;
	}

	const
		hasReportTabs = _.isArray(reportTabs) && reportTabs.length > 0,
		tabBarId = `${id || self?.path || 'ReportsManager'}-reportTabs`,
		reportElements = renderReportLayout(reports),
		tabBarTabs = hasReportTabs ? _.map(reportTabs, (tab, ix) => ({
			...tab,
			content: <ScrollView className="flex-1 w-full" key={`reportTabContent-${ix}`}>
							<VStackNative className="w-full p-4" onLayout={onLayout}>
								{renderReportLayout(tab.reports || [])}
							</VStackNative>
						</ScrollView>,
		})) : [];
	
	return <VStack
				className="overflow-hidden flex-1 w-full"
			>
				<ScreenHeader
					title="Reports"
					icon={ChartPie}
				/>
				{hasReportTabs ?
					<TabBar
						id={tabBarId}
						initialTabIx={initialReportTabIx}
						tabs={tabBarTabs}
					/> :
					<ScrollView className="flex-1 w-full">
						<VStackNative className="w-full p-4" onLayout={onLayout}>
							{containerWidth && reportElements}
						</VStackNative>
					</ScrollView>}
			</VStack>;
}
