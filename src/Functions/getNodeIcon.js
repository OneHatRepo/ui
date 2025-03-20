import {
	COLLAPSED,
	EXPANDED,
	LEAF,
} from '../Constants/Tree.js';
import BigCircle from '../Components/Icons/BigCircle.js';
import FolderClosed from '../Components/Icons/ChevronRight.js';
import FolderOpen from '../Components/Icons/ChevronDown.js';
import Camera from '../Components/Icons/Camera.js';

export default function getNodeIcon(which, item) {
	let icon;
	switch(which) {
		case COLLAPSED:
			icon = FolderClosed;
			break;
		case EXPANDED:
			icon = FolderOpen;
			break;
		case LEAF:
			icon = BigCircle;
			if (item.regulars__regular_fk_id === 1) {
				icon = Camera;
			}
			break;
	}
	return icon;
}