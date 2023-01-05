import {
	Row,
	Text,
} from 'native-base';
import styles from '../../Constants/Styles';

export default function Label(props) {
	return <Row
				w={styles.LABEL_WIDTH}
				maxWidth="30%"
				alignItems="center"
				pl={2}
				{...props}
			>
				<Text fontSize={styles.LABEL_FONTSIZE}>{props.children}</Text>
			</Row>;
}
