import { useState, useEffect, } from 'react';
import {
	Button,
	Column,
	Icon,
	Row,
	ScrollView,
	Text,
} from 'native-base';
import Form from './Form.js';
import _ from 'lodash';


function FiltersForm(props) {

	let 
		Filter1Element,
		Filter2Element,
		Filter3Element,
		Filter4Element,
		Filter5Element;

	return <Form
				flex={1}
				values={{
					// fields that are not a part of the entity,
					// but should still be controlled by form (with validation if needed)
					// Anything which is 'null' is uncontrolled (RN behavior)
					filter1: '',
					filter2: '',
					filter3: '',
					filter4: '',
					filter5: '',
				}}
				items={[
					{
						type: Filter1Element,
						label: 'Filter 1',
						name: 'filter1',
					},
					{
						type: Filter2Element,
						label: 'Filter 2',
						name: 'filter2',
					},
					{
						type: Filter3Element,
						label: 'Filter 3',
						name: 'filter3',
					},
					{
						type: Filter4Element,
						label: 'Filter 4',
						name: 'filter4',
					},
					{
						type: Filter5Element,
						label: 'Filter 5',
						name: 'filter5',
					},
				]}
			/>;

}

export default FiltersForm;