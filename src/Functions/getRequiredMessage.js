export const getRequiredMessage = (properties, fieldName) => {
	const
		fieldDefinition = properties.find((prop) => prop.name === fieldName),
		fieldLabel = fieldDefinition ? fieldDefinition.title : fieldName;
	return `"${fieldLabel}" is a required field`;
};

const getGetRequiredMessage = (properties) => (fieldName) => getRequiredMessage(properties, fieldName);
export default getGetRequiredMessage;
