import React, { useState, } from 'react';
import {
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../constants/Selection';

export default function withSelection(WrappedComponent) {
	return (props) => {
		const
			{
				defaultSelection,
				onSelect,
				selectionMode = SELECTION_MODE_MULTI, // SELECTION_MODE_MULTI, SELECTION_MODE_SINGLE
			} = props,
			[selection, setSelection] = useState(defaultSelection ? [defaultSelection] : []),
			setSelectionDecorator = (selection) => {
				if (onSelect) {
					onSelect(selection);
				}
				setSelection(selection);
			};

		return <WrappedComponent
					{...props}
					selection={selection}
					setSelection={setSelectionDecorator}
					selectionMode={selectionMode}
				/>;
	};
}