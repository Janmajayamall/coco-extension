process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.env.PORT = 3000;

var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var config = require("../webpack.config");
var path = require("path");

for (var entryName in config.entry) {
	config.entry[entryName] = [
		"webpack/hot/dev-server",
		`webpack-dev-server/client?hot=true&hostname=localhost&port=${process.env.PORT}`,
	].concat(config.entry[entryName]);
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
	config.plugins || []
);

delete config.chromeExtensionBoilerplate;

var compiler = webpack(config);

var server = new WebpackDevServer(
	{
		https: false,
		hot: false,
		client: false,
		host: "localhost",
		port: process.env.PORT,
		static: {
			directory: path.join(__dirname, "../build"),
		},
		devMiddleware: {
			publicPath: `http://localhost:${process.env.PORT}/`,
			writeToDisk: true,
		},
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		allowedHosts: "all",
	},
	compiler
);

if (process.env.NODE_ENV === "development" && module.hot) {
	module.hot.accept();
}

(async () => {
	await server.start();
})();
