import * as yup from 'yup'; // https://github.com/jquense/yup#string

const Attachments = {
	
	name: 'Attachments',
	
	model: {

		idProperty: 'attachments__id',
		displayProperty: 'attachments__id',
		sortProperty: 'attachments__filename',
		
		sorters: null,

		validator: yup.object({
			attachments__attachment_directory_id: yup.number().integer().nullable(),
			attachments__model: yup.string().oneOf([]).required(),
			attachments__modelid: yup.number().integer().required(),
			attachments__uuid: yup.string().max(40).required(),
			attachments__path: yup.string().nullable(),
			attachments__filename: yup.string().max(100).required(),
			attachments__mimetype: yup.string().max(100).required(),
			attachments__size: yup.number().integer().nullable()
		}),
		
		properties: [
			{ name: 'attachments__model_display', mapping: 'model_display', title: 'Model Display', isVirtual: true, isFilteringDisabled: true, isEditingDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__size_formatted', mapping: 'size_formatted', title: 'Size Formatted', isVirtual: true, isFilteringDisabled: true, isEditingDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__info', mapping: 'info', title: 'Info', isVirtual: true, isFilteringDisabled: true, isEditingDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__uri', mapping: 'uri', title: 'Uri', isVirtual: true, isFilteringDisabled: true, isEditingDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__attachment_directory_id', mapping: 'attachment_directory_id', title: 'Attachment Directory', type: 'int', isFk: true, fkIdField: 'attachment_directories__id', fkDisplayField: 'attachment_directories__name', filterType: {"type":"AttachmentDirectoriesCombo","loadAfterRender":!1}, editorType: {"type":"AttachmentDirectoriesComboEditor","loadAfterRender":!1}, fieldGroup: 'General', },
			{ name: 'attachments__abs_path', mapping: 'abs_path', title: 'Abs Path', isVirtual: true, isFilteringDisabled: true, isEditingDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__id', mapping: 'id', title: 'Id', type: 'int', isFilteringDisabled: true, fieldGroup: 'General', },
			{ name: 'attachments__model', mapping: 'model', title: 'Model', isFilteringDisabled: true, editorType: {"type":"ArrayCombo"}, fieldGroup: 'General', defaultValue: 'INSPECTIONS', },
			{ name: 'attachments__modelid', mapping: 'modelid', title: 'Modelid', type: 'int', filterType: {"type":"NumberRange"}, editorType: {"type":"Number"}, fieldGroup: 'General', },
			{ name: 'attachments__uuid', mapping: 'uuid', title: 'Uuid', isFilteringDisabled: true, editorType: {"type":"Input"}, fieldGroup: 'General', },
			{ name: 'attachments__path', mapping: 'path', title: 'Path', isFilteringDisabled: true, editorType: {"type":"TextArea"}, fieldGroup: 'General', },
			{ name: 'attachments__filename', mapping: 'filename', title: 'Filename', isFilteringDisabled: true, editorType: {"type":"Input"}, fieldGroup: 'General', },
			{ name: 'attachments__mimetype', mapping: 'mimetype', title: 'Mimetype', isFilteringDisabled: true, editorType: {"type":"Input"}, fieldGroup: 'General', },
			{ name: 'attachments__size', mapping: 'size', title: 'Size', type: 'int', filterType: {"type":"NumberRange"}, editorType: {"type":"Number"}, fieldGroup: 'General', },
			{ name: 'attachment_directories__id', mapping: 'attachment_directory.id', title: 'Id', type: 'int', isForeignModel: true, isEditingDisabled: true, isFilteringDisabled: true, },
			{ name: 'attachment_directories__name', mapping: 'attachment_directory.name', title: 'Name', isForeignModel: true, isEditingDisabled: true, isFilteringDisabled: true, },
			{ name: 'attachment_directories__model', mapping: 'attachment_directory.model', title: 'Model', isForeignModel: true, isEditingDisabled: true, isFilteringDisabled: true, },
			{ name: 'attachment_directories__modelid', mapping: 'attachment_directory.modelid', title: 'Modelid', type: 'int', isForeignModel: true, isEditingDisabled: true, isFilteringDisabled: true, }
		],

		associations: {
			belongsTo: [
				'AttachmentDirectories'
			],

		},

		ancillaryFilters: [],

		defaultFilters: [
			// 'attachments__attachment_directory_id',
			// 'attachments__modelid',
			// 'attachments__size'
		],

	},

	entity: {
		methods: {

			getAttachmentDirectory: async function() {
				const AttachmentDirectories = this.getAssociatedRepository('AttachmentDirectories');
				let entity = AttachmentDirectories.getById(this.attachments__attachment_directory_id);
				if (!entity) {
					entity = await AttachmentDirectories.getSingleEntityFromServer(this.attachments__attachment_directory_id);
				}
				return entity;
			},

		},
	},


	repository: {
	    "type": "onebuild",
	    "isRemotePhantomMode": false,
	    "isAutoLoad": false
	},

};

export default Attachments;
