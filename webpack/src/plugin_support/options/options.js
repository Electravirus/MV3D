import mv3d from '../../mv3d.js';

const _option_command_list = Window_Options.prototype.makeCommandList;
Window_Options.prototype.makeCommandList = function() {
	_option_command_list.apply(this,arguments);
	
	this.addCommand("3D Options", 'mv3d-options');
};