const path = require('path');

module.exports = function override(config, env) {
    config["resolve"] = {
        alias: {
            business: path.resolve(__dirname, 'src/business/'),
            components: path.resolve(__dirname, 'src/ui/components/'),
            metronic: path.resolve(__dirname, 'src/_metronic/'),
            actions: path.resolve(__dirname, 'src/business/actions/'),
            reducers: path.resolve(__dirname, 'src/business/reducers/'),
            sagas: path.resolve(__dirname, 'src/business/sagas/'),
            routes: path.resolve(__dirname, 'src/routes'),
            api: path.resolve(__dirname, 'src/business/api/'),
            constants: path.resolve(__dirname, 'src/constants/')

        },
        extensions: ['.js']
    }

    return config;
}