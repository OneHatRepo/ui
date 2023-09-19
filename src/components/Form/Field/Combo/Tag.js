import {
	SELECTION_MODE_MULTI,
} from '../../../../Constants/Selection.js';
import Combo, { ComboEditor } from './Combo.js';

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					selectionMode={SELECTION_MODE_MULTI}
					valueIsAlwaysArray={true}
					valueAsIdAndText={true}
					valueAsStringifiedJson={true}
					disableDirectEntry={true}
					pageSize={500}
					{...props}
				/>;
	};
}

const Tag = withAdditionalProps(Combo);
export const TagEditor = withAdditionalProps(ComboEditor);

export default Tag;