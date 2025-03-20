import {
	HStack,
} from '@project-components/Gluestack';
import Toolbar from './Toolbar.js'
import _ from 'lodash';

export default function FilterToolbar(props) {
	const {
			toolbarItems = [],
		} = props;
	return <Toolbar className={`
				bg-grey-200
				border-t
				border-t-grey-400
				w-full
			`} >
				{toolbarItems.length && 
					<HStack className={`
						flex-1
						border
						border-l-grey-100
					`}>{toolbarItems}</HStack>}
			</Toolbar>;
};
