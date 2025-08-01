
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
} from '@src/models/Slices/DebugSlice';
import WaitMessage from './WaitMessage';
import ErrorMessage from './ErrorMessage';



export default function GlobalModals() {
	const
		dispatch = useDispatch(),
		isWaitModalShown = useSelector(selectIsWaitModalShown),
		alertMessage = useSelector(selectAlertMessage),
		debugMessage = useSelector(selectDebugMessage),
		infoMessage = useSelector(selectInfoMessage),
		waitMessage = useSelector(selectWaitMessage);

	return <>
				{isWaitModalShown && <WaitMessage text={waitMessage} />}
				{!isWaitModalShown && alertMessage && 
					<ErrorMessage
						text={alertMessage}
						onOk={() => dispatch(setAlertMessage(null))}
					/>}
				{!isWaitModalShown && debugMessage && 
					<ErrorMessage
						text={debugMessage}
						color="green"
						onOk={() => dispatch(setDebugMessage(null))}
					/>}
				{!isWaitModalShown && infoMessage && 
					<ErrorMessage
						text={infoMessage}
						color="#000"
						onOk={() => dispatch(setInfoMessage(null))}
					/>}
			</>;
}
