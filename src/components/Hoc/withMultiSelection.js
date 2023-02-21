import {
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';

export default function withMultiSelection(WrappedComponent) {
	return (props) => {
		const
			{
				selectionMode = SELECTION_MODE_MULTI,
			} = props;
		return <WrappedComponent
					selectionMode={selectionMode}
					{...props}
				/>;
	};
}