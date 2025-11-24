var webpack = require('webpack');
var CSSSplitWebpackPlugin = require('css-split-webpack-plugin/dist/index').default;
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function(webpackConfig) {
    // adding plugins to your configuration
    // css文件分割（For IE）
    webpackConfig.plugins.push(
        new CSSSplitWebpackPlugin({
            size: 3000,
        }),
    );

    webpackConfig.module.rules.forEach(rule => {
        // 1. 先排除无 test 属性的规则，避免 undefined 错误
        if (!rule.test) return;

        // 2. 处理 rule.test 为正则的情况（Webpack 规则中 test 常用正则）
        const isCssRule = 
            (rule.test instanceof RegExp && rule.test.test('.css')) || 
            (rule.test instanceof RegExp && rule.test.test('.less'));

        // 3. 只对 CSS/LESS 规则修改 css-loader 配置
        if (isCssRule) {
            rule.use.forEach(loader => {
                if (loader.loader === 'css-loader') {
                    loader.options = {
                        ...loader.options,
                        modules: {
                            localIdentName: process.env.NODE_ENV === 'production' 
                                ? '[local]__[hash:6]' 
                                : '[path][name]__[local]__[hash:6]',
                        },
                    };
                }
            });
        }
    });


    if (process.env.NODE_ENV == 'production') {
        // 代码压缩
        webpackConfig.plugins = webpackConfig.plugins.filter(function(plugin) {
            return !(plugin instanceof webpack.optimize.UglifyJsPlugin);
        });
        webpackConfig.plugins.push(
            new ParallelUglifyPlugin({
                uglifyJS: {
                    output: {
                        comments: false,
                        ascii_only: true,
                    },
                    warnings: false,
                },
                cacheDir: './.cache',
            }),
        );

        // 打包分析工具
        // webpackConfig.plugins.push(new BundleAnalyzerPlugin());
    }

    return webpackConfig;
};
