import {
	Text,
	Tooltip,
} from '@project-components/Gluestack';

export default function TextWithTooltip(props) {
	const {
		tooltip,
		children,
		propsToPass
	} = props;
	return <Tooltip label={tooltip}>
				<Text {...propsToPass}>{children}</Text>
			</Tooltip>;
}
