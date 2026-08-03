import PmEventTypesCombo from './PmEventTypesCombo.js';
import getComponentFromType from '../../../../../Functions/getComponentFromType.js';

function AllPmEventTypesCombo(props) {
	const PmEventTypesCombo = getComponentFromType('PmEventTypesCombo');
	return <PmEventTypesCombo
				reference="AllPmEventTypesCombo"
				baseParams={{
					order: 'name ASC',
				}}
				{...props}
			/>;
}

export default AllPmEventTypesCombo;