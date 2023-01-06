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
	const {
			show_selector = false,
			show_filters = false,
			show_columns = false,
			show_editor = false,
			WestCoastElementType,
			westCoastTitle,
			westCoastStartsCollapsed = false,
			westCoastWidth = 300,
			westCoastProps = {},
			// westCoastPermission,
			iowaStartsCollapsed = false,
			FiltersElementType,
			filtersProps = {},
			ColumnsElementType,
			columnsProps = {},
			IllinoisElementType,
			illinoisNoSelectorMeansNoResults = true,
			illinoisSelector_id, // what selector_id illinois listens to (and a few other things)
			illinoisProps = {},
			IndianaElementType,
			indianaStartsCollapsed = false,
			indianaSelector_id, // What selector_id to use for the Indiana formPanel
			indianaProps = {},
			eastCoastStartsCollapsed = false,
			eastCoastWidth = 340,
			associatedPanels = [], // array of panel config objects.
			associatedPanelsPerTab = 3,
		} = props,
		// westCoastRef = useRef(),
		// columnsRef = useRef(),
		// filtersRef = useRef(),
		[isWestCoastCollapsed, setIsWestCoastCollapsed] = useState(westCoastStartsCollapsed),
		[isEastCoastCollapsed, setIsEastCoastCollapsed] = useState(eastCoastStartsCollapsed),
		[isIowaCollapsed, setIsIowaCollapsed] = useState(iowaStartsCollapsed),
		[isIndianaCollapsed, setIsIndianaCollapsed] = useState(indianaStartsCollapsed),
		[isFullscreen, setIsFullscreen] = useState(false),
		// [eventsMapping, setEventsMapping] = useState({}),
		[illinoisSelectorSelected, setIllinoisSelectorSelected] = useState(),
		[filtersFilters, setFiltersFilters] = useState(),
		onToggleFullscreen = () => {
			const newIsFullScreen = !isFullscreen;
			setIsFullscreen(!newIsFullScreen);
			if (newIsFullScreen) {
				setIsWestCoastCollapsed(true);
				setIsEastCoastCollapsed(true);
				setIsIowaCollapsed(true);
				setIsIndianaCollapsed(true);
			} else {
				setIsWestCoastCollapsed(false);
				setIsEastCoastCollapsed(false);
				setIsIowaCollapsed(false);
				setIsIndianaCollapsed(false);
			}
		},
		fireEvent = (fromRef, eventName, args) => {
			if (!eventsMapping[fromRef]) {
				debugger;
			}
			if (!eventsMapping[fromRef][eventName]) {
				debugger;
			}

			// Fire event
			_.each(eventsMapping[fromRef][eventName], (roRef) => {
				debugger;
				switch(eventName) {
					case 'setInitialFilter':
						onSetInitialFilter(args);
						break;
					case 'swapFilter':
						onSwapFilter(args);
						break;
					case 'changeSelection':
						onChangeSelection(args);
						break;
					default:
				}
			});
		},
		onIllinoisSetInitialFilterToFilters = (filters) => {
			setFiltersFilters(filters);
		},
		onChangeSelectorSelected = (selectorSelected) => {
			setIllinoisSelectorSelected(selectorSelected);
		};
		

		
	// useEffect(() => {
	// 	const
	// 		eventsMapping = {},
	// 		relayEvents = (fromRef, toRef, eventNames = [], prefix, handler) => {
	// 			_.each(eventNames, (eventName) => relayEvent(fromRef, toRef, eventName, prefix, handler))
	// 		},
	// 		relayEvent = (fromRef, toRef, eventName, prefix = '', handler) => {
	// 			if (!eventsMapping[fromRef]) {
	// 				eventsMapping[fromRef] = {};
	// 			}
	// 			if (!eventsMapping[fromRef][prefix + eventName]) {
	// 				eventsMapping[fromRef][prefix + eventName] = [];
	// 			}
	// 			// if (!eventsMapping[fromRef][prefix + eventName][toRef]) {
	// 			// 	eventsMapping[fromRef][prefix + eventName][toRef] = {};
	// 			// }
	// 			eventsMapping[fromRef][prefix + eventName].push(toRef);
	// 		};

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
		
	// 	setEventsMapping(eventsMapping);
	// }, []);

	
	//   REGIONS ------------------------------------------------------------------------
	// 	[				] [											] [					]
	// 	[	westCoast	] [					midwest					] [	  eastCoast		]
	// 	[				] [											] [					]
	//   SUB-REGIONS --------------------------------------------------------------------
	// 	[				] [			] [					] [			] [					]
	//	[				] [	  iowa	] [	   illinois		] [	indiana	] [		tabpanel?	]
	// 	[				] [			] [					] [			] [					]
	//   PANELS -------------------------------------------------------------------------
	// 	[				] [	filters	] [					] [			] [	associated1		]
	// 	[				] [			] [					] [			] [	associated2		]
	// 	[				] [	columns	] [					] [			] [	associated3...	]
	// 	[				] [			] [					] [			] [	uploadDownload	]
	//   --------------------------------------------------------------------------------

	let westCoast,
		iowa,
		illinois,
		indiana,
		eastCoast;

	// 'westCoast' section, AKA 'selector', the far-left column
	if (show_selector && WestCoastElementType) {

		// TODO: Add in event handlers that tie this panel to others

		westCoast = <WestCoastElementType
						title={westCoastTitle}
						startsCollapsed={westCoastStartsCollapsed}
						collapseDirection={HORIZONTAL}
						split={true}
						frame={false}
						w={westCoastWidth}
						loadAfterRender={true}
						disablePaging={true}
						uniqueRepository={true}
						selectionMode={SELECTION_MODE_SINGLE}
						fireEvent={fireEvent}
						reference={'westCoast'}
						// ref={westCoastRef}
						{...westCoastProps}
					/>;
	}

	// 'iowa' section
	if ((show_filters && FiltersElementType) || (show_columns && ColumnsElementType)) {
		let iowaTitle = 'Filters',
			iowaChildren = null;
			columnsProps.fireEvent = fireEvent;
			columnsProps.reference = 'columns';
			// columnsProps.ref = columnsRef;
			filtersProps.fireEvent = fireEvent;
			filtersProps.reference = 'filters';
			// filtersProps.ref = filtersRef;
			filtersProps.filters = filtersFilters;
			filtersProps.selectionMode = SELECTION_MODE_SINGLE;
		if ((show_filters && FiltersElementType) && (show_columns && ColumnsElementType)) {
			// Both filters and columns panels
			iowaChildren = <Container
								north={<FiltersElementType showHeader={false} h={200} {...filtersProps} />}
								center={<ColumnsElementType title="Columns" isCollapsible={false} {...columnsProps}/>}
							/>;
		} else if (show_filters && FiltersElementType) {
			// Only filters panel
			iowaChildren = <FiltersElementType showHeader={false} {...filtersProps} />;
		} else if (show_columns && ColumnsElementType) {
			// Only columns panel
			iowaTitle = 'Columns';
			iowaChildren = <ColumnsElementType showHeader={false} {...columnsProps} />;
		}
		iowa = <Panel
					title={iowaTitle}
					startsCollapsed={iowaStartsCollapsed}
					collapseDirection={HORIZONTAL}
					frame={false}
					split={false}
					w={185}
				>{iowaChildren}</Panel>;
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
						selector_id={show_selector ? illinoisSelector_id : null}
						selectorSelected={illinoisSelectorSelected}
						noSelectorMeansNoResults={illinoisNoSelectorMeansNoResults}
						onToggleFullscreen={onToggleFullscreen}
						isFullscreen={isFullscreen}
						fireEvent={fireEvent}
						reference={'illinois'}
						{...illinoisProps}
					/>;
	}

	// 'indiana' section
	if (show_editor && IndianaElementType) {
		indiana = <IndianaElementType
						title="Editor"
						startsCollapsed={indianaStartsCollapsed}
						frame={false}
						split={false}
						w={330}
						selector_id={indianaSelector_id}
						noSelectorMeansNoResults={true}
						fireEvent={fireEvent}
						reference={'indiana'}
						{...indianaProps}
					/>;
	}

	// 'eastCoast' section
	if (associatedPanels.length) {
		const
			tabs = [],
			associatedPanelProps = {
				fireEvent: fireEvent,
				// isCollapsible: false,
				// selectorMode: OneHat.Globals.SINGLE,
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
							startsCollapsed={eastCoastStartsCollapsed}
							frame={true}
							split={true}
							w={eastCoastWidth}
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
									return React.cloneElement(associatedPanel, { key: ix, ...associatedPanelProps});
								})}
						</Panel>;
		}
	}
	
	
	
	// this.on('toggleFullScreen', function(enable) {
	// 	if (enable) {
	// 		if (eastCoast) {
	// 			eastCoast.collapse();
	// 		}
	// 		if (indiana) {
	// 			indiana.collapse();
	// 		}
	// 		if (iowa) {
	// 			iowa.collapse();
	// 		}
	// 		if (westCoast) {
	// 			westCoast.collapse();
	// 		}
	// 	} else {
	// 		if (eastCoast) {
	// 			eastCoast.expand(null, false);
	// 		}
	// 		if (indiana) {
	// 			indiana.expand(null, false);
	// 		}
	// 		if (iowa) {
	// 			iowa.expand(null, false);
	// 		}
	// 		if (westCoast) {
	// 			westCoast.expand(null, false);
	// 		}
	// 	}
	// });

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
				center={<Container
							west={iowa}
							isWestCollapsed={isIowaCollapsed}
							setIsWestCollapsed={setIsIowaCollapsed}
							center={illinois}
							east={indiana}
							isEastCollapsed={isIndianaCollapsed}
							setIsEastCollapsed={setIsIndianaCollapsed}
						/>}
				east={eastCoast}
				isEastCollapsed={isEastCoastCollapsed}
				setIsEastCollapsed={setIsEastCoastCollapsed}
			/>;
}