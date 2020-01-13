<div  align="center">
  <h1>
      combine-workbox-precaches-plugin
  </h1>
   <p>
       Combines precaches of multiple entry points of Workbox into one service worker.
   </p>
</div>

## Why?

If you have an app with multiple Webpack entry points for like a Web-App and a Web-Worker, then the Workbox-Plugin with `InjectManifest` will always override its generated Service-Worker files from other entry points which results in missing precache import statements.  This plugin captures all precache import statements and inserts them into the generated Service-Worker file.

## Usage

1. Load plugin

   ```js
   const CombineWorkboxPrecachesPlugin = require('combine-workbox-precaches-plugin');
   ```

2. Set amount of entry points / precaches

   ```js
   CombineWorkboxPrecachesPlugin.amount = 2;
   ```

3. For every Webpack entry besides the final one, load the Workbox-Plugin and afterwards use this plugin with the `save` option and the filename of the generated file by the Workbox-Plugin.    

   > Note: Use `tmp1.txt` or similar filenames for precaches besides the final one.

   ```js
   new WorkboxPlugin.InjectManifest({
           swSrc: './src/service-worker/service-worker.js',
           swDest: 'tmp1.txt',
           include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/, /\.json$/]
         }),
   new CombineWorkboxPrecachesPlugin('save', 'tmp1.txt'),
   ```

4. On the final entry use this plugin with the option combine

   > Note: If you use `null` for the filename, `service-worker.js` will be used as default.

   ```js
   new WorkboxPlugin.InjectManifest({
           swSrc: './src/service-worker/service-worker.js',
           include: [/\.wasm$/, /\.html$/, /\.js$/, /\.ico$/, /\.png$/, /\.jpeg$/, /\.json$/]
         }),
   new CombineWorkboxPrecachesPlugin('combine', null),
   ```

   

## Disclaimer

> This is an unofficial plugin for Workbox. The plugin is not affiliated with the Workbox team or Google.

## License

MIT

---

> GitHub [kurbaniec](https://github.com/kurbaniec-tgm) &nbsp;&middot;&nbsp;
> Mail [at.kacper.urbaniec@gmail.com](mailto:at.kacper.urbaniec@gmail.com)