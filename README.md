# nuxt-lazy-load
| npm install nuxt-lazy-load | yarn add nuxt-lazy-load |
|--|--|

## 👉 Description
You don't need to bother with extra attributes on elements (like **data-src**), just add the **module** in **nuxt.config.js** and that's it 😊

## 🚀 Usage
```javascript
// nuxt.config.js
modules: [
  'nuxt-lazy-load'
]
// or
modules: [
  ['nuxt-lazy-load', {
    directiveOnly: false
  }]
]
```

#### directiveOnly
If you don't want to use lazy load on every image/video/audio, set **directiveOnly** to **true** and use directive like this (with data-src/data-srcset/data-poster)
```html
<img data-src="image.png" alt="" title="" v-lazy-load>
```
You don't need to add directive (**v-lazy-load**) on source elements
```html
<video data-poster="~/assets/images/poster.jpg" v-lazy-load>
  <source data-src="video.mp4" type="video/mp4"> --> without directive
</video>
```

#### data-no-lazy
If you don't want to lazy load single element, just add **data-no-lazy** attribute
```html
<audio controls="controls" data-no-lazy>
  <source type="audio/mpeg" src="audio.mp3">
</audio>
```

#### dynamic content
If your content (**html**) is changing **dynamically** and you use **v-html** you can do it like this:
```html
// instead of using v-html="yourHTML" use v-lazy-load="yourHTML"
<div v-lazy-load="yourHTML"></div>
```

## 🔧 Options
```javascript
modules: [
  ['nuxt-lazy-load', {
    // This are default values
    images: true,
    videos: true,
    audios: true,
    directiveOnly: false,
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',
    observerConfig: {
      rootMargin: '50px 0px 50px 0px',
      threshold: 0
      // See IntersectionObserver documentation
    }
  }]
]
```