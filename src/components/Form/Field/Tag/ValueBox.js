import {
	HStack,
	Text,
} from '@project-components/Gluestack';
import testProps from '../../../../Functions/testProps.js';
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
	return <HStack
				{...testProps('valueBox-' + text)}
				className={`
					max-w-full
					items-center
					mr-1
					bg-grey-100
					border
					border-grey-400
					rounded-md
					${!onDelete && 'pr-4'}
				`}
			>
				<IconButton
					{...testProps('eyeBtn')}
					icon={Eye}
					_icon={{
						size: styles.FORM_TAG_VALUEBOX_ICON_SIZE,
						className: 'text-grey-600',
					}}
					onPress={onView}
					className="h-full"
				/>
				<Text
					className={`
						text-grey-600
						${styles.FORM_TAG_VALUEBOX_FONTSIZE}
						${onDelete ? 'mr-0' : 'mr-1'}
					`}
				>{text}</Text>
				{onDelete &&
					<IconButton
						{...testProps('xBtn')}
						icon={Xmark}
						_icon={{
							size: styles.FORM_TAG_VALUEBOX_ICON_SIZE,
							className: 'text-grey-600',
						}}
						onPress={onDelete}
						className="h-full"
					/>}
			</HStack>;
}