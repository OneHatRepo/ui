import testProps from '../../Functions/testProps.js';
import IconButton from './IconButton.js';
import Rotate from '../Icons/Rotate.js';

export default function ReloadButton(props) {
	const {
			_icon ={},
			self,
			Repository,
			isTree = false,
			propsToPass,
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
				parent={self}
				reference="reloadBtn"
				onPress={onPress}
				{...propsToPass}
				icon={Rotate}
				_icon={_icon}
				className="ml-2"
				tooltip="Reload"
			/>;
}

