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
				fields,
				idField,
				displayField,
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
				const idIx = fields.indexOf(idField),
					displayIx = fields.indexOf(idField);
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

		// return <Input
		// 			ref={props.tooltipRef}
		// 			onChangeText={props.setValue}
		// 			flex={1}
		// 			fontSize={STYLE_INPUT_FONTSIZE}
		// 			{...props}
		// 		/>;
	},
	RadioGroupField = withValue(withData(RadioGroupElement));

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <RadioGroupField {...props} tooltipRef={ref} />;
}));
