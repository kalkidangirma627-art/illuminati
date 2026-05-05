const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'rawHtml.js');
let html = fs.readFileSync(filePath, 'utf8');

// Replace texts
html = html.replace('From algae, light, and time — we create things that serve a purpose and then quietly disappear.', 'From the shadows of history — we guide the future with silent precision.');
html = html.replace('Living systems, soft tech', 'The New World Order');
html = html.replace('>food<', '>power<');
html = html.replace('>health<', '>influence<');
html = html.replace('>design<', '>wealth<');
html = html.replace('>world around us<', '>global control<');
html = html.replace('>Explore Systems<', '>Enter The Agency<');
html = html.replace('a biomaterial studio, working like nature. Not forging or molding — but cultivating.', 'the architects of destiny, working in the shadows. Not forging or molding — but controlling.');
html = html.replace('>more about us<', '>discover the truth<');
html = html.replace('The world doesn’t need another product', 'The world doesn’t need chaos');
html = html.replace('It needs a better way of making things', 'It needs the order of the Illuminati');
html = html.replace('we skillfully grow', 'we silently guide');
html = html.replace('a single living material — and shape it into four distinct systems. Each serves a different world, yet all share the same origin: light, water, and algae.', 'a single unified network — and shape it into absolute control. Each serves a different purpose, yet all share the same origin: knowledge, wealth, and power.');
html = html.replace('Tactile', 'Power');
html = html.replace('Edible', 'Influence');
html = html.replace('Remedy', 'Wealth');
html = html.replace('Living', 'Control');
html = html.replace('Algae have been here long before us—And they’ll be here long after', 'We have been here long before you—And we\\'ll be here long after');

// Update login button in CTA
html = html.replace(
  'Growth becomes harmony when it’s shared<span class="home-cta_span"> </span>creating a future alive with possibility</h2></div>',
  'Power becomes harmony when it’s shared<span class="home-cta_span"> </span>creating a future alive with possibility</h2>' +
  '<div class="button-hero_wrap" style="margin-top:2rem; justify-content:center; display:flex;">' +
  '<a href="/login" class="button w-inline-block">' +
  '<div class="button-text"><div class="text-label">LogIn</div></div>' +
  '<div class="button-arrow_wrapper"><div class="button-arrow"><div class="icon-1x1 w-embed"><svg width="100%" height="100%" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.770292 0.769683L9.85535 9.85474M9.85535 9.85474L9.85535 0.31543M9.85535 9.85474L0.316039 9.85474" stroke="currentColor" stroke-width="2"/></svg></div></div></div></a></div></div>'
);

// Replace URLs
html = html.replace(/https:\/\/host-resourses\.cdn\.express\/2384111_Waves_Moss_1920x1080\.mp4#t=0\.5/g, '/assets/illuminativid.mp4');
html = html.replace(/https:\/\/host-resourses\.cdn\.express\/2%20Algae-Hero\.mp4#t=0\.5/g, '/assets/illuminativid.mp4');

html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68ef6d1f597879e5ba62fc1b_freepik_edit_A-hyperrealistic-decorative-glass-texture-reminisc\.webp/g, '/assets/illuminati1.jpg');
html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68ef6ac628e91e035fb7a064_seaweed-sheet-with-sunlight-shining-through-highlighting-its-thin-texture%2010\.webp/g, '/assets/illuminati2.jpg');
html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68d10f68461d68370daab5f0_card-img3\.webp/g, '/assets/illuminati3.jpg');
html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68d10f9aa8c48a661252882a_card-img4\.webp/g, '/assets/illuminati4.jpg');
html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68d7c3e964c36ce4b5d63577_faq-img-p-\d+\.webp/g, '/assets/illuminati5.jpg');
html = html.replace(/https:\/\/cdn\.prod\.website-files\.com\/68c276a7cb47ae57b08b33d1\/68d7c3e964c36ce4b5d63577_faq-img\.webp/g, '/assets/illuminati5.jpg');

fs.writeFileSync(filePath, html, 'utf8');
console.log('rawHtml.js updated successfully!');
