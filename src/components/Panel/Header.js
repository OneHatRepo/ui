import {
	Row,
	Text,
} from 'native-base';
import {
	FaTimes,
	FaMinus,
	FaPlus,
} from 'react-icons/fa';
import {
	HEADER_PX,
	HEADER_PY,
	HEADER_ICON_SIZE,
	HEADER_ICON_COLOR,
	HEADER_TEXT_FONTSIZE,
	HEADER_TEXT_COLOR,
} from '../../../constants/HeaderFooter';
import emptyFn from '../../functions/emptyFn';
import IconButton from '../Buttons/IconButton';

export default function Header(props) {
	const {
			testID = 'header',
			title = '',
			isClosable = true,
			onClose = emptyFn,
			isCollapsible = true,
			isCollapsed = false,
			onToggleCollapse = emptyFn,
		} = props;

	let closeBtn = null,
		collapseBtn = null;
	if (isClosable) {
		closeBtn = <IconButton
						icon={<FaTimes size={HEADER_ICON_SIZE} color={HEADER_ICON_COLOR} />}
						onPress={onClose}
						testID="closeBtn"
						alignSelf="center"
						mr={1}
					/>;
	}
	if (isCollapsible) {
		collapseBtn = <IconButton
						icon={isCollapsed ? <FaPlus size={HEADER_ICON_SIZE} color={HEADER_ICON_COLOR} /> : <FaMinus size={HEADER_ICON_SIZE}  color={HEADER_ICON_COLOR} />}
						onPress={onToggleCollapse}
						testID="collapseBtn"
						alignSelf="center"
						ml={1}
					/>;
	}
	return <Row alignItems="center" justifyContent="flex-start" px={HEADER_PX} py={HEADER_PY} bg="primary.100" testID={testID}>
				{closeBtn}
				<Text flex={1} fontSize={HEADER_TEXT_FONTSIZE} color={HEADER_TEXT_COLOR} testID="text">{title}</Text>
				{collapseBtn}
			</Row>;
}
