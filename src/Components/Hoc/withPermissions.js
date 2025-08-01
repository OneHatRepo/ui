import { forwardRef } from 'react';
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
import oneHatData from '@onehat/data';
import _ from 'lodash';

/**
 * checkPermission
 * @param {string} permission like 'view_pm_events'
 * @returns {boolean} - Whether permission is permitted
 */
export function checkPermission(permission) {
	const
		reduxState = UiGlobals.redux?.getState(),
		permissions = reduxState?.app?.permissions || [];
	let hasPermission = inArray(permission, permissions);
	if (hasPermission) {
		return true;
	}
	// check for anonymous get
	const matches = permission.match(/^view_(.*)$/);
	if (matches) {
		const
			name = Inflector.camelize(matches[1]), // 'pm_events' -> 'PmEvents'
			repository = oneHatData.getRepository(name),
			allowAnonymousGet = repository?.schema.repository.allowAnonymousGet;
		if (allowAnonymousGet) {
			hasPermission = true;
		}
	}
	return hasPermission;
}

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
export function canUser(permission, modelToCheck = null) {

	if (modelToCheck) {
		// deal with special cases that refer to other permissions
		switch(permission) {
			case PRINT:
				permission = VIEW; // correct; doesn't recursively call canUser(), just continues on with this permission
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
			modelToCheck = Inflector.underscore(modelToCheck); // 'PmEvents' -> 'pm_events'
			permission += '_' + modelToCheck; // e.g. 'view_pm_events'
		}
	}

	return checkPermission(permission);
}

export default function withPermissions(WrappedComponent, forceUsePermissions = false) {
	return forwardRef((props, ref) => {

		if ((!props.usePermissions && !forceUsePermissions) || props.alreadyHasWithPermissions) {
			return <WrappedComponent {...props} ref={ref} />;
		}

		const {
				// withAlert
				alert,

				// withData
				Repository,
			} = props,
			model = Repository?.schema?.permissionsModel || Repository?.schema?.name, // so we can use an alternate model for permissions if needed
			showPermissionsError = (permission, modelForAlert = null) => {
				if (!modelForAlert) {
					modelForAlert = model;
				}
				modelForAlert = Inflector.humanize(Inflector.underscore(modelForAlert)); // 'PmEvents' -> 'pm events'
			
				alert(`You are not authorized to ${permission} ${modelForAlert}.`);
			},
			canUserDecorator = (permission, modelToCheck = null) => {
				if (!modelToCheck) {
					modelToCheck = model; // fallback to the model of the Repository
				}
				return canUser(permission, modelToCheck);
			};

		return <WrappedComponent
					{...props}
					alreadyHasWithPermissions={true}
					ref={ref}
					canUser={canUserDecorator}
					showPermissionsError={showPermissionsError}
				/>;
	});
}