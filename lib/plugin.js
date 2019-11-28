import Vue from 'vue';
require('intersection-observer');

let options = <%= serialize(options) %>;
let observer = null;
let attributes = ['src', 'poster', 'srcset'];
let elementsMap = {
  img: 'images',
  video: 'videos',
  picture: 'images',
  audio: 'audios',
  iframe: 'iframes'
}

const setAttributes = (el) =>{
  if(el.tagName.toLocaleLowerCase() !== 'svg'){
    let media = el.children && el.children.length > 0 ? [...el.children, el] : [el];
    media.forEach(el =>{
      for(let attribute of attributes){
        if(el.dataset[attribute]){
          el[attribute] = el.dataset[attribute];
          el.removeAttribute(`data-${attribute}`);
        }
        if(['video', 'audio'].includes(el.tagName.toLocaleLowerCase())) el.load();
      }
    })
  }
}

if(process.browser){
  observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        setAttributes(entry.target);
        if(options.loadedClass !== false){
          if(entry.target.tagName.toLocaleLowerCase() === 'img'){
            entry.target.addEventListener('load', () =>{
              entry.target.classList.add(options.loadedClass)
            });
          } else entry.target.classList.add(options.loadedClass)
        };
        self.unobserve(entry.target)
      }
    })
  }, options.observerConfig);
}

const vLazyLoad = Vue.directive('lazy-load', {
  inserted(el, {value, def}) {
    def.set(el, value)
  },

  update(el, {value, def}) {
    def.set(el, value)
  },

  set(el, value) {
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
        
        if(options[elementsMap[element.tagName.toLowerCase()]] !== true || (element.dataset.notLazy !== undefined || element.dataset.noLazy !== undefined)){
          setAttributes(element);
        } else {
          if(options.appendClass !== false) element.classList.add(options.appendClass);
          observer.observe(element)
        }
      }
    }
  }
});

Vue.use(vLazyLoad);

// IE Polyfill
if (!Array.from) {
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