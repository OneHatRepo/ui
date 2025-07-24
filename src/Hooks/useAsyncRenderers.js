import { useState, useEffect, } from 'react';

export default function useAsyncRenderers(columnsConfig, item) {
	const
		[results, setResults] = useState(new Map()),
		[loading, setLoading] = useState(new Set());

	useEffect(() => {
		const asyncConfigs = columnsConfig.filter(config => 
			config.renderer && typeof config.renderer === 'function'
		);

		if (asyncConfigs.length === 0) {
			setResults(new Map());
			setLoading(new Set());
			return;
		}

		const newLoading = new Set();
		asyncConfigs.forEach((config, index) => {
			newLoading.add(index);
		});
		setLoading(newLoading);

		const promises = asyncConfigs.map(async (config, configIndex) => {
			try {
				const result = await config.renderer(item);
				return { configIndex, result, error: null };
			} catch (error) {
				return { configIndex, result: null, error };
			}
		});

		Promise.allSettled(promises).then(settled => {
			const
				newResults = new Map(),
				newLoading = new Set();

			settled.forEach((outcome, index) => {
				if (outcome.status === 'fulfilled') {
					const { configIndex, result, error } = outcome.value;
					newResults.set(configIndex, { result, error });
				}
			});

			setResults(newResults);
			setLoading(newLoading);
		});

	}, [columnsConfig, item]);

	return { results, loading };
}