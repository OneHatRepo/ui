export default function(value, allowNull = true) {
	if (allowNull && !value) return true; // Allow null or empty values
	const date = new Date(value);
	return !isNaN(date.getTime()); // Check if the date is valid
}