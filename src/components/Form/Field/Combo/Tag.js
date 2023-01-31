import {
	SELECTION_MODE_MULTI,
} from '../../../../Constants/Selection';
import Combo from './Combo';

export default function Tag(props) {
	return <Combo
				selectionMode={SELECTION_MODE_MULTI}
				disableDirectEntry={true}
				{...props}
			/>;
}
