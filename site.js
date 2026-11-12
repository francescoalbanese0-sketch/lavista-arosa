
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
      ['name','tel','email','date','time','pers','msg'].forEach(function(k){v[k]=(f.elements[k].value||'').trim()});
      if(!v.name||!v.tel||!v.date||!v.time||!v.pers){err.textContent=de?'Bitte alle Pflichtfelder (*) ausfüllen.':'Please fill in all required fields (*).';return;}
      if(f.elements.botcheck.checked)return;
      var dp=v.date.split('-'), dd=dp[2]+'.'+dp[1]+'.'+dp[0];
      var btn=f.querySelector('button[type=submit]'), ok=document.getElementById('fok');
      btn.disabled=true; btn.textContent=de?'Wird gesendet …':'Sending …';
      var data={access_key:'5dcf53aa-2a64-4e49-bb9b-bfc24edb881e',
        subject:'Reservation '+dd+' '+v.time+' – '+v.pers+' Pers. – '+v.name,
        from_name:'La Vista Website',
        Name:v.name, Telefon:v.tel, Datum:dd, Uhrzeit:v.time, Personen:v.pers,
        Bemerkung:v.msg||'-', Sprache:de?'Deutsch':'English'};
      if(v.email){data.email=v.email; data.replyto=v.email;}
      fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json()})
        .then(function(j){
          if(!j.success)throw 0;
          f.style.display='none'; ok.style.display='block';
          ok.querySelector('.dd').textContent=dd+' · '+v.time+' · '+v.pers+(de?' Personen':' guests');
        })
        .catch(function(){
          btn.disabled=false; btn.textContent=de?'Anfrage senden':'Send request';
          err.textContent=de?'Senden nicht möglich. Bitte rufen Sie uns an: +41 77 940 52 08':'Could not send. Please call us: +41 77 940 52 08';
        });
    });
  }
})();
