import { forwardRef, useRef } from 'react';
import {
	Toast,
	ToastTitle,
	ToastDescription,
	useToast,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import _ from 'lodash';

// This HOC enables showing a toast in the wrapped component.

export default function withToast(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithToast || props.alreadyHasWithToast) {
			return <WrappedComponent {...props} ref={ref} />;
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
					{...props}
					alreadyHasWithToast={true}
					disableWithToast={false}
					ref={ref}
					showToast={showToast}
				/>;
	});
}