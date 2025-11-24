module.exports = {
    extends: ['@vtx/vortex', 'plugin:react/recommended'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    globals: {
        OPERATE_INFO: true,
    },
    rules: {
        'react/prop-types': 'off',
    },
};
