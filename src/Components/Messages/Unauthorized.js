import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';

export default function Unauthorized(props) {
	const 
		{
			text = 'Unauthorized.',
		} = props;
	return <VStack className="w-full flex-1 justify-center items-center">
				<Text className="text-center text-[#f00]">{text}</Text>
			</VStack>;
}