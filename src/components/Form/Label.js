import {
	Row,
	Text,
} from 'native-base';
import {
	STYLE_LABEL_WIDTH,
	STYLE_LABEL_FONTSIZE,
} from '../../constants/Style';

export default function Label(props) {
	return <Row
				w={STYLE_LABEL_WIDTH}
				alignItems="center"
				pl={2}
				{...props}
			>
				<Text fontSize={STYLE_LABEL_FONTSIZE}>{props.children}</Text>
			</Row>;
}
