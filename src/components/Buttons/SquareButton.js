import IconButton from './IconButton.js';

// This component is used to create a square button with an icon and text
// For example, the Gingerich app uses this for EqStatusesSwitch and WoPrioritiesSwitch

export default function SquareButton(props) {
	const {
			text,
			isActive = false,
			activeClassName,
			invertColorWhenActive = false,
			showText = true,
			disableInteractions = false,
			fontSize = '20px',
			...propsToPass
		} = props,
		color = invertColorWhenActive && isActive ? '#fff' : '#000';

	if (!props.icon) {
		throw Error('icon missing');
	}
	if (!text) {
		throw Error('text missing. If you want to hide the text, use showText={false}');
	}

	let className = `
		SquareButton
		rounded-md
		p-2
		h-[100px]
		w-[100px]
		flex
		flex-col
		justify-center
		items-center
		bg-trueGray-300
		hover:bg-trueGray-400
		disabled:bg-trueGray-200
	`;
	if (isActive && activeClassName) {
		className += ' ' + activeClassName;
	}

	return <IconButton
				className={className}
				style={{
					// backgroundColor: bg,
				}}
				_icon={{
					className: `
						h-[40px]
						w-[40px]
					`,
					style: {
						color,
					}
				}}
				_text={{
					style: {
						color,
						fontSize
					}
				}}
				text={showText ? text : null}
				isDisabled={disableInteractions}
				{...propsToPass}
			/>;

}

