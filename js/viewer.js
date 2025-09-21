
// ==========================================
// Viewer Page - 3Dmol.js Integration
// ==========================================

class ProteinViewer {
    constructor() {
        this.viewer = null;
        this.model = null;
        this.isSpinning = false;
        this.isRocking = false;
        this.animationSpeed = 1;
        this.click_count = 0;
        this.atom_clicks = [];
        this.labels = [];
        this.measurementMode = null; // 'distance' or 'angle'
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.initViewer();
        this.initControls();
        this.loadFromSessionStorage();
        this.animateElements();
        console.log('ProteinViewer initialized successfully! 🔬');
    }

    // ==========================================
    // Viewer Initialization
    // ==========================================
    initViewer() {
        const viewerElement = document.getElementById('viewer-3d');
        const config = {
            backgroundColor: '#1a1d24',
            hoverable: true,
            hoverDuration: 200,
            clickable: true,
            callback: (atom, viewer, event, container) => {
                this.handleAtomClick(atom, viewer, event, container);
            }
        };
        this.viewer = $3Dmol.createViewer(viewerElement, config);
    }

    loadFromPDB(pdbId) {
        if (!pdbId || pdbId.length !== 4) {
            alert('Please enter a valid 4-character PDB ID.');
            return;
        }
        this.showLoading(true);
        this.viewer.clear();
        fetch(`https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`PDB ID ${pdbId.toUpperCase()} not found or network error.`);
                }
                return response.text();
            })
            .then(data => {
                this.model = this.viewer.addModel(data, 'pdb');
                this.updateStructureInfo(pdbId.toUpperCase(), data, 'pdb');
                this.applyStyle();
                this.viewer.zoomTo();
                this.viewer.render();
                this.showLoading(false);
            })
            .catch(error => {
                alert(`Could not load PDB ID: ${pdbId}. ${error.message}`);
                this.showLoading(false);
            });
    }

    loadFromData(name, data, type) {
        this.showLoading(true);
        this.viewer.clear();
        this.model = this.viewer.addModel(data, type);
        this.updateStructureInfo(name, data, type);
        this.applyStyle();
        this.viewer.zoomTo();
        this.viewer.render();
        this.showLoading(false);
    }

    loadFromSessionStorage() {
        const storedData = sessionStorage.getItem('proteinData');
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data && data.content && data.extension) {
                this.loadFromData(data.name, data.content, data.extension);
                // Clear the data so it doesn't reload on refresh
                sessionStorage.removeItem('proteinData');
            }
        }
    }

    // ==========================================
    // Controls and UI
    // ==========================================
    initControls() {
        // Load from PDB ID
        document.getElementById('load-pdb-btn').addEventListener('click', () => {
            const pdbId = document.getElementById('pdb-input').value;
            this.loadFromPDB(pdbId);
        });

        // Load from sample
        const sampleSelect = document.getElementById('sample-select');
        sampleSelect.addEventListener('change', () => {
            if (sampleSelect.value) {
                this.loadFromPDB(sampleSelect.value);
            }
        });

        // Style buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.style-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.applyStyle();
            });
        });

        // Color scheme
        document.getElementById('color-scheme').addEventListener('change', () => this.applyStyle());

        // Opacity
        document.getElementById('opacity-slider').addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            document.getElementById('opacity-value').textContent = `${Math.round(opacity * 100)}%`;
            this.viewer.setOpacity(opacity);
            this.viewer.render();
        });

        // Animation
        document.getElementById('spin-btn').addEventListener('click', () => this.toggleSpin());
        document.getElementById('rock-btn').addEventListener('click', () => this.toggleRock());
        document.getElementById('spin-speed').addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            // If an animation is running, this will be picked up on the next frame
        });

        // Viewer actions
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.viewer.toggleFullscreen());
        document.getElementById('screenshot-btn').addEventListener('click', () => this.viewer.png());
        document.getElementById('reset-view-btn').addEventListener('click', () => this.viewer.zoomTo());

        // Placeholder button
        const placeholderBtn = document.querySelector('.viewer-placeholder #load-sample-btn');
        if (placeholderBtn) {
            placeholderBtn.addEventListener('click', () => this.loadFromPDB('1MBN'));
        }
        // Display options checkboxes
        document.getElementById('show-labels').addEventListener('change', (e) => this.toggleLabels(e.target.checked));
        document.getElementById('show-water').addEventListener('change', (e) => this.toggleWater(e.target.checked));
        document.getElementById('show-hetero').addEventListener('change', (e) => this.toggleHetero(e.target.checked));
        document.getElementById('show-bonds').addEventListener('change', (e) => this.toggleBonds(e.target.checked));

        // Right sidebar - Analysis and Export
        document.getElementById('export-png-btn').addEventListener('click', () => this.viewer.png());
        document.getElementById('export-pdb-btn').addEventListener('click', () => this.exportPDB());

        document.getElementById('measure-distance-btn').addEventListener('click', () => this.setMeasurementMode('distance'));
        document.getElementById('measure-angle-btn').addEventListener('click', () => this.setMeasurementMode('angle'));
        document.getElementById('select-all-btn').addEventListener('click', () => this.selectAll());
        document.getElementById('clear-selection-btn').addEventListener('click', () => this.clearSelection());
        document.getElementById('analyze-secondary-btn').addEventListener('click', () => this.analyzeSecondaryStructure());
        document.getElementById('analyze-surface-btn').addEventListener('click', () => this.analyzeSurfaceArea());
        document.getElementById('find-cavities-btn').addEventListener('click', () => this.findCavities());
    }

    applyStyle() {
        if (!this.model) return;

        const style = document.querySelector('.style-btn.active').dataset.style;
        const color = document.getElementById('color-scheme').value;

        this.viewer.setStyle({}, { [style]: { colorscheme: color } });
        this.viewer.render();
    }

    toggleLabels(show) {
        if (show) {
            this.viewer.addResidueLabels();
        } else {
            this.viewer.removeAllLabels();
        }
        this.viewer.render();
    }

    toggleWater(show) {
        this.viewer.setStyle({ water: {} }, { stick: { hidden: !show } });
        this.viewer.render();
    }

    updateStructureInfo(name, data, type) {
        document.getElementById('structure-title').textContent = name;
        const atoms = this.viewer.getModel().selectedAtoms({}).length;
        // Basic parsing for chains/residues - can be improved
        let chains = new Set();
        let sequence = '';
        let residues = new Set();
        if (type === 'pdb') {
            data.split('\n').forEach(line => {
                if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                    chains.add(line.substring(21, 22));
                    residues.add(line.substring(22, 26).trim());
                }
                // Extract sequence from SEQRES records
                if (line.startsWith('SEQRES')) {
                    const res = line.substring(19, 70).trim().split(' ');
                    sequence += res.join('');
                }
            });
        }

        document.getElementById('structure-chains').textContent = `${chains.size} chains`;
        document.getElementById('structure-residues').textContent = `${residues.size} residues`;
        document.getElementById('structure-atoms').textContent = `${atoms} atoms`;
        document.getElementById('structure-sequence').textContent = `${sequence.length} sequence length`;

        // Hide placeholder
        document.querySelector('.viewer-placeholder').style.display = 'none';
    }
    
    toggleHetero(show) {
        this.viewer.setStyle({ hetatm: true }, { stick: { hidden: !show } });
        this.viewer.render();
    }

    toggleBonds(show) {
        this.viewer.setStyle({}, { line: { hidden: !show } });
        this.viewer.render();
    }

    exportPDB() {
        if (!this.model) {
            alert('No model loaded to export.');
            return;
        }
        const data = this.model.toPDB();
        this.downloadFile(data, `${this.model.name || 'structure'}.pdb`, 'text/plain');
    }

    // ==========================================
    // Measurement and Selection
    // ==========================================
    setMeasurementMode(mode) {
        this.measurementMode = mode;
        this.atom_clicks = [];
        this.click_count = 0;
        alert(`Click on ${mode === 'distance' ? 2 : 3} atoms to measure the ${mode}.`);
    }

    handleAtomClick(atom) {
        if (this.measurementMode) {
            this.atom_clicks.push(atom);
            this.click_count++;

            if (this.measurementMode === 'distance' && this.click_count === 2) {
                this.measureDistance();
            } else if (this.measurementMode === 'angle' && this.click_count === 3) {
                this.measureAngle();
            }
        } else {
            // Regular selection
            const selectionMode = document.getElementById('selection-mode').value;
            let selection;
            switch (selectionMode) {
                case 'residue':
                    selection = { resi: atom.resi, chain: atom.chain };
                    break;
                case 'chain':
                    selection = { chain: atom.chain };
                    break;
                case 'atom':
                default:
                    selection = { serial: atom.serial };
                    break;
            }
            this.viewer.setStyle(selection, { stick: { color: 'yellow' } });
            this.viewer.render();
            this.updateSelectionInfo(this.viewer.selectedAtoms(selection).length);
        }
    }

    measureDistance() {
        const [p1, p2] = this.atom_clicks;
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)).toFixed(2);

        const label = this.viewer.addLabel(`Distance: ${distance} Å`, {
            position: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2 },
            backgroundColor: '0x2c3e50',
            backgroundOpacity: 0.7
        });
        this.labels.push(label);
        this.viewer.render();
        this.resetMeasurement();
    }

    measureAngle() {
        const [p1, p2, p3] = this.atom_clicks; // p2 is the vertex
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);

        const label = this.viewer.addLabel(`Angle: ${angle.toFixed(2)}°`, {
            position: { x: p2.x, y: p2.y, z: p2.z },
            backgroundColor: '0x2c3e50',
            backgroundOpacity: 0.7
        });
        this.labels.push(label);
        this.viewer.render();
        this.resetMeasurement();
    }

    resetMeasurement() {
        this.measurementMode = null;
        this.atom_clicks = [];
        this.click_count = 0;
    }

    selectAll() {
        this.viewer.setStyle({}, { stick: { color: 'yellow' } });
        this.viewer.render();
        this.updateSelectionInfo(this.viewer.getModel().selectedAtoms({}).length);
    }

    clearSelection() {
        this.applyStyle(); // Re-apply the original style to clear selection highlight
        this.viewer.removeAllLabels();
        this.labels = [];
        this.updateSelectionInfo(0);
    }

    updateSelectionInfo(count) {
        const infoElement = document.getElementById('selection-info');
        if (count > 0) {
            infoElement.innerHTML = `<p>${count} atoms selected.</p>`;
        } else {
            infoElement.innerHTML = `<p>No selection</p>`;
        }
    }

    analyzeSurfaceArea() {
        if (!this.model) {
            alert('Please load a structure first.');
            return;
        }

        this.showLoading(true);

        // Use a timeout to allow the loading spinner to render before the calculation
        setTimeout(() => {
            try {
                // Add a molecular surface (SASA)
                const surface = this.viewer.addSurface($3Dmol.SurfaceType.SAS, {
                    opacity: 0.8,
                    color: 'lightblue'
                }, {});

                // The area is stored on the surface object after creation
                const area = surface.area;
                alert(`Solvent Accessible Surface Area (SASA): ${area.toFixed(2)} Å²`);

                // Optional: remove the surface after showing the result
                this.viewer.removeSurface(surface);
            } catch (error) {
                alert('An error occurred during surface area calculation.');
                console.error('Surface Area Error:', error);
            } finally {
                this.showLoading(false);
            }
        }, 50);
    }

    findCavities() {
        if (!this.model) {
            alert('Please load a structure first.');
            return;
        }

        this.showLoading(true);
        alert('Generating a molecular surface colored by hydrophobicity. Hydrophobic pockets (potential cavities) will appear reddish-brown.');

        setTimeout(() => {
            try {
                this.viewer.removeAllSurfaces();
                this.viewer.addSurface($3Dmol.SurfaceType.MS, {
                    color: 'hydrophobicity',
                    opacity: 0.85
                }, {});
                this.viewer.render();
            } catch (error) {
                alert('An error occurred while trying to find cavities.');
                console.error('Find Cavities Error:', error);
            } finally {
                this.showLoading(false);
            }
        }, 50);
    }

    // ==========================================
    // Structure Analysis
    // ==========================================
    analyzeSecondaryStructure() {
        if (!this.model) {
            alert('Please load a structure first.');
            return;
        }

        const atoms = this.model.selectedAtoms({});
        if (atoms.length === 0) {
            alert('No atoms found to analyze.');
            return;
        }

        let ss_counts = { 'h': 0, 's': 0, 'c': 0 };
        let total_residues = 0;
        let processed_residues = new Set();

        atoms.forEach(atom => {
            if (atom.ss && !processed_residues.has(atom.resi)) {
                ss_counts[atom.ss]++;
                total_residues++;
                processed_residues.add(atom.resi);
            }
        });

        if (total_residues === 0) {
            alert('Could not determine secondary structure. Ensure the PDB file contains SS information.');
            return;
        }

        const helix_percent = ((ss_counts['h'] / total_residues) * 100).toFixed(1);
        const sheet_percent = ((ss_counts['s'] / total_residues) * 100).toFixed(1);
        const coil_percent = ((ss_counts['c'] / total_residues) * 100).toFixed(1);

        // For now, we'll show the results in an alert. This can be expanded to show in a panel.
        const results = `Secondary Structure Analysis:
        - Alpha Helices: ${helix_percent}% (${ss_counts['h']} residues)
        - Beta Sheets: ${sheet_percent}% (${ss_counts['s']} residues)
        - Coils/Turns: ${coil_percent}% (${ss_counts['c']} residues)`;
        alert(results);
    }

    // ==========================================
    // Animation
    // ==========================================
    toggleSpin() {
        this.isSpinning = !this.isSpinning;
        this.isRocking = false; // Stop rocking if spinning
        this.updateAnimation();
    }

    toggleRock() {
        this.isRocking = !this.isRocking;
        this.isSpinning = false; // Stop spinning if rocking
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.isSpinning) {
            const spin = () => {
                this.viewer.rotate(this.animationSpeed, {
                    y: 1
                });
                this.animationFrameId = requestAnimationFrame(spin);
            };
            spin();
        } else if (this.isRocking) {
            // Simple rock animation - can be improved
            let angle = 0;
            let direction = 1;
            const rock = () => {
                this.viewer.rotate(direction * 0.5 * this.animationSpeed, {
                    y: 1
                });
                angle += direction * 0.5 * this.animationSpeed;
                if (Math.abs(angle) > 15) {
                    direction *= -1;
                }
                this.animationFrameId = requestAnimationFrame(rock);
            };
            rock();
        }
    }

    // ==========================================
    // Utility
    // ==========================================
    showLoading(isLoading) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !isLoading);
        }
    }

    animateElements() {
        gsap.from('.sidebar', {
            x: (index) => (index === 0 ? -100 : 100),
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.2
        });
        gsap.from('.viewer-main', {
            opacity: 0,
            scale: 0.95,
            duration: 1,
            delay: 0.3,
            ease: 'power2.out'
        });
    }

    downloadFile(data, filename, type) {
        const blob = new Blob([data], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

// ==========================================
// Initialize Viewer Handler
// ==========================================
let proteinViewer;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('viewer-page')) {
        proteinViewer = new ProteinViewer();
    }
});