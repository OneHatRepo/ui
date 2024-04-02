import { useDrag, useDrop } from 'react-dnd'; // https://react-dnd.github.io/react-dnd/about don't forget the wrapping <DndProvider /> as shown here: https://react-dnd.github.io/react-dnd/docs/api/dnd-provider

// This HOC allows components to be dragged and dropped onto another component.
// It doesn't contraint the moment of the preview item.

export function withDragSource(WrappedComponent) {
	return (props) => {
		
		if (!props.isDragSource) {
			return <WrappedComponent {...props} />;
		}

		if (!props.dragSourceType) {
			throw Error('dragSourceType not defined');
		}
		if (!props.dragSourceItem) {
			throw Error('dragSourceItem not defined');
		}

		const {
				dragSourceType,
				dragSourceItem,
			} = props,
			[dragState, dragSourceRef, dragPreviewRef] = useDrag(() => { // A specification object or a function that creates a specification object.
				// The useDrag hook provides a way to wire your component into the DnD system as a drag source. By passing in a specification into useDrag, you declaratively describe the typeof draggable being generated, the itemobject representing the drag source, what props to collect, and more. The useDraghooks returns a few key items: a set of collected props, and refs that may be attached to drag source and drag preview elements
				return {
					type: dragSourceType, // Required. This must be either a string or a symbol. Only the drop targets registered for the same type will react to this item.
					item: dragSourceItem, // Required (object or function).
						// When an object, it is a plain JavaScript object describing the data being dragged. This is the only information available to the drop targets about the drag source so it's important to pick the minimal data they need to know. You may be tempted to put a complex reference here, but you should try very hard to avoid doing this because it couples the drag sources and drop targets. It's a good idea to use something like { id }.
						// When a function, it is fired at the beginning of the drag operation and returns an object representing the drag operation (see first bullet). If null is returned, the drag operation is cancelled.
					previewOptions: null, // Optional. A plain JavaScript object describing drag preview options.
					options: null, // Optional. A plain object optionally containing any of the following properties:
						// dropEffect: Optional: The type of drop effect to use on this drag. ("move" or "copy" are valid values.)
					end: null, // (item, monitor) Optional. When the dragging stops, endis called. For every begin call, a corresponding end call is guaranteed. You may call monitor.didDrop() to check whether or not the drop was handled by a compatible drop target. If it was handled, and the drop target specified a drop result by returning a plain object from its drop()method, it will be available as monitor.getDropResult(). This method is a good place to fire a Flux action. Note: If the component is unmounted while dragging, componentparameter is set to be null.
					canDrag: null, // (monitor): Optional. Use it to specify whether the dragging is currently allowed. If you want to always allow it, just omit this method. Specifying it is handy if you'd like to disable dragging based on some predicate over props. Note: You may not call monitor.canDrag()inside this method.
					isDragging: null, // (monitor): Optional. By default, only the drag source that initiated the drag operation is considered to be dragging. You can override this behavior by defining a custom isDraggingmethod. It might return something like props.id === monitor.getItem().id. Do this if the original component may be unmounted during the dragging and later “resurrected” with a different parent. For example, when moving a card across the lists in a Kanban board, you want it to retain the dragged appearance—even though technically, the component gets unmounted and a different one gets mounted every time you move it to another list. Note: You may not call monitor.isDragging()inside this method.
					collect: (monitor, props) => { // Optional. The collecting function. It should return a plain object of the props to return for injection into your component. It receives two parameters, monitor and props. Read the overview for an introduction to the monitors and the collecting function. See the collecting function described in detail in the next section.
						// monitor fn determines which props from dnd state get passed
						return {
							canDrag: !!monitor.canDrag(), // Returns trueif no drag operation is in progress, and the owner's canDrag() returns true or is not defined.
							isDragging: !!monitor.isDragging(), // Returns trueif a drag operation is in progress, and either the owner initiated the drag, or its isDragging() is defined and returns true.
							// type: monitor.getItemType(), // Returns a string or a symbol identifying the type of the current dragged item. Returns null if no item is being dragged.
							// item: monitor.getItem(), // Returns a plain object representing the currently dragged item. Every drag source must specify it by returning an object from its beginDrag()method. Returns nullif no item is being dragged.
							// dropResult: monitor.getDropResult(), // Returns a plain object representing the last recorded drop result. The drop targets may optionally specify it by returning an object from their drop()methods. When a chain of drop()is dispatched for the nested targets, bottom up, any parent that explicitly returns its own result from drop()overrides the child drop result previously set by the child. Returns nullif called outside endDrag().
							// didDrop: !!monitor.didDrop(), // Returns trueif some drop target has handled the drop event, falseotherwise. Even if a target did not return a drop result, didDrop()returns true. Use it inside endDrag()to test whether any drop target has handled the drop. Returns falseif called outside endDrag().
							// initialClientOffset: monitor.getInitialClientOffset(), // Returns the { x, y }client offset of the pointer at the time when the current drag operation has started. Returns nullif no item is being dragged.
							// initialSourceClientOffset: monitor.getInitialSourceClientOffset(), // Returns the { x, y }client offset of the drag source component's root DOM node at the time when the current drag operation has started. Returns nullif no item is being dragged.
							// clientOffset: monitor.getClientOffset(), // Returns the last recorded { x, y }client offset of the pointer while a drag operation is in progress. Returns nullif no item is being dragged.
							// differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(), // Returns the { x, y }difference between the last recorded client offset of the pointer and the client offset when the current drag operation has started. Returns nullif no item is being dragged.
							// sourceClientOffset: monitor.getSourceClientOffset(), // Returns the projected { x, y }client offset of the drag source component's root DOM node, based on its position at the time when the current drag operation has started, and the movement difference. Returns nullif no item is being dragged.
						};
					},
				};
			}),
			{
				canDrag,
				isDragging,
				// type,
				// item,
				// dropResult,
				// didDrop,
				// initialClientOffset,
				// initialSourceClientOffset,
				// clientOffset,
				// differenceFromInitialOffset,
				// sourceClientOffset,
			} = dragState;

		return <WrappedComponent 
					canDrag={canDrag}
					isDragging={isDragging}
					dragSourceRef={dragSourceRef}
					{...props}
				/>;
	};
}


