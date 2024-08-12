import Inflector from 'inflector-js';
import inArray from '../../Functions/inArray.js';
import {
	ADD,
	EDIT,
	DELETE,
	VIEW,
	COPY,
	DUPLICATE,
	PRINT,
	UPLOAD_DOWNLOAD,
} from '../../Constants/Commands.js';
import UiGlobals from '../../UiGlobals.js';
import _ from 'lodash';


export default function withPermissions(WrappedComponent) {
	return (props) => {

		if (!props.usePermissions) {
			return <WrappedComponent {...props} />;
		}

		const {
				// withAlert
				alert,

				// withData
				Repository,
			} = props,
			model = Repository.schema.name,
			checkPermission = (permission) => {
				const
					reduxState = UiGlobals.redux?.getState(),
					permissions = reduxState?.app?.permissions;
				if (!permissions) {
					return false;
				}
				return inArray(permission, permissions);
			},

			showPermissionsError = (permission) => {
				alert(`You are not authorized to ${permission} ${model}.`);
			},

			/**
			 * Check if user has permission to perform an action
			 * 
			 * Example usages:
			 * canUser('view') // check if user can perform 'view' action on the default model
			 * canUser('add', 'PmEvents') // check if user can perform 'add' action on a specific model
			 * canUser('do_something_else) // check if user has a custom permission
			 * 
			 * @param {string} permission - The permission to check for.
			 * @param {string} modelToCheck - The model to check for the permission on.
			 * @returns {boolean} - Whether user has permission
			 */
			canUser = (permission, modelToCheck = null) => {

				// deal with special cases that refer to other permissions
				switch(permission) {
					case PRINT:
						permission = VIEW;
						break;
					case COPY:
					case DUPLICATE: {
						// user must have ADD _and_ EDIT permissions, so check both
						const
							hasAddPermission = canUser(ADD, modelToCheck),
							hasEditPermission = canUser(EDIT, modelToCheck);
						return hasAddPermission && hasEditPermission;
					}
					case UPLOAD_DOWNLOAD: {
						// user must have VIEW, ADD, EDIT, and DELETE permissions, so check all of them
						const
							hasViewPermission = canUser(VIEW, modelToCheck),
							hasAddPermission = canUser(ADD, modelToCheck),
							hasEditPermission = canUser(EDIT, modelToCheck),
							hasDeletePermission = canUser(DELETE, modelToCheck);
						return hasViewPermission && hasAddPermission && hasEditPermission && hasDeletePermission;
					}
					default:
						// do nothing
						break;
				}

				// standard CRUD permissions
				if (inArray(permission, [VIEW, ADD, EDIT, DELETE])) {
					if (!modelToCheck) {
						modelToCheck = model; // use default model if none supplied
					}
					modelToCheck = Inflector.underscore(modelToCheck); // 'PmEvents' -> 'pm_events'
					permission += '_' + modelToCheck; // e.g. 'view_pm_events'
				}

				return checkPermission(permission);
			};

		return <WrappedComponent
					{...props}
					canUser={canUser}
					showPermissionsError={showPermissionsError}
				/>;
	};
}