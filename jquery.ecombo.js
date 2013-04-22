/**
 * jQuery eCombo plugin
 * Partially Based on jQuery eComboBox - by Recep Karadas - http://www.reckdesign.de/eComboBox
 * 
 * @author  Francesco Smelzo
 * @version 1.0
 *
 * Licensed under The MIT License
 *
 * @version			1.0
 * @since			ven apr 19 12:12:24 2013
 * @author			Francesco Smelzo
 * @documentation	https://github.com/smelzo/eCombo
 * @license			http://opensource.org/licenses/mit-license.php
 *
 * Usage with default values:
 * ---------------------------------------------------------------------------------
 * $('#eCombo').eCombo();
 *
 * <select id="eCombo">
 * 	<option>Value 1</option>
 * 	<option>Value 2</option>
 * 	<option>Value 3</option>
 * 	<option>Value 4</option>
 * </select>
 *
 */

(function( $ ){
	var camelToDash = function (str) {
		return str.replace(/\W+/g, '-')
				  .replace(/([a-z\d])([A-Z])/g, '$1-$2')
					.toLowerCase();
	}
	var copyDimensions = function (srcElement,destElement,which){
		if (!which || which == 'height') 
			destElement.css('height',$(srcElement).css('height'));
		if (!which || which == 'width') 
		destElement.css('width',$(srcElement).css('width'));
	}
	
	var setTrigger = function (eventname,params) { // returns jQuery.Event
		var _ev = jQuery.Event(eventname);
		$(this).trigger(_ev,params);
		//isDefaultPrevented
		return _ev;
	}
	window.eCombo = {};
	
	window.eCombo.defaultSettings = {
		wrapperElementTag : 'span',
		wrapperElementClass : 'ecombo-wrapper',
		inputClass		  : 'ecombo-input' ,
		//--------------- use buttons
		buttons		  : true ,	
		buttonsPlacement	  : 'right', // right || left
		buttonsPresentClass		  : 'ecombo-with-button' ,
		
		//----------------------------------
		newButtonClass	  : 'btn ecombo-btn', // class of button
		newButtonHtml	  : 'Add New',
		
		//----------------------------------
		editButtonClass	:	'btn ecombo-edit',
		editButtonHtml	:	'Add',
		//----------------------------------
		dismissButtonClass	:	'btn ecombo-dismiss',
		dismissButtonHtml	:	'Cancel',
		//----------------------------------
		// States classes
		normalStateClass	: 'ecombo-state-normal' ,
		editStateClass		: 'ecombo-state-edit' ,
		//----------------------------------
		useBootstrap	  : true ,
		bootstrapIconNew	: 'icon-plus' ,
		bootstrapIconEdit	: 'icon-save' ,
		bootstrapIconDismiss	: 'icon-remove' ,
		tooltipsPlacement	: 'bottom' ,
		/**
		 * add a new <option> to <select>
		 */
		newOption		  :	true , 
		newOptionValue    :	'add-new',
		newOptionText     : 'Add New',
		newOptionClass    : 'ecombo-option-add-new',
		/**
		 * save option can be a
		 * function (value , callback)
		 * callback is a function with 1 argument
		 * callback argument (tipically response from server) can be :
		 * - plain object  {value:[String],text:[String]}
		 * - array	[String,String]
		 * - string [value]
		 */
		save : null ,
		sortingResults : 'ascending' , // ascending | descending | none
		responseParse : function (response){
			if (response['value']==undefined) 
				response['value'] = 'value';
			if (response['text']==undefined) 
				response['text'] = response['value'];
			return response;
		},
		sortBy : 'text', // 'value'|'text'
		avoidDuplicates: true ,
		duplicateMessage : 'The record exists!',
		//events
		showEdit 	: function (event,ui){} ,
		hideEdit 	: function (event,ui){}
	};
	// apply BS icon and BS tooltip
	var bootstrapIcon = function (icon,settings){
		var title = $.trim( $(this).text());
		$(this).attr('title',title);
		$(this).tooltip({placement:settings.tooltipsPlacement});
		if (icon) {
			$(this).html('<i class="' + icon + '"></i>');
		}
	}
	var init = function( options ) {
		  var settings = window.eCombo.defaultSettings;
			   
		  var generateNewOption = function (){
			  return $('<option></option>')
				  .attr('value',settings.newOptionValue)
				  .addClass(settings.newOptionClass)
				  .text(settings.newOptionText);
		  }
  
		  return this.each(function() { 
			  var selectEl = this 
				  , selectElement = $(this)
				  , wrapperElement = null
				  , inputElement = null
				  , isMultiple = selectElement.attr('multiple')?true:false
				  , methods = {};
				  
			  // OPTIONS HANDLE
			  // If options exist, lets merge them
			  // with our default settings
			  if ( options ) { 
				  $.extend( settings, options );
			  }
			  //read options also from data- attributes
			  //all camelCase options are converted in dash-mode
			  $.each(settings,function (key,value){
				  var dashedkey = camelToDash(key);
				  var dataVal =  selectElement.attr('data-' + dashedkey) || null;
				  
				  if (!dataVal) return ;
				  //boolean values
				  if(jQuery.inArray(dataVal.toLowerCase(),['true','false'])>-1){
					  dataVal = (dataVal=='true');
				  }
				  settings[key]=dataVal;
			  });
			  $(this).data("settings", settings);
			  // END OPTIONS HANDLE
			  
			  
			  var newOptionSelected = function (){ //return if is select "add new" option
				  if (!settings.newOption) return false;
				  if(arguments.length) return (arguments[0]==settings.newOptionValue); //check value
				  return (selectElement.val()==settings.newOptionValue);
			  }
   
			   
			  // add option new
			  selectElement.prepend(generateNewOption());
			  
			  // BINDINGS
			  
			  //showEdit
			  selectElement.bind('showEdit',function (event,data){
				  settings.showEdit.call(selectElement,event,data);
			  });
			  
			  //hideEdit
			  selectElement.bind('hideEdit',function (event,data){
				  settings.hideEdit.call(selectElement,event,data);
			  });
			  
			  // END BINDINGS
			  
			  // Create Wrapper Element 
			  var wrapperEl = document.createElement(settings.wrapperElementTag);
			  var wrapperElement = jQuery(wrapperEl).addClass(settings.wrapperElementClass);
			  
			  
			  
  
			  // Create Input Element
			  
			  ev = setTrigger.call(selectElement,'beforeCreateInput',ui);
  
				  inputElement = jQuery('<input type="text">')
					  .addClass(selectEl.className)
					  .addClass(settings.editStateClass)
					  .addClass(settings.inputClass)
					  .hide();
				  if (isMultiple) copyDimensions(selectElement,inputElement , 'width');
				  else copyDimensions(selectElement,inputElement);
			  // put input and select element in wrapper element
			  selectElement
				  .addClass(settings.normalStateClass)
				  .before(wrapperElement);
				  if ((settings.buttonsPlacement=='right')) {
					  wrapperElement
						  .append(inputElement)
						  .append(selectElement);
				  }
				  else {
					  wrapperElement
						  .append(selectElement)
						  .append(inputElement);
				  }
			  
			  var newButtonElement = null
				  ,	editButtonElement = null
				  ,	dismissButtonElement = null;
			  //create newButton
			  if (settings.buttons) {
				  newButtonElement = jQuery('<button></button>')
					  .addClass(settings.newButtonClass)
					  .addClass(settings.normalStateClass)
					  .html(settings.newButtonHtml);
				  //use bootstrap
					  if (settings.useBootstrap) {
						  bootstrapIcon.call(newButtonElement,settings.bootstrapIconNew,settings);
					  }
				  var insertFx = (settings.buttonsPlacement=='right') ? 'insertAfter' : 'insertBefore';
				  newButtonElement[insertFx](selectElement);
				  //dismiss Button
				  dismissButtonElement = jQuery('<button></button>')
					  .addClass(settings.dismissButtonClass)
					  .addClass(settings.editStateClass)
					  .hide()
					  .html(settings.dismissButtonHtml);
				  //use bootstrap
					  if (settings.useBootstrap) {
						  bootstrapIcon.call(dismissButtonElement,settings.bootstrapIconDismiss,settings);
					  }
				  dismissButtonElement[insertFx](newButtonElement);
				  //edit Button
				  editButtonElement = jQuery('<button></button>')
					  .addClass(settings.editButtonClass)
					  .addClass(settings.editStateClass)
					  .hide()
					  .html(settings.editButtonHtml);
				  //use bootstrap
					  if (settings.useBootstrap) {
						  bootstrapIcon.call(editButtonElement,settings.bootstrapIconEdit,settings);
					  }
				  editButtonElement[insertFx](newButtonElement);
				  wrapperElement.addClass(settings.buttonsPresentClass);
				  wrapperElement.addClass(settings.buttonsPresentClass + '-' + settings.buttonsPlacement);
			  }
			  var ui = {
				  select : selectElement
				  , input : inputElement
				  , buttons : {
					  newButton 		: newButtonElement
					  , editButton	: editButtonElement
					  , dismissButton	: dismissButtonElement
				  }
				  , wrapper : wrapperElement
			  }
			  
			  var reset = function (){
				if (settings.newOption && selectElement.children('option:first').is(':selected')) {
					selectElement.children('option:first:selected').removeAttr('selected');
					selectElement.children('option:eq(1)').attr('selected','selected');
				}
			  }
			  var valueExists = function (value){
				if (selectElement.find('option[value="' + value + '"]').length) {
					return true;
				}
				return false;
			  }
			  
			  var showEdit = function (){
				  var ev = setTrigger.call(selectElement,'showEdit',ui);
				  if (!ev.isDefaultPrevented()) {
					  wrapperElement.find('.' + settings.editStateClass).show();
					  wrapperElement.find('.' + settings.normalStateClass).hide();
					  inputElement.val("").focus();
				  }
			  }
			  var hideEdit = function (){
				  var ev = setTrigger.call(selectElement,'hideEdit',ui);
				  if (!ev.isDefaultPrevented()) {
					  wrapperElement.find('.' + settings.editStateClass).hide();
					  wrapperElement.find('.' + settings.normalStateClass).show();
					  reset();
				  }
			  }
			  var sort = function (afterSort){
				var extractValue = function (e){
					var v = $(e)[(settings.sortBy=='text'?'text':'val')]();
					return $.trim(v).toLowerCase();
				}
				var compare = function (a,b){
					var _a = extractValue(a)
						, _b = extractValue(b);
					if (_a == _b) return 0;
					else {
						if (settings.sortingResults=='ascending') 
							return (_a > _b) ? 1 : -1;
						else
							return (_a > _b) ? -1 : 1;
					}
					
				}
				var options = selectElement.find('option').toArray();
				if (settings.newOption) {
					options.shift();
				}
				options.sort(compare);

				$(options).remove().appendTo(selectElement);
				if ($.isFunction(afterSort))  afterSort();
			  }
			  var showError = function (msg){
				alert(msg);
			  }
			  var addValue = function (value , optionText){
				  if (optionText == undefined) optionText = value;
				  var option =  $('<option>').attr('value',value).text(optionText);
				  selectElement.append(option);
				  if (settings.sortingResults!='none') {
					sort(function (){
						selectElement.val(value);
					});
				  }
				  else {
					selectElement.val(value);
				  }
			  }
			  
			  var enable = function (){
				wrapperElement.find('[disabled="disabled"]').removeAttr('disabled');
			  }
			  
			  var disable = function (){
			    wrapperElement.find('input,select,button').attr('disabled','disabled');
			  }
			  
			  var save = function (value){
				var v = value, t = value;
				if (settings.avoidDuplicates && valueExists(v)) {
					showError(settings.duplicateMessage);
				}
				if (jQuery.isFunction(settings.save)) {
				  disable();
				  settings.save.call(selectElement ,value , function (response){
					  if (!response)  return ;
					  else if (jQuery.isPlainObject(response)) {
						  response = settings.responseParse(response);
						  v = response.value;
						  t = response.text;
					  }
					  else if (jQuery.isArray(response))  {
						  v = (response.length>=1)?response[0]:'';
						  t = (response.length>=2)?response[1]:v;
					  }
					  else  {
						  v=response;
						  t=response;
					  }
					  addValue(v,t);
					  enable();
					  hideEdit();
				  });					
				}
				else  {
					addValue(v,t);
					hideEdit();
				}
			  }
			  
			  methods.showEdit = function (){
				  showEdit();
			  }
			  methods.hideEdit = function (){
				  showEdit();
			  }
			  methods.addValue = function (value , caption){
				  addValue(value , caption);
			  }
			  selectElement.data('methods',methods);
			  selectElement.keydown( function(e){
				  //alert(e.keyCode);
				  if(e.keyCode >= 37 && e.keyCode <=40  || e.keyCode == 13) // arrow buttons or enter button
					  return ;
				  var new_selected = newOptionSelected();
				  if(e.keyCode == "46"){ // del-button
					  if(!new_selected){
						  $(this).children("option:selected").remove();
					  }
					  return;
				  }
			  });
			  
			  selectElement.change( function(e){
				  var new_selected = newOptionSelected();
				  if(new_selected){
					  e.preventDefault();
					  showEdit();
					  return ;
				  }
			  });
			  
			  inputElement.keyup(function(e){
				  if(e.keyCode == 27){ //ESC
					  e.preventDefault();
					  hideEdit();
					  return ;
				  }
				  else if(e.keyCode == 13){ //enter
					  if ($(this).val()) 
						  save($(this).val());
				  }
			  });
			  
			  inputElement.blur(function (e){
				  if (!$(this).val()) {
					  hideEdit();
					  return ;
				  }
			  });
			  editButtonElement.click(function (e){
				  e.preventDefault();
				  if (inputElement.val()) 
						  save(inputElement.val());
				  return ;
			  });
			  newButtonElement.click(function (e){
				  e.preventDefault();
				  showEdit();
				  return ;
			  });
			  
			  dismissButtonElement.click(function (e){
				  e.preventDefault();
				  hideEdit();
				  return ;
			  });
		  }); // END init
	};

  
  $.fn.eCombo = function( method ) {
    if ( typeof method === 'string') {
		return this.each(function (){
			var methods = $(this).data('methods');
			if (methods[method]) {
				methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
			}
		})
    }
    else if ( typeof method === 'object' || method == undefined) {
      return init.apply( this, arguments );
    }
	else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.eCombo' );
    }    
  
  };

})( jQuery );