import {
	Badge,
	Icon,
	Pressable,
	Text,
} from '@gluestack-ui/themed';
import {
	Ionicons,
} from '@expo/vector-icons';
import testProps from '../../Functions/testProps';

export default function CartButtonWithBadge(props) {
	const {
			badgeMsg,
			onPress,
		} = props;
	return <Pressable onPress={onPress} flexDirection="row" justifyContent="center" pr={5} {...testProps('cartBtn')}>
				<Icon as={Ionicons} name="cart" color="primary.800" size="xl" pb={1} />
				{badgeMsg > 0 && 
					<Badge position="absolute" right={2} top={-10} colorScheme="danger" rounded="20px" variant="solid" {...testProps('cartBadge')}>
						<Text fontSize={12} fontWeight="bold" color="lightText">{badgeMsg}</Text>
					</Badge>}
			</Pressable>
}

