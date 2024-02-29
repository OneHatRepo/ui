import {
	Row,
	Text,
} from 'native-base';
import IconButton from '../../../Buttons/IconButton.js';
import Eye from '../../../Icons/Eye.js';
import Xmark from '../../../Icons/Xmark.js';
import UiGlobals from '../../../../UiGlobals.js';
import _ from 'lodash';

export default function ValueBox(props) {
	const {
			text,
			onView,
			onDelete,
		} = props,
		styles = UiGlobals.styles;
	return <Row
				borderWidth={1}
				borderColor="trueGray.400"
				borderRadius="md"
				mr={1}
				bg="trueGray.200"
				alignItems="center"
			>
				<IconButton
					_icon={{
						as: Eye,
						color: 'trueGray.600',
						size: styles.FORM_TAG_VALUEBOX_ICON_SIZE,
					}}
					onPress={onView}
					h="100%"
				/>
				<Text
					color="trueGray.600"
					mr={onDelete ? 0 : 2}
					fontSize={styles.FORM_TAG_VALUEBOX_FONTSIZE}
				>{text}</Text>
				{onDelete &&
					<IconButton
						_icon={{
							as: Xmark,
							color: 'trueGray.600',
							size: styles.FORM_TAG_VALUEBOX_ICON_SIZE,
						}}
						onPress={onDelete}
						h="100%"
					/>}
			</Row>;
}