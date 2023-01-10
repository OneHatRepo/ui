import {
	Column,
} from 'native-base';
// import AccordionGridPanel from '../Components/Panel/AccordionGridPanel';
import ArrayCheckboxGroup from '../Components/Form/Field/CheckboxGroup/ArrayCheckboxGroup';
import ArrayCombo from '../Components/Form/Field/Combo/ArrayCombo';
import ArrayRadioGroup from '../Components/Form/Field/RadioGroup/ArrayRadioGroup';
// import BackButton from '../Components/Buttons/BackButton';
import Blank from '../Components/Blank';
import BooleanCombo from '../Components/Form/Field/Combo/BooleanCombo';
// import CartButtonWithBadge from '../Components/Buttons/CartButtonWithBadge';
import CheckboxGroup from '../Components/Form/Field/CheckboxGroup/CheckboxGroup';
import Color from '../Components/Form/Field/Color';
import Combo from '../Components/Form/Field/Combo/Combo';
// import ComboEditor from '../Components/Form/Field/Combo/ComboEditor';
import Container from '../Components/Container/Container';
import Date from '../Components/Form/Field/Date';
// import DateRange from '../Components/Filter/DateRange';
import FieldSet from '../Components/Form/FieldSet';
import File from '../Components/Form/Field/File';
import FiltersForm from '../Components/Form/FiltersForm';
// import FiltersToolbar from '../Components/Toolbar/FiltersToolbar';
import Form from '../Components/Form/Form';
import Grid from '../Components/Grid/Grid';
import GridPanel from '../Components/Panel/GridPanel';
import IconButton from '../Components/Buttons/IconButton';
import Input from '../Components/Form/Field/Input';
import Label from '../Components/Form/Label';
import MonthsCombo from '../Components/Form/Field/Combo/MonthsCombo';
import Number from '../Components/Form/Field/Number';
import NumberRange from '../Components/Filter/NumberRange';
import Panel from '../Components/Panel/Panel';
// import Picker from '../Components/Panel/Picker';
import RadioGroup from '../Components/Form/Field/RadioGroup/RadioGroup';
import TabPanel from '../Components/Panel/TabPanel';
import TextArea from '../Components/Form/Field/TextArea';
import Toolbar from '../Components/Toolbar/Toolbar';
import YearsCombo from '../Components/Form/Field/Combo/YearsCombo';
import _ from 'lodash';

const
	mapping = {
		// AccordionGridPanel,
		ArrayCheckboxGroup,
		ArrayCombo,
		ArrayRadioGroup,
		// BackButton,
		Blank,
		BooleanCombo,
		// CartButtonWithBadge,
		CheckboxGroup,
		Color,
		Column,
		Combo,
		// ComboEditor,
		Container,
		Date,
		// DateRange,
		FieldSet,
		File,
		FiltersForm,
		// FiltersToolbar,
		Form,
		Grid,
		GridPanel,
		IconButton,
		Input,
		Label,
		MonthsCombo,
		Number,
		NumberRange,
		Panel,
		// Picker,
		RadioGroup,
		TabPanel,
		TextArea,
		Toolbar,
		YearsCombo,
	};

export default function getComponentFromType(type) {
	if (_.isString(type)) {
		return mapping[type];
	}
	return type;
}

export function registerComponents(newMapping) {
	_.merge(mapping, newMapping);
}