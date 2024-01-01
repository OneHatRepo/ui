import {
	Row,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';

export default function Footer(props) {
	const styles = UiGlobals.styles;
	return <Row
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
			</Row>;
}
