import { forwardRef, useRef } from 'react';
import {
	Toast,
	ToastTitle,
	ToastDescription,
	useToast,
} from '@project-components/Gluestack';
import _ from 'lodash';

// This HOC enables showing a toast in the wrapped component.

export default function withToast(WrappedComponent) {
	return forwardRef((props, ref) => {

		if (props.disableWithToast || props.showToast) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		const
			toastId = useRef(0),
			toast = useToast(),
			showToast = (args) => {
				let {
					title = null,
					description = null,
					placement = 'top',
					duration,
					onCloseComplete,
					avoidKeyboard,
					containerStyle,
				} = args;

				if (!title && !description) {
					throw Error('Toast must have a title or description');
				}

				const
					toastProps = {},
					id = ++toastId.current;
				if (duration) {
					toastProps.duration = duration;
				}
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
						const uniqueToastId = 'toast-' + id;
						let bodyElements = [];
						if (title) {
							bodyElements.push(<ToastTitle key="title">{title}</ToastTitle>);
						}
						if (description) {
							bodyElements.push(<ToastDescription key="description">{description}</ToastDescription>);
						}
						return <Toast nativeID={uniqueToastId} action="muted" variant="solid">
									{bodyElements}
								</Toast>;
					},
					...toastProps,
				})
			};
		
		return <WrappedComponent
					{...props}
					showToast={showToast}
					ref={ref}
				/>;
	});
}