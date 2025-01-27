import {
	Text,
	Tooltip, TooltipContent, TooltipText,
} from '@project-components/Gluestack';

export default function TextWithTooltip(props) {
	const {
			tooltip,
			children,
			...propsToPass
		} = props;
	return <Tooltip
				placement="bottom"
				trigger={(triggerProps) => {
					return <Text {...triggerProps} {...propsToPass}>{children}</Text>
				}}
			>
				<TooltipContent>
					<TooltipText>{tooltip}</TooltipText>
				</TooltipContent>
			</Tooltip>;
}
