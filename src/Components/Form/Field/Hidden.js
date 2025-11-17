import withComponent from '../../Hoc/withComponent.js';
import withValue from '../../Hoc/withValue.js';

const HiddenElement = (props) => {
	
	// This component does not render any visible UI elements,
	// but it acts as a hidden input field for form submissions
	// via the withValue HOC.

	return null;
};

export default withComponent(withValue(HiddenElement));