import {
	HStackNative,
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
			showEye,
			minimizeForRow = false,
		} = props,
		styles = UiGlobals.styles;
	return <HStackNative
				{...testProps('valueBox-' + text)}
				className={`
					ValueBox-HStackNative
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
				{showEye &&
					<IconButton
						{...testProps('eyeBtn')}
						icon={Eye}
						_icon={{
							size: styles.FORM_TAG_VALUEBOX_ICON_SIZE,
							className: 'text-grey-600',
						}}
						onPress={onView}
						className={`
							ValueBox-eyeBtn
							h-full
							${minimizeForRow ? 'py-0' : ''}
							${styles.FORM_TAG_BTN_CLASSNAME}
						`}
					/>}
				<Text
					className={`
						ValueBox-Text
						text-grey-600
						${styles.FORM_TAG_VALUEBOX_CLASSNAME}
						${showEye ? 'ml-0' : 'ml-1'}
						${onDelete ? 'mr-0' : 'mr-1'}
						${minimizeForRow ? 'py-0' : ''}
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
						className={`
							ValueBox-xBtn
							h-full
							${minimizeForRow ? 'py-0' : ''}
							${styles.FORM_TAG_BTN_CLASSNAME}
						`}
					/>}
			</HStackNative>;
}