import Vue from 'vue';
require('intersection-observer');

let options = <%= serialize(options) %>;
let observer = null;
let attributes = ['src', 'poster', 'srcset'];
let elementsMap = {
  img: 'images',
  video: 'videos',
  audio: 'audios',
  iframe: 'iframes',
  picture: 'images',
}

const capitalize = (s) =>{
  if(typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const setAttributes = (el, defaultImage=false) =>{
  let elementTagName = el.tagName.toLowerCase();
  if(elementTagName !== 'svg'){
    let media = el.children && el.children.length > 0 ? [...el.children, el] : [el];
    media.forEach(el =>{
      for(let attribute of attributes){
        if(el.dataset[attribute]){
          el[attribute] = defaultImage ? options.defaultImage : el.dataset[attribute];
          if(!defaultImage) el.removeAttribute(`data-${attribute}`);
        }
        if(el.load) el.load();
        if(elementTagName === 'audio' && el.getAttribute('data-lazy-controls') === 'true'){
          el.removeAttribute('controls')
          el.removeAttribute('data-lazy-controls')
        }
      }
    })
  }
}

const setBackground = (el) =>{
  el.style.backgroundImage = `url(${el.getAttribute('lazy-background')})`
  el.removeAttribute('lazy-background');
  if(options.loadedClass !== false) el.classList.add(options.loadedClass)
}

const setClasses = (el, type) =>{
  let elementTagName = el.tagName.toLowerCase();
  if(['img', 'video'].includes(elementTagName)){
    let eventName = elementTagName === 'img' ? 'load' : 'loadeddata';
    if(options.loadingClass !== false && type === 'loading'){
      el.classList.add(options.loadingClass)
      el.addEventListener(eventName, () =>{
        el.classList.remove(options.loadingClass)
      });
    } else if(options.loadedClass !== false && type === 'loaded'){
      el.addEventListener(eventName, () =>{
        el.classList.add(options.loadedClass)
      });
    }
  } else if(type === 'loaded' && options.loadedClass !== false){
    el.classList.add(options.loadedClass)
  }
}

const removeNotLazy = (el) => {
  el.removeAttribute('data-no-lazy');
  el.removeAttribute('data-not-lazy');
}

if(process.browser){
  let isWindowLoaded = false;
  let globalName = capitalize(options.globalName) || 'Nuxt';
  window[`on${globalName}Ready`](() => {isWindowLoaded = true})
  observer = new IntersectionObserver((entries, self) => {
    if(isWindowLoaded){
      entries.forEach(entry => {
        if(entry.isIntersecting){
          let el = entry.target;
          if(el.getAttribute('lazy-background')){
            setBackground(el);
          } else {
            setAttributes(el);
            setClasses(el, 'loaded')
            setClasses(el, 'loading')
            self.unobserve(el)
          }
        }
      })
    }
  }, options.observerConfig);
}

const vLazyLoad = Vue.directive('lazy-load', {
  inserted(el, {value, def}) {
    def.set(el, value)
  },

  update(el, {value, def}, vNode, oldVnode) {
    for(let attribute of attributes){
      if(oldVnode.data.attrs[`data-${attribute}`] !== vNode.data.attrs[`data-${attribute}`]){
        def.set(el, value);
        break;
      }
    }
  },

  set(el, value) {
    if(options.native === true){
      if(options.appendClass) el.classList.add(options.appendClass);
      if(['notLazy', 'noLazy'].every(d => el.dataset[d] === undefined)){
        el.setAttribute('loading', 'lazy');
        removeNotLazy(el)
        if(options.loadedClass){
          el.addEventListener('load', () =>{
            el.classList.add(options.loadedClass);
          })
        }
      }
    } else {
      if(options.defaultImage) setAttributes(el, true)
      if(process.browser){
        if(value){
          let media = [];
          value.replace(/( )src=/g, ' data-src=');
          value.replace(/( )srcset=/g, ' data-srcset=');
          value.replace(/( )poster=/g, ' data-poster=');
          el.innerHTML = value;
          
          for(let key in elementsMap){
            if(options[elementsMap[key]]) media.push(...el.querySelectorAll(key))
          }
          
          for(let element of media){
            if(options.appendClass !== false) element.classList.add(options.appendClass);
            observer.observe(element);
          }
        } else{
          let element = el.tagName.toLowerCase() === 'source' ? el.parentNode : el;
          if(options[elementsMap[element.tagName.toLowerCase()]] !== true || ['notLazy', 'noLazy'].some(d => element.dataset[d] !== undefined)){
            setAttributes(element);
            removeNotLazy(element)
          } else {
            if(element.dataset.manualLazy === undefined){
              if(options.appendClass !== false) element.classList.add(options.appendClass);
              if(element.tagName.toLowerCase() === 'audio' && !element.getAttribute('controls')){
                element.setAttribute('controls', '')
                element.setAttribute('data-lazy-controls', 'true')
              }
              observer.observe(element)
            }
          }
        }
      }
    }
  }
});

const vLazyBackground = Vue.directive('lazy-background', {
  inserted(el, {def}) {
    def.set(el)
  },
  
  update(el, {def}, vNode, oldVnode) {
    def.set(el, vNode.data.attrs['lazy-background'] !== oldVnode.data.attrs['lazy-background'])
  },

  set(el, hasBackgroundChanged=false) {
    if(process.browser){
      if(options.defaultImage) el.style.backgroundImage = `url(${options.defaultImage})`
      if(['notLazy', 'noLazy'].some(d => el.dataset[d] !== undefined)){
        setBackground(el)
      } else {
        if(el.dataset.manualLazy === undefined){
          if(options.appendClass !== false) el.classList.add(options.appendClass);
          observer.observe(el)
        }

        if(hasBackgroundChanged){
          observer.unobserve(el)
          observer.observe(el)
        }
      }
    }
  }
});

Vue.use(vLazyLoad);
Vue.use(vLazyBackground);

const lazyLoadMedia = (el) =>{
  el.removeAttribute('data-manual-lazy');
  if(options.appendClass !== false) el.classList.add(options.appendClass);
  if(el.getAttribute('lazy-background')) setBackground(el);
  else {
    setAttributes(el);
    setClasses(el, 'loading')
    setClasses(el, 'loaded')
  }
}

const lazyLoadInject = (e) =>{
  if(e.target){
    let media = e.target.querySelectorAll('[data-manual-lazy]');
    [...media].forEach(m => lazyLoadMedia(m))
  } else lazyLoadMedia(e)
}


// IE Polyfill
if (!Array.from && options.polyfill) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    
    return function from(arrayLike) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

export default (context, inject) =>{
  inject('lazyLoad', lazyLoadInject)
}