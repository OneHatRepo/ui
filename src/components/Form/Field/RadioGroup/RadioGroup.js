import React, { useState, useEffect, } from 'react';
import {
	Column,
	Radio,
	Row,
} from 'native-base';
import withData from '../../../Hoc/withData';
import withValue from '../../../Hoc/withValue';
import withTooltip from '../../../Hoc/withTooltip';
import _ from 'lodash';

const
	RadioGroupElement = (props) => {
		const {
				value,

				// data source
				Repository,
				data,
				idIx,
				displayIx,
			} = props,
			[radios, setRadioes] = useState([]);

		useEffect(() => {

			// adjust the radios to match the value
			let radios = [];
			const radioProps = {
				my: '2px',
			};
			if (Repository) {
				const entities = Repository.getEntitiesOnPage();
				radios = _.map(entities, (entity, ix) => {
					return <Radio
								key={ix}
								value={entity.id}
								{...radioProps}
							>{entity.displayValue}</Radio>;
				});
			} else {
				radios = _.map(data, (datum, ix) => {
					return <Radio
								key={ix}
								value={datum[idIx]}
								{...radioProps}
							>{datum[displayIx]}</Radio>;
				});
			}
			setRadioes(radios);
		}, [value]);

		return <Radio.Group onChange={props.setValue} accessibilityLabel={props.name} {...props}>
					{radios}
				</Radio.Group>;
	},
	RadioGroupField = withValue(withData(RadioGroupElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <RadioGroupField {...props} outerRef={ref} />;
}));