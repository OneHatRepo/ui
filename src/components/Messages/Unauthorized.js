import {
	Text,
	VStack,
} from '../Gluestack';

export default function Unauthorized(props) {
	const 
		{
			text = 'Unauthorized.',
		} = props;
	return <VStack className="w-full flex-1 justify-center items-center">
				<Text className="text-center text-[#f00]">{text}</Text>
			</VStack>;
}