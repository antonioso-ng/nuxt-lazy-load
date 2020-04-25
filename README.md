# nuxt-lazy-load
```bash
npm i nuxt-lazy-load
```

## 👉 Description
You don't need to bother with extra attributes on elements (like **data-src**, only if you want to lazy load background-image), just add the **module** in **nuxt.config.js** and that's it 😊

### Buy me a coffee
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F31MWWL)

## 🚀 Usage
```javascript
// nuxt.config.js
modules: [
  'nuxt-lazy-load'
]
// or
modules: [
  ['nuxt-lazy-load', {
    // Your options
  }]
]
```

#### background image
**lazy-background** attribute
```html
<div lazy-background="~/assets/images/background-image.jpg">
  Content
</div>
```

#### directiveOnly
If you don't want to use lazy load on every image/video/audio/iframe, set **directiveOnly** to **true** and use directive like this (with data-src/data-srcset/data-poster)
```html
<img data-src="image.png" alt="" title="" v-lazy-load>
```
You don't need to add directive (**v-lazy-load**) on source elements
```html
<video data-poster="~/assets/images/poster.jpg" v-lazy-load>
  <source data-src="video.mp4" type="video/mp4"> --> without directive
</video>
```

#### Manual lazy-load ($lazyLoad)
**$lazyLoad** is injected, so you can use it everywhere, you just need to call it on **parent element** or **pass an element** you want to lazy load. (**example below**)

#### data-manual-lazy
If you want to load image/video/audio/iframe only on hover or some other event you can use **data-manual-lazy**
```html
<!-- 
  with markup like this (mouseenter is on parent element)
  you don't need to pass any element to function
-->
<div class="imageWrapper" @mouseenter="lazyLoadImage">
  <img src="image.png" alt="" title="" data-manual-lazy>
  <img src="second-image.png" alt="" title="" data-manual-lazy>
</div>

<!--
  but if you have something like this, then you'll need to
  call another function and to pass elements to it
-->
<div class="imageWrapper">
  <button @mouseenter="lazyLoadImage">Hover me to see the image</button>
  <img src="image.png" alt="" title="" data-manual-lazy>
</div>
```
```javascript
methods: {
  lazyLoadImage(e){
    let media = e.target.parentNode.querySelectorAll('[data-manual-lazy]');
    [...media].forEach(m => this.$lazyLoad(m))
  }
}
```

#### data-not-lazy
If you don't want to lazy load single element, just add **data-not-lazy** attribute
```html
<audio controls="controls" data-not-lazy>
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
    // These are the default values
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    polyfill: true,
    directiveOnly: false,
    
    // Default image must be in the static folder
    defaultImage: '/images/default-image.jpg',

    // To remove class set value to false
    loadingClass: 'isLoading',
    loadedClass: 'isLoaded',
    appendClass: 'lazyLoad',
    
    observerConfig: {
      // See IntersectionObserver documentation
    }
  }]
]
```