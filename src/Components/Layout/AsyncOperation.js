import { useState, useRef, } from 'react';
import {
	Box,
	Text,
	VStack,
} from '@project-components/Gluestack';
import { PROGRESS_COMPLETED } from '../../Constants/Progress.js';
import isJson from '../../Functions/isJson.js';
import Form from '../Form/Form.js';
import Button from '../Buttons/Button.js';
import withComponent from '../Hoc/withComponent.js';
import withAlert from '../Hoc/withAlert.js';
import ChevronLeft from '../Icons/ChevronLeft.js';
import ChevronRight from '../Icons/ChevronRight.js';
import Play from '../Icons/Play.js';
import Stop from '../Icons/Stop.js';
import TabBar from '../Tab/TabBar.js';
import Panel from '../Panel/Panel.js';
import Toolbar from '../Toolbar/Toolbar.js';
import _ from 'lodash';


// LEFT OFF HERE
// For one, the interval is not unique to this component, but needs to be.
// Secondly, I want to change the tab[1] icon to indicate in progress or stopped.

let interval = null;

function AsyncOperation(props) {
	const {
			action,
			Repository,
			formItems = [],
			formStartingValues = {},
			getProgressUpdates = false,
			progressStuckThreshold = null, // e.g. 3, if left blank, doesn't check for stuck state

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

			setFooter(getFooter('processing'));
			
			const
				method = Repository.methods.edit,
				uri = Repository.getModel() + '/' + action,
				formValues = self?.children?.form?.formGetValues() || {},
				result = await Repository._send(method, uri, formValues);

			setFormValues(formValues);
			
			const response = Repository._processServerResponse(result);
			if (!response.success) {
				alert(result.message);
				reset();
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
									onPress={() => reset()}
								/>
							</Toolbar>;
			}
		},
		[footer, setFooter] = useState(getFooter()),
		[results, setResults] = useState(null),
		[progress, setProgress] = useState(null),
		[isStuck, setIsStuck] = useState(false),
		[currentTabIx, setCurrentTab] = useState(0),
		previousProgress = useRef(null),
		unchangedProgressCount = useRef(0),
		formValues = useRef(null),
		getPreviousProgress = () => {
			return previousProgress.current;
		},
		setPreviousProgress = (progress) => {
			previousProgress.current = progress;
		},
		getUnchangedProgressCount = () => {
			return unchangedProgressCount.current;
		},
		setUnchangedProgressCount = (count) => {
			unchangedProgressCount.current = count;
		},
		getFormValues = () => {
			return formValues.current;
		},
		setFormValues = (values) => {
			formValues.current = values;
		},
		showResults = (results) => {
			setCurrentTab(1);
			setFooter(getFooter('results'));
			setResults(results);

			if (getProgressUpdates) {
				interval = setInterval(async () => {
					const
						method = Repository.methods.edit,
						progressAction = 'get' + action.charAt(0).toUpperCase() + action.slice(1) + 'Progress',
						uri = Repository.getModel() + '/' + progressAction,
						result = await Repository._send(method, uri, getFormValues());
						
					const response = Repository._processServerResponse(result);
					if (!response.success) {
						alert(result.message);
						setProgress(null);
						clearInterval(interval);
						return;
					}

					const progress = response.message
					setProgress(progress);
					if (progress === PROGRESS_COMPLETED) {
						clearInterval(interval);
					} else {
						let newUnchangedProgressCount = getUnchangedProgressCount();
						if (progress === getPreviousProgress()) {
							newUnchangedProgressCount++;
						} else {
							setPreviousProgress(progress);
							newUnchangedProgressCount = 0;
						}
						setUnchangedProgressCount(newUnchangedProgressCount);
						if (newUnchangedProgressCount && progressStuckThreshold !== null && newUnchangedProgressCount >= progressStuckThreshold) {
							clearInterval(interval);
							setProgress('The operation appears to be stuck.');
							setIsStuck(true);
						}
					}
				}, 10000);
			}
		},
		reset = () => {
			setProgress(null);
			setIsStuck(false);
			setPreviousProgress(null);
			setUnchangedProgressCount(0);
			clearInterval(interval);
			setCurrentTab(0);
			setFooter(getFooter());
		};

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
							icon: Stop,
							isDisabled: currentTabIx !== 1,
							content: <Box className={`p-2 ${isStuck ? 'text-red-400 font-bold' : ''}`}>
										{progress || results}
									</Box>,
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