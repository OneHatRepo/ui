import testProps from '../../Functions/testProps.js';
import {
	LOAD_CAUSES__RELOAD_BTN,
} from '../../Constants/LoadCauses.js';
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
				if (self?.reloadTree) {
					self.reloadTree(LOAD_CAUSES__RELOAD_BTN); // so Tree can track where the reload request originated
					return;
				}
				Repository.loadRootNodes(1);
			} else {
				if (self?.reloadGrid) {
					self.reloadGrid(LOAD_CAUSES__RELOAD_BTN); // so Grid can track where the reload request originated
					return;
				}
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
				tooltip="Reload"
			/>;
}
