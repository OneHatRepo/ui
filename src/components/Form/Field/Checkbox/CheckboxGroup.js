import React, { useState, useEffect, } from 'react';
import {
	Checkbox, CheckboxGroup,
} from '@project-components/Gluestack';
import testProps from '../../../../Functions/testProps.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import withTooltip from '../../../Hoc/withTooltip.js';
import _ from 'lodash';

const
	CheckboxGroupElement = (props) => {
		const {
				value,

				// withData
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
				if (!Repository.isDestroyed) {
					const entities = Repository.getEntitiesOnPage();
					checkboxes = _.map(entities, (entity, ix) => {
						return <Checkbox
									{...testProps('checkbox-' + entity.id)}
									key={ix}
									value={entity.id}
									{...checkboxProps}
								>{entity.displayValue}</Checkbox>;
					});
				}
			} else {
				checkboxes = _.map(data, (datum, ix) => {
					return <Checkbox
								{...testProps('checkbox-' + datum[idIx])}
								key={ix}
								value={datum[idIx]}
								{...checkboxProps}
							>{datum[displayIx]}</Checkbox>;
				});
			}
			setCheckboxes(checkboxes);
		}, [value]);

		return <CheckboxGroup
					onChange={props.setValue}
					accessibilityLabel={props.name}
					ref={props.outerRef}
					{...props}
				>
					{checkboxes}
				</CheckboxGroup>;
	},
	CheckboxGroupField = withValue(withData(CheckboxGroupElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <CheckboxGroupField {...props} outerRef={ref} />;
}));
