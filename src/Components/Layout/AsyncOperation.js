import { useState, useRef, useEffect, } from 'react';
import {
	Box,
	ScrollView,
	Text,
	VStack,
} from '@project-components/Gluestack';
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


function AsyncOperation(props) {
	const {
			action,
			Repository,
			formItems = [],
			formStartingValues = {},
			getProgressUpdates = false,
			parseProgress, // optional fn, accepts 'response' as arg and returns progress string
			progressStuckThreshold = null, // e.g. 3, if left blank, doesn't check for stuck state
			updateInterval = 10000, // ms

			// withComponent
			self,

			// withAlert
			alert,
		} = props,
		initiate = async () => {

			if (!Repository || !action) {
				alert('AsyncOperation: Repository and action are required!');
				return;
			}
			clearProgress();
			setFooter(getFooter('processing'));
			setIsInProgress(true);
			
			const
				method = Repository.methods.edit,
				uri = Repository.getModel() + '/' + action,
				formValues = self?.children?.form?.formGetValues() || {},
				result = await Repository._send(method, uri, formValues);

			setFormValues(formValues);
			
			const response = Repository._processServerResponse(result);
			if (!response.success) {
				alert(result.message);
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
		getFooter = (which = 'initiate') => {
			switch(which) {
				case 'initiate':
					return <Toolbar>
								<Button
									text="Initiate"
									rightIcon={ChevronRight}
									onPress={() => initiate()}
								/>
							</Toolbar>;
				case 'processing':
					return <Toolbar>
								<Button
									text="Please wait"
									isLoading={true}
									variant="link"
								/>
							</Toolbar>;
				case 'results':
					return <Toolbar>
								<Button
									text="Reset"
									icon={ChevronLeft}
									onPress={() => resetToInitialState()}
								/>
							</Toolbar>;
			}
		},
		forceUpdate = useForceUpdate(),
		[footer, setFooter] = useState(getFooter()),
		[results, setResults] = useState(null),
		[progress, setProgress] = useState(null),
		[isInProgress, setIsInProgress] = useState(false),
		[isStuck, setIsStuck] = useState(false),
		[currentTabIx, setCurrentTab] = useState(0),
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
			setFooter(getFooter('results'));
			setResults(results);

			if (getProgressUpdates) {
				const interval = setInterval(async () => {
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
				}, updateInterval);
				setIntervalRef(interval);
			}
		},
		resetToInitialState = () => {
			setCurrentTab(0);
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
		unchangedProgressCount = getUnchangedProgressCount();

	useEffect(() => {
		return () => {
			// Cleanup function to clear the interval when the component unmounts
			clearInterval(getInterval());
		};
	}, []);

	return <Panel {...props} footer={footer}>
				<TabBar
					tabs={[
						{
							title: 'Initiate',
							icon: Play,
							isDisabled: currentTabIx !== 0,
							content: <Form
										reference="form"
										parent={self}
										className="w-full h-full flex-1"
										disableFooter={true}
										items={formItems}
										startingValues={formStartingValues}
									/>,
						},
						{
							title: 'Results',
							icon: isInProgress ? EllipsisHorizontal : Stop,
							isDisabled: currentTabIx !== 1,
							content: <ScrollView className="ScrollView h-full w-full">
										<Box className={`p-2 ${isStuck ? 'text-red-400 font-bold' : ''}`}>
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