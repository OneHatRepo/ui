import React, { useState, useEffect, } from 'react';
import {
	Column,
	Checkbox,
	Row,
} from 'native-base';
import withData from '../../../Hoc/withData';
import withValue from '../../../Hoc/withValue';
import withTooltip from '../../../Hoc/withTooltip';
import _ from 'lodash';

const
	CheckboxGroupElement = (props) => {
		const {
				value,

				// data source
				Repository,
				data,
				idIx,
				displayIx,
			} = props,
			[checkboxes, setCheckboxes] = useState([]);

		useEffect(() => {
			
			// adjust the checkboxes to match the value
			let checkboxes = [];
			const checkboxProps = {
			};
			if (Repository) {
				const entities = Repository.getEntitiesOnPage();
				checkboxes = _.map(entities, (entity, ix) => {
					return <Checkbox
								key={ix}
								value={entity.id}
								{...checkboxProps}
							>{entity.displayValue}</Checkbox>;
				});
			} else {
				checkboxes = _.map(data, (datum, ix) => {
					return <Checkbox
								key={ix}
								value={datum[idIx]}
								{...checkboxProps}
							>{datum[displayIx]}</Checkbox>;
				});
			}
			setCheckboxes(checkboxes);
		}, [value]);

		return <Checkbox.Group onChange={props.setValue} accessibilityLabel={props.name} {...props}>
					{checkboxes}
				</Checkbox.Group>;
	},
	CheckboxGroupField = withValue(withData(CheckboxGroupElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <CheckboxGroupField {...props} tooltipRef={ref} />;
}));
