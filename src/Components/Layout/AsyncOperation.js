import { useState, } from 'react';
import {
	Text,
	VStack,
} from '@project-components/Gluestack';
import Form from '../Form/Form.js';
import Button from '../Buttons/Button.js';
import CenterBox from '../Layout/CenterBox.js';
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


function AsyncOperation(props) {
	const {
			action,
			Repository,
			formItems = [],

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
				method = Repository.methods.post,
				uri = Repository.getModel() + '/' + action,
				formValues = self.children.form.formGetValues(),
				result = await Repository._send(method, uri, formValues);
				
			const response = Repository._processServerResponse(result);
			if (!response.success) {
				alert(result.message);
				reset();
				return;
			}
			
			let results = <CenterBox><Text>Success</Text></CenterBox>;
			if (response.message) {
				const decodedMessage = JSON.parse(response.message);
				results = _.isArray(decodedMessage) ? 
								<VStack>
									{decodedMessage?.map((line, ix)=> {
										return <Text key={ix}>{line}</Text>;
									})}
								</VStack> : 
								<Text>{decodedMessage}</Text>;
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
		[results, setResults] = useState(''),
		[currentTabIx, setCurrentTab] = useState(0),
		showResults = (results) => {
			setCurrentTab(1);
			setFooter(getFooter('results'));
			setResults(results);
		},
		reset = () => {
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
									/>,
						},
						{
							title: 'Results',
							icon: Stop,
							isDisabled: currentTabIx !== 1,
							content: results,
						},
					]}
					currentTabIx={currentTabIx}
					canToggleCollapse={false}
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