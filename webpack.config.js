var webpack = require("webpack");
var path = require("path");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var TerserPlugin = require("terser-webpack-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");

const ASSET_PATH = process.env.ASSET_PATH || "/";

var alias = {
	"react-dom": "@hot-loader/react-dom",
};

var fileExtensions = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"eot",
	"otf",
	"svg",
	"ttf",
	"woff",
	"woff2",
];

var options = {
	mode: process.env.NODE_ENV || "development",
	entry: {
		options: path.join(
			__dirname,
			"src",
			"components",
			"options",
			"index.jsx"
		),
		popup: path.join(__dirname, "src", "components", "popup", "index.jsx"),
		background: path.join(
			__dirname,
			"src",
			"components",
			"background",
			"index.js"
		),
		content: path.join(
			__dirname,
			"src",
			"components",
			"content",
			"index.js"
		),
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "build"),
		clean: true,
		publicPath: ASSET_PATH,
	},
	hmrIgnore: ["background", "content"],
	module: {
		rules: [
			{
				// look for .css or .scss files
				test: /\.(css|scss)$/,
				// in the `src` directory
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
				type: "asset/resource",
				exclude: /node_modules/,
			},
			{
				test: /\.html$/,
				loader: "html-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: "source-map-loader",
					},
					{
						loader: "babel-loader",
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		alias: alias,
		extensions: fileExtensions
			.map((extension) => "." + extension)
			.concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
	},
	plugins: [
		new CleanWebpackPlugin({ verbose: false }),
		new webpack.ProgressPlugin(),
		// expose and write the allowed env vars on the compiled bundle
		new webpack.EnvironmentPlugin(["NODE_ENV"]),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/manifest.json",
					to: path.join(__dirname, "build"),
					force: true,
					transform: function (content, path) {
						// generates the manifest file using the package.json informations
						return Buffer.from(
							JSON.stringify({
								description:
									process.env.npm_package_description,
								version: process.env.npm_package_version,
								...JSON.parse(content.toString()),
							})
						);
					},
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/assets/icon128.png",
					to: path.join(__dirname, "build"),
					force: true,
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/assets/icon48.png",
					to: path.join(__dirname, "build"),
					force: true,
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/assets/icon16.png",
					to: path.join(__dirname, "build"),
					force: true,
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/components/content/content-style.css",
					to: path.join(__dirname, "build"),
					force: true,
				},
			],
		}),
		new HtmlWebpackPlugin({
			template: path.join(
				__dirname,
				"src",
				"components",
				"options",
				"index.html"
			),
			filename: "options.html",
			chunks: ["options"],
			cache: false,
		}),
		new HtmlWebpackPlugin({
			template: path.join(
				__dirname,
				"src",
				"components",
				"popup",
				"index.html"
			),
			filename: "popup.html",
			chunks: ["popup"],
			cache: false,
		}),
	],
	infrastructureLogging: {
		level: "info",
	},
};

if (process.env.NODE_ENV === "development") {
	options.devtool = "cheap-module-source-map";
} else {
	options.optimization = {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	};
}

module.exports = options;
