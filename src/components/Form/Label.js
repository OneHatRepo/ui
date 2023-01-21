import {
	Row,
	Text,
} from 'native-base';
import styles from '../../Constants/Styles';

export default function Label(props) {
	return <Row
				w={styles.FORM_LABEL_WIDTH}
				maxWidth="30%"
				alignItems="center"
				pl={2}
				{...props}
			>
				<Text
					fontSize={styles.FORM_LABEL_FONTSIZE}
					numberOfLines={1}
					ellipsizeMode="head"
				>{props.children}</Text>
			</Row>;
}
