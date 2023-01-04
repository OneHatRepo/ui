import React, { useState, useEffect, } from 'react';
import {
	Column,
	Radio,
	Row,
} from 'native-base';
import oneHatData from '@onehat/data';
import inArray from '../../../../functions/inArray';
import withTooltip from '../../../Hoc/withTooltip';
import withValue from '../../../Hoc/withValue';
import _ from 'lodash';

const
	RadioGroupElement = (props) => {
		const {
				value,

				// data source
				Repository,
				model,
				data,
				fields,
				idField,
				displayField,
			} = props,
			[isReady, setIsReady] = useState(false),
			[LocalRepository, setLocalRepository] = useState(),
			[radios, setRadioes] = useState([]);

		useEffect(() => {
			if (!isReady) {
				return () => {};
			}
			
			// adjust the radios to match the value
			let radios = [];
			const radioProps = {
				my: '2px',
			};
			if (LocalRepository) {
				const entities = LocalRepository.getEntitiesOnPage();
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
		}, [isReady, value]);

		useEffect(() => {
			let LocalRepository = Repository;
			if (model) {
				LocalRepository = oneHatData.getRepository(model);
			}
			if (LocalRepository) {
				setLocalRepository(LocalRepository);
			}
			setIsReady(true);
		}, []);

		if (!isReady) {
			return null;
		}

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
	RadioGroupField = withValue(RadioGroupElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <RadioGroupField {...props} tooltipRef={ref} />;
}));
