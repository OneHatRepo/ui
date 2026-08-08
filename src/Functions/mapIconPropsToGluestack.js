import _ from 'lodash';
import addIconProps from './addIconProps.js';
import clsx from 'clsx';

const BUTTON_ICON_SIZE_CLASS_MAP = {
	'2xs': 'h-3 w-3',
	xs: 'h-3.5 w-3.5',
	sm: 'h-4 w-4',
	md: 'h-[18px] w-[18px]',
	lg: 'h-[18px] w-[18px]',
	xl: 'h-5 w-5',
	'2xl': 'h-6 w-6',
};

const ICON_SIZE_CLASS_MAP = {
	'2xs': 'h-3 w-3',
	xs: 'h-3.5 w-3.5',
	sm: 'h-4 w-4',
	md: 'h-[18px] w-[18px]',
	lg: 'h-5 w-5',
	xl: 'h-6 w-6',
	'2xl': 'h-7 w-7',
};

export default function mapIconPropsToGluestack(iconProps = {}, options = {}) {
	const {
		context = 'button',
		defaultSize,
	} = options;

	const props = {
		...addIconProps(iconProps || {}),
	};

	if (context === 'button') {
		if (_.isString(props.size) && BUTTON_ICON_SIZE_CLASS_MAP[props.size]) {
			props.className = clsx(
				BUTTON_ICON_SIZE_CLASS_MAP[props.size],
				props.className,
			);
			delete props.size;
		} else if (!props.width && !props.height && _.isString(defaultSize) && BUTTON_ICON_SIZE_CLASS_MAP[defaultSize]) {
			props.className = clsx(
				BUTTON_ICON_SIZE_CLASS_MAP[defaultSize],
				props.className,
			);
		}
		return props;
	}

	if (_.isString(props.size) && ICON_SIZE_CLASS_MAP[props.size]) {
		props.className = clsx(
			ICON_SIZE_CLASS_MAP[props.size],
			props.className,
		);
		delete props.size;
	} else if (!props.width && !props.height && _.isString(defaultSize) && ICON_SIZE_CLASS_MAP[defaultSize]) {
		props.className = clsx(
			ICON_SIZE_CLASS_MAP[defaultSize],
			props.className,
		);
	}

	return props;
}
