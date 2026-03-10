
async function loadAttractions(){
 const res=await fetch('data/attractions.json');
 const data=await res.json();
 const container=document.getElementById('cards');
 if(!container) return;
 container.innerHTML='';
 data.forEach(a=>{
   const card=document.createElement('div');
   card.className='card';
   card.innerHTML=`
     <img src="${a.image}" alt="${a.name}">
     <h3>${a.name}</h3>
     <p>${a.subtitle||''}</p>
     <p><strong>od ${a.price} Kč</strong></p>
     <p>${a.desc||''}</p>
     <button class="btn btn-poptat" data-attraction="${a.name}">Poptat</button>
   `;
   container.appendChild(card);
 });
}
document.addEventListener('DOMContentLoaded',loadAttractions);
