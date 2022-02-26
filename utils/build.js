process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

var webpack = require("webpack");
var config = require("../webpack.config");

delete config.hmrIgnore;

config.mode = "production";

webpack(config, function (err) {
	if (err) throw err;
});
