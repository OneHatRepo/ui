import {
	Icon,
} from '@gluestack-ui/themed';
import testProps from '../../Functions/testProps.js';
import IconButton from './IconButton.js';
import Rotate from '../Icons/Rotate.js';

export default function ReloadButton(props) {
	const {
			iconProps ={},
			self,
			Repository,
			isTree = false,
		} = props,
		onPress = () => {
			if (isTree) {
				Repository.loadRootNodes(1);
			} else {
				Repository.reload();
			}
		};

	if (!Repository || Repository.isLocal) {
		return null;
	}

	return <IconButton
				{...testProps('reloadBtn')}
				{...props}
				reference="reloadBtn"
				parent={self}
				icon={<Icon as={Rotate} {...iconProps} color="trueGray.600" />}
				onPress={onPress}
				tooltip="Reload"
				ml={2}
			/>;
}

