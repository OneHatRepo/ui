import { cloneElement, forwardRef, isValidElement, useContext, useRef } from 'react';
import {
	Button,
	ButtonText,
	ButtonSpinner,
	ButtonIcon,
	ButtonGroup,
} from '@onehat-gluestack';
import mapIconPropsToGluestack from '../../Functions/mapIconPropsToGluestack.js';
import clsx from 'clsx';
import withComponent from '../Hoc/withComponent.js';
import withTooltip from '../Hoc/withTooltip.js';
import FormContext from '../Form/FormContext.js';
import _ from 'lodash';

const ButtonComponent = forwardRef((props, ref) => {

	let {
			self,
			text, // the text to display on the button
			content, // the content to display on the button
			isLoading = false, // show a spinner?
			isExpandToFillVertical = false,
			icon = null, // an actual icon element
			rightIcon = null, // an actual icon element
			_spinner = {}, // props for ButtonSpinner
			_icon, // props for icon
			_rightIcon, // props for rightIcon
			_text = {}, // props for ButtonText
			disableOnInvalid,
			...propsToPass
		} = props;

	if (propsToPass.handler) {
		propsToPass.onPress = propsToPass.handler; // alias
	}
	const
		formContext = useContext(FormContext),
		internalRef = useRef(),
		hasBackgroundClass = (className) => {
			if (!className || !_.isString(className)) {
				return false;
			}

			// Match bg-* utilities with optional variant prefixes like hover:, web:, dark:, etc.
			return /(?:^|\s)(?:[^\s:]+:)*bg-[^\s]+/.test(className);
		},
		getInheritedContentColorClassName = (className) => {
			// Gluestack v5 styles ButtonText/ButtonIcon as separate slots, so root text color
			// classes on Button do not always cascade; extract only color-like text classes
			// so we can re-apply them directly to content slots below.
			if (!className || !_.isString(className)) {
				return '';
			}

			const
				NON_COLOR_TEXT_CLASS_SUFFIXES = new Set([
					'text-xs',
					'text-sm',
					'text-base',
					'text-lg',
					'text-xl',
					'text-2xl',
					'text-3xl',
					'text-4xl',
					'text-5xl',
					'text-6xl',
					'text-7xl',
					'text-8xl',
					'text-9xl',
					'text-left',
					'text-center',
					'text-right',
					'text-justify',
					'text-start',
					'text-end',
					'text-ellipsis',
					'text-clip',
				]),
				tokens = _.compact(className.split(/\s+/)),
				colorTokens = _.filter(tokens, (token) => {
					if (!token.includes('text-')) {
						return false;
					}

					const suffix = token.split(':').pop();
					if (!suffix || !suffix.startsWith('text-')) {
						return false;
					}

					if (NON_COLOR_TEXT_CLASS_SUFFIXES.has(suffix)) {
						return false;
					}

					// Skip arbitrary font-size utilities like text-[13px].
					if (/^text-\[[0-9.]+(px|rem|em|%)\]$/.test(suffix)) {
						return false;
					}

					return true;
				});

			return colorTokens.join(' ');
		};

	if (_.isNil(propsToPass.isDisabled) && disableOnInvalid && formContext && !formContext.isValid) {
		propsToPass.isDisabled = true;
	}


	const resolvedRef = ref || internalRef;
	
	if (self) {
		self.ref = resolvedRef.current;
	}

	let className = clsx(
		'Button',
		'flex',
		'flex-row',
		'items-center',
		'data-[disabled=true]:opacity-40',
		'data-[disabled=true]:cursor-not-allowed',
		'web:disabled:opacity-40',
		'web:disabled:cursor-not-allowed',
	);
	if (isExpandToFillVertical) {
		// IMPORTANT! Otherwise the button will cut off the vertical content due to size classes automatically added by Gluestack (e.g. h-10)
		className += ' h-auto';
	}
	if (propsToPass.className) {
		className += ' ' + propsToPass.className;
	}
	const shouldApplyPrimaryFallback = _.isNil(propsToPass.variant) && _.isNil(propsToPass.action) && !hasBackgroundClass(className);
	if (shouldApplyPrimaryFallback) {
		// Preserve classic primary button appearance when callers don't set variant/action.
		className += ' bg-primary-500 data-[hover=true]:bg-primary-600 data-[active=true]:bg-primary-600';
	}

	const
		inheritedContentColorClassName = getInheritedContentColorClassName(className),
		fallbackContentColorClassName = shouldApplyPrimaryFallback && !inheritedContentColorClassName ? 'text-white' : '',
		// Merge caller-provided slot props with inherited root color classes.
		// Explicit _icon/_rightIcon/_text classes still win because they are appended last.
		iconPropsToUse = {
			...(_icon || {}),
			className: clsx(fallbackContentColorClassName, inheritedContentColorClassName, _icon?.className),
		},
		rightIconPropsToUse = {
			...(_rightIcon || {}),
			className: clsx(fallbackContentColorClassName, inheritedContentColorClassName, _rightIcon?.className),
		},
		textPropsToUse = {
			...(_text || {}),
			className: clsx('ButtonText', fallbackContentColorClassName, inheritedContentColorClassName, _text?.className),
		};

	if (icon) {
		if (isValidElement(icon)) {
			if (_icon || inheritedContentColorClassName) {
				// For custom icon elements, inject mapped Gluestack props via cloneElement.
				icon = cloneElement(icon, mapIconPropsToGluestack(iconPropsToUse, { context: 'button', defaultSize: 'lg' }));
			}
		} else {
			// For icon types/components, render through ButtonIcon with mapped props.
			icon = <ButtonIcon as={icon} {...mapIconPropsToGluestack(iconPropsToUse, { context: 'button', defaultSize: 'lg' })} />;
		}
	}
	if (rightIcon) {
		if (isValidElement(rightIcon)) {
			if (_rightIcon || inheritedContentColorClassName) {
				rightIcon = cloneElement(rightIcon, mapIconPropsToGluestack(rightIconPropsToUse, { context: 'button', defaultSize: 'lg' }));
			}
		} else {
			rightIcon = <ButtonIcon as={rightIcon} {...mapIconPropsToGluestack(rightIconPropsToUse, { context: 'button', defaultSize: 'lg' })} />;
		}
	}
	
	return <Button
				{...propsToPass}
				className={className}
				ref={resolvedRef}
			>
				{isLoading && <ButtonSpinner className="ButtonSpinner" {..._spinner} />}
				{icon}
				{text && <ButtonText {...textPropsToUse}>{text}</ButtonText>}
				{content}
				{rightIcon}
			</Button>;
});

export default withComponent(withTooltip(ButtonComponent));
