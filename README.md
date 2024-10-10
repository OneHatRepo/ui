# OneHatUi Patterns

The OneHatUi library is a set of pre-built components that make use of the OneHatData library. 
It is built on top of ReactNative, and either NativeBase or GlueStack.

Many of the components make use of other components internally. 
For example, the `Grid` component uses `IconButtons` for its pagination toolbar. 
The `Combo` component makes use of the `Grid` component for its menu. 
And the `Tag` component is simply a `Combo` with additional functionality.

Many components have “regular” and “editor” versions. For example, there’s a `Grid` and a `GridEditor`. 
The `Grid` is simply for viewing. The `GridEditor` allows the records within the `Grid` to be managed (add/edit/delete).

For the most part, it follows the React rules of data flowing only top-down through props, and of components not knowing about 
their relative position in the component tree. But there are some cases where such wooden adherence is counterproductive. 
In such cases, the library makes use of the `withComponent` HOC, which adds a “self” prop to every component, 
which has references to parents and children. In this way, a child component can directly reference its parent(s) or children. 

For parentage examples, the `Form` component closes its grandparent `Editor` in some cases, 
and the `InlineEditor` queries its parent `Grid` to figure out which row it should align with.

For a child example, the `Combo` can directly tell its menu `Grid` to `selectNext()` or `selectPrev()`
based on user keystrokes.

