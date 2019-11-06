const path = require('path');

module.exports = function cookies (_options) {
  const defaultOptions = {
    images: true,
    videos: true,
    audios: true,
    directiveOnly: false,
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',
    observerConfig: {
      rootMargin: '50px 0px 50px 0px',
      threshold: 0
    }
  }

  let options = Object.assign(defaultOptions, _options);

  this.extendBuild((config) => {
    const vueLoader = config.module.rules.find((loader) => loader.loader === 'vue-loader');
    vueLoader.options.transformAssetUrls['img'] = ['src', 'data-src','srcset', 'data-srcset'];
    vueLoader.options.transformAssetUrls['video'] = ['src', 'data-src', 'poster', 'data-poster'];
    vueLoader.options.transformAssetUrls['source'] = ['src', 'data-src','srcset', 'data-srcset'];
    vueLoader.options.transformAssetUrls['audio'] = ['src', 'data-src'];

    if(!options.directiveOnly){
      config.module.rules.push({
        test: /\.vue$/,
        loader: 'string-replace-loader',
        exclude: /node_modules/,
        options: {
          multiple: [
            {search: '( )src=', replace: ' v-lazy-load data-src=', flags: 'g' },
            {search: '(:)src=', replace: 'v-lazy-load :data-src=', flags: 'g' },
            {search: '( )srcset=', replace: ' v-lazy-load data-srcset=', flags: 'g' },
            {search: '(:)srcset=', replace: 'v-lazy-load :data-srcset=', flags: 'g' },
            {search: '( )poster=', replace: ' v-lazy-load data-poster=', flags: 'g' },
            {search: '(:)poster=', replace: 'v-lazy-load :data-poster=', flags: 'g' },
          ]
        }
      })
    }
  })

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'v-lazy-load.js',
    options
  })
}

module.exports.meta = require('../package.json')