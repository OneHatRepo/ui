import Grid from './Grid';
import oneHatData from '@onehat/data';

export default function ModelGrid(props) {
	if (props.Repository) {
		return <Grid {...props} />;
	}
	if (!props.model) {
		throw new Error('"model" must be provided.')
	}

	const Repository = oneHatData.getRepository(props.model);

	return <Grid {...props} Repository={Repository} />;

}
