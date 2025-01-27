import {
	TextNative,
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
					return <TextNative {...triggerProps} {...propsToPass}>{children}</TextNative>
				}}
			>
				<TooltipContent>
					<TooltipText>{tooltip}</TooltipText>
				</TooltipContent>
			</Tooltip>;
}
