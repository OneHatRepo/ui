import {
	Text,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import _ from 'lodash';

function TagViewer(props) {
	const {
			value,
		} = props,
		parsedValue = value ? JSON.parse(value) : null,
		values = parsedValue ? _.map(parsedValue, (val) => {
			const ret = val?.text;
			return ret;
		}).join(', ') : [],
		styles = UiGlobals.styles;

	return <Text
				numberOfLines={1}
				ellipsizeMode="head"
				fontSize={styles.FORM_TEXT_FONTSIZE}
				minHeight='40px'
				px={3}
				py={2}
				{...props}
			>{values}</Text>;
}

export default withComponent(TagViewer);
