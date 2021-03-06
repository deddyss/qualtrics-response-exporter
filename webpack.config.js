const TsconfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");
const ThreadsPlugin = require("threads-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const RemoveFilesPlugin = require("remove-files-webpack-plugin");
const { ContextReplacementPlugin } = require("webpack");

const path = require("path");

const src = path.resolve(__dirname, "src");
const dist = path.resolve(__dirname, "dist");

module.exports = {
	mode: "production",
	entry: {
		app: path.join(src, "app.ts")
	},
	output: {
		path: dist,
		filename: "[name].js"
	},
	target: "node",
	resolve: {
		extensions: [".ts", ".js"],
		plugins: [
			new TsconfigPathsWebpackPlugin()
		]
	},
	plugins: [
		new ThreadsPlugin(),
		new ContextReplacementPlugin(/app-root-path/),
		new RemoveFilesPlugin({
			before: {
				test: [
					{
						folder: dist,
						method: (absoluteItemPath) => {
							return new RegExp(/\.js$/, "m").test(absoluteItemPath);
						}
					}
				],
				log: false,
				trash: true
			}
		}),
		new SimpleProgressWebpackPlugin({
			format: "compact"
		})
	],
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: "ts-loader",
				exclude: path.resolve(__dirname, "node_modules")
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserWebpackPlugin({
				extractComments: false
			})
		]
	},
	stats: {
		colors: true,
		warnings: false,
		warningsCount: false,
		assets: true,
		modules: false,
	}
};