export function withDropTarget(WrappedComponent) {
	return (props) => {
		if (!props.isDropTarget) {
			return <WrappedComponent {...props} />;
		}

		if (!props.dropTargetAccept) {
			throw Error('dropTargetAccept not defined');
		}

		const {
				dropTargetAccept,
				onDrop = null,
			} = props,
			[dropState, dropTargetRef] = useDrop(() => { // A specification object or a function that creates a specification object.
				// The useDrophook provides a way for you to wire in your component into the DnD system as a drop target. By passing in a specification into the useDrophook, you can specify including what types of data items the drop-target will accept, what props to collect, and more. This function returns an array containing a ref to attach to the Drop Target node and the collected props.
				return {
					accept: dropTargetAccept, // Required. A string, a symbol, or an array of either. This drop target will only react to the items produced by the drag sources of the specified type or types. Read the overview to learn more about the items and types.
					// options: null, // Optional. A plain object. If some of the props to your component are not scalar (that is, are not primitive values or functions), specifying a custom arePropsEqual(props, otherProps) function inside the options object can improve the performance. Unless you have performance problems, don't worry about it.
					drop: onDrop, // (item, monitor): Optional. Called when a compatible item is dropped on the target. You may either return undefined, or a plain object. If you return an object, it is going to become the drop result and will be available to the drag source in its endDragmethod as monitor.getDropResult(). This is useful in case you want to perform different actions depending on which target received the drop. If you have nested drop targets, you can test whether a nested target has already handled dropby checking monitor.didDrop()and monitor.getDropResult(). Both this method and the source's endDragmethod are good places to fire Flux actions. This method will not be called if canDrop()is defined and returns false.
					// hover: null, // (item, monitor): Optional. Called when an item is hovered over the component. You can check monitor.isOver({ shallow: true })to test whether the hover happens over only the current target, or over a nested one. Unlike drop(), this method will be called even if canDrop()is defined and returns false. You can check monitor.canDrop()to test whether this is the case.
					// canDrop: null, // (item, monitor): Optional. Use it to specify whether the drop target is able to accept the item. If you want to always allow it, omit this method. Specifying it is handy if you'd like to disable dropping based on some predicate over props or monitor.getItem(). Note: You may not call monitor.canDrop() inside this method.
					collect: (monitor, props) => { // Optional. The collecting function. It should return a plain object of the props to return for injection into your component. It receives two parameters, monitorand props. Read the overview for an introduction to the monitors and the collecting function. See the collecting function described in detail in the next section.
						return {
							canDrop: !!monitor.canDrop(),
							isOver: !!monitor.isOver(),
							// didDrop: !!monitor.didDrop(),
							// clientOffset: monitor.getClientOffset(),
							// differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
							// dropResult: monitor.getDropResult(),
							// handlerId: monitor.getHandlerId(),
							// initialClientOffset: monitor.getInitialClientOffset(),
							// initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
							// receiveHandlerId
							// subscribeToStateChange
						};
					},
				};
			}),
			{
				canDrop,
				isOver,
				// didDrop,
				// clientOffset,
				// differenceFromInitialOffset,
				// dropResult,
				// handlerId,
				// initialClientOffset,
				// initialSourceClientOffset,
			} = dropState;
			
		return <WrappedComponent 
					canDrop={canDrop}
					isOver={isOver}
					dropTargetRef={dropTargetRef}
					{...props}
				/>;
	};
}
