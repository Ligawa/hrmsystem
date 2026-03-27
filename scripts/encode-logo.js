import { writeFileSync } from 'fs';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unedp-logo-Qf0C9QElJzpN2olS4bdnPpd2HMpMQK.jpg';

const response = await fetch(LOGO_URL);
const arrayBuffer = await response.arrayBuffer();
const base64 = Buffer.from(arrayBuffer).toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;

const output = `// Auto-generated — do not edit manually\nexport const UNEDP_LOGO_BASE64 = "${dataUrl}";\n`;

writeFileSync('/vercel/share/v0-project/lib/logo-base64.ts', output);
console.log('Logo encoded successfully. Length:', dataUrl.length);
