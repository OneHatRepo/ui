import {
	SELECTION_MODE_MULTI,
} from '../../../../Constants/Selection.js';
import Combo from './Combo.js';

export default function Tag(props) {
	return <Combo
				selectionMode={SELECTION_MODE_MULTI}
				disableDirectEntry={true}
				allowToggleSelection={true}
				disablePagination={true}
				disableAdjustingPageSizeToHeight={true}
				pageSize={1000}
				{...props}
			/>;
}
