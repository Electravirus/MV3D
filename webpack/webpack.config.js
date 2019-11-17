const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const getBanner=()=>`/*:
${fs.readFileSync("src/_info.txt")}
@help
${fs.readFileSync("src/_help.txt")}

${fs.readFileSync("src/_parameters.txt")}
*/
${fs.readFileSync("src/_structs.txt")}
`;

module.exports = {
	target:'web',
	entry:'./src/index.js',
	output:{
		filename:'mv3d-babylon.js',
		path: path.resolve('../js/plugins'),
	},
	watch: true,
	watchOptions: {
		ignored: /node_modules/,
		aggregateTimeout: 100,
		//poll: 1000,
	},
	mode: 'production',
	devtool: 'source-map',
	optimization:{
		minimize: true,
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
	],

};