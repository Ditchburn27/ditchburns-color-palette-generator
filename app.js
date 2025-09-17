class AdvancedColorPaletteGenerator {
    constructor() {
        this.currentPalette = [];
        this.savedPalettes = JSON.parse(localStorage.getItem('colorPalettes') || '[]');
        this.maxSavedPalettes = 20;
        this.currentPaletteType = 'qualitative';

        // Color theory configurations
        this.paletteTypes = {
            random: { name: "Random", description: "Randomly generated vibrant colors" },
            qualitative: { name: "Qualitative", description: "Distinct colors for categorical data" },
            divergent: { name: "Divergent", description: "Two-hue system with neutral midpoint" },
            complementary: { name: "Complementary", description: "Opposite colors on the color wheel" },
            analogous: { name: "Analogous", description: "Adjacent colors on the color wheel" },
            triadic: { name: "Triadic", description: "Three evenly spaced colors" },
            sequential: { name: "Sequential", description: "Progressive color transitions" },
            monochromatic: { name: "Monochromatic", description: "Variations of a single hue" }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateInitialPalette();
        this.updatePaletteDescription();
        this.displaySavedPalettes();
    }

    setupEventListeners() {
        // Control elements
        document.getElementById('generateBtn').addEventListener('click', () => this.generateNewColors());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePalette());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
        document.getElementById('paletteType').addEventListener('change', (e) => {
            this.currentPaletteType = e.target.value;
            this.updatePaletteDescription();
            this.generateNewColors();
        });
        document.getElementById('paletteSize').addEventListener('change', (e) => {
            this.changePaletteSize(parseInt(e.target.value));
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.hideExportModal());
        document.getElementById('copyExport').addEventListener('click', () => this.copyExportData());
        document.getElementById('exportFormat').addEventListener('change', () => this.updateExportOutput());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, select, button')) {
                e.preventDefault();
                this.generateNewColors();
            } else if (e.code === 'KeyS' && !e.target.matches('input, textarea, select, button')) {
                e.preventDefault();
                this.savePalette();
            }
        });

        // Click outside modal to close
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                this.hideExportModal();
            }
        });
    }

    generateInitialPalette() {
        const size = parseInt(document.getElementById('paletteSize').value);
        this.currentPalette = Array(size).fill(null).map(() => ({
            color: this.generateRandomColor(),
            locked: false
        }));
        this.displayPalette();
    }

    updatePaletteDescription() {
        const description = this.paletteTypes[this.currentPaletteType].description;
        document.getElementById('paletteDescription').textContent = description;
    }

    generateNewColors() {
        const type = this.currentPaletteType;
        const size = this.currentPalette.length;

        // Generate new palette based on type
        let newColors;
        switch (type) {
            case 'qualitative':
                newColors = this.generateQualitativePalette(size);
                break;
            case 'divergent':
                newColors = this.generateDivergentPalette(size);
                break;
            case 'complementary':
                newColors = this.generateComplementaryPalette(size);
                break;
            case 'analogous':
                newColors = this.generateAnalogousPalette(size);
                break;
            case 'triadic':
                newColors = this.generateTriadicPalette(size);
                break;
            case 'sequential':
                newColors = this.generateSequentialPalette(size);
                break;
            case 'monochromatic':
                newColors = this.generateMonochromaticPalette(size);
                break;
            default:
                newColors = Array(size).fill(null).map(() => this.generateRandomColor());
        }

        // Update only unlocked colors
        for (let i = 0; i < this.currentPalette.length; i++) {
            if (!this.currentPalette[i].locked && i < newColors.length) {
                this.currentPalette[i].color = newColors[i];
            }
        }

        this.displayPalette();
    }

    generateQualitativePalette(size) {
        const colors = [];
        const maxRecommended = Math.min(size, 12); // Research-based limit

        for (let i = 0; i < size; i++) {
            const hue = (i * 360) / maxRecommended;
            const saturation = 65 + Math.random() * 15; // 65-80%
            const lightness = 45 + Math.random() * 20;  // 45-65%
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }

    generateDivergentPalette(size) {
        const colors = [];
        const hue1 = Math.random() * 360;
        const hue2 = (hue1 + 180) % 360; // Opposite hue

        for (let i = 0; i < size; i++) {
            const position = i / (size - 1); // 0 to 1

            if (position < 0.5) {
                // First half: hue1 to neutral
                const t = position * 2; // 0 to 1
                const sat = 70 * (1 - t);
                const light = 30 + (60 * t);
                colors.push(this.hslToHex(hue1, sat, light));
            } else {
                // Second half: neutral to hue2
                const t = (position - 0.5) * 2; // 0 to 1
                const sat = 70 * t;
                const light = 90 - (60 * t);
                colors.push(this.hslToHex(hue2, sat, light));
            }
        }
        return colors;
    }

    generateComplementaryPalette(size) {
        const baseHue = Math.random() * 360;
        const complementHue = (baseHue + 180) % 360;
        const colors = [];

        for (let i = 0; i < size; i++) {
            const useBase = i % 2 === 0;
            const hue = useBase ? baseHue : complementHue;
            const saturation = 60 + Math.random() * 20;
            const lightness = 40 + Math.random() * 40;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }

    generateAnalogousPalette(size) {
        const baseHue = Math.random() * 360;
        const colors = [];
        const hueRange = 60; // Adjacent colors within 60 degrees

        for (let i = 0; i < size; i++) {
            const hueOffset = (i / (size - 1)) * hueRange - (hueRange / 2);
            const hue = (baseHue + hueOffset + 360) % 360;
            const saturation = 60 + Math.random() * 20;
            const lightness = 45 + Math.random() * 30;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }

    generateTriadicPalette(size) {
        const baseHue = Math.random() * 360;
        const colors = [];

        for (let i = 0; i < size; i++) {
            const hue = (baseHue + (i * 120)) % 360;
            const saturation = 65 + Math.random() * 15;
            const lightness = 45 + Math.random() * 25;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    }

    generateSequentialPalette(size) {
        const baseHue = Math.random() * 360;
        const colors = [];

        for (let i = 0; i < size; i++) {
            const position = i / (size - 1);
            const saturation = 20 + (50 * position); // Increase saturation
            const lightness = 90 - (60 * position);  // Decrease lightness
            colors.push(this.hslToHex(baseHue, saturation, lightness));
        }
        return colors;
    }

    generateMonochromaticPalette(size) {
        const baseHue = Math.random() * 360;
        const colors = [];

        for (let i = 0; i < size; i++) {
            const position = i / (size - 1);
            const saturation = 30 + (40 * Math.sin(position * Math.PI));
            const lightness = 25 + (60 * position);
            colors.push(this.hslToHex(baseHue, saturation, lightness));
        }
        return colors;
    }

    generateRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // Boost saturation by ensuring at least one channel is strong
        const channels = [r, g, b];
        const maxChannel = Math.max(...channels);
        if (maxChannel < 128) {
            const randomIndex = Math.floor(Math.random() * 3);
            channels[randomIndex] = Math.floor(Math.random() * 128) + 128;
        }

        return this.rgbToHex(channels[0], channels[1], channels[2]);
    }

    changePaletteSize(newSize) {
        const currentSize = this.currentPalette.length;

        if (newSize > currentSize) {
            // Add new colors
            for (let i = currentSize; i < newSize; i++) {
                this.currentPalette.push({
                    color: this.generateRandomColor(),
                    locked: false
                });
            }
        } else if (newSize < currentSize) {
            // Remove colors from the end
            this.currentPalette = this.currentPalette.slice(0, newSize);
        }

        this.displayPalette();
    }

    displayPalette() {
        const container = document.getElementById('paletteContainer');
        container.innerHTML = '';

        this.currentPalette.forEach((item, index) => {
            const swatch = this.createColorSwatch(item.color, item.locked, index);
            container.appendChild(swatch);
        });
    }

    createColorSwatch(color, locked, index) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch fade-in';

        const textColor = this.getContrastColor(color);
        const accessibility = this.getAccessibilityScore(color);

        swatch.innerHTML = `
            <div class="color-display color-transition" style="background-color: ${color};">
                <div class="accessibility-indicator ${accessibility.class}"></div>
                <div class="color-info">
                    <div style="color: ${textColor};">
                        <div>Contrast: ${accessibility.score}</div>
                        <div>Click to copy</div>
                    </div>
                </div>
            </div>
            <div class="hex-code">${color}</div>
            <div class="swatch-controls">
                <button class="lock-btn ${locked ? 'locked' : ''}" data-index="${index}">
                    ${locked ? '🔒' : '🔓'}
                </button>
                <button class="copy-btn" data-color="${color}">Copy</button>
            </div>
        `;

        // Add event listeners
        const lockBtn = swatch.querySelector('.lock-btn');
        const copyBtn = swatch.querySelector('.copy-btn');
        const colorDisplay = swatch.querySelector('.color-display');

        lockBtn.addEventListener('click', () => this.toggleLock(index));
        copyBtn.addEventListener('click', () => this.copyColor(color));
        colorDisplay.addEventListener('click', () => this.copyColor(color));

        return swatch;
    }

    toggleLock(index) {
        this.currentPalette[index].locked = !this.currentPalette[index].locked;
        this.displayPalette();
    }

    copyColor(color) {
        navigator.clipboard.writeText(color).then(() => {
            this.showNotification(`Copied ${color} to clipboard!`);
        }).catch(err => {
            console.error('Failed to copy color: ', err);
        });
    }

    savePalette() {
        const palette = {
            id: Date.now(),
            colors: this.currentPalette.map(item => item.color),
            type: this.currentPaletteType,
            name: `${this.paletteTypes[this.currentPaletteType].name} Palette`,
            timestamp: new Date().toLocaleDateString(),
            size: this.currentPalette.length
        };

        this.savedPalettes.unshift(palette);

        // Limit saved palettes
        if (this.savedPalettes.length > this.maxSavedPalettes) {
            this.savedPalettes = this.savedPalettes.slice(0, this.maxSavedPalettes);
        }

        localStorage.setItem('colorPalettes', JSON.stringify(this.savedPalettes));
        this.displaySavedPalettes();
        this.showNotification('Palette saved successfully!');
    }

    displaySavedPalettes() {
        const container = document.getElementById('savedPalettesGrid');

        if (this.savedPalettes.length === 0) {
            container.innerHTML = '<p class="no-palettes">No saved palettes yet. Create and save your first palette!</p>';
            return;
        }

        container.innerHTML = '';

        this.savedPalettes.forEach(palette => {
            const paletteElement = document.createElement('div');
            paletteElement.className = 'saved-palette';
            paletteElement.innerHTML = `
                <div class="palette-preview">
                    ${palette.colors.map(color => `<div class="preview-color" style="background-color: ${color};"></div>`).join('')}
                </div>
                <div class="palette-meta">
                    <span>${palette.name} (${palette.size} colors)</span>
                    <span>${palette.timestamp}</span>
                </div>
            `;

            paletteElement.addEventListener('click', () => this.loadPalette(palette));
            container.appendChild(paletteElement);
        });
    }

    loadPalette(palette) {
        this.currentPalette = palette.colors.map(color => ({
            color: color,
            locked: false
        }));

        // Update UI
        document.getElementById('paletteSize').value = palette.size;
        document.getElementById('paletteType').value = palette.type;
        this.currentPaletteType = palette.type;
        this.updatePaletteDescription();
        this.displayPalette();
        this.showNotification(`Loaded "${palette.name}"`);
    }

    showExportModal() {
        document.getElementById('exportModal').style.display = 'flex';
        this.updateExportOutput();
    }

    hideExportModal() {
        document.getElementById('exportModal').style.display = 'none';
    }

    updateExportOutput() {
        const format = document.getElementById('exportFormat').value;
        const colors = this.currentPalette.map(item => item.color);
        let output = '';

        switch (format) {
            case 'css':
                output = ':root {\n';
                colors.forEach((color, index) => {
                    output += `  --color-${index + 1}: ${color};\n`;
                });
                output += '}';
                break;
            case 'json':
                output = JSON.stringify({
                    type: this.currentPaletteType,
                    colors: colors,
                    generated: new Date().toISOString()
                }, null, 2);
                break;
            case 'hex':
                output = JSON.stringify(colors, null, 2);
                break;
        }

        document.getElementById('exportOutput').value = output;
    }

    copyExportData() {
        const output = document.getElementById('exportOutput').value;
        navigator.clipboard.writeText(output).then(() => {
            this.showNotification('Export data copied to clipboard!');
            this.hideExportModal();
        });
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility functions
    rgbToHex(r, g, b) {
        const componentToHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    hslToHex(h, s, l) {
        h = h % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;

        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };

        return this.rgbToHex(f(0), f(8), f(4));
    }

    getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    getAccessibilityScore(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

        if (brightness > 180) return { score: 'AA', class: 'good' };
        if (brightness > 120) return { score: 'A', class: 'fair' };
        return { score: 'Poor', class: 'poor' };
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedColorPaletteGenerator();
});
