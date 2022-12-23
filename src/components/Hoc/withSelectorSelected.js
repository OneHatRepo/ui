import { useState, } from 'react';
import {
	SELECTOR_MODE_ALL,
	SELECTOR_MODE_SINGLE,
	SELECTOR_MODE_MULTI,
} from '../../constants/SelectorModes';

export default function withSelectorSelected(WrappedComponent) {
	return (props) => {
		const {
				selector_id,
				selectorMode = SELECTOR_MODE_ALL, // SELECTOR_MODE_ALL, SELECTOR_MODE_SINGLE, SELECTOR_MODE_MULTI
				disableSelectorSelected,
				onAfterSelectorChangeSelection,
				noSelectorMeansNoResults = false,
				Repository,
			} = props,
			[selectorSelected, setSelectorSelected] = useState(null),
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
					selectorSelected={selectorSelected}
					filterBySelector={filterBySelector}
					noSelectorMeansNoResults={noSelectorMeansNoResults}
				/>;
	};
}