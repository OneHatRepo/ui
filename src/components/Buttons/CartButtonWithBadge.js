import {
	Badge,
	Icon,
	Pressable,
	Text,
} from '../Gluestack';
import {
	Ionicons,
} from '@expo/vector-icons';
import testProps from '../../Functions/testProps';

export default function CartButtonWithBadge(props) {
	const {
			badgeMsg,
			onPress,
		} = props;
	return <Pressable
				onPress={onPress}
				{...testProps('cartBtn')}
				className="flex-row justify-center pr-[5px]"
			>
				<Icon as={Ionicons} name="cart" size="xl" className="text-primary-800 pb-1" />
				{badgeMsg > 0 && 
					<Badge
						colorScheme="danger"
						variant="solid"
						{...testProps('cartBadge')}
						className="absolute right-2 -top-10 rounded-[20px]">
						<Text className="text-[12px] font-bold text-lightText">{badgeMsg}</Text>
					</Badge>}
			</Pressable>;
}

