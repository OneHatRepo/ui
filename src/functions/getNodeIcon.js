import {
	COLLAPSED,
	EXPANDED,
	LEAF,
} from '../constants/Tree.js';
import BigCircle from '../components/Icons/BigCircle.js';
import FolderClosed from '../components/Icons/ChevronRight.js';
import FolderOpen from '../components/Icons/ChevronDown.js';
import Camera from '../components/Icons/Camera.js';

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