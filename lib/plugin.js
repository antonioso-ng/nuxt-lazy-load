import Vue from 'vue';
require('intersection-observer');

let options = <%= serialize(options) %>;
let observer = null;
let attributes = ['src', 'poster', 'srcset'];
let elementsMap = {
  img: 'images',
  video: 'videos',
  picture: 'images',
  audio: 'audios'
}

const setAttributes = (el) =>{
  let media = el.children.length > 0 ? [...el.children, el] : [el];
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
  inserted(el, {value}) {
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
        
        if(options[elementsMap[element.tagName.toLowerCase()]] !== true || element.dataset.noLazy !== undefined){
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