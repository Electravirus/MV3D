const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const yazl = require('yazl');
const glob = require('glob');

const sound=(()=>{const player=require('play-sound')({});return sound=>{
	const cp=player.play(sound,err=>{});
	if(!cp){ return; }
	setTimeout(()=>cp.kill(),1000);
}})();


const getBanner=()=>`/*:
${fs.readFileSync("src/_info.txt")}
@help
${fs.readFileSync("src/_help.txt")}

${fs.readFileSync("_patrons.txt")}

${fs.readFileSync("src/_parameters.txt")}
*/
${fs.readFileSync("src/_structs.txt")}
`;

const getReadme=()=>`
${fs.readFileSync("src/_readme_header.txt")}

${fs.readFileSync("src/_help.txt")}

${fs.readFileSync("_patrons.txt")}
`;

module.exports = {
	target:'node-webkit',
	entry:'./src/index.js',
	output:{
		filename:'mv3d.js',
		path: path.resolve('../project/js/plugins'),
	},
	watch: true,
	watchOptions: {
		ignored: /node_modules/,
		//aggregateTimeout: 100,
		//poll: 1000,
	},
	mode: 'production',
	devtool: 'source-map',
	optimization:{
		minimize: false,
		minimizer: [
			new TerserPlugin({
				sourceMap: true,
				terserOptions:{
					mangle:true,
					keep_classnames:true,
					output:{
						comments:/^[!:~]/,
					}
				}
			}),
		],
	},

	plugins:[
		new webpack.BannerPlugin({
			raw: true,
			banner: getBanner,
		}),
		{apply:compiler=>compiler.hooks.done.tap('myDonePlugin',stats=>{
			if(stats.compilation.errors.length){
				sound('../project/audio/se/Buzzer1.ogg');
				return;
			}
			fs.writeFile('../README.md',getReadme(),err=>{
				if(err){ console.error("Couldn't write README.md!"); }
				else{ console.log("Created README.md"); }
			});

			const mv3d_files = glob.sync("../project/img/MV3D/**/!(_ignore_)*",{nodir:true});
			const zipfile = new yazl.ZipFile();
			//zipfile.addFile('../project/js/plugins/babylon.js','js/plugins/babylon.js');
			zipfile.addFile('../project/js/plugins/mv3d.js','js/plugins/mv3d.js');
			for (const file of mv3d_files){
				zipfile.addFile(file,path.relative('../project',file));
			}
			zipfile.outputStream.pipe(fs.createWriteStream('../plugin.zip')).on('close',()=>{
				console.log(`Created plugin.zip`);
			});
			zipfile.end();
			sound('../project/audio/se/Computer.ogg');
		})},
	],

};