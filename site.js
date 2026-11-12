
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
  var f=document.getElementById('rform');
  if(f){
    var d=f.elements.date, today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
    d.min=today.toISOString().slice(0,10);
    var err=document.getElementById('ferr');
    f.addEventListener('input',function(){err.textContent=''});
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      var de=root.getAttribute('data-lang')==='de', v={};
      ['name','tel','date','time','pers','msg'].forEach(function(k){v[k]=(f.elements[k].value||'').trim()});
      if(!v.name||!v.tel||!v.date||!v.time||!v.pers){err.textContent=de?'Bitte alle Pflichtfelder (*) ausfüllen.':'Please fill in all required fields (*).';return;}
      var dp=v.date.split('-'), dd=dp[2]+'.'+dp[1]+'.'+dp[0];
      var subj=(de?'Reservation ':'Reservation ')+dd+' '+v.time+' – '+v.pers+(de?' Personen':' guests');
      var body=(de?'Guten Tag\n\nIch möchte gerne einen Tisch reservieren:\n\n':'Hello\n\nI would like to book a table:\n\n')+
        (de?'Name: ':'Name: ')+v.name+'\n'+(de?'Telefon: ':'Phone: ')+v.tel+'\n'+(de?'Datum: ':'Date: ')+dd+'\n'+(de?'Uhrzeit: ':'Time: ')+v.time+'\n'+(de?'Personen: ':'Guests: ')+v.pers+'\n'+
        (v.msg?((de?'Bemerkung: ':'Message: ')+v.msg+'\n'):'')+(de?'\nVielen Dank!':'\nThank you!');
      location.href='mailto:info@lavista-arosa.ch?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
    });
  }
})();
