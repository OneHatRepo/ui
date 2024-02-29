import {
	Row,
} from 'native-base';
import UiGlobals from '../../UiGlobals.js';

export default function Toolbar(props) {
	const styles = UiGlobals.styles;
	return <Row
				w="100%"
				justifyContent="flex-start"
				bg="trueGray.200"
				borderBottomWidth={1}
				borderBottomColor="trueGray.400"
				px={styles.TOOLBAR_PX}
				py={styles.TOOLBAR_PY}
				overflow="auto"
				{...props}
			>
				{props.children}
			</Row>;
};
