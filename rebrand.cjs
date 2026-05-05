/**
 * Rebranding script: Replaces all SVG "LUMOSINE" logos with
 * text-based "Illuminati" + ".ethiopia" branding using ethiopiaemblem.svg
 */
const fs = require('fs');

// The old SVG logo pattern (the <div class="icon-1x1 w-embed"><svg...LUMOSINE paths...</svg></div>)
// We'll replace the inner content of each .logo div
const oldLogoSvgStart = '<svg width="100%" height="100%" viewBox="0 0 112 22"';
const oldLogoSvgEnd = '</svg>';

// New logo HTML: emblem image + "Illuminati" text + ".ethiopia" below
const newLogoHtml = `<div style="display:flex;align-items:center;gap:0.4em;">
<img src="/public/assets/ethiopiaemblem.svg" alt="Emblem" style="width:1.8em;height:1.8em;">
<div style="display:flex;flex-direction:column;line-height:1.1;">
<span style="font-weight:700;font-size:1em;letter-spacing:0.06em;color:currentColor;">Illuminati</span>
<span style="font-weight:400;font-size:0.45em;letter-spacing:0.15em;color:currentColor;opacity:0.8;">.ethiopia</span>
</div>
</div>`;

function replaceLogos(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and replace all occurrences of the LUMOSINE SVG logo
  let startIdx = 0;
  let replacements = 0;
  
  while (true) {
    const svgStart = content.indexOf(oldLogoSvgStart, startIdx);
    if (svgStart === -1) break;
    
    const svgEnd = content.indexOf(oldLogoSvgEnd, svgStart);
    if (svgEnd === -1) break;
    
    const fullSvgEnd = svgEnd + oldLogoSvgEnd.length;
    const oldSvg = content.substring(svgStart, fullSvgEnd);
    
    // Only replace if this SVG contains the LUMOSINE path data (viewBox 0 0 112 22)
    if (oldSvg.includes('M1.078 3.27')) {
      content = content.substring(0, svgStart) + newLogoHtml + content.substring(fullSvgEnd);
      replacements++;
      startIdx = svgStart + newLogoHtml.length;
    } else {
      startIdx = fullSvgEnd;
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`${filePath}: ${replacements} logo(s) replaced`);
}

// Process both pages
replaceLogos('index.html');
replaceLogos('about-us/index.html');

console.log('Done!');
