import mv3d from '../../mv3d.js';

const _option_command_list = Window_Options.prototype.makeCommandList;
Window_Options.prototype.makeCommandList = function() {
	_option_command_list.apply(this,arguments);
	
	this.addCommand("3D Options", 'mv3d-options');
};

const _option_status_text = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
	const symbol = this.commandSymbol(index);
	const value = this.getConfigValue(symbol);
	if(symbol==='mv3d-options'){ return ''; }
	return _option_status_text.apply(this,arguments);
};

Object.defineProperty(ConfigManager, 'mv3d-options', {
	get(){ return undefined; },
	set(v){ SceneManager.push(Scene_3D_Options); },
	configurable: true
});

mv3d['option-store']={}

const _config_makeData=ConfigManager.makeData;
ConfigManager.makeData = function() {
	const config = _config_makeData.apply(this,arguments);
	Object.assign(config,mv3d['option-store']);
	return config;
};
const _config_applyData=ConfigManager.applyData;
ConfigManager.applyData = function(config) {
	_config_applyData.apply(this,arguments);
	for(const key in mv3d.options){
		if(key in config){
			mv3d['option-store'][key]=config[key];
			mv3d.options[key].apply(config[key]);
		}
	}
	mv3d.updateParameters();
};

mv3d.options={
	'mv3d-renderDist':{
		name:"Render Distance",
		min:10, max:100,
		increment:5,
		wrap:false,
		apply(v){ mv3d.RENDER_DIST=v; },
		default:mv3d.RENDER_DIST,
	},
}

if(mv3d.MIPMAP_OPTION) mv3d.options['mv3d-mipmap']={
	name:"Mipmapping",
	type:'bool',
	apply(v){ mv3d.MIPMAP=v; mv3d.needReloadMap=true; },
	default:mv3d.MIPMAP,
}

class Scene_3D_Options extends Scene_Options{
	createOptionsWindow(){
		this._optionsWindow = new Window_3D_Options();
		this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
		this.addWindow(this._optionsWindow);
	}
	terminate(){
		super.terminate();
		mv3d.updateParameters();
	}
}

class Window_3D_Options extends Window_Options{
	makeCommandList(){
		for (const key in mv3d.options){
			this.addCommand(mv3d.options[key].name,key);
		}
	}
	statusText(index){
		const symbol = this.commandSymbol(index);
		const value = this.getConfigValue(symbol);
		const option = mv3d.options[symbol];
		if(option.type==='bool'){
			return this.booleanStatusText(value);
		}else if(option.values){
			return option.values[value];
		}
		return String(value);
	}
	setConfigValue(symbol, value){
		mv3d['option-store'][symbol]=value;
		const option = mv3d.options[symbol];
		if(option.apply){ option.apply(value); }
	}
	getConfigValue(symbol){
		const option = mv3d.options[symbol];
		let value = mv3d['option-store'][symbol];
		if(value==null){ value=option.default||option.min||0; }
		return value;
	}
	cursorLeft(wrap){
		this._mv3d_cursor(wrap,-1);
	}
	cursorRight(wrap){
		this._mv3d_cursor(wrap,1);
	}
	_mv3d_cursor(wrap,direction){
		const index = this.index();
		const symbol = this.commandSymbol(index);
		let value = this.getConfigValue(symbol);
		const option = mv3d.options[symbol];
		if(option.type==='bool'){
			this.changeValue(symbol, direction>0);
		}else{
			const min = option.min||0;
			const max = option.values?option.values.length-1:option.max||1;
			value += (option.increment||1)*direction;
			if(wrap&&option.wrap||wrap==='ok'){
				if(value>max){ value = min; }
				if(value<min){ value = max; }
			}else{
				value = value.clamp(min,max);
			}
			this.changeValue(symbol, value);
		}
	}
	processOk(){
		const index = this.index();
		const symbol = this.commandSymbol(index);
		let value = this.getConfigValue(symbol);
		const option = mv3d.options[symbol];
		if(option.type==='bool'){
			this.changeValue(symbol, !value);
		}else{
			this._mv3d_cursor('ok',1);
		}
	}
}