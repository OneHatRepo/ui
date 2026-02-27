import {
	Text,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import CenterBox from '../../../Layout/CenterBox';

export default function MakeTreeSelection(props) {
	return <CenterBox className="TreeSpecific-CenterBox bg-grey-100">
				<Text className="text-center">Please make a selection on the tree</Text>
			</CenterBox>;
}