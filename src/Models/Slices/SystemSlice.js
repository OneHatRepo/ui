import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import _ from 'lodash';


// synchronous thunks
export function setIsWaitModalShown(bool, name = 'default') {
	return (dispatch, getState) => {
		// NOTE: the waitStack is a dictionary of processes and their counts.
		// Normally, this just uses the 'default' name.
		// Optionally, the user can tell us which name is to be shown.
		// If not using the default, the name name is added as the waitMessage.
		// If multiple processes are being awaited, the most recently added name 
		// controls the waitMessage, even if other earlier added namees have been
		// incremented.

		const stack = _.clone(selectWaitStack(getState()));
		if (bool) {
			// Show it
			if (_.isEmpty(stack)) {
				dispatch(setIsWaitModalShownAction(true));
			}
			if (stack[name]) {
				stack[name]++;
			} else {
				stack[name] = 1;
			}
		} else {
			// Hide it
			if (stack[name] !== 1) {
				stack[name]--;
			} else {
				delete stack[name];
			}
			if (_.isEmpty(stack)) {
				dispatch(setIsWaitModalShownAction(false));
			}

			const
				keys = Object.keys(stack),
				lastKey = keys[keys.length - 1];
			name = lastKey;
		}
		dispatch(setWaitStack(stack));
		dispatch(setWaitMessage(name === 'default' ? null : name));
	};
}
export function startOperation(name, totalItems = 0) {
	return (dispatch) => {
		dispatch(_setOperationInProgress({
			name,
			currentItem: 0,
			totalItems,
			progressPercentage: 0,
		}));
	};
}
export function updateOperation(name, args = {}) {
	return (dispatch, getState) => {
		let {
				currentItem,
				totalItems,
				progressPercentage,
			} = args;
		const
			state = getState().system,
			operations = selectOperationsInProgress(getState()),
			operation = _.clone(operations.find(op => op.name === name)); // clone so we don't mutate state directly

		if (!operation) {
			console.warn(`Operation "${name}" not found. Use startOperation() first.`);
			return;
		}

		// if totalItems is set, use it
		if (totalItems) {
			operation.totalItems = totalItems;
		} else {
			totalItems = operation.totalItems;
		}
		if (progressPercentage) {
			operation.progressPercentage = progressPercentage;
			operation.currentItem = totalItems > 0 ? Math.round((progressPercentage / 100) * totalItems) : 0;
		}
		if (currentItem) {
			operation.currentItem = currentItem;
			operation.progressPercentage = totalItems > 0 ? Math.round((currentItem / totalItems) * 100) : 0;
		}

		dispatch(_setOperationInProgress(operation));
	};
}
export function completeOperation(name) {
	return (dispatch) => {
		dispatch(_setOperationInProgress({
			name,
			progressPercentage: 100,
		}));
	};
}


// slice
export const systemSlice = createSlice({
	name: 'system',
	initialState: {
		debugMessage: null,
		debugStack: [],
		alertMessage: null,
		infoMessage: null,
		isWaitModalShown: false,
		waitMessage: null,
		waitStack: {},
		progressMessage: null,
		progressPercentage: 100,
		operationsInProgress: [], // array of { name, totalItems, currentItem, progressPercentage }
	},
	reducers: {
		setDebugMessage: (state, action) => {
			state.debugMessage = action.payload;
		},
		setDebugStack: (state, action) => {
			state.debugStack = action.payload;
		},
		setAlertMessage: (state, action) => {
			state.alertMessage = action.payload;
		},
		setInfoMessage: (state, action) => {
			state.infoMessage = action.payload;
		},
		setIsWaitModalShownAction: (state, action) => {
			state.isWaitModalShown = action.payload;
		},
		setWaitMessage: (state, action) => {
			state.waitMessage = action.payload;
		},
		setWaitStack: (state, action) => {
			state.waitStack = action.payload;
		},
		setProgressMessage: (state, action) => {
			state.progressMessage = action.payload;
		},
		setProgressPercentage: (state, action) => {
			state.progressPercentage = action.payload;
		},
		_setOperationInProgress: (state, action) => {
			// This method sets or updates one particular operation in progress.
			// This is a private function and should not be used directly;
			// use helper thunks (startOperation, updateOperation, completeOperation) instead.

			const {
					name,
					totalItems,
					currentItem,
					progressPercentage,
				} = action.payload;

			if (progressPercentage < 100) {
				// Add or update operation
				const
					existingIndex = state.operationsInProgress.findIndex(op => op.name === name),
					operation = {
						name,
						totalItems: totalItems || 0,
						currentItem: currentItem || 0,
						progressPercentage: progressPercentage || 0
					};
				
				if (existingIndex >= 0) {
					state.operationsInProgress[existingIndex] = operation;
				} else {
					state.operationsInProgress.push(operation);
				}
			} else {
				// Remove operation
				state.operationsInProgress = state.operationsInProgress.filter(op => op.name !== name);
			}
		},
		clearAllOperations: (state) => {
			state.operationsInProgress = [];
		},
	}
});


// action definitions
export const {
	setDebugMessage,
	setDebugStack,
	setAlertMessage,
	setInfoMessage,
	setIsWaitModalShownAction,
	setWaitMessage,
	setWaitStack,
	setProgressMessage,
	setProgressPercentage,
	clearAllOperations,
} = systemSlice.actions;
const { // private, do not export
	_setOperationInProgress
} = systemSlice.actions;



// selectors
export const selectDebugMessage = state => state.system.debugMessage;
export const selectDebugStack = state => state.system.debugStack;
export const selectAlertMessage = state => state.system.alertMessage;
export const selectInfoMessage = state => state.system.infoMessage;
export const selectIsWaitModalShown = state => state.system.isWaitModalShown;
export const selectWaitMessage = state => state.system.waitMessage;
export const selectWaitStack = state => state.system.waitStack;
export const selectProgressMessage = state => state.system.progressMessage;
export const selectProgressPercentage = state => state.system.progressPercentage;
export const selectOperationsInProgress = state => state.system.operationsInProgress;
export const selectOperationByName = (name) => state => state.system.operationsInProgress.find(op => op.name === name);
export const selectOperationCount = state => state.system.operationsInProgress.length;
export const selectHasOperationsInProgress = state => state.system.operationsInProgress.length > 0;


export default systemSlice.reducer;