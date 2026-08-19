import { forwardRef, useRef } from 'react';
import {
	Toast,
	ToastTitle,
	ToastDescription,
	useToast,
} from '@onehat-gluestack';
import clsx from 'clsx';
import _ from 'lodash';

const WITH_TOAST_MARKER = Symbol.for('alreadyHasWithToast');

// This HOC enables showing a toast in the wrapped component.

export default function withToast(WrappedComponent) {
	if (WrappedComponent?.[WITH_TOAST_MARKER]) {
		return WrappedComponent;
	}

	const ComponentWithToast = forwardRef((props, ref) => {
		const {
				disableWithToast = false,
				alreadyHasWithToast,
				...incomingProps
			} = props;

		if (disableWithToast) {
			return <WrappedComponent {...incomingProps} ref={ref} />;
		}

		const
			toastId = useRef(0),
			toast = useToast(),
			showToast = (args) => {
				let {
					title = null,
					description = null,
					body = null,
					placement = 'top',
					action = 'muted',
					variant = 'solid',
					duration = 3000,
					onCloseComplete,
					avoidKeyboard,
					containerStyle,
					className,
				} = args;

				if (!title && !description && !body) {
					throw Error('Toast must have a title or description or body');
				}

				const
					toastProps = {},
					id = ++toastId.current;
				if (onCloseComplete) {
					toastProps.onCloseComplete = onCloseComplete;
				}
				if (avoidKeyboard) {
					toastProps.avoidKeyboard = avoidKeyboard;
				}
				if (containerStyle) {
					toastProps.containerStyle = containerStyle;
				}

				toast.show({
					id,
					placement,
					duration,
					render: ({ id }) => {
						const toastId = 'toast-' + id;
						let bodyElements = [];
						if (title) {
							bodyElements.push(<ToastTitle key="title" className="text-lg">{title}</ToastTitle>);
						}
						if (description) {
							bodyElements.push(<ToastDescription key="description">{description}</ToastDescription>);
						}
						return <Toast
									nativeID={toastId}
									action={action}
									variant={variant}
									className={className}
								>
									{body || bodyElements}
								</Toast>;
					},
					...toastProps,
				})
			};
		
		return <WrappedComponent
					{...incomingProps}
					ref={ref}
					showToast={showToast}
				/>;
	});

	ComponentWithToast[WITH_TOAST_MARKER] = true;
	return ComponentWithToast;
}