/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	//https://github.com/ckeditor/ckeditor4-releases

	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config
	config.extraPlugins = 'embed,googlemap,qrc,lineheight,tliyoutube';

	// Toolbar
	// ------------------------------

	// The toolbar groups arrangement, optimized for two toolbar rows.
	
	config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker','embed' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'others' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'about' },
		{ name: 'pbckcode' }
	];
	
	
	
	//  config.toolbar =[
	// 	['Source', '-', 'Templates','-','Maximize', 'ShowBlocks'],
	// 	['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
	// 	['Find', 'Replace', '-', 'SelectAll'],
	// 	['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'],
	// 	['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
 //        ['Link', 'Unlink', 'Anchor'],
	// 	['Image', 'Flash', 'tliyoutube', 'googlemap', 'qrc','multi_upload'], ['TextColor', 'BGColor'],
	// 	['Styles', 'Format', 'Font', 'FontSize', 'LineHeight']
	// ];
	
	//CKEDITOR.plugins.addExternal('youtube', 'plugins/youtube');
	
	config.youtube_width = '640';
	config.youtube_height = '480';
	config.youtube_responsive = true;
	config.youtube_related = true;
	config.youtube_older = false;
	config.youtube_privacy = false;
	config.youtube_autoplay = false;
	config.youtube_controls = true;
	config.youtube_disabled_fields = ['txtEmbed', 'chkAutoplay'];


	// Extra config
	// ------------------------------

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript,Flash';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';

	// Allow content rules
	config.allowedContent = true;


	// Extra plugins
	// ------------------------------

	// CKEDITOR PLUGINS LOADING
    config.extraPlugins = 'pbckcode'; // add other plugins here (comma separated)
    //config.extraPlugins = 'imageuploader';//image uploader

	// PBCKCODE CUSTOMIZATION
    config.pbckcode = {
        // An optional class to your pre tag.
        cls : '',

        // The syntax highlighter you will use in the output view
        highlighter : 'PRETTIFY',

        // An array of the available modes for you plugin.
        // The key corresponds to the string shown in the select tag.
        // The value correspond to the loaded file for ACE Editor.
        modes : [ ['HTML', 'html'], ['CSS', 'css'], ['PHP', 'php'], ['JS', 'javascript'] ],

        // The theme of the ACE Editor of the plugin.
        theme : 'textmate',

        // Tab indentation (in spaces)
        tab_size : '4',

        // the root path of ACE Editor. Useful if you want to use the plugin
        // without any Internet connection
        js : "http://cdn.jsdelivr.net//ace/1.1.4/noconflict/"
    };

};
