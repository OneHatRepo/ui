import React, { useState, useEffect, } from 'react';
import {
	Column,
	Checkbox,
	Row,
} from 'native-base';
import oneHatData from '@onehat/data';
import inArray from '../../../../functions/inArray';
import withTooltip from '../../../Hoc/withTooltip';
import withValue from '../../../Hoc/withValue';
import _ from 'lodash';

const
	CheckboxGroupElement = (props) => {
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
			[checkboxes, setCheckboxes] = useState([]);

		useEffect(() => {
			if (!isReady) {
				return () => {};
			}
			
			// adjust the checkboxes to match the value
			let checkboxes = [];
			const checkboxProps = {
			};
			if (LocalRepository) {
				const entities = LocalRepository.getEntitiesOnPage();
				checkboxes = _.map(entities, (entity, ix) => {
					return <Checkbox
								key={ix}
								value={entity.id}
								{...checkboxProps}
							>{entity.displayValue}</Checkbox>;
				});
			} else {
				const idIx = fields.indexOf(idField),
					displayIx = fields.indexOf(idField);
				checkboxes = _.map(data, (datum, ix) => {
					return <Checkbox
								key={ix}
								value={datum[idIx]}
								{...checkboxProps}
							>{datum[displayIx]}</Checkbox>;
				});
			}
			setCheckboxes(checkboxes);
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

		return <Checkbox.Group onChange={props.setValue} accessibilityLabel={props.name} {...props}>
					{checkboxes}
				</Checkbox.Group>;

		// return <Input
		// 			ref={props.tooltipRef}
		// 			onChangeText={props.setValue}
		// 			flex={1}
		// 			fontSize={STYLE_INPUT_FONTSIZE}
		// 			{...props}
		// 		/>;
	},
	CheckboxGroupField = withValue(CheckboxGroupElement);

// Tooltip needs us to forwardRef
export default withTooltip(React.forwardRef((props, ref) => {
	return <CheckboxGroupField {...props} tooltipRef={ref} />;
}));
