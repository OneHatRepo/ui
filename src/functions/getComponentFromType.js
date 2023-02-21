import {
	Column,
} from 'native-base';
// import AccordionGridPanel from '../Components/Panel/AccordionGridPanel.js';
import ArrayCheckboxGroup from '../Components/Form/Field/CheckboxGroup/ArrayCheckboxGroup.js';
import ArrayCombo from '../Components/Form/Field/Combo/ArrayCombo.js';
import ArrayRadioGroup from '../Components/Form/Field/RadioGroup/ArrayRadioGroup.js';
// import BackButton from '../Components/Buttons/BackButton.js';
import Blank from '../Components/Blank.js';
import BooleanCombo from '../Components/Form/Field/Combo/BooleanCombo.js';
// import CartButtonWithBadge from '../Components/Buttons/CartButtonWithBadge.js';
import CheckboxGroup from '../Components/Form/Field/CheckboxGroup/CheckboxGroup.js';
import CKEditor from '../Components/Form/Field/CKEditor/CKEditor.js';
import Color from '../Components/Form/Field/Color.js';
import Combo from '../Components/Form/Field/Combo/Combo.js';
// import ComboEditor from '../Components/Form/Field/Combo/ComboEditor.js';
import Container from '../Components/Container/Container.js';
import DataMgt from '../Components/Screens/DataMgt.js';
import Date from '../Components/Form/Field/Date.js';
import DateRange from '../Components/Filter/DateRange.js';
import DisplayField from '../Components/Form/Field/DisplayField.js';
import FieldSet from '../Components/Form/FieldSet.js';
import File from '../Components/Form/Field/File.js';
import FiltersForm from '../Components/Form/FiltersForm.js';
// import FiltersToolbar from '../Components/Toolbar/FiltersToolbar.js';
import Form from '../Components/Form/Form.js';
import Grid from '../Components/Grid/Grid.js';
import GridPanel from '../Components/Panel/GridPanel.js';
import IconButton from '../Components/Buttons/IconButton.js';
import Input from '../Components/Form/Field/Input.js';
import IntervalsCombo from '../Components/Form/Field/Combo/IntervalsCombo.js';
import Label from '../Components/Form/Label.js';
import MonthsCombo from '../Components/Form/Field/Combo/MonthsCombo.js';
import Number from '../Components/Form/Field/Number.js';
import NumberRange from '../Components/Filter/NumberRange.js';
import Panel from '../Components/Panel/Panel.js';
// import Picker from '../Components/Panel/Picker.js';
import RadioGroup from '../Components/Form/Field/RadioGroup/RadioGroup.js';
import TabPanel from '../Components/Panel/TabPanel.js';
import Tag from '../Components/Form/Field/Combo/Tag.js';
import TextArea from '../Components/Form/Field/TextArea.js';
import Text from '../Components/Form/Field/Text.js';
import TimezonesCombo from '../Components/Form/Field/Combo/TimezonesCombo.js';
import Toggle from '../Components/Form/Field/Toggle.js';
import Toolbar from '../Components/Toolbar/Toolbar.js';
import YearsCombo from '../Components/Form/Field/Combo/YearsCombo.js';
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
		CKEditor,
		Color,
		Column,
		Combo,
		// ComboEditor,
		Container,
		DataMgt,
		Date,
		DateRange,
		DisplayField,
		FieldSet,
		File,
		FiltersForm,
		// FiltersToolbar,
		Form,
		Grid,
		GridPanel,
		IconButton,
		Input,
		IntervalsCombo,
		Label,
		MonthsCombo,
		Number,
		NumberRange,
		Panel,
		// Picker,
		RadioGroup,
		TabPanel,
		Tag,
		Text,
		TextArea,
		TimezonesCombo,
		Toggle,
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