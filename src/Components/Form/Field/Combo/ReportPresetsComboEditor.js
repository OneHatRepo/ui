import { ComboEditor } from './Combo.js';
import ReportPresetsEditorWindow from '../../../Window/ReportPresetsEditorWindow.js';

function ReportPresetsComboEditor(props) {
	return <ComboEditor
				reference="ReportPresetsCombo"
				model="ReportPresets"
				uniqueRepository={true}
				Editor={ReportPresetsEditorWindow}
				usePermissions={true}
				{...props}
			/>;
}

export default ReportPresetsComboEditor;