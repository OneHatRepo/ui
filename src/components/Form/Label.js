import {
	Row,
	Text,
} from 'native-base';
import styles from '../../constants/Styles.js';

export default function Label(props) {
	const {
			w = styles.FORM_LABEL_WIDTH,
		} = props;
	return <Row
				w={w}
				minWidth="120px"
				// maxWidth="50%"
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
