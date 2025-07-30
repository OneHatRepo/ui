import { useState, } from 'react';
import {
	ScrollView,
	VStack,
} from '@project-components/Gluestack';
import clsx from 'clsx';
import Accordion from 'react-native-collapsible/Accordion'; // https://www.npmjs.com/package/react-native-collapsible
import testProps from '../../Functions/testProps';
import Footer from '../Layout/Footer.js';
import Toolbar from '../Toolbar/Toolbar.js';
import PaginationToolbar from '../Toolbar/PaginationToolbar.js';
import NoRecordsFound from './NoRecordsFound.js';
import GridPanel from './GridPanel.js';
import _ from 'lodash';

export default function AccordionGridPanel(props) {
	
	// const {
	// 		sections = [],
	// 		Repository = null,
	// 		topToolbar = null,
	// 		bottomToolbar = 'pagination',
	// 		columns = [],
	// 		getRowProps = () => {
	// 			return {
	// 				bg: '#fff',
	// 				p: 2,
	// 			};
	// 		},
	// 		renderSectionHeader = (section, ix, isActive) => {},
	// 		onChangeSelection = () => {},
	// 		noneFoundText,
	// 		containerStyle = {},
	// 		hideRightVStack = false,
	// 		activeSectionIndexes = [0],
	// 	} = props,
	// 	[activeSections, setActiveSections] = useState(activeSectionIndexes);

	// return <VStack
	// 			{...testProps('AccorionGridPanel')}
	// 			flex={1}
	// 			w="100%"
	// 			{...containerStyle}
	// 		>
	// 			{topToolbar && <Toolbar>{topToolbar}</Toolbar>}

	// 			<ScrollView
	// 				keyboardShouldPersistTaps="always"
	// 				flex={1}
	// 				w="100%"
	// 			>
	// 				<Accordion
	// 					activeSections={activeSections}
	// 					sections={sections}
	// 					onChange={setActiveSections}
	// 					renderHeader={renderSectionHeader}
	// 					renderContent={(section) => {
	// 						if (!section.data.length) {
	// 							return <NoRecordsFound text={noneFoundText} />;
	// 						}
	// 						return <GridPanel
	// 									flatListProps={{
	// 										scrollEnabled: false,
	// 										...testProps(section.title),
	// 									}}
	// 									noneFoundText="No items found."
	// 									Repository={{ // Simulated repository
	// 										entities: section.data,
	// 										schema: section.schema,
	// 									}}
	// 									flex={1}
	// 									w="100%"
	// 									getRowProps={getRowProps}
	// 									pullToRefresh={false}
	// 									columns={columns}
	// 									onChangeSelection={onChangeSelection}
	// 									bottomToolbar={false}
	// 									hideRightVStack={hideRightVStack}
	// 								/>;
	// 					}}
	// 				/>
	// 			</ScrollView>

	// 			{bottomToolbar && (bottomToolbar !== 'pagination' || Repository.entities.length > 5) && /* Only show pagination toolbar if >5 items to display */ (
	// 				<Footer>
	// 					{(
	// 						bottomToolbar === 'pagination' ? 
	// 							<PaginationToolbar Repository={Repository} /> :
	// 								<Toolbar>{bottomToolbar}</Toolbar>
	// 					)}
	// 				</Footer>
	// 			)}
	// 		</VStack>;
}
 