import { forwardRef } from 'react';
import {
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection.js';
import { withInjectedHocProps } from '../../Functions/internalHocProps.js';

export default function withMultiSelection(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {
				selectionMode = SELECTION_MODE_MULTI,
			} = props;
		return <WrappedComponent
					{...withInjectedHocProps(props, {
						selectionMode,
					})}
					ref={ref}
				/>;
	});
}