
import { useSelector, useDispatch, } from 'react-redux';
import {
	selectIsWaitModalShown,
	selectAlertMessage,
	selectDebugMessage,
	selectInfoMessage,
	selectWaitMessage,
	setAlertMessage,
	setDebugMessage,
	setInfoMessage,
	selectProgressMessage,
	selectProgressPercentage,
} from '@src/models/Slices/DebugSlice';
import WaitMessage from './WaitMessage';
import ErrorMessage from './ErrorMessage';
import ProgressModal from './ProgressModal';



export default function GlobalModals(props) {
	const {
			progressColor = '#666',
		} = props,
		dispatch = useDispatch(),
		isWaitModalShown = useSelector(selectIsWaitModalShown),
		alertMessage = useSelector(selectAlertMessage),
		debugMessage = useSelector(selectDebugMessage),
		infoMessage = useSelector(selectInfoMessage),
		waitMessage = useSelector(selectWaitMessage),
		progressMessage = useSelector(selectProgressMessage),
		progressPercentage = useSelector(selectProgressPercentage);

	let moduleToShow = null;

	if (debugMessage) {
		moduleToShow =
			<ErrorMessage
				text={debugMessage}
				onOk={() => dispatch(setDebugMessage(null))}
				color="green"
			/>;
	} else if (alertMessage) {
		moduleToShow = 
			<ErrorMessage
				text={alertMessage}
				onOk={() => dispatch(setAlertMessage(null))}
			/>;
	} else if (infoMessage) {
		moduleToShow =
			<ErrorMessage
				text={infoMessage}
				onOk={() => dispatch(setInfoMessage(null))}
				color="#000"
			/>;
	}
	if (isWaitModalShown) {
		moduleToShow = <WaitMessage text={waitMessage} />;
	}
	if (progressMessage && progressPercentage !== 100) {
		moduleToShow = <ProgressModal
							progressMessage={progressMessage}
							progressPercentage={progressPercentage}
							color={progressColor}
						/>;
	}
	return moduleToShow;
}

