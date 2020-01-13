const os = require('os');

/**
 * The EasyPass project has two entry points — one for the main app, one for the worker.
 * This means every entry creates an individual precache for the service-worker.
 * The problem is, the workbox plugin always overwrites the service-worker file and
 * the plugin is being executed two times because of the two entry points.
 * That means, one precache will always be missing. To fix this, the precache import
 * of the worker entry is manually added to the service-worker file at the top.
 */
class CombineWorkboxPrecachesPlugin {

    constructor(mode, fileName) {
        this.mode = mode;
        if (fileName === null) {
            this.fileName = 'service-worker.js';
        } else this.fileName = fileName;
    }

    static amount = undefined;

    static counter = 0;

    static flag = false;

    static cache = [];

    static precaches = "";

    static addPrecache(precache) {
        this.precaches += precache + os.EOL;
    }

    static timeout = 2000;

    pluginName = "[combine-workbox-precaches-plugin] ";

    apply(compiler) {
        compiler.hooks.emit.tapAsync('WorkboxSavePrecachePlugin', async (compilation, callback) => {
            if (CombineWorkboxPrecachesPlugin.amount === undefined) {
                throw this.pluginName + "You need to set the amount of precaches of the WorkboxCombinePrecachesPlugin " +
                "through `WorkboxCombinePrecachesPlugin.amount = your_amount` before using the plugin.";
            }
            else if (this.mode === 'save') {
                if (CombineWorkboxPrecachesPlugin.counter >= CombineWorkboxPrecachesPlugin.amount) {
                    throw this.pluginName + "When calling the WorkboxCombinePrecachesPlugin on the last precache you " +
                    "need to use the mode `combine`";
                } else {
                    const content = compilation.assets[this.fileName].source();
                    const precacheImport = content.substring(0, content.search(';')+1);
                    CombineWorkboxPrecachesPlugin.cache.push(precacheImport);
                    delete compilation.assets[this.fileName];
                    CombineWorkboxPrecachesPlugin.counter++;
                    if (CombineWorkboxPrecachesPlugin.counter + 1 === CombineWorkboxPrecachesPlugin.amount) {
                        CombineWorkboxPrecachesPlugin.flag = true;
                    }
                    callback();
                }
            } else if (this.mode === 'combine') {
                if (CombineWorkboxPrecachesPlugin.flag === false) {
                    await this.wait();
                }
                if (CombineWorkboxPrecachesPlugin.counter + 1 === CombineWorkboxPrecachesPlugin.amount) {
                    CombineWorkboxPrecachesPlugin.cache.forEach(item =>
                        CombineWorkboxPrecachesPlugin.addPrecache(item));

                    const serviceWorker = CombineWorkboxPrecachesPlugin.precaches +
                        compilation.assets[this.fileName].source();

                    compilation.assets[this.fileName] = {
                        source: function() {
                            return serviceWorker;
                        },
                        size: function() {
                            return serviceWorker.length;
                        }
                    };

                    callback();

                } else {
                    throw this.pluginName + "Expected more precaches."
                }
            } else {
                throw this.pluginName + 'Unknown mode: ' + this.mode;
            }
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async wait() {
        console.log(this.pluginName + "Waiting for precaches...");
        let i = 0;
        while(!CombineWorkboxPrecachesPlugin.flag) {
            if (i > CombineWorkboxPrecachesPlugin.timeout) {
                throw this.pluginName + "Combining precaches extended timeout"
            }
            await this.sleep(100);
            i += 100;
        }
    }

}

module.exports = CombineWorkboxPrecachesPlugin;