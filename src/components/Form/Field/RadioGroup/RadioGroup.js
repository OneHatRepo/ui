import React, { useState, useEffect, } from 'react';
import {
	Column,
	Radio,
	Row,
} from 'native-base';
import withComponent from '../Hoc/withComponent.js';
import withData from '../../../Hoc/withData.js';
import withValue from '../../../Hoc/withValue.js';
import withTooltip from '../../../Hoc/withTooltip.js';
import _ from 'lodash';

const
	RadioGroupElement = (props) => {
		const {
				value,

				// withData
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

		// return <Radio.Group onChange={props.setValue} accessibilityLabel={props.name} ref={props.outerRef} {...props}> // RadioGroup from NativeBase doesn't yet allow refs
		return <Radio.Group onChange={props.setValue} accessibilityLabel={props.name} {...props}>
					{radios}
				</Radio.Group>;
	},
	RadioGroupField = withComponent(withValue(withData(RadioGroupElement)));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <RadioGroupField {...props} outerRef={ref} />;
}));
