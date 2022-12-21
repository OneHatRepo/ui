/**
 * This file is categorized as "Proprietary Framework Code"
 * and is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useState, useCallback } from 'react'

export default function useForceUpdate() {
	const [, setTick] = useState(0);
	const update = useCallback(() => {
		setTick(tick => tick + 1);
	}, [])
	return update;
}