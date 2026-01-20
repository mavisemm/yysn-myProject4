var path = require('path');
var host = 'http://122.224.196.178:8003/';

export default {
    entry: 'src/index.js',
    html: {
        template: './public/index.ejs',
    },
    proxy: {
        '/jiepai': {
            target: `${host}`, //测试
            changeOrigin: true,
        },
        '/shanggang': {
            target: `${host}`, //测试
            changeOrigin: true,
        },
        '/hardware/device': {
            target: `${host}`,
            changeOrigin: true,
        },
        '/taicang/hardware': {
            target: `${host}`,
            changeOrigin: true,
        },
        '/cloudFile': {
            target: `${host}`,
            changeOrigin: true,
        },
        '/cas': {
            target: `${host}`,
            changeOrigin: true,
        },
        '/cloud': {
            target: `${host}`,
            changeOrigin: true,
        },
    },
    extraBabelPlugins: [
        ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: 'css' }, 'antd'],
        ['import', { libraryName: 'vtx-ui', camel2DashComponentName: false }, 'vtx-ui'],
        [
            'import',
            { libraryName: 'lodash', libraryDirectory: '', camel2DashComponentName: false },
            'lodash',
        ],
    ],
    hash: true,
    ignoreMomentLocale: true,
    commons: [
        {
            async: 'common',
            children: true,
            minChunks: 5,
        },
        {
            async: 'echarts',
            children: true,
            minChunks: function (module) {
                return /echarts/.test(module.context);
            },
        },
        {
            async: 'lodash',
            children: true,
            minChunks: function (module) {
                return /lodash/.test(module.context);
            },
        },
        {
            async: 'moment',
            children: true,
            minChunks: function (module) {
                return /moment/.test(module.context);
            },
        },
        {
            name: 'manifest',
            minChunks: 'Infinity',
        },
    ],
    alias: {
        history: path.dirname(require.resolve('history/package.json')),
        moment: path.dirname(require.resolve('moment/package.json')),
        '@src': path.resolve(__dirname, 'src'),
    },
    env: {
        development: {
            extraBabelPlugins: ['dva-hmr'],
        },
        production: {
            extraBabelPlugins: ['transform-remove-console'],
        },
    },
};