import * as yup from 'yup'; // https://github.com/jquense/yup#string

const AttachmentDirectories = {
	
	name: 'AttachmentDirectories',
	
	model: {

		idProperty: 'attachment_directories__id',
		displayProperty: 'attachment_directories__name',
		sortProperty: 'attachment_directories__name',
		
		sorters: null,

		validator: yup.object({
			attachment_directories__name: yup.string().required(),
			attachment_directories__model: yup.string().max(50).required(),
			attachment_directories__modelid: yup.number().integer().required()
		}),
		
		properties: [
			{ name: 'attachment_directories__id', mapping: 'id', title: 'Id', type: 'int', isFilteringDisabled: true, fieldGroup: 'General', },
			{ name: 'attachment_directories__name', mapping: 'name', title: 'Name', isFilteringDisabled: true, editorType: {"type":"Input"}, fieldGroup: 'General', },
			{ name: 'attachment_directories__model', mapping: 'model', title: 'Model', isFilteringDisabled: true, editorType: {"type":"Input"}, fieldGroup: 'General', },
			{ name: 'attachment_directories__modelid', mapping: 'modelid', title: 'Modelid', type: 'int', filterType: {"type":"NumberRange"}, editorType: {"type":"Number"}, fieldGroup: 'General', }
		],

		associations: {
			hasMany: [
				'Attachments'
			],

		},

		ancillaryFilters: [],

		defaultFilters: [
			// 'attachment_directories__modelid'
		],

	},

	entity: {
		methods: {

			getAttachments: function() {
				const Attachments = this.getAssociatedRepository('Attachments');
				return Attachments.getBy((entity) => {
					return entity.attachments__attachment_directory_id === this.attachment_directories__id;
				});
			},

		},
	},


	repository: {
		type: 'tree',
		isRemotePhantomMode: false,
		isAutoLoad: true,
		isAutoSave: true,
	},

};

export default AttachmentDirectories;
