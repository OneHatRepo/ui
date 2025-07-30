import { useState, useRef, useEffect, } from 'react';
import {
	Box,
	ScrollView,
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import { useSelector, useDispatch, } from 'react-redux';
import { PROGRESS_COMPLETED } from '../../Constants/Progress.js';
import useForceUpdate from '../../Hooks/useForceUpdate.js';
import isJson from '../../Functions/isJson.js';
import Form from '../Form/Form.js';
import Button from '../Buttons/Button.js';
import withComponent from '../Hoc/withComponent.js';
import withAlert from '../Hoc/withAlert.js';
import ChevronLeft from '../Icons/ChevronLeft.js';
import ChevronRight from '../Icons/ChevronRight.js';
import Play from '../Icons/Play.js';
import EllipsisHorizontal from '../Icons/EllipsisHorizontal.js';
import Stop from '../Icons/Stop.js';
import TabBar from '../Tab/TabBar.js';
import Panel from '../Panel/Panel.js';
import Toolbar from '../Toolbar/Toolbar.js';
import _ from 'lodash';

const
	INITIATE = 'INITIATE',
	PROCESSING = 'PROCESSING',
	RESULTS = 'RESULTS';

// NOTE: This component assumes you have an AppSlice, that has 
// an 'operationsInProgress' state var and a 'setOperationsInProgress' action.

function AsyncOperation(props) {

	if (!props.Repository || !props.action) {
		throw Error('AsyncOperation: Repository and action are required!');
	}

	const {
			action,
			Repository,
			formItems = [],
			formStartingValues = {},
			_form = {},
			getProgressUpdates = false,
			parseProgress, // optional fn, accepts 'response' as arg and returns progress string
			progressStuckThreshold = null, // e.g. 3, if left blank, doesn't check for stuck state
			updateInterval = 10000, // ms

			// withComponent
			self,

			// withAlert
			alert,
		} = props,
		dispatch = useDispatch(),
		isValid = useRef(true),
		setIsValid = (valid) => {
			isValid.current = valid;
		},
		getIsValid = () => {
			return isValid.current;
		},
		mode = useRef(INITIATE),
		setMode = (newMode) => {
			mode.current = newMode;
		},
		getMode = () => {
			return mode.current;
		},
		initiate = async () => {

			clearProgress();
			setMode(PROCESSING);
			setFooter(getFooter());
			setIsInProgress(true);
			
			const
				method = Repository.methods.edit,
				uri = Repository.getModel() + '/' + action,
				formValues = self?.children?.form?.formGetValues() || {},
				result = await Repository._send(method, uri, formValues);

			setFormValues(formValues);
			
			const response = Repository._processServerResponse(result);
			if (!response.success) {
				resetToInitialState();
				return;
			}
			
			let results = <Text>Success</Text>;
			if (response.message) {
				let message = response.message;
				if (isJson(message)) {
					message = JSON.parse(message);
				}
				results = _.isArray(message) ? 
								<VStack>
									{message?.map((line, ix)=> {
										return <Text key={ix}>{line}</Text>;
									})}
								</VStack> :
								<Text>{message}</Text>;
			}
			showResults(results);
		},
		getFooter = (which = getMode()) => {
			switch(which) {
				case INITIATE:
					return <Toolbar>
								<Button
									text="Start"
									rightIcon={ChevronRight}
									onPress={() => initiate()}
									isDisabled={!getIsValid()}
								/>
							</Toolbar>;
				case PROCESSING:
					return <Toolbar>
								<Button
									text="Please wait"
									isLoading={true}
									variant="link"
								/>
							</Toolbar>;
				case RESULTS:
					return <Toolbar>
								<Button
									text="Reset"
									icon={ChevronLeft}
									onPress={() => resetToInitialState()}
								/>
							</Toolbar>;
			}
		},
		operationsInProgress = useSelector((state) => state.app.operationsInProgress),
		isInProgress = operationsInProgress.includes(action),
		forceUpdate = useForceUpdate(),
		[footer, setFooter] = useState(getFooter()),
		[results, setResults] = useState(isInProgress ? 'Checking progress...' : null),
		[progress, setProgress] = useState(null),
		[isStuck, setIsStuck] = useState(false),
		[currentTabIx, setCurrentTab] = useState(isInProgress ? 1 : 0),
		previousProgressRef = useRef(null),
		unchangedProgressCountRef = useRef(0),
		intervalRef = useRef(null),
		formValuesRef = useRef(null),
		getPreviousProgress = () => {
			return previousProgressRef.current;
		},
		setPreviousProgress = (progress) => {
			previousProgressRef.current = progress;
		},
		getUnchangedProgressCount = () => {
			return unchangedProgressCountRef.current;
		},
		setUnchangedProgressCount = (count) => {
			unchangedProgressCountRef.current = count;
			forceUpdate();
		},
		getInterval = () => {
			return intervalRef.current;
		},
		setIntervalRef = (interval) => { // 'setInterval' is a reserved name
			intervalRef.current = interval;
		},
		getFormValues = () => {
			return formValuesRef.current;
		},
		setFormValues = (values) => {
			formValuesRef.current = values;
		},
		showResults = (results) => {
			setCurrentTab(1);
			setMode(RESULTS);
			setFooter(getFooter());
			setResults(results);
			getProgress();
		},
		getProgress = (immediately = false) => {
			if (getProgressUpdates) {

				async function fetchProgress() {
					const
						method = Repository.methods.edit,
						progressAction = 'get' + action.charAt(0).toUpperCase() + action.slice(1) + 'Progress',
						uri = Repository.getModel() + '/' + progressAction,
						result = await Repository._send(method, uri, getFormValues());
						
					const response = Repository._processServerResponse(result);
					if (!response.success) {
						alert(result.message);
						clearProgress();
						return;
					}

					const progress = parseProgress ? parseProgress(response) : response.message
					if (progress === PROGRESS_COMPLETED) {
						clearProgress();
						setProgress(progress);
					} else {
						// in process
						let newUnchangedProgressCount = getUnchangedProgressCount();
						if (progress === getPreviousProgress()) {
							newUnchangedProgressCount++;
							setUnchangedProgressCount(newUnchangedProgressCount);
							if (progressStuckThreshold !== null && newUnchangedProgressCount >= progressStuckThreshold) {
								clearProgress();
								setProgress('The operation appears to be stuck.');
								setIsStuck(true);
							}
						} else {
							setPreviousProgress(progress);
							setProgress(progress);
							setUnchangedProgressCount(0);
						}
					}
				};
				
				if (immediately) {
					fetchProgress();
				}
		
				const interval = setInterval(fetchProgress, updateInterval);
				setIntervalRef(interval);
			}
		},
		resetToInitialState = () => {
			setCurrentTab(0);
			setMode(INITIATE);
			setFooter(getFooter());
			clearProgress();
		},
		clearProgress = () => {
			setIsInProgress(false);
			setIsStuck(false);
			setProgress(null);
			setPreviousProgress(null);
			setUnchangedProgressCount(0);
			clearInterval(getInterval());
			setIntervalRef(null);
		},
		setIsInProgress = (isInProgress) => {
			dispatch({
				type: 'app/setOperationsInProgress',
				payload: {
					operation: action,
					isInProgress,
				},
			});
		},
		onValidityChange = (isValid) => {
			setIsValid(isValid);
			setFooter(getFooter());
		},
		unchangedProgressCount = getUnchangedProgressCount();

	useEffect(() => {
		
		if (isInProgress) {
			getProgress(true); // true to fetch immediately
		}

		return () => {
			// clear the interval when the component unmounts
			clearInterval(getInterval());
		};
	}, []);

	return <Panel {...props} footer={footer}>
				<TabBar
					tabs={[
						{
							title: 'Start',
							icon: Play,
							isDisabled: currentTabIx !== 0,
							content: <Form
										reference="form"
										parent={self}
										className="w-full h-full flex-1"
										disableFooter={true}
										items={formItems}
										startingValues={formStartingValues}
										onValidityChange={onValidityChange}
										{..._form}
									/>,
						},
						{
							title: 'Results',
							icon: isInProgress ? EllipsisHorizontal : Stop,
							isDisabled: currentTabIx !== 1,
							content: <ScrollView className="ScrollView h-full w-full">
										<Box className={`p-4 ${isStuck ? 'text-red-400 font-bold' : ''}`}>
											{progress ? 
											progress + (unchangedProgressCount > 0 ? ' (unchanged x' + unchangedProgressCount + ')' : '') : 
											results}
										</Box>
									</ScrollView>,
						},
					]}
					currentTabIx={currentTabIx}
					canToggleCollapse={false}
					tabsAreButtons={false}
				/>
			</Panel>;
}

function withAdditionalProps(WrappedComponent) {
	return (props) => {
		return <WrappedComponent
					reference={props.reference || 'AsyncOperation'}
					{...props}
				/>;
	};
}

export default withAdditionalProps(withComponent(withAlert(AsyncOperation)));