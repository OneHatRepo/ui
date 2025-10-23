import { useState, useRef, useEffect, } from 'react';
import {
	Box,
	HStack,
	ScrollView,
	Text,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import * as Progress from 'react-native-progress';
import useForceUpdate from '../../Hooks/useForceUpdate';
import {
	PROGRESS__NONE_FOUND,
	PROGRESS__IN_PROCESS,
	PROGRESS__COMPLETED,
	PROGRESS__FAILED,
	PROGRESS__STUCK,
	PROGRESS__UNSTUCK,
} from '../../Constants/Progress.js';
import {
	MOMENT_DATE_FORMAT_2,
} from '../../Constants/Dates.js';
import isJson from '../../Functions/isJson.js';
import Form from '../Form/Form.js';
import Button from '../Buttons/Button.js';
import withComponent from '../Hoc/withComponent.js';
import withAlert from '../Hoc/withAlert.js';
import Loading from '../Messages/Loading.js';
import ChevronLeft from '../Icons/ChevronLeft.js';
import ChevronRight from '../Icons/ChevronRight.js';
import RotateLeft from '../Icons/RotateLeft.js';
import Play from '../Icons/Play.js';
import EllipsisHorizontal from '../Icons/EllipsisHorizontal.js';
import Stop from '../Icons/Stop.js';
import TabBar from '../Tab/TabBar.js';
import Panel from '../Panel/Panel.js';
import Toolbar from '../Toolbar/Toolbar.js';
import moment from 'moment';
import _ from 'lodash';

const
	INIT = 'INIT', // no footer shown; used when component initially loads, to see if operation is already in progress
	START = 'START', // shows the start form
	PROCESSING = 'PROCESSING', // shows the loading indicator while starting the operation
	RESULTS = 'RESULTS'; // shows the results of the operation, or any in-progress updates

// If getProgressUpdates is false, the component will show the start form initially.
// If getProgressUpdates is true, the component will initially query the server to see if
// 		an operation is already in progress. 
// 		If so, it will automatically poll the server for progress updates
// 		If not, it will show the start form.

function AsyncOperation(props) {

	if (!props.Repository || !props.process) {
		throw Error('AsyncOperation: Repository and process are required!');
	}

	const {
			process,
			Repository,
			formItems = [],
			formStartingValues = {},
			_form = {},
			getProgressUpdates = false,
			parseProgress, // optional fn, accepts 'response' as arg and returns an object like this: { status, errors, started, lastUpdated, timeElapsed, count, current, total, percentage }
			updateInterval = 10000, // ms
			progressColor = '#666',

			// withComponent
			self,

			// withAlert
			alert,
		} = props,
		forceUpdate = useForceUpdate(),
		isValid = useRef(true),
		setIsValid = (valid) => {
			isValid.current = valid;
		},
		getIsValid = () => {
			return isValid.current;
		},
		mode = useRef(INIT),
		setMode = (newMode) => {
			mode.current = newMode;
		},
		getMode = () => {
			return mode.current;
		},
		isInProcess = getMode() === PROCESSING,
		currentTabIx = (getMode() === PROCESSING ? 1 : (getMode() === RESULTS ? 2 : 0)),
		intervalRef = useRef(null),
		getInterval = () => {
			return intervalRef.current;
		},
		setIntervalRef = (interval) => { // 'setInterval' is a reserved name
			intervalRef.current = interval;
		},
		formValuesRef = useRef(null),
		getFormValues = () => {
			return formValuesRef.current;
		},
		setFormValues = (values) => {
			formValuesRef.current = values;
		},
		isStuckRef = useRef(false),
		getIsStuck = () => {
			return isStuckRef.current;
		},
		setIsStuck = (bool) => {
			isStuckRef.current = bool;
		},
		getFooter = () => {
			switch(getMode()) {
				case INIT:
					return null;
				case START:
					return <Toolbar>
								<Button
									text="Start"
									rightIcon={ChevronRight}
									onPress={() => startProcess()}
									isDisabled={!getIsValid()}
								/>
							</Toolbar>;
				case PROCESSING:
					// TODO: Add a cancellation option to the command.
					// would require a backend controller action to support it
					return null;
					// return <Toolbar>
					// 			<Button
					// 				text="Please wait"
					// 				isLoading={true}
					// 				variant="link"
					// 			/>
					// 		</Toolbar>;
				case RESULTS:
					let button;
					if (getIsStuck()) {
						button = <Button
									text="Unstick"
									icon={RotateLeft}
									onPress={() => unstick()}
								/>;
					} else {
						button = <Button
									text="Reset"
									icon={ChevronLeft}
									onPress={() => resetToInitialState()}
								/>;
					}
					return <Toolbar>
								{button}
							</Toolbar>;
			}
		},
		[footer, setFooter] = useState(getFooter()),
		[results, setResults] = useState(null),
		[progress, setProgress] = useState(null),
		[isReady, setIsReady] = useState(false),
		showResults = (results) => {
			setMode(RESULTS);
			setFooter(getFooter());
			setResults(results);
		},
		startProcess = async () => {
			stopGettingProgress();
			setMode(PROCESSING);
			setFooter(getFooter());
			
			const
				method = Repository.methods.edit,
				uri = Repository.getModel() + '/startProcess',
				formValues = self?.children?.form?.formGetValues() || {};
			formValues.process = process;
			const
				result = await Repository._send(method, uri, formValues);

			setFormValues(formValues);
			
			const response = Repository._processServerResponse(result);
			if (!response?.success) {
				alert(response.message || 'Error starting process on server.');
				resetToInitialState();
				return;
			}

			if (getProgressUpdates) {
				setProgress(<VStack className="p-4">
								<Text className="text-lg" key="status">
									Process has started. Progress updates will appear here momentarily.
								</Text>
								<Loading />
							</VStack>);
				getProgress();
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
		getProgress = (immediately = false) => {
			if (!getProgressUpdates) {
				return;
			}

			async function fetchProgress(isInitial = false) {

				setIsStuck(false);
				
				const
					method = Repository.methods.edit,
					uri = Repository.getModel() + '/getProcessProgress',
					data = {
						process,
						...getFormValues(), // in case options submitted when starting the process affect the progress updates
					},
					result = await Repository._send(method, uri, data);

				const response = Repository._processServerResponse(result);
				if (!response.success) {
					alert(response.message || 'Error getting progress info from server.');
					stopGettingProgress();
					return;
				}

				const
					progress = parseProgress ? parseProgress(response.root) : response.root,
					{
						status,
						errors,
						started,
						lastUpdated,
						timeElapsed,
						count,
						current,
						total,
						percentage,
						message,
					} = progress || {},
					renderItems = [];
				if (status === PROGRESS__NONE_FOUND) {
					resetToInitialState();
					setIsReady(true);
					forceUpdate();
					return;
				}

				let color = 'text-black',
					statusMessage = '',
					errorMessage = null;
				if (status === PROGRESS__IN_PROCESS) {
					setMode(PROCESSING);
					color = 'text-green-600';
					statusMessage = 'In process...';
				} else {
					setMode(RESULTS);
					stopGettingProgress();
					if (status === PROGRESS__COMPLETED) {
						statusMessage = 'Completed';
					} else if (status === PROGRESS__FAILED) {
						color = 'text-red-400 font-bold';
						statusMessage = 'Failed';
					} else if (status === PROGRESS__STUCK) {
						color = 'text-red-400 font-bold';
						setIsStuck(true);
						statusMessage = 'Stuck';
					}
				}

				const className = 'text-lg';
				renderItems.push(<Text className={className + ' ' + color} key="status">Status: {statusMessage}</Text>);
				if (!_.isNil(percentage) && status !== PROGRESS__COMPLETED) {
					renderItems.push(<VStack key="progress">
											<Progress.Bar
												animated={true}
												progress={percentage / 100}
												width={175}
												height={15}
												color={progressColor}
											/>
											<Text className={className}>{percentage}%</Text>
										</VStack>);
				}
				if (started) {
					const startedMoment = moment(started);
					if (startedMoment.isValid()) {
						renderItems.push(<Text className={className} key="started">Started: {startedMoment.format(MOMENT_DATE_FORMAT_2)}</Text>);
					}
				}
				if (lastUpdated) {
					const updatedMoment = moment(lastUpdated);
					if (updatedMoment.isValid()) {
						renderItems.push(<Text className={className} key="lastUpdated">Last Updated: {updatedMoment.format(MOMENT_DATE_FORMAT_2)}</Text>);
					}
				}
				if (timeElapsed) {
					renderItems.push(<Text className={className} key="timeElapsed">Time Elapsed: {timeElapsed}</Text>);
				}
				if (!_.isNil(count) && count !== 0) {
					renderItems.push(<Text className={className} key="count">Count: {count}</Text>);
				}
				if (!_.isNil(current) && !_.isNil(total)) {
					renderItems.push(<Text className={className} key="currentTotal">Current/Total: {current} / {total}</Text>);
				}
				if (!_.isNil(message) && !_.isEmpty(message)) {
					renderItems.push(<Text className={className} key="message">{message}</Text>);
				}
				if (!_.isNil(errors)) {
					renderItems.push(<VStack key="errors">
										<Text className="text-red-400 font-bold">Errors:</Text>
										{errors?.map((line, ix)=> {
											return <Text key={ix}>{line}</Text>;
										})}
									</VStack>);
				}
				if (getMode() === PROCESSING) {
					setProgress(renderItems);
				} else {
					setResults(renderItems);
				}

				setIsReady(true);
				setFooter(getFooter());
				forceUpdate();
			};
	
			let interval = getInterval();
			if (interval) {
				clearInterval(interval);
			}
			setIntervalRef(setInterval(fetchProgress, updateInterval));
			
			if (immediately) {
				fetchProgress(true); // isInitial
			}
		},
		unstick = async () => {
			stopGettingProgress();
			setMode(PROCESSING);
			setFooter(getFooter());
			
			const
				method = Repository.methods.edit,
				uri = Repository.getModel() + '/unstickProcess',
				data = {
					process
				};
			const
				result = await Repository._send(method, uri, data);
			
			const response = Repository._processServerResponse(result);
			if (!response?.success) {
				alert(response.message || 'Error unsticking process on server.');
				resetToInitialState();
				return;
			}

			if (response.root?.status !== PROGRESS__UNSTUCK) {
				alert('Process could not be unstuck.');
				return;
			}

			alert('Process unstuck.');
			resetToInitialState();
		},
		resetToInitialState = () => {
			setMode(START);
			setFooter(getFooter());
			setIsStuck(false);
			stopGettingProgress();
		},
		stopGettingProgress = () => {
			clearInterval(getInterval());
			setIntervalRef(null);
		},
		onValidityChange = (isValid) => {
			setIsValid(isValid);
			setFooter(getFooter());
		};

	useEffect(() => {
		if (getProgressUpdates) {
			getProgress(true);
		} else {
			setMode(START);
			setIsReady(true);
		}
		return () => {
			// clear the interval when the component unmounts
			const interval = getInterval();
			if (interval) {
				clearInterval(interval);
			}
		};
	}, []);

	return <Panel
				{...props}
				footer={footer}
			>
				{!isReady && <Loading />}
				{isReady &&
					<TabBar
						tabs={[
							{
								title: 'Start',
								icon: Play,
								isDisabled: currentTabIx !== 0,
								content: getMode() === INIT ? 
										<Loading /> :
										<ScrollView className="ScrollView h-full w-full">
											<Form
												reference="form"
												parent={self}
												className="w-full h-full flex-1"
												disableFooter={true}
												items={formItems}
												startingValues={formStartingValues}
												onValidityChange={onValidityChange}
												{..._form}
											/>
										</ScrollView>,
							},
							{
								title: 'Progress',
								icon: EllipsisHorizontal,
								isDisabled: currentTabIx !== 1,
								content: <ScrollView className="ScrollView h-full w-full p-4">
											{progress}
										</ScrollView>,
							},
							{
								title: 'Results',
								icon: Stop,
								isDisabled: currentTabIx !== 2,
								content: <ScrollView className="ScrollView h-full w-full p-4">
											{results}
										</ScrollView>,
							},
						]}
						currentTabIx={currentTabIx}
						canToggleCollapse={false}
						tabsAreButtons={false}
					/>}
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