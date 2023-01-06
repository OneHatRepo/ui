import { useState, } from 'react';
import {
	SELECTION_MODE_ALL,
	SELECTION_MODE_SINGLE,
	SELECTION_MODE_MULTI,
} from '../../Constants/Selection';

export default function withSelectorSelected(WrappedComponent) {
	return (props) => {
		const {
				selector_id,
				selectorMode = SELECTION_MODE_ALL, // SELECTION_MODE_ALL, SELECTION_MODE_SINGLE, SELECTION_MODE_MULTI
				selectorSelected,
				setSelectorSelected,
				disableSelectorSelected,
				onAfterSelectorChangeSelection,
				noSelectorMeansNoResults = false,
				Repository,
			} = props,
			usePassThrough = !!setSelectorSelected,
			[localSelectorSelected, setLocalSelectorSelected] = useState(null),
			onSelectorChangeSelection = (entities) => {
				if (!disableSelectorSelected) {
					return;
				}

				if (entities && entities[0] && entities[0].phantom) {
					return; // Don't allow selector to be phantom record
				}

				setSelectorSelected(entities);

				if (onAfterSelectorChangeSelection) {
					onAfterSelectorChangeSelection(entities);
				}
			},
			filterBySelector = () => {
				if (!disableSelectorSelected) {
					return;
				}
				Repository.filter(selector_id, selectorSelected.id, false); // false to not replace all filters
			};

		return <WrappedComponent
					{...props}
					selectorMode={selectorMode}
					onSelectorChangeSelection={onSelectorChangeSelection}
					selectorSelected={usePassThrough ? selectorSelected : localSelectorSelected}
					setSelectorSelected={usePassThrough ? setSelectorSelected : setLocalSelectorSelected}
					filterBySelector={filterBySelector}
					noSelectorMeansNoResults={noSelectorMeansNoResults}
				/>;
	};
}