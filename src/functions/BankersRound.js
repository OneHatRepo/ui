import round from 'locutus/php/math/round.js'; // Port of PHP functions to JS

// Rounds to the nearest EVEN integer. This means it is unbiased (doesn't always round up, doesn't always round down)
export function BankersRound($x) {
	return round($x, 0, 'PHP_ROUND_HALF_EVEN');
}

// Rounds half-cent amounts to nearest cent, using algorithm similar to above
export default function BankersRoundCents($x) {
	return round($x, 2, 'PHP_ROUND_HALF_EVEN');
}
