import React, { useEffect, useState, useRef, } from 'react';
import {
	Button,
	Column,
	Row,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection';
import getComponentFromType from '../../Functions/getComponentFromType';
import Container from '../Container/Container';
import Panel from '../Panel/Panel';
import TabPanel from '../Panel/TabPanel';
import UploadDownload from '../Panel/UploadDownload';
import _ from 'lodash';

export default function DataMgt(props) {
	let {
			showSelector = false,
			showDownload = false,
			westCoastElementType,
			westCoastTitle,
			westCoastStartsCollapsed = false,
			westCoastWidth = 300,
			westCoastProps = {},
			westCoastSelector_id, // the foreign id of westCoast records that illinois and some associated panels listen to
			// westCoastPermission,
			illinoisElementType,
			illinoisTitle,
			illinoisNoSelectorMeansNoResults = true,
			illinoisProps = {},
			illinoisSelector_id, // the foreign id of illinois records that some associated panels listen to
			onAddIllinoisRecord,
			onSearchIllinoisText,
			eastCoastStartsCollapsed = false,
			eastCoastWidth = 340,
			associatedPanels = [], // array of React components
			associatedPanelsPerTab = 3,
			additionalTabButtons = [],
		} = props;

	const
		// westCoastRef = useRef(),
		[isWestCoastCollapsed, setIsWestCoastCollapsed] = useState(westCoastStartsCollapsed),
		[isEastCoastCollapsed, setIsEastCoastCollapsed] = useState(eastCoastStartsCollapsed),
		[isFullscreen, setIsFullscreen] = useState(false),
		[westCoastSelectorSelected, setWestCoastSelectorSelected] = useState(),
		[illinoisSelectorSelected, setIllinoisSelectorSelected] = useState(),
		onToggleFullscreen = () => {
			const newIsFullScreen = !isFullscreen;
			setIsFullscreen(!newIsFullScreen);
			if (newIsFullScreen) {
				setIsWestCoastCollapsed(true);
				setIsEastCoastCollapsed(true);
			} else {
				setIsWestCoastCollapsed(false);
				setIsEastCoastCollapsed(false);
			}
		},
		onNavigateTo = (path) => {
			debugger;
		},
		onBatchUpload = (path) => {
			debugger;
			// How do I route this back to illinois?
			// Maybe don't, but look at the props on IllinoisElementType??

		},
		onEvent = (e, arg1) => {
			switch(e) {
				case 'toggleFullscreen': // from illinois
					onToggleFullscreen();
					break;
				case 'navigateTo':
					onNavigateTo(arg1);
					break;
				case 'batchUpload': // from uploadDownload
					onBatchUpload(arg1);
					break;
				default:
			}
		};


	//   REGIONS -------------------------------------------------------
	// 	[				] [							] [					]
	// 	[	westCoast	] [		   illinois			] [	  eastCoast		]
	// 	[				] [							] [					]
	//   PANELS ---------------------------------------------------------
	// 	[				] [							] [	associated1		]
	// 	[				] [							] [	associated2		]
	// 	[				] [							] [	associated3...	]
	// 	[				] [							] [	uploadDownload	]
	//   ---------------------------------------------------------------


	let westCoast,
		illinois,
		eastCoast;

	// 'westCoast' section, AKA 'selector', the far-left column
	if (showSelector && westCoastElementType) {
		const WestCoastElementType = getComponentFromType(westCoastElementType);
		westCoast = <WestCoastElementType
						title={westCoastTitle}
						w={westCoastWidth}
						// maxWidth="230px" // this breaks drag resize!
						startsCollapsed={westCoastStartsCollapsed}
						collapseDirection={HORIZONTAL}
						split={true}
						frame={false}
						loadAfterRender={true}
						disablePaging={true}
						uniqueRepository={true}
						selectionMode={SELECTION_MODE_SINGLE}
						onChangeSelection={setWestCoastSelectorSelected}
						onEvent={onEvent}
						reference="westCoast"
						{...westCoastProps}
					/>;
	}

	// 'illinois' section, the main Grid
	if (illinoisElementType) {
		if (!showSelector && illinoisNoSelectorMeansNoResults) {
			illinoisNoSelectorMeansNoResults = false;
		}
		const IllinoisElementType = getComponentFromType(illinoisElementType);
		illinois = <IllinoisElementType
						title={illinoisTitle}
						isCollapsible={false}
						frame={false}
						split={false}
						loadAfterRender={!showSelector}
						selectorId={showSelector ? westCoastSelector_id : null}
						selectorSelected={westCoastSelectorSelected}
						noSelectorMeansNoResults={illinoisNoSelectorMeansNoResults}
						isFullscreen={isFullscreen}
						onChangeSelection={setIllinoisSelectorSelected}
						onEvent={onEvent}
						reference="illinois"
						{...illinoisProps}
					/>;
	}

	// 'eastCoast' section, contains associated panels
	if (showDownload) {
		associatedPanels.push(<UploadDownload key="ud" reference="uploadDownload" onEvent={onEvent} />);
	}
	if (associatedPanels.length) {
		const
			tabs = [],
			allAssociatedPanelProps = {
				// isCollapsible: false,
				onEvent,
				noSelectorMeansNoResults: true,
				disablePaging: true,
			},
			panels = _.map(associatedPanels, (associatedPanel, ix) => {
				const
					thisAssociatedPanelProps = {
						selectorId: associatedPanel.controlledByIllinois ? illinoisSelector_id : westCoastSelector_id,
						selectorSelected: associatedPanel.controlledByIllinois ? illinoisSelectorSelected : westCoastSelectorSelected,
						...associatedPanel.props,
					};
				return React.cloneElement(associatedPanel, { key: ix, reference: 'associatedPanel' + ix, ...allAssociatedPanelProps, ...thisAssociatedPanelProps, });
			});
		
			
		if (panels.length > associatedPanelsPerTab) {
			// Tab panel holds them
			let tabIx = 0,
				panelIx = 0;
			_.each(panels, (associatedPanel, ix) => {
				if (panelIx === associatedPanelsPerTab) {
					// New tab
					panelIx = 0;
					tabIx++;
				}
				if (panelIx === 0) {
					tabs[tabIx] = {
						title: 'Page ' + (tabIx +1),
						items: [],
					};
				}
				tabs[tabIx].items.push(associatedPanel);
				panelIx++;
			});
			eastCoast = <TabPanel
							title="Associated Information"
							w={eastCoastWidth}
							startsCollapsed={eastCoastStartsCollapsed}
							frame={true}
							split={true}
							tabs={tabs}
							additionalButtons={additionalTabButtons}
						/>;
		} else {
			// Single container holds them
			eastCoast = <Panel
							title="Associated Information"
							w={eastCoastWidth}
							startsCollapsed={eastCoastStartsCollapsed}
							frame={true}
							split={true}
						>{panels}</Panel>;
		}
	}

	return <Container
				west={westCoast}
				isWestCollapsed={isWestCoastCollapsed}
				setIsWestCollapsed={setIsWestCoastCollapsed}
				center={illinois}
				east={eastCoast}
				isEastCollapsed={isEastCoastCollapsed}
				setIsEastCollapsed={setIsEastCoastCollapsed}
			/>;
}