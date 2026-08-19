import {
	BoxNative as Box,
	TextNative,
	Tooltip, TooltipContent,
} from '@onehat-gluestack';
import clsx from 'clsx';

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
					<Box className="bg-black rounded-md px-3 py-1">
						<TextNative className="text-white">{tooltip}</TextNative>
					</Box>
				</TooltipContent>
			</Tooltip>;
}
