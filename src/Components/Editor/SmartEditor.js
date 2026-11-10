import { forwardRef, useEffect, useState } from 'react';
import oneHatData from '@onehat/data';
import {
	EDITOR_TYPE__SMART,
} from '../../Constants/Editor.js';
import {
	withInjectedHocProps,
} from '../../Functions/internalHocProps.js';
import getComponentFromType from '../../Functions/getComponentFromType.js';
import Loading from '../Messages/Loading';
import withData from '../Hoc/withData.js';
import withEditor from '../Hoc/withEditor.js';
import withPermissions from '../Hoc/withPermissions.js';

const SmartEditor = forwardRef((props, ref) => {
	const {
			model,
			Editor,
			self,
			...propsToPass
		} = props;

	let LocalEditor = Editor;
	if (!LocalEditor) {
		if (!model) {
			throw Error('SmartEditor requires model when Editor is not provided.');
		}
		LocalEditor = getComponentFromType(model + 'Editor');
	}

	return <LocalEditor
				{...propsToPass}
				parent={self}
				reference="editor"
				ref={ref}
			/>;
});

function withAdditionalProps(WrappedComponent) {
	return forwardRef((props, ref) => {
		const {
				model,
				initialRecordId = null,
				selection = [],
				Repository: incomingRepository = null,
				self,
			} = props,
			normalizedSelection = Array.isArray(selection) ? selection : (selection ? [selection] : []),
			record = normalizedSelection[0] ?? null,
			idToUse = initialRecordId || record?.actualId || record?.id,
			[isReady, setIsReady] = useState(false),
			[trueSelection, setTrueSelection] = useState([]),
			[Repository, setRepository] = useState(incomingRepository);

		useEffect(() => {
			if (incomingRepository) {
				if (self) {
					self.repository = incomingRepository;
				}
				setRepository(incomingRepository);
				return () => {};
			}
			if (!model) {
				throw Error('SmartEditor requires model.');
			}

			// deal with the unique Repository
			let Repository = null,
				isMounted = true;

			(async () => {
				Repository = await oneHatData.getUniqueRepository(model);

				// If unmounted before await resolves, delete immediately and skip setState.
				if (!isMounted) {
					if (Repository?.id) {
						oneHatData.deleteRepository(Repository.id);
					}
					return;
				}
				if (self) {
					self.repository = Repository;
				}
				setRepository(Repository);

			})();

			return () => {
				isMounted = false;
				if (Repository?.id) {
					oneHatData.deleteRepository(Repository.id);
				}
			};
		}, [incomingRepository, model, self]);


		useEffect(() => {
			if (!Repository) {
				return;
			}

			(async () => {
				if (normalizedSelection.length > 0) {
					setTrueSelection(normalizedSelection);
					setIsReady(true);
					return;
				}
				if (Repository && idToUse) {
					let entity = Repository.getById(idToUse);
					if (!entity) {
						entity = await Repository.loadOneAdditionalEntity(idToUse);
					}

					setTrueSelection(entity ? [entity] : []);
				} else {
					setTrueSelection([]);
				}
				setIsReady(true);
			})();

		}, [Repository, idToUse, normalizedSelection]);

		if (!isReady) {
			return <Loading />;
		}

		return <WrappedComponent
					{...props}
					Repository={Repository}
					editorType={EDITOR_TYPE__SMART}
					selection={trueSelection}
					getSelection={() => trueSelection}
					ref={ref}
				/>;
	});
}

export default withAdditionalProps(
					withData(
						withPermissions(
							withEditor(
								SmartEditor
							)
						)
					)
				);
