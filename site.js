
(function(){
  var KEY='lv-lang', root=document.documentElement, l;
  try{l=localStorage.getItem(KEY)}catch(e){}
  if(!l){l=(navigator.language||'de').toLowerCase().indexOf('de')===0?'de':'en'}
  function set(x){root.setAttribute('data-lang',x);root.lang=x;
    document.querySelectorAll('.lang button').forEach(function(b){b.classList.toggle('on',b.dataset.l===x)});
    try{localStorage.setItem(KEY,x)}catch(e){}}
  set(l);
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.l)})});
  var tabs=document.querySelectorAll('.tabs button');
  function show(id){document.querySelectorAll('.panel').forEach(function(p){p.classList.toggle('on',p.id===id)});
    tabs.forEach(function(b){b.classList.toggle('on',b.dataset.p===id)});}
  tabs.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.p);history.replaceState(null,'','#'+(b.dataset.p==='wein'?'weinkarte':'speisekarte'));window.scrollTo({top:0})})});
  if(tabs.length){show(/wein/.test(location.hash)?'wein':'speise')}
})();
