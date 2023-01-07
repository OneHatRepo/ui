import { useState, } from 'react';
import {
	Column,
	ScrollView,
} from 'native-base';
import Accordion from 'react-native-collapsible/Accordion'; // https://www.npmjs.com/package/react-native-collapsible
import testProps from '../../Functions/testProps';
import Footer from './Footer';
import Toolbar from '../Toolbar/Toolbar';
import PaginationToolbar from '../Toolbar/PaginationToolbar';
import NoRecordsFound from './NoRecordsFound';
import GridPanel from './GridPanel';
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
	// 		hideRightColumn = false,
	// 		activeSectionIndexes = [0],
	// 	} = props,
	// 	[activeSections, setActiveSections] = useState(activeSectionIndexes);

	// return <Column
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
	// 									hideRightColumn={hideRightColumn}
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
	// 		</Column>;
}
 