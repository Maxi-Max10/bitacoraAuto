const paths = {
  arrowUpRight:'<path d="M7 17 17 7M7 7h10v10"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  link:'<path d="m10 13 4-4M8 15l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0m2 3a3 3 0 0 0 4 0l5-5a3 3 0 0 0-4-4l-2 2"/>',
  gauge:'<path d="M4.9 19a9 9 0 1 1 14.2 0M12 12l5-5"/><circle cx="12" cy="12" r="1"/>',
  history:'<path d="M3 11a9 9 0 1 1 2.4 7.1M3 4v7h7M12 7v5l3 2"/>',
  car:'<path d="m5 7 1.5-4h11L19 7l2 3v9h-3v-3H6v3H3v-9l2-3ZM5 7h14M3 12h18M6 10h1m10 0h1"/>',
  paperclip:'<path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9a2 2 0 0 1 3 3l-9 9a1 1 0 0 0 2 2l8-8"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m3 0h2m3 0h1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wrench:'<path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-6 6a3 3 0 0 1-4-4l6-6a6 6 0 0 1 8-8l-3 3Z"/>',
  oil:'<path d="M3 9h3l3-4h6v4l6 3v6H6l-3-6V9Zm7-4V3m-2 0h6M7 13h9M19 5c3 3 3 5 0 5s-3-2 0-5Z"/>',
  spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  wallet:'<path d="M20 7V4H6a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7m19 6h-5v4h5M6 7h14"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 15v5Z"/>',
  archive:'<path d="M4 7v14h16V7M2 3h20v4H2zM9 11h6m-3 0v5m-3-2 3 3 3-3"/>',
  file:'<path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h6"/>',
  shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  alert:'<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'
};
export function icon(name){
  const key=Object.hasOwn(paths,name)?name:'file';
  return `<svg class="ui-icon" data-icon-name="${key}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[key]}</svg>`;
}
export function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
