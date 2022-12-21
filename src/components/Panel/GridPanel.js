import Panel from '../Panel/Panel';
import Grid from '../Grid/Grid';

export default function GridPanel(props) {
	const {
			_panel = {},
			_grid = {},
		} = props,
		title = _grid.model ? _grid.model : props.title;

	return <Panel title={title} {..._panel}>
				<Grid
					{..._grid}
				/>
			</Panel>;
}