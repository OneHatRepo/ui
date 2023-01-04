import {
	Column,
} from 'native-base';
import BooleanCombo from './Field/Combo/BooleanCombo';
import CheckboxGroup from './Field/CheckboxGroup/CheckboxGroup';
import RadioGroup from './Field/RadioGroup/RadioGroup';
import Color from './Field/Color';
import Combo from './Field/Combo/Combo';
import Date from './Field/Date';
import FieldSet from './FieldSet';
import File from './Field/File';
import Input from './Field/Input';
import Number from './Field/Number';
import MonthsCombo from './Field/Combo/MonthsCombo';
import TextArea from './Field/TextArea';
import _ from 'lodash';

export default function getFormElementFromType(type) {
	let Element = type;
	if (_.isString(type)) {
		switch (type) {
			case 'BooleanCombo':
				Element = BooleanCombo;
				break;
			case 'CheckboxGroup':
				Element = CheckboxGroup;
				break;
			case 'Color':
				Element = Color;
				break;
			case 'Column':
				Element = Column;
				break;
			case 'Combo':
				Element = Combo;
				break;
			case 'Date':
				Element = Date;
				break;
			case 'FieldSet':
				Element = FieldSet;
				break;
			case 'File':
				Element = File;
				break;
			case 'Input':
				Element = Input;
				break;
			case 'MonthsCombo':
				Element = MonthsCombo;
				break;
			case 'Number':
				Element = Number;
				break;
			case 'RadioGroup':
				Element = RadioGroup;
				break;
			case 'TextArea':
				Element = TextArea;
				break;
			default:
				throw new Error('type not recognized');
		}
	}
	return Element;
}