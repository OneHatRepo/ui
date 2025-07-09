import {
	Icon,
	VStack,
} from '@project-components/Gluestack';
import ArrowPointer from '../Icons/ArrowPointer.js';

function RowSelectHandle(props) {
	return <VStack
				className="RowSelectHandle w-[40px] px-2 items-center justify-center select-none cursor-pointer"
			>
				<Icon
					as={ArrowPointer}
					size="xs"
					className="w-[20px] h-[20px] text-[#ddd]" />
			</VStack>;
}

export default RowSelectHandle;