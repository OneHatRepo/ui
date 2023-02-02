import React, { useState, useMemo, } from 'react';
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
			westElementType,
			westTitle,
			westStartsCollapsed = false,
			westWidth = 300,
			westProps = {},
			westSelector_id, // the foreign id of west records that center and some associated panels listen to
			// westPermission,
			centerElementType,
			centerTitle,
			centerNoSelectorMeansNoResults = true,
			centerProps = {},
			centerSelector_id, // the foreign id of center records that some associated panels listen to
			onAddCenterRecord,
			onSearchCenterText,
			eastStartsCollapsed = false,
			eastWidth = 340,
			associatedPanels = [], // array of React components
			associatedPanelsPerTab = 3,
			additionalTabButtons = [],
		} = props;

	const
		// westRef = useRef(),
		[isWestCollapsed, setIsWestCollapsed] = useState(westStartsCollapsed),
		[isEastCollapsed, setIsEastCollapsed] = useState(eastStartsCollapsed),
		[isFullscreen, setIsFullscreen] = useState(false),
		[westRepository, setWestRepository] = useState(),
		[westSelected, setWestSelectedRaw] = useState(),
		[centerSelected, setCenterSelected] = useState(),
		setWestSelected = (selected) => {
			setWestSelectedRaw(selected);
			setCenterSelected(); // clear selection in center
		},
		onToggleFullscreen = () => {
			const newIsFullScreen = !isFullscreen;
			setIsFullscreen(!newIsFullScreen);
			if (newIsFullScreen) {
				setIsWestCollapsed(true);
				setIsEastCollapsed(true);
			} else {
				setIsWestCollapsed(false);
				setIsEastCollapsed(false);
			}
		},
		onNavigateTo = (path) => {
			debugger;
		},
		onBatchUpload = (path) => {
			debugger;
			// How do I route this back to center?
			// Maybe don't, but look at the props on CenterElementType??

		},
		onEvent = (e, arg1) => {
			switch(e) {
				case 'toggleFullscreen': // from center
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
	// 	[	  west  	] [		   center			] [	  east		]
	// 	[				] [							] [					]
	//   PANELS ---------------------------------------------------------
	// 	[				] [							] [	associated1		]
	// 	[				] [							] [	associated2		]
	// 	[				] [							] [	associated3...	]
	// 	[				] [							] [	uploadDownload	]
	//   ---------------------------------------------------------------


	// 'west' section, AKA 'selector', the far-left column
	const west = useMemo(() => {
		if (!showSelector || !westElementType) {
			return null;
		}
		const WestElementType = getComponentFromType(westElementType);
		return <WestElementType
					reference="west"
					title={westTitle}
					w={westWidth}
					// maxWidth="230px" // this breaks drag resize!
					startsCollapsed={westStartsCollapsed}
					collapseDirection={HORIZONTAL}
					isResizable={true}
					frame={false}
					disablePagination={true}
					autoLoad={true}
					canColumnsReorder={false}
					canColumnsResize={false}
					setRepository={setWestRepository}
					Repository={westRepository}
					uniqueRepository={true}
					selectionMode={SELECTION_MODE_SINGLE}
					selection={westSelected}
					onChangeSelection={setWestSelected}
					onEvent={onEvent}
					{...westProps}
				/>;
	}, [
		showSelector,
		westElementType,
		westTitle,
		westWidth,
		westStartsCollapsed,
		westRepository,
		westSelected,
		westSelected?.hash,
		westProps,
	]);

	// 'center' section, the main Grid
	const center = useMemo(() => {
		if (!centerElementType) {
			return null;
		}

		if (!showSelector && centerNoSelectorMeansNoResults) {
			centerNoSelectorMeansNoResults = false;
		}
		const CenterElementType = getComponentFromType(centerElementType);
		return <CenterElementType
					reference="center"
					title={centerTitle}
					isCollapsible={false}
					isFullscreen={isFullscreen}
					frame={false}
					isResizable={false}
					// disablePagination={true}
					autoLoad={!showSelector}
					uniqueRepository={true}
					selectorId={showSelector ? westSelector_id : null}
					selectorSelected={westSelected}
					noSelectorMeansNoResults={centerNoSelectorMeansNoResults}
					onChangeSelection={setCenterSelected}
					onEvent={onEvent}
					{...centerProps}
				/>;
	}, [
		centerTitle,
		isFullscreen,
		showSelector,
		westSelected,
		westSelected?.hash,
		centerNoSelectorMeansNoResults,
		// {...centerProps}
	])

	// 'east' section, contains associated panels
	let east;
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
				disablePagination: true,
			},
			panels = _.map(associatedPanels, (associatedPanel, ix) => {
				const
					controlledByCenter = typeof associatedPanel.props.controlledByCenter === 'undefined' ? true : associatedPanel.props.controlledByCenter,
					thisAssociatedPanelProps = {
						selectorId: controlledByCenter ? centerSelector_id : westSelector_id,
						selectorSelected: controlledByCenter ? centerSelected : westSelected,
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
			east = <TabPanel
							title="Associated Information"
							w={eastWidth}
							startsCollapsed={eastStartsCollapsed}
							frame={true}
							isResizable={true}
							tabs={tabs}
							additionalButtons={additionalTabButtons}
						/>;
		} else {
			// Single container holds them
			east = <Panel
							title="Associated Information"
							w={eastWidth}
							startsCollapsed={eastStartsCollapsed}
							frame={true}
							isResizable={true}
						>{panels}</Panel>;
		}
	}

	return <Container
				west={west}
				isWestCollapsed={isWestCollapsed}
				setIsWestCollapsed={setIsWestCollapsed}
				center={center}
				east={east}
				isEastCollapsed={isEastCollapsed}
				setIsEastCollapsed={setIsEastCollapsed}
			/>;
}