import {
	Row,
} from 'native-base';
import styles from '../../Constants/Styles';

export default function Footer(props) {
	return <Row
				alignItems="center"
				justifyContent="center"
				alignSelf="flex-end"
				bg={styles.FOOTER_BG}
				testID="footer"
				w="100%"
				p={2}
				safeAreaBottom
				{...props}
			>
				{props.children}
			</Row>;
}
