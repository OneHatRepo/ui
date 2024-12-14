// These are the default styles of the @onehat/ui components.
// App can override these with Functions/registerStyles()
const
	DEFAULT_FONTSIZE = 'base',
	BLACK = 'black',
	WHITE = 'white',
	FOCUS = 'focus-200',
	HOVER = 'primary-200';

const defaults = {
	ATTACHMENTS_MAX_FILESIZE: 1024 * 1024 * 5, // 5MB
	CONTEXT_MENU_WIDTH: 180,
	CONTEXT_MENU_ITEM_HEIGHT: 30,
	DEFAULT_WINDOW_WIDTH: 900,
	DEFAULT_WINDOW_HEIGHT: 800,
	FILTER_LABEL_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_ANCILLARY_TITLE_CLASSNAME: 'text-[22px]',
	FORM_ANCILLARY_DESCRIPTION_CLASSNAME: 'text-[16px]',
	FORM_COLOR_INPUT_CLASSNAME: 'text-' + DEFAULT_FONTSIZE + ' ' +
								'bg-' + WHITE + ' ' + 
								'focus:bg-' + FOCUS,
	FORM_COMBO_INPUT_CLASSNAME: 'text-' + DEFAULT_FONTSIZE + ' ' + 
								'bg-' + WHITE + ' ' +
								'focus:bg-' + FOCUS,
	FORM_COMBO_MENU_HEIGHT: 250,
	FORM_COMBO_MENU_MIN_WIDTH: 250,
	FORM_COMBO_TRIGGER_CLASSNAME: 'bg-' + WHITE + ' ' +
									'hover:bg-grey-300',
	FORM_DATE_CLASSNAME: 'h-[40px]',
	FORM_DATE_TRIGGER_CLASSNAME: 'bg-primary-200 ' +
								'hover:bg-primary-400',
	FORM_DATE_TRIGGER_ICON_CLASSNAME: 'text-' + WHITE,
	FORM_DATE_INPUT_CLASSNAME: 'bg-' + WHITE + ' ' +
								'focus:bg-' + FOCUS + ' ' +
								'text-' + DEFAULT_FONTSIZE,
	FORM_FIELDSET_FONTSIZE: 'text-' + DEFAULT_FONTSIZE,
	FORM_FIELDSET_BG: 'bg-[#f6f6f6]',
	// FORM_FILE_ICON_BG: 'bg-primary-200',
	// FORM_FILE_ICON_BG_HOVER: 'hover:bg-primary-400',
	// FORM_FILE_ICON_COLOR: 'text-' + WHITE,
	// FORM_FILE_INPUT_FONTSIZE: 'text-' + DEFAULT_FONTSIZE,
	// FORM_FILE_READOUT_FONTSIZE: 'text-' + DEFAULT_FONTSIZE,
	// FORM_FILE_READOUT_BG: 'bg-' + WHITE,
	FORM_INPUT_CLASSNAME: 'bg-' + WHITE + ' ' +
						'focus:bg-' + FOCUS + ' ' +
						'hover:bg-' + HOVER,
	FORM_INPUT_FIELD_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_LABEL_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_SELECT_CLASSNAME: 'text-' + DEFAULT_FONTSIZE + ' ' + 
							'bg-grey-100 ' +
							'focus:bg-' + FOCUS + ' ' +
							'hover:bg-' + HOVER,
	FORM_TAG_CLASSNAME: '',
	FORM_TAG_VALUEBOX_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_TAG_VALUEBOX_ICON_SIZE: 'sm',
	FORM_TAG_BTN_CLASSNAME: '',
	FORM_TEXT_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_TEXTAREA_CLASSNAME: 'bg-' + WHITE + ' ' +
							'text-' + DEFAULT_FONTSIZE + ' ' +
							'h-[130px]',
	FORM_TOGGLE_BG: null,
	FORM_TOGGLE_READOUT_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	FORM_TOGGLE_SIZE: 'md',
	FORM_TOGGLE_ON_COLOR: '#0b0',
	FORM_TOGGLE_OFF_COLOR: '#f00',
	FORM_ONE_COLUMN_THRESHOLD: 900, // only allow one column in form unless form is wider than this
	FORM_STACK_ROW_THRESHOLD: 400, // stack labels & fields if row is less than this width
	GRID_CELL_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	GRID_EXPAND_BTN_CLASSNAME: '',
	GRID_HEADER_PRESSABLE_CLASSNAME: 'bg-[#eee] ' +
									'hover:bg-[#ddd]',
	GRID_HEADER_CLASSNAME: 'text-' + DEFAULT_FONTSIZE,
	GRID_HEADER_ICON_CLASSNAME: 'mt-3 mr-2',
	GRID_HEADER_ICON_SIZE: 'sm',
	GRID_NAV_COLUMN_COLOR: 'text-grey-400',
	GRID_ROW_BG: '#fff', // must be hex
	GRID_ROW_ALTERNATE_BG: '#ddd', // must be hex
	GRID_ROW_BG_HOVER: '#ccc', // must be hex
	GRID_ROW_SELECTED_BG: '#ff0', // must be hex
	GRID_ROW_SELECTED_BG_HOVER: '#cc0', // must be hex
	GRID_REORDER_BORDER_COLOR: 'border-[#23d9ea]',
	GRID_REORDER_BORDER_WIDTH: 'border-4',
	GRID_REORDER_BORDER_STYLE: 'border-dashed',
	ICON_BUTTON_CLASSNAME: 'bg-grey-100 ' + 
							'active:bg-grey-900/50 ' +
							'disabled:bg-grey-200 ' +
							'hover:bg-grey-900/20',
	INLINE_EDITOR_MIN_WIDTH: 'min-w-[150px]',
	PANEL_FOOTER_CLASSNAME: 'border-t-primary-300', // :alpha.50
	PANEL_HEADER_BG: 'bg-primary-500',
	PANEL_HEADER_ICON_CLASSNAME: 'text-' + WHITE,
	PANEL_HEADER_ICON_SIZE: 'md',
	PANEL_HEADER_TEXT_CLASSNAME: 'text-' + WHITE + ' ' +
								'text-[18px]',
	SLIDER_MIN_TRACK_COLOR: '#000',
	SLIDER_MAX_TRACK_COLOR: '#ccc',
	SLIDER_THUMB_COLOR: '#000',
	SLIDER_READOUT_FONTSIZE: 'text-' + DEFAULT_FONTSIZE,
	TAB_BAR_CLASSNAME: 'bg-grey-300',
	TAB_BG: 'bg-grey-300',
	TAB_BG_ACTIVE: 'active:bg-grey-900/50',
	TAB_BG_CURRENT: 'bg-grey-0',
	TAB_BG_DISABLED: 'disabled:bg-grey-200',
	TAB_BG_HOVER: 'hover:bg-grey-900/30',
	TAB_BG_ACTIVE_HOVER: 'hover:bg-grey-200',
	TAB_BG_CURRENT_HOVER: 'hover:bg-grey-900/30',
	TAB_COLOR: 'text-' + BLACK,
	TAB_COLOR_ACTIVE: 'active:text-primary-800',
	TAB_COLOR_CURRENT: 'active:text-primary-800',
	TAB_ICON_COLOR: 'text-' + BLACK,
	TAB_ICON_COLOR_ACTIVE: 'text-' + BLACK,
	TAB_ICON_COLOR_CURRENT: 'text-' + BLACK,
	TAB_ICON_COLOR_HOVER: 'group-hover/button:text-' + BLACK,
	TAB_ICON_COLOR_DISABLED: 'group-disabled/button:text-grey-400',
	TAB_FONTSIZE: 'text-md',
	TEXT_FONTSIZE: 'text-' + DEFAULT_FONTSIZE,
	TREE_NODE_CLASSNAME: 'text-' + DEFAULT_FONTSIZE + ' ' +
						'px-2 ' + 
						'py-3',
	TREE_NODE_BG: '#fff', // must be hex
	TREE_NODE_BG_HOVER: '#cce', // must be hex
	TREE_NODE_SELECTED_BG: '#ff0', // must be hex
	TREE_NODE_SELECTED_BG_HOVER: '#cc0', // must be hex
	TREE_NODE_HIGHLIGHTED_BG: '#0f0', // must be hex
	TOOLBAR_CLASSNAME: 'bg-grey-200',
	TOOLBAR_ITEMS_COLOR: 'text-grey-800',
	TOOLBAR_ITEMS_ICON_SIZE: 'sm',
	VIEWER_ANCILLARY_FONTSIZE: 'text-[22px]',
};

export default defaults;
