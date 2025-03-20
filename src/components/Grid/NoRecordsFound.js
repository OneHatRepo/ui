import {
	HStack,
	Text,
	VStack,
} from '@project-components/Gluestack';
import IconButton from '../Buttons/IconButton.js';
import Rotate from '../Icons/Rotate.js';

export default function NoRecordsFound(props) {
	const 
		{
			onRefresh,
			text = 'No Records found.',
		} = props,
		textComponent = <Text
							className="text-center"
						>{text}</Text>;

	let component = textComponent;
	if (onRefresh) {
		component = <HStack className="NoRecordsFound justify-center items-center w-full flex-1">
						<IconButton
							icon={Rotate}
							_icon={{
								size: 'md',
								className: `
									text-grey-400
								`,
							}}
							onPress={onRefresh}
							variant="outline"
							className="p-1 px-2 mr-2"
						/>
						{textComponent}
					</HStack>;
	} else {
		component = <VStack className="NoRecordsFound justify-center items-center w-full flex-1">
						{textComponent}
					</VStack>;
	}
	return component;
}