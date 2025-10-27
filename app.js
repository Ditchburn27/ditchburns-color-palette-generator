// Palette Data
const seabornPalettes = {
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde724'],
  magma: ['#000004', '#180f3d', '#451077', '#721f81', '#9f2f7f', '#cd4071', '#f1605d', '#fd9668', '#fec287', '#fcfdbf'],
  plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
  inferno: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'],
  cividis: ['#00224e', '#123570', '#3b496c', '#575d6d', '#707173', '#8a8678', '#a49b77', '#c1b176', '#e1c87b', '#fee838'],
  rocket: ['#03051a', '#1c1044', '#46146f', '#7b1a8e', '#b0309a', '#dc5089', '#f57c6f', '#fdac5e', '#f9df71', '#f6ffa6'],
  mako: ['#0b0405', '#2c1e3d', '#40356b', '#4f4d90', '#5a66aa', '#6a80be', '#869dca', '#aabbd2', '#cfdadc', '#f2f9f7'],
  turbo: ['#30123b', '#4662d7', '#36a9e1', '#13c75f', '#8dd93b', '#f7e622', '#ea5d29', '#cb2a4c', '#7a0403']
};

const ggsciPalettes = {
  npg: ['#E64B35', '#4DBBD5', '#00A087', '#3C5488', '#F39B7F', '#8491B4', '#91D1C2', '#DC0000', '#7E6148', '#B09C85'],
  aaas: ['#3B4992', '#EE0000', '#008B45', '#631879', '#008280', '#BB0021', '#5F559B', '#A20056', '#808180', '#1B1919'],
  nejm: ['#BC3C29', '#0072B5', '#E18727', '#20854E', '#7876B1', '#6F99AD', '#FFDC91', '#EE4C97'],
  lancet: ['#00468B', '#ED0000', '#42B540', '#0099B4', '#925E9F', '#FDAF91', '#AD002A', '#ADB6B6', '#1B1919'],
  jama: ['#374E55', '#DF8F44', '#00A1D5', '#B24745', '#79AF97', '#6A6599', '#80796B'],
  jco: ['#0073C2', '#EFC000', '#868686', '#CD534C', '#7AA6DC', '#003C67', '#8F7700', '#3B3B3B', '#A73030', '#4A6990'],
  d3: ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'],
  locuszoom: ['#D43F3A', '#357EBD', '#46B8DA', '#5CB85C', '#EEA236', '#9632B8', '#FF00FF'],
  igv: ['#5050FF', '#CE3D32', '#749B58', '#F0E685', '#466983', '#BA6338', '#5DB1DD', '#802268', '#6BD76B', '#D595A7'],
  cosmic: ['#BC80BD', '#FB8072', '#B3DE69', '#FFED6F', '#FDB462', '#FCCDE5', '#8DD3C7', '#CCEBC5', '#BEBADA', '#80B1D3'],
  material: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50']
};

const fruits = [
  { emoji: '🍉', name: 'watermelon' },
  { emoji: '🍌', name: 'banana' },
  { emoji: '🍎', name: 'apple' },
  { emoji: '🍓', name: 'strawberry' },
  { emoji: '🍍', name: 'pineapple' },
  { emoji: '🍊', name: 'orange' },
  { emoji: '🥝', name: 'kiwi' },
  { emoji: '🍑', name: 'peach' }
];

// State
let currentPalette = [];
let lockedColors = [];
let colorCollection = [];
let savedPalettes = [];
let currentFruit = 0;
let nextFruit = 1;
let animationState = 'running';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFromMemory();
  initializeControls();
  generatePalette();
  initializeAnimation();
  updateCollectionDisplay();
  updateSavedPalettesDisplay();
});

function loadFromMemory() {
  // Using in-memory storage only - no localStorage
  colorCollection = [];
  savedPalettes = [];
}

function initializeControls() {
  // Populate preset palettes
  const presetSelect = document.getElementById('presetPalette');
  
  // Source change handler
  document.getElementById('paletteSource').addEventListener('change', (e) => {
    const source = e.target.value;
    document.getElementById('theoryTypeGroup').classList.toggle('hidden', source !== 'generator');
    document.getElementById('presetPaletteGroup').classList.toggle('hidden', source === 'generator');
    document.getElementById('colorStyleGroup').classList.toggle('hidden', source !== 'generator');
    
    // Populate preset options
    if (source === 'seaborn') {
      presetSelect.innerHTML = Object.keys(seabornPalettes).map(key => 
        `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
      ).join('');
    } else if (source === 'ggsci') {
      presetSelect.innerHTML = Object.keys(ggsciPalettes).map(key => 
        `<option value="${key}">${key.toUpperCase()}</option>`
      ).join('');
    }
  });
  
  // Color picker sync
  document.getElementById('colorPicker').addEventListener('input', (e) => {
    document.getElementById('baseColor').value = e.target.value;
  });
  
  document.getElementById('baseColor').addEventListener('input', (e) => {
    const color = e.target.value;
    if (color.startsWith('#')) {
      document.getElementById('colorPicker').value = color;
    }
  });
  
  // Button handlers
  document.getElementById('generateBtn').addEventListener('click', generatePalette);
  document.getElementById('saveBtn').addEventListener('click', savePalette);
  document.getElementById('exportBtn').addEventListener('click', showExportModal);
  document.getElementById('clearCollectionBtn').addEventListener('click', clearCollection);
  document.getElementById('exportCollectionBtn').addEventListener('click', showExportCollectionModal);
  
  // Export format change handlers
  document.getElementById('exportFormat').addEventListener('change', updateExportOutput);
  document.getElementById('exportCollectionFormat').addEventListener('change', updateCollectionExportOutput);
}

// Color Conversion Functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

function colorNameToHex(name) {
  const colors = {
    red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
    orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
    black: '#000000', white: '#ffffff', gray: '#808080', grey: '#808080'
  };
  return colors[name.toLowerCase()] || null;
}

// Color Style Modifiers
function applyColorStyle(baseHsl, style) {
  const styles = {
    default: { sat: [60, 80], light: [45, 65] },
    pastel: { sat: [25, 45], light: [70, 85] },
    vivid: { sat: [85, 100], light: [45, 55] },
    muted: { sat: [20, 40], light: [40, 60] },
    neutral: { sat: [5, 20], light: [40, 70] },
    warm: { hue: [0, 60], sat: [60, 80], light: [45, 65] },
    cool: { hue: [180, 270], sat: [60, 80], light: [45, 65] },
    light: { sat: [40, 60], light: [75, 90] },
    dark: { sat: [50, 70], light: [20, 35] },
    deep: { sat: [70, 90], light: [25, 40] },
    pale: { sat: [15, 35], light: [80, 95] },
    vintage: { hue: [20, 50], sat: [30, 50], light: [45, 60] },
    earthy: { hue: [15, 45], sat: [30, 50], light: [35, 55] }
  };

  if (style === 'colorblind') {
    return null; // Handled separately
  }

  const config = styles[style] || styles.default;
  let { h, s, l } = baseHsl;

  if (config.hue) {
    h = config.hue[0] + Math.random() * (config.hue[1] - config.hue[0]);
  }
  if (config.sat) {
    s = config.sat[0] + Math.random() * (config.sat[1] - config.sat[0]);
  }
  if (config.light) {
    l = config.light[0] + Math.random() * (config.light[1] - config.light[0]);
  }

  return { h, s, l };
}

// Color Generation
function generatePalette() {
  const source = document.getElementById('paletteSource').value;
  const numColors = parseInt(document.getElementById('numColors').value);
  
  if (source === 'generator') {
    const theoryType = document.getElementById('theoryType').value;
    const colorStyle = document.getElementById('colorStyle').value;
    const baseColor = document.getElementById('baseColor').value;
    currentPalette = generateTheoryPalette(theoryType, numColors, baseColor, colorStyle);
  } else if (source === 'seaborn') {
    const preset = document.getElementById('presetPalette').value;
    currentPalette = interpolateSeabornPalette(preset, numColors);
  } else if (source === 'ggsci') {
    const preset = document.getElementById('presetPalette').value;
    currentPalette = cycleGgsciPalette(preset, numColors);
  }
  
  // Preserve locked colors
  currentPalette = currentPalette.map((color, i) => lockedColors[i] || color);
  
  displayPalette();
}

function generateTheoryPalette(theory, count, baseColor, style) {
  if (style === 'colorblind') {
    const safeColors = ['#0173B2', '#DE8F05', '#029E73', '#CC78BC', '#CA9161', '#949494', '#ECE133', '#56B4E9'];
    return safeColors.slice(0, count);
  }

  let baseHue = Math.random() * 360;
  
  // Parse base color if provided
  if (baseColor) {
    let hex = baseColor.startsWith('#') ? baseColor : colorNameToHex(baseColor);
    if (hex && hexToRgb(hex)) {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      baseHue = hsl.h;
    }
  }
  
  const colors = [];
  
  switch (theory) {
    case 'random':
      for (let i = 0; i < count; i++) {
        const hsl = applyColorStyle({ h: Math.random() * 360, s: 70, l: 55 }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'qualitative':
      const goldenRatio = 0.618033988749895;
      for (let i = 0; i < count; i++) {
        const h = (baseHue + i * goldenRatio * 360) % 360;
        const hsl = applyColorStyle({ h, s: 70, l: 55 }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'complementary':
      const complement = (baseHue + 180) % 360;
      for (let i = 0; i < count; i++) {
        const h = (i % 2 === 0) ? baseHue : complement;
        const s = 50 + Math.random() * 30;
        const l = 40 + Math.random() * 40;
        const hsl = applyColorStyle({ h, s, l }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'analogous':
      for (let i = 0; i < count; i++) {
        const offset = (i - count/2) * (60 / count);  // Spread across ±30 degrees
        const h = (baseHue + offset + 360) % 360;
        const s = 60 + Math.random() * 20;
        const l = 45 + Math.random() * 20;
        const hsl = applyColorStyle({ h, s, l }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'triadic':
      const triadicHues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
      for (let i = 0; i < count; i++) {
        const h = triadicHues[i % 3];
        const s = 60 + Math.random() * 20;
        const l = 45 + Math.random() * 20;
        const hsl = applyColorStyle({ h, s, l }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'sequential':
      for (let i = 0; i < count; i++) {
        const position = i / (count - 1);
        const lightness = 90 - (65 * position);  // 90% → 25%
        const saturation = 20 + (60 * position); // 20% → 80%
        // Keep same hue throughout
        const hsl = style === 'default' ? { h: baseHue, s: saturation, l: lightness } : applyColorStyle({ h: baseHue, s: saturation, l: lightness }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'divergent':
      const midpoint = Math.floor(count / 2);
      for (let i = 0; i < count; i++) {
        const h = i < midpoint ? baseHue : (baseHue + 180) % 360;
        const dist = Math.abs(i - midpoint) / midpoint;
        const l = 90 - dist * 50;
        const hsl = applyColorStyle({ h, s: 70, l }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
      
    case 'monochromatic':
      for (let i = 0; i < count; i++) {
        const position = i / (count - 1);
        const saturation = 20 + (60 * Math.sin(position * Math.PI));
        const lightness = 20 + (70 * position);  // 20% → 90%
        // Keep same hue throughout
        const hsl = style === 'default' ? { h: baseHue, s: saturation, l: lightness } : applyColorStyle({ h: baseHue, s: saturation, l: lightness }, style);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
  }
  
  return colors;
}

function interpolateSeabornPalette(preset, count) {
  const basePalette = seabornPalettes[preset];
  if (!basePalette) return [];
  
  if (count <= basePalette.length) {
    return basePalette.slice(0, count);
  }
  
  // Interpolate for larger sizes
  const result = [];
  for (let i = 0; i < count; i++) {
    const pos = (i / (count - 1)) * (basePalette.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    
    if (idx >= basePalette.length - 1) {
      result.push(basePalette[basePalette.length - 1]);
    } else {
      const color1 = hexToRgb(basePalette[idx]);
      const color2 = hexToRgb(basePalette[idx + 1]);
      const r = color1.r + (color2.r - color1.r) * frac;
      const g = color1.g + (color2.g - color1.g) * frac;
      const b = color1.b + (color2.b - color1.b) * frac;
      result.push(rgbToHex(r, g, b));
    }
  }
  
  return result;
}

function cycleGgsciPalette(preset, count) {
  const basePalette = ggsciPalettes[preset];
  if (!basePalette) return [];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(basePalette[i % basePalette.length]);
  }
  return result;
}

// Display Functions
function displayPalette() {
  const container = document.getElementById('paletteDisplay');
  container.innerHTML = '';
  
  currentPalette.forEach((color, index) => {
    const swatch = createColorSwatch(color, index);
    container.appendChild(swatch);
  });
}

function createColorSwatch(color, index) {
  const swatch = document.createElement('div');
  swatch.className = 'color-swatch';
  
  const preview = document.createElement('div');
  preview.className = 'color-preview';
  preview.style.backgroundColor = color;
  preview.addEventListener('click', () => copyToClipboard(color));
  
  const info = document.createElement('div');
  info.className = 'color-info';
  
  const hex = document.createElement('div');
  hex.className = 'color-hex';
  hex.textContent = color.toUpperCase();
  
  const actions = document.createElement('div');
  actions.className = 'color-actions';
  
  const lockBtn = document.createElement('button');
  lockBtn.className = 'icon-btn';
  lockBtn.textContent = lockedColors[index] ? '🔒' : '🔓';
  if (lockedColors[index]) lockBtn.classList.add('locked');
  lockBtn.addEventListener('click', () => toggleLock(index));
  
  const addBtn = document.createElement('button');
  addBtn.className = 'icon-btn';
  const isInCollection = colorCollection.includes(color);
  addBtn.textContent = isInCollection ? '✓' : '+';
  if (isInCollection) addBtn.classList.add('added');
  addBtn.addEventListener('click', () => addToCollection(color, addBtn));
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'icon-btn';
  copyBtn.textContent = '📋';
  copyBtn.addEventListener('click', () => copyToClipboard(color));
  
  actions.appendChild(lockBtn);
  actions.appendChild(addBtn);
  actions.appendChild(copyBtn);
  
  info.appendChild(hex);
  info.appendChild(actions);
  
  swatch.appendChild(preview);
  swatch.appendChild(info);
  
  return swatch;
}

function toggleLock(index) {
  if (lockedColors[index]) {
    lockedColors[index] = null;
  } else {
    lockedColors[index] = currentPalette[index];
  }
  displayPalette();
}

function addToCollection(color, btn) {
  if (!colorCollection.includes(color)) {
    colorCollection.push(color);
    btn.textContent = '✓';
    btn.classList.add('added');
    updateCollectionDisplay();
  }
}

function updateCollectionDisplay() {
  const container = document.getElementById('collectionDisplay');
  const count = document.getElementById('collectionCount');
  
  count.textContent = `(${colorCollection.length})`;
  
  if (colorCollection.length === 0) {
    container.innerHTML = '<p class="empty-message">No colors collected yet. Click the + button on any color to add it to your collection.</p>';
    return;
  }
  
  container.innerHTML = '';
  colorCollection.forEach((color, index) => {
    const item = document.createElement('div');
    item.className = 'collection-item';
    item.style.backgroundColor = color;
    item.title = color;
    item.addEventListener('click', () => copyToClipboard(color));
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromCollection(index);
    });
    
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

function removeFromCollection(index) {
  colorCollection.splice(index, 1);
  updateCollectionDisplay();
  displayPalette(); // Refresh to update checkmarks
}

function clearCollection() {
  if (colorCollection.length === 0) return;
  if (confirm('Are you sure you want to clear all collected colors?')) {
    colorCollection = [];
    updateCollectionDisplay();
    displayPalette();
  }
}

// Save & Export
function savePalette() {
  if (currentPalette.length === 0) return;
  
  savedPalettes.push([...currentPalette]);
  updateSavedPalettesDisplay();
}

function updateSavedPalettesDisplay() {
  const container = document.getElementById('savedPalettes');
  
  if (savedPalettes.length === 0) {
    container.innerHTML = '<p class="empty-message">No saved palettes yet. Click "Save Palette" to save your current palette.</p>';
    return;
  }
  
  container.innerHTML = '';
  savedPalettes.forEach((palette, index) => {
    const item = document.createElement('div');
    item.className = 'saved-palette';
    
    const colors = document.createElement('div');
    colors.className = 'saved-palette-colors';
    palette.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'saved-palette-color';
      colorDiv.style.backgroundColor = color;
      colors.appendChild(colorDiv);
    });
    
    const actions = document.createElement('div');
    actions.className = 'saved-palette-actions';
    
    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn--sm btn--primary';
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => loadPalette(index));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--sm btn--secondary';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deletePalette(index));
    
    actions.appendChild(loadBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(colors);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

function loadPalette(index) {
  currentPalette = [...savedPalettes[index]];
  lockedColors = [];
  document.getElementById('numColors').value = currentPalette.length;
  displayPalette();
}

function deletePalette(index) {
  savedPalettes.splice(index, 1);
  updateSavedPalettesDisplay();
}

function showExportModal() {
  document.getElementById('exportModal').classList.remove('hidden');
  updateExportOutput();
}

function showExportCollectionModal() {
  if (colorCollection.length === 0) {
    alert('No colors in collection to export.');
    return;
  }
  document.getElementById('exportCollectionModal').classList.remove('hidden');
  updateCollectionExportOutput();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function updateExportOutput() {
  const format = document.getElementById('exportFormat').value;
  const output = document.getElementById('exportOutput');
  output.value = formatColors(currentPalette, format);
}

function updateCollectionExportOutput() {
  const format = document.getElementById('exportCollectionFormat').value;
  const output = document.getElementById('exportCollectionOutput');
  output.value = formatColors(colorCollection, format);
}

function formatColors(colors, format) {
  switch (format) {
    case 'hex':
      return colors.join('\n');
      
    case 'rgb':
      return colors.map(color => {
        const rgb = hexToRgb(color);
        return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
      }).join('\n');
      
    case 'hsl':
      return colors.map(color => {
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      }).join('\n');
      
    case 'json':
      return JSON.stringify(colors, null, 2);
      
    case 'css':
      return colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');

    case 'python':
      // Creates Python list
      return "colors = [\n  " +
        colors.map(c => `'${c}'`).join(",\n  ") +
        "\n]";
    case 'r':
      // Creates R vector
      return "colors <- c(\n  " +
        colors.map(c => `"${c}"`).join(",\n  ") +
        "\n)";
    default:
      return colors.join('\n');
  }
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function copyExport() {
  const output = document.getElementById('exportOutput');
  copyToClipboard(output.value);
  alert('Copied to clipboard!');
}

function copyCollectionExport() {
  const output = document.getElementById('exportCollectionOutput');
  copyToClipboard(output.value);
  alert('Copied to clipboard!');
}

// Ninja Animation
function initializeAnimation() {
  const ninja = document.getElementById('ninja');
  const fruit = document.getElementById('fruit');
  const slash = document.getElementById('slash');
  
  // Set initial fruit
  fruit.textContent = fruits[currentFruit].emoji;
  
  // Monitor animation progress
  ninja.addEventListener('animationiteration', () => {
    // Select next fruit at cycle end
    nextFruit = (currentFruit + 1) % fruits.length;
  });
  
  // Check proximity every frame
  setInterval(() => {
    const ninjaRect = ninja.getBoundingClientRect();
    const fruitRect = fruit.getBoundingClientRect();
    const distance = fruitRect.left - ninjaRect.right;
    
    if (distance < 150 && distance > 80 && animationState === 'running') {
      // Raise sword
      ninja.classList.add('raising');
      animationState = 'preparing';
    } else if (distance < 80 && distance > -50 && animationState === 'preparing') {
      // Execute chop
      ninja.classList.remove('raising');
      ninja.classList.add('slashing');
      slash.classList.add('active');
      fruit.classList.add('split');
      animationState = 'slashing';
      
      setTimeout(() => {
        slash.classList.remove('active');
      }, 500);
      
      setTimeout(() => {
        fruit.classList.remove('split');
        ninja.classList.remove('slashing');
        // Apply next fruit
        currentFruit = nextFruit;
        fruit.textContent = fruits[currentFruit].emoji;
        animationState = 'running';
      }, 1500);
    }
  }, 50);
}