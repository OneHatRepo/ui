import {
	Row,
	Text,
} from 'native-base';
import styles from '../../Constants/Styles.js';

export default function Label(props) {
	const {
			w = styles.FORM_LABEL_WIDTH,
		} = props;
	return <Row
				w={w}
				// maxWidth="30%"
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
