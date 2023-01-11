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
import Container from '../Container/Container';
import Panel from '../Panel/Panel';
import TabPanel from '../Panel/TabPanel';
import _ from 'lodash';

export default function DataMgt(props) {
	let {
			show_selector = false,
			WestCoastElementType,
			westCoastTitle,
			westCoastStartsCollapsed = false,
			westCoastWidth = 300,
			westCoastProps = {},
			// westCoastPermission,
			IllinoisElementType,
			illinoisNoSelectorMeansNoResults = true,
			illinoisSelector_id, // what selectorId illinois listens to (and a few other things)
			illinoisProps = {},
			eastCoastStartsCollapsed = false,
			eastCoastWidth = 340,
			associatedPanels = [], // array of panel config objects.
			associatedPanelsPerTab = 3,
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

		};
		

		
	// useEffect(() => {

	// 	// Wire up the events
	// 	if (FiltersElementType) {
	// 		relayEvents('illinois', 'filters', ['setInitialFilter']);
	// 		relayEvents('filters', 'illinois', ['swapFilter']);
	// 	}
	// 	if (ColumnsElementType) {
	// 		relayEvents('columns', 'illinois', ['changeColumns']);
	// 	}
	// 	if (WestCoastElementType) {
	// 		relayEvents('westCoast', 'illinois', ['changeSelection'], 'selector_');
	// 		// relayEvents(this, 'westCoast', ['externalChangeSelection']);
	// 	}
	// 	if (IndianaElementType) {
	// 		if (WestCoastElementType) {
	// 			relayEvents('westCoast', 'indiana', ['changeSelection'], 'selector_');
	// 		}
	// 		relayEvents('indiana', 'illinois', ['saveRecord', 'cancelEdit']);
	// 		relayEvents('illinois', 'indiana', ['changeSelection'], 'fromInlineGridEditor_');
	// 	}
		
	// 	// Assign events to associated panels
	// 	_.each(associatedPanels, (associatedPanel, ix) => {
	// 		if (associatedPanel.props.hasSelector) {
	// 			relayEvents('illinois', 'associatedPanel' + ix, ['changeSelection'], 'selector_');
	// 		}
	// 		// if (config.xtype === 'uploadDownload') {
	// 		// 	illinois.relayEvents(associatedPanel, ['batchUpload']);
	// 		// 	associatedPanel.relayEvents(illinois, ['changeFilterSettings', 'changeSortOrder']);
	// 		// 	associatedPanel.relayEvents(oThis, ['changeNode', 'changeColumns', 'changeLockout']);
	// 		// 	if (westCoast && oThis.illinoisSelector_id) {
	// 		// 		associatedPanel.setSelectorId(oThis.illinoisSelector_id);
	// 		// 		associatedPanel.relayEvents(westCoast, ['changeSelection'], 'selector_');
	// 		// 	}
	// 		// }
	// 	});
		
	// }, []);


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
	if (show_selector && WestCoastElementType) {

		// TODO: Add in event handlers that tie this panel to others
		westCoast = <WestCoastElementType
						// _panel={{
						// 	w: westCoastWidth,
						// }}
						w={westCoastWidth}
						// maxWidth="230px" // this breaks drag resize!
						title={westCoastTitle}
						startsCollapsed={westCoastStartsCollapsed}
						collapseDirection={HORIZONTAL}
						split={true}
						frame={false}
						loadAfterRender={true}
						disablePaging={true}
						uniqueRepository={true}
						selectionMode={SELECTION_MODE_SINGLE}
						onChangeSelection={setWestCoastSelectorSelected}
						onNavigateTo={onNavigateTo}
						reference="westCoast"
						{...westCoastProps}
					/>;
	}

	// 'illinois' section
	if (IllinoisElementType) {
		if (!show_selector && illinoisNoSelectorMeansNoResults) {
			illinoisNoSelectorMeansNoResults = false;
		}
		// let illinoisTitle = 'Filters';
		illinois = <IllinoisElementType
						// title={illinoisTitle}
						isCollapsible={false}
						frame={false}
						split={false}
						selectorId={show_selector ? illinoisSelector_id : null}
						selectorSelected={westCoastSelectorSelected}
						noSelectorMeansNoResults={illinoisNoSelectorMeansNoResults}
						onToggleFullscreen={onToggleFullscreen}
						isFullscreen={isFullscreen}
						onChangeSelection={setIllinoisSelectorSelected}
						onNavigateTo={onNavigateTo}
						reference="illinois"
						{...illinoisProps}
					/>;
	}

	// 'eastCoast' section
	if (associatedPanels.length) {
		const
			tabs = [],
			associatedPanelProps = {
				// isCollapsible: false,

				onNavigateTo,
			};
		if (associatedPanels.length > associatedPanelsPerTab) {
			let tabIx = 0,
				panelIx = 0;
			_.each(associatedPanels, (associatedPanel, ix) => {
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
				if (!_.isEmpty(associatedPanelProps)) {
					associatedPanel = React.cloneElement(associatedPanel, { reference: 'associatedPanel' + ix, ...associatedPanelProps});
				}
				tabs[tabIx].items.push(associatedPanel);
				panelIx++;
			});
			eastCoast = <TabPanel
							title="Associated Information"
							// _panel={{
							// 	w: eastCoastWidth,
							// }}
							w={eastCoastWidth}
							startsCollapsed={eastCoastStartsCollapsed}
							frame={true}
							split={true}
							tabs={tabs}
							additionalButtons ={[
								<Button onPress={() => { debugger; }}>Test</Button>
							]}
						/>;
		} else {
			eastCoast = <Panel
							title="Associated Information"
							startsCollapsed={eastCoastStartsCollapsed}
							frame={true}
							split={true}
							w={eastCoastWidth}
						>
								{_.map(associatedPanels, (associatedPanel, ix) => {
									return React.cloneElement(associatedPanel, { key: ix, reference: 'associatedPanel' + ix, ...associatedPanelProps});
								})}
						</Panel>;
		}
	}
	
	
	

	// // Actions for event 'navigateTo'
	// this.selectWestCoast = function(id, callback) {
	// 	var store = westCoast.getStore(),
	// 		proxy = store.getProxy();

	// 	// abort any currently running loads
	// 	proxy.abort();

	// 	// reload, so we can attach a callback
	// 	store.reload({
	// 		callback: function() {
	// 			var record = store.getById(id);
	// 			westCoast.getSelectionModel().select(record);
	// 			if (callback) {
	// 				callback();
	// 			}
	// 		}
	// 	});
	// };

	// // External API to set the general search box in illinois
	// this.searchAllText = function(q) {
	// 	illinois.setFilterValue('searchAllText', q);
	// };
	
	// this.addIllinoisRecord = function(data, callback) {
	// 	var store = illinois.getStore(),
	// 		proxy = store.getProxy();

	// 	// abort any currently running loads
	// 	proxy.abort();

	// 	// reload, so we can attach a callback
	// 	store.reload({
	// 		callback: function() {
	// 			illinois.getController().addRecord(data);
	// 			if (callback) {
	// 				callback();
	// 			}
	// 		}
	// 	});
	// };

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