import {
	Icon,
} from 'native-base';
import testProps from '../../Functions/testProps.js';
import IconButton from './IconButton.js';
import Rotate from '../Icons/Rotate.js';

export default function ReloadPageButton(props) {
	const {
			iconProps ={},
			self,
			Repository,
		} = props;

	if (!Repository || Repository.isLocal) {
		return null;
	}

	return <IconButton
				{...testProps('reloadPageBtn')}
				{...props}
				reference="reloadPageBtn"
				parent={self}
				icon={<Icon as={Rotate} {...iconProps} color="trueGray.600" />}
				onPress={() => Repository.reload()}
				tooltip="Reload"
				ml={2}
			/>;
}

