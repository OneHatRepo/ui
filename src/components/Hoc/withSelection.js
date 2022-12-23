import React, { useState, } from 'react';

export default function withSelection(WrappedComponent) {
	return (props) => {
		const
			[selection, setSelection] = useState([]);

		return <WrappedComponent
					{...props}
					selection={selection}
					setSelection={setSelection}
				/>;
	};
}