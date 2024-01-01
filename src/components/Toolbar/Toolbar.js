import {
	HStack,
} from '@gluestack-ui/themed';

export default function Toolbar(props) {
	return <HStack
				w="100%"
				justifyContent="flex-start"
				bg="trueGray.200"
				borderBottomWidth={1}
				borderBottomColor="trueGray.400"
				p={2}
				overflow="auto"
				{...props}
			>
				{props.children}
			</HStack>;
};
