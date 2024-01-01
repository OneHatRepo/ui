import {
	HStack,
} from '@gluestack-ui/themed';
import UiGlobals from '../../UiGlobals.js';

export default function Footer(props) {
	const styles = UiGlobals.styles;
	return <HStack
				alignItems="center"
				justifyContent="center"
				alignSelf="flex-end"
				bg={styles.PANEL_FOOTER_BG}
				testID="footer"
				w="100%"
				p={2}
				// safeAreaBottom
				{...props}
			>
				{props.children}
			</HStack>;
}
