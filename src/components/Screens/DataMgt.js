import React, { useState, useEffect, useMemo, useId, } from 'react';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../Constants/Directions.js';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import Container from '../Container/Container.js';
import Panel from '../Panel/Panel.js';
import TabPanel from '../Panel/TabPanel.js';
import UploadDownload from '../Panel/UploadDownload.js';
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
			getSaved,
			setSaved,
		} = props;

	const
		id = useId(),
		// westRef = useRef(),
		[isReady, setIsReady] = useState(false),
		[isWestCollapsed, setIsWestCollapsedRaw] = useState(westStartsCollapsed),
		[isEastCollapsed, setIsEastCollapsedRaw] = useState(eastStartsCollapsed),
		[isFullscreen, setIsFullscreenRaw] = useState(false),
		[westSelected, setWestSelectedRaw] = useState(),
		[centerSelected, setCenterSelected] = useState(),
		setIsWestCollapsed = (bool) => {
			setIsWestCollapsedRaw(bool);
			if (setSaved) {
				setSaved(id + '-isWestCollapsed', bool);
			}
		},
		setIsEastCollapsed = (bool) => {
			setIsEastCollapsedRaw(bool);
			if (setSaved) {
				setSaved(id + '-isEastCollapsed', bool);
			}
		},
		setIsFullscreen = (bool) => {
			setIsFullscreenRaw(bool);
			if (setSaved) {
				setSaved(id + '-isFullscreen', isFullscreen);
			}
		},
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

	useEffect(() => {
		if (!getSaved) {
			setIsReady(true);
			return () => {};
		}

		// Restore saved settings
		(async () => {

			let key, val;
			key = id + '-isWestCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setIsWestCollapsedRaw(val);
			}

			key = id + '-isEastCollapsed';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setIsEastCollapsedRaw(val);
			}

			key = id + '-isFullscreen';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setIsFullscreenRaw(val);
			}

			key = id + '-westSelected';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setWestSelectedRaw(val);
			}

			key = id + '-centerSelected';
			val = await getSaved(key);
			if (!_.isNil(val)) {
				setCenterSelectedRaw(val);
			}

			if (!isReady) {
				setIsReady(true);
			}
		})();
	}, []);

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
					selectorSelected={westSelected?.[0]}
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
		westSelected?.[0]?.hash,
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
						selectorSelected: controlledByCenter ? centerSelected?.[0] : westSelected?.[0],
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

	if (!isReady) {
		return null;
	}

	return <Container
				west={west}
				isWestCollapsed={isWestCollapsed}
				setIsWestCollapsed={setIsWestCollapsed}
				center={center}
				east={east}
				isEastCollapsed={isEastCollapsed}
				setIsEastCollapsed={setIsEastCollapsed}
				getSaved={getSaved}
				setSaved={setSaved}
			/>;
}