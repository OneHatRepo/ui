import { Box } from "../Gluestack";

export default function CenterBox(props) {
	let className = `
		CenterBox
		w-full
		flex-1
		items-center
		justify-center
		p-2
	`;
	if (props.className) {
		className += props.className;
	}
	return <Box
				{...props}
				className={className}
			>
				{props.children}
			</Box>;
}
