const path = require('path');

module.exports = function cookies (_options) {
  const defaultOptions = {
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    polyfill: true,
    directiveOnly: false,
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',
    observerConfig: {
      rootMargin: '50px 0px 50px 0px',
      threshold: 0
    }
  }

  let options = Object.assign(defaultOptions, _options);
  if(this.options.globalName) options['globalName'] = this.options.globalName;

  this.extendBuild(config => {
    const vueLoader = config.module.rules.find((loader) => loader.loader === 'vue-loader');
    vueLoader.options.transformAssetUrls['img'] = ['src', 'data-src','srcset', 'data-srcset', 'data-flickity-lazyload'];
    vueLoader.options.transformAssetUrls['video'] = ['src', 'data-src', 'poster', 'data-poster'];
    vueLoader.options.transformAssetUrls['source'] = ['src', 'data-src','srcset', 'data-srcset'];
    vueLoader.options.transformAssetUrls['audio'] = ['src', 'data-src'];
    vueLoader.options.transformAssetUrls['*'] = ['lazy-background']

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
            {search: '( )lazy-background=', replace: ' v-lazy-background lazy-background=', flags: 'g' },
            {search: '(:)lazy-background=', replace: 'v-lazy-background :lazy-background=', flags: 'g' },
          ]
        }
      })
    }
  })

  const renderLazyLoad = lazyLoad = (el) => {
    if('data-not-lazy' in el.data.attrs || 'data-no-lazy' in el.data.attrs){
      el.data.attrs.src = el.data.attrs['data-src']
      delete el.data.attrs['data-src']
      delete el.data.attrs['data-no-lazy']
      delete el.data.attrs['data-not-lazy']
    }
  }

  /* To be refactored */

  if(this.options.render && this.options.render.bundleRenderer && this.options.render.bundleRenderer.directives){
    this.options.render.bundleRenderer.directives.lazyLoad = renderLazyLoad;
  } else if(this.options.render && this.options.render.bundleRenderer && !this.options.render.bundleRenderer.directives) {
    this.options.render.bundleRenderer.directives = {
      lazyLoad: renderLazyLoad
    }
  } else if(this.options.render && !this.options.render.bundleRenderer){
    this.options.render.bundleRenderer = {
      directives: {
        lazyLoad: renderLazyLoad
      }
    }
  } else if(!this.options.render){
    this.options.render = {
      bundleRenderer: {
        directives: {
          lazyLoad: renderLazyLoad
        }
      }
    }
  }

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'v-lazy-load.js',
    options
  })
}

module.exports.meta = require('../package.json')