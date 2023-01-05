import React, { useState, } from 'react';
import {
	Column,
	Row,
} from 'native-base';
import {
	HORIZONTAL,
	VERTICAL,
} from '../../constants/Directions';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../constants/Selection';
import Container from '../Container/Container';
import GridPanel from '../Panel/GridPanel';
import Panel from '../Panel/Panel';
import TabPanel from '../Panel/TabPanel';
import _ from 'lodash';

// Note on collapseDirections:
// HORIZONTAL means the Panel collapses along the X axis.
// VERTICAL means the Panel collapses along the Y axis.

export default function DataMgt(props) {
	let {
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
			setDynamicConfig, // fn for setting config at runtime

			...propsToPass
		} = props,
		
		// Layout regions - names indicate their general position
		westCoast,
		iowa,
		illinois,
		indiana,
		eastCoast,
		midwest,
		filters,
		columns;
	
	// if (setDynamicConfig) {
	// 	setDynamicConfig();
	// }
	
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

	// 'westCoast' section, AKA 'selector', the far-left column
	if (show_selector && WestCoastElementType) {

		// TODO: Add in event handlers that tie this panel to others

		westCoast = <WestCoastElementType
						title={westCoastTitle}
						isCollapsed={westCoastStartsCollapsed}
						collapseDirection={HORIZONTAL}
						split={true}
						frame={false}
						w={westCoastWidth}
						loadAfterRender={true}
						disablePaging={true}
						uniqueRepository={true}
						selectionMode={SELECTION_MODE_SINGLE}
						{...westCoastProps}
					/>;
	}

	// 'iowa' section
	if ((show_filters && FiltersElementType) || (show_columns && ColumnsElementType)) {
		let iowaTitle = 'Filters',
			iowaChildren = null;
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
					isCollapsed={iowaStartsCollapsed}
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
						noSelectorMeansNoResults={illinoisNoSelectorMeansNoResults}
						{...illinoisProps}
					/>;
	}

	// 'indiana' section
	if (show_editor && IndianaElementType) {
		indiana = <IndianaElementType
						title="Editor"
						isCollapsed={indianaStartsCollapsed}
						frame={true}
						split={false}
						w={330}
						selector_id={indianaSelector_id}
						noSelectorMeansNoResults={true}
						{...indianaProps}
					/>;
	}

	// 'eastCoast' section
	if (associatedPanels.length) {
		const
			tabs = [],
			associatedPanelProps = {
				isCollapsible: false,
			};
		if (associatedPanels.length > associatedPanelsPerTab) {
			let ix = 0,
				tabIx = 0,
				panelIx = 0,
				tabItems;
			_.each(associatedPanels, (associatedPanel) => {
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
				ix++;
			});
		} else {
			_.each(associatedPanels, (config, ix) => {
				if (config) {
					eastCoast.items[eastCoast.items.length] = Ext.applyIf(config, {
						reference: 'associated' + ix,
						selectorMode: OneHat.Globals.SINGLE,
						flex: 1
					});
				}
			});
		}

		_.map(associatedPanels, (associatedPanel) => {
			return React.cloneElement(associatedPanel, {...associatedPanelProps});
		})
		eastCoast = <TabPanel
						title="Associated Information"
						isCollapsed={eastCoastStartsCollapsed}
						frame={true}
						split={true}
						w={eastCoastWidth}
						tabs={tabs}
					/>;
	}

	// eastCoast = { // far-right column
	// 	layout: 'vbox',
	// 	region: 'east',
	// 	title: 'Associated Information',
	// 	split: true,
	// 	frame: true,
	// 	reference: 'eastCoast',
	// 	cls: 'eastCoast',
	// 	itemCls: 'associated',
	// 	collapsible: true,
	// 	collapsed: eastCoastStartsCollapsed,
	// 	width: eastCoastWidth,
	// 	items: []
	// };
	
	
	
	// midwest.items[midwest.items.length] = illinois;
	// if (show_editor){
	// 	midwest.items[midwest.items.length] = indiana;
	// }
	// items[items.length] = midwest;
	
	// // eastCoast region (far-right)
	// if (!associatedPanels.length) {
	// 	associatedPanels = []; // replace with new array, otherwise we get prototypal inheritance collisions
	// }
	// attachDeprecatedPanels(); // for backwards compatibility
	// if (associatedPanels.length) {
		
	// 	// Split these into a tabpanel if >3
	// 	var tabs = [],
	// 		tabIx = 0,
	// 		panelIx = 0,
	// 		tabItems;
		
	// 	if (associatedPanels.length > associatedPanelsPerTab) {
	// 		var ix = 0;
	// 		Ext.each(associatedPanels, function(config, n) {
	// 			if (config) {
	// 				// New tab
	// 				if (panelIx === oThis.associatedPanelsPerTab) {
	// 					panelIx = 0;
	// 					tabIx++;
	// 				}
	// 				if (panelIx === 0) {
	// 					tabs[tabIx] = {
	// 						title: 'Page ' + (tabIx +1),
	// 						layout: 'vbox',
	// 						split: true,
	// 						frame: true,
	// 						items: []
	// 					};
	// 				}
	// 				tabItems = tabs[tabIx].items;
	// 				tabItems[tabItems.length] = Ext.applyIf(config, {
	// 					reference: 'associated' + ix,
	// 					selectorMode: OneHat.Globals.SINGLE,
	// 					flex: 1
	// 				});
	// 				panelIx++;
	// 				ix++;
	// 			}
	// 		});
	// 		eastCoast.xtype = 'tabpanel';
	// 		eastCoast.deferredRender = false; // otherwise, selectorSelected won't work for panels on page 2+
	// 		eastCoast.split = null;
	// 		eastCoast.frame = null;
	// 		eastCoast.items = tabs;
	// 	} else {
	// 		Ext.each(associatedPanels, function(config, ix) {
	// 			if (config) {
	// 				eastCoast.items[eastCoast.items.length] = Ext.applyIf(config, {
	// 					reference: 'associated' + ix,
	// 					selectorMode: OneHat.Globals.SINGLE,
	// 					flex: 1
	// 				});
	// 			}
	// 		});
	// 	}
	// 	items[items.length] = eastCoast;
	// }
	
	// items = items;
	
	
	// this.callParent(arguments);
	
	
	// // Get references
	// westCoast = this.lookupReference('westCoast');
	// midwest = this.lookupReference('midwest');
	// filters = this.lookupReference('filters');
	// columns = this.lookupReference('columns');
	// iowa = this.lookupReference('iowa');
	// illinois = this.lookupReference('illinois');
	// indiana = this.lookupReference('indiana');
	// eastCoast = this.lookupReference('eastCoast');
	
	
	// // Relay events
	// if (this.passActivationEvents) {
	// 	illinois.relayEvents(this, ['activate', 'deactivate']);
	// }
	// if (filters) {
	// 	filters.relayEvents(illinois, ['setInitialFilter']);
	// 	illinois.relayEvents(this, ['swapFilter']);
	// }
	// if (columns) {
	// 	illinois.relayEvents(columns, ['changeColumns']);
	// }
	// if (westCoast) {
	// 	illinois.relayEvents(westCoast, ['changeSelection'], 'selector_');
	// 	if (this.passActivationEvents) {
	// 		westCoast.relayEvents(this, ['activate', 'deactivate']);
	// 	}
	// 	westCoast.relayEvents(this, ['externalChangeSelection']);
	// }
	// if (indiana) {
	// 	if (westCoast) {
	// 		indiana.relayEvents(westCoast, ['changeSelection'], 'selector_');
	// 	}
	// 	illinois.relayEvents(indiana, ['saveRecord', 'cancelEdit']);
	// 	indiana.relayEvents(illinois, ['changeSelection'], 'fromInlineGridEditor_');
	// }
	
	// // Assign events to associated panels
	// Ext.each(this.associatedPanels, function(config, ix) {
	// 	var ap = oThis.associatedPanels;
	// 	if (!config) {
	// 		return;
	// 	}
	// 	var associatedPanel = oThis.lookupReference('associated' + ix);
	// 	if (config.has_selector) {
	// 		associatedPanel.relayEvents((config.controlled_by_illinois ? illinois : westCoast), ['changeSelection'], 'selector_');
	// 	}
	// 	if (config.xtype === 'uploadDownload') {
	// 		illinois.relayEvents(associatedPanel, ['batchUpload']);
	// 		associatedPanel.relayEvents(illinois, ['changeFilterSettings', 'changeSortOrder']);
	// 		associatedPanel.relayEvents(oThis, ['changeNode', 'changeColumns', 'changeLockout']);
	// 		if (westCoast && oThis.illinoisSelector_id) {
	// 			associatedPanel.setSelectorId(oThis.illinoisSelector_id);
	// 			associatedPanel.relayEvents(westCoast, ['changeSelection'], 'selector_');
	// 		}
	// 	}
	// });
	
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
				center={<Container
							west={iowa}
							center={illinois}
							east={indiana}
						/>}
				east={eastCoast}
			/>;
}