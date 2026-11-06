import {carIllustrations} from './illustrations/catalog.js';

export function illustratedVehicle(car,appearance,escape){
  const asset=appearance.stage===3?carIllustrations[appearance.profileId]:null;
  if(!asset)return null;
  const name=[car.make,car.model,car.year].filter(Boolean).join(' ');
  const label=escape(`Ilustración animada de ${name}`);
  return `<svg class="vehicle-illustration illustrated-car" data-renderer="illustrated" data-artwork="model" data-body="${appearance.body}" data-profile="${appearance.profileId}" data-stage="${appearance.stage}" viewBox="${asset.viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
    <g class="illustration-paint"><image href="${asset.file}" width="${asset.width}" height="${asset.height}" preserveAspectRatio="xMidYMid meet"/></g>
    <g class="car-tracing illustration-tracing" fill="none" stroke="#cfe0bc" stroke-linecap="round" stroke-linejoin="round">
      <path class="car-draw-line illustration-outline" pathLength="1" d="${asset.outline}"/>
      ${asset.details.map((detail,index)=>`<path class="car-draw-line car-draw-detail illustration-detail" style="--line-delay:${Math.min(index,6)*.055}s" pathLength="1" d="${detail}"/>`).join('')}
    </g>
  </svg>`;
}

export function prepareIllustrations(root=document){
  root.querySelectorAll('svg[data-renderer="illustrated"]').forEach(svg=>{
    if(svg.dataset.imageBound)return;
    svg.dataset.imageBound='true';
    const probe=new Image();
    probe.onload=()=>svg.classList.add('is-ready');
    probe.onerror=()=>svg.classList.add('illustration-unavailable');
    probe.src=svg.querySelector('image').getAttribute('href');
    if(probe.complete&&probe.naturalWidth)svg.classList.add('is-ready');
  });
}
