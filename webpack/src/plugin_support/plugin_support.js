
require('./options/options_main.js');
require('./movement/movement_main.js');

if(window.Imported&&Imported.YEP_SaveCore){
	const _onLoadSuccess = Scene_File.prototype.onLoadSuccess;
	Scene_File.prototype.onLoadSuccess=function(){
		_onLoadSuccess.apply(this,arguments);
		mv3d.needClearMap=true;
	}
}