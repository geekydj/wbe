// ==========================================
// Upload Page - File Handling and Validation
// ==========================================

class ProteinUploader {
    constructor() {
        this.uploadedFiles = [];
        this.currentPreview = null;
        
        this.init();
    }

    init() {
        this.initDragDrop();
        this.initFileInput();
        this.initQuickActions();
        this.initModal();
        this.animateElements();
        console.log('ProteinUploader initialized successfully! 🧬');
    }

    // ==========================================
    // Drag and Drop Functionality
    // ==========================================
    initDragDrop() {
        const uploadZone = document.getElementById('upload-zone');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Add drag over styling
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        }, false);

        // Click to browse
        uploadZone.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    initFileInput() {
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    // ==========================================
    // File Processing
    // ==========================================
    async handleFiles(files) {
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid files to upload', 'warning');
            return;
        }

        for (const file of validFiles) {
            await this.processFile(file);
        }

        this.updateFileList();
    }

    validateFile(file) {
        const allowedTypes = ['.pdb', '.cif', '.mol2', '.pdf'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(extension)) {
            this.showNotification(`File ${file.name} has unsupported format. Allowed: ${allowedTypes.join(', ')}`, 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification(`File ${file.name} is too large. Maximum size: 50MB`, 'error');
            return false;
        }

        return true;
    }

    async processFile(file) {
        this.showProgress(0, `Processing ${file.name}...`);
        
        try {
            // Read file content
            const content = await this.readFile(file);
            
            // Validate structure
            const isTextBased = !['.pdf'].includes(this.getFileExtension(file.name));
            const validation = isTextBased ? this.validateStructure(content, file.name) : { isValid: true, errors: [], warnings: [], info: {} };
            
            // Create file object
            const fileObj = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: this.getFileType(file.name),
                content: content,
                validation: validation,
                uploadDate: new Date(),
                status: validation.isValid ? 'valid' : 'warning'
            };

            this.uploadedFiles.push(fileObj);
            
            // Simulate upload progress
            await this.simulateUpload();
            
            this.showNotification(`Successfully processed ${file.name}`, 'success');
            
        } catch (error) {
            this.showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
        }
        
        this.hideProgress();
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('Failed to read file'));
            reader.readAsText(file); // Read as text for protein files
        });
    }

    async simulateUpload() {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            this.showProgress(i, i < 100 ? 'Uploading...' : 'Complete!');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // ==========================================
    // File Validation and Analysis
    // ==========================================
    validateStructure(content, filename) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            info: {
                atoms: 0,
                chains: new Set(),
                residues: new Set(),
                hetAtoms: 0
            }
        };

        const lines = content.split('\n');
        let hasAtomRecords = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                hasAtomRecords = true;
                
                if (line.startsWith('ATOM')) {
                    validation.info.atoms++;
                } else {
                    validation.info.hetAtoms++;
                }
                
                // Extract chain and residue info
                if (line.length >= 22) {
                    const chain = line.substring(21, 22).trim();
                    const resName = line.substring(17, 20).trim();
                    const resNum = line.substring(22, 26).trim();
                    
                    if (chain) validation.info.chains.add(chain);
                    if (resName && resNum) validation.info.residues.add(`${resName}${resNum}${chain}`);
                }
            }
            
            // Check for common issues
            if (line.startsWith('ATOM') && line.length < 78) {
                validation.warnings.push(`Line ${i + 1}: ATOM record may be incomplete`);
            }
        }

        if (!hasAtomRecords) {
            validation.isValid = false;
            validation.errors.push('No ATOM records found in file');
        }

        if (validation.info.atoms === 0 && validation.info.hetAtoms === 0) {
            validation.isValid = false;
            validation.errors.push('No atomic coordinates found');
        }

        // Convert Sets to numbers for display
        validation.info.chains = validation.info.chains.size;
        validation.info.residues = validation.info.residues.size;

        return validation;
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return this.getFileTypeFromExtension(extension);
    }

    getFileTypeFromExtension(extension) {
         const types = {
            'pdb': 'Protein Data Bank',
            'cif': 'Crystallographic Information File',
            'mol2': 'MOL2 Format'
        };
        return types[extension] || 'Unknown';
    }


    // ==========================================
    // File List Management
    // ==========================================
    updateFileList() {
        const fileList = document.getElementById('file-list');
        const clearAllBtn = document.getElementById('clear-all-btn');
        
        if (this.uploadedFiles.length === 0) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-medical"></i>
                    <p>No files uploaded yet</p>
                </div>
            `;
            clearAllBtn.style.display = 'none';
            return;
        }

        clearAllBtn.style.display = 'block';
        
        fileList.innerHTML = this.uploadedFiles.map(file => `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-icon">
                    <i class="fas ${this.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span>${this.formatFileSize(file.size)}</span>
                        <span class="file-status status-${file.status}">
                            ${file.status === 'valid' ? '✓ Valid' : '⚠ Warning'}
                        </span>
                    </div>
                    <div class="file-stats">
                        ${file.validation.info.atoms ? `<span>${file.validation.info.atoms} atoms</span>` : ''}
                        ${file.validation.info.chains ? `<span>${file.validation.info.chains} chains</span>` : ''}
                        ${file.validation.info.residues ? `<span>${file.validation.info.residues} residues</span>` : ''}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-secondary" onclick="proteinUploader.previewFile('${file.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="proteinUploader.visualizeFile('${file.id}')">
                        <i class="fas fa-cube"></i> View 3D
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="proteinUploader.removeFile('${file.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Animate new items
        gsap.from('.file-item', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }

    getFileExtension(filename) {
        return '.' + filename.split('.').pop().toLowerCase();
    }

    getFileIcon(filename) {
        const extension = this.getFileExtension(filename);
        switch (extension) {
            case '.pdb': return 'fa-dna';
            case '.cif': return 'fa-gem';
            case '.mol2': return 'fa-atom';
            default: return 'fa-file';
        }
    }


    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
        this.updateFileList();
        this.showNotification('File removed', 'info');
    }

    clearAllFiles() {
        this.uploadedFiles = [];
        this.updateFileList();
        this.showNotification('All files cleared', 'info');
    }

    // ==========================================
    // File Preview Modal
    // ==========================================
    initModal() {
        const modal = document.getElementById('preview-modal');
        const closeButtons = modal.querySelectorAll('.modal-close');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Visualize button
        document.getElementById('visualize-btn').addEventListener('click', () => {
            if (this.currentPreview) {
                this.visualizeFile(this.currentPreview.id);
            }
        });

        // Clear all button
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllFiles();
        });
    }

    previewFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id == fileId);
        if (!file) return;

        this.currentPreview = file;
        this.populateModal(file);
        this.openModal();
    }

    populateModal(file) {
        // Basic info
        document.getElementById('preview-filename').textContent = file.name;
        document.getElementById('preview-filesize').textContent = this.formatFileSize(file.size);
        document.getElementById('preview-format').textContent = file.type;
        document.getElementById('preview-status').textContent = file.status === 'valid' ? 'Valid' : 'Warning';
        document.getElementById('preview-status').className = `status status-${file.status}`;

        // Restore view for protein files
        document.querySelector('.content-tabs').style.display = 'flex';
        document.getElementById('visualize-btn').style.display = 'inline-flex';

        this.resetModalTabs();

        // Structure info tab
        const structureInfo = document.getElementById('structure-info');
        structureInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <label>Total Atoms:</label>
                    <span>${file.validation.info.atoms}</span>
                </div>
                <div class="info-item">
                    <label>Hetero Atoms:</label>
                    <span>${file.validation.info.hetAtoms}</span>
                </div>
                <div class="info-item">
                    <label>Chains:</label>
                    <span>${file.validation.info.chains}</span>
                </div>
                <div class="info-item">
                    <label>Residues:</label>
                    <span>${file.validation.info.residues}</span>
                </div>
                <div class="info-item">
                    <label>Upload Date:</label>
                    <span>${file.uploadDate.toLocaleString()}</span>
                </div>
            </div>
        `;

        // File content tab
        const contentText = document.getElementById('file-content-text');
        const preview = file.content.split('\n').slice(0, 100).join('\n');
        contentText.textContent = preview + (file.content.split('\n').length > 100 ? '\n... (truncated)' : '');

        // Validation tab
        const validationResults = document.getElementById('validation-results');
        validationResults.innerHTML = `
            <div class="validation-summary ${file.validation.isValid ? 'valid' : 'invalid'}">
                <h5>${file.validation.isValid ? '✓ Structure Valid' : '✗ Structure Issues'}</h5>
            </div>
            ${file.validation.errors.length > 0 ? `
                <div class="validation-section">
                    <h6>Errors:</h6>
                    <ul class="validation-list errors">
                        ${file.validation.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${file.validation.warnings.length > 0 ? `
                <div class="validation-section">
                    <h6>Warnings:</h6>
                    <ul class="validation-list warnings">
                        ${file.validation.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${file.validation.errors.length === 0 && file.validation.warnings.length === 0 ? `
                <p class="no-issues">No validation issues found!</p>
            ` : ''}
        `;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    }

    resetModalTabs() {
        const tabContent = document.querySelector('.tab-content');
        tabContent.innerHTML = `
            <div id="tab-structure" class="tab-panel active">
                <div id="structure-info"><div class="loading">Analyzing structure...</div></div>
            </div>
            <div id="tab-content" class="tab-panel">
                <div class="file-content"><pre id="file-content-text"></pre></div>
            </div>
            <div id="tab-validation" class="tab-panel">
                <div id="validation-results"><div class="loading">Validating file...</div></div>
            </div>
        `;
        this.switchTab('structure');
    }

    openModal() {
        const modal = document.getElementById('preview-modal');
        modal.classList.add('active');
        
        // Animate modal
        gsap.fromTo(modal.querySelector('.modal-content'), 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }

    closeModal() {
        const modal = document.getElementById('preview-modal');
        modal.classList.remove('active');
        this.currentPreview = null;
    }

    // ==========================================
    // Quick Actions
    // ==========================================
    initQuickActions() {
        // Fetch from PDB
        document.getElementById('fetch-pdb-btn').addEventListener('click', () => {
            const pdbId = document.getElementById('pdb-id-input').value.trim();
            if (pdbId) {
                this.fetchFromPDB(pdbId);
            }
        });

        // Load from URL
        document.getElementById('load-url-btn').addEventListener('click', () => {
            const url = document.getElementById('url-input').value.trim();
            if (url) {
                this.loadFromURL(url);
            }
        });

        // Load sample
        document.getElementById('load-sample-btn').addEventListener('click', () => {
            const sample = document.getElementById('sample-structures').value;
            if (sample) {
                this.fetchFromPDB(sample);
            }
        });
    }

    async fetchFromPDB(pdbId) {
        if (!pdbId || pdbId.length !== 4) {
            this.showNotification('Please enter a valid 4-character PDB ID', 'error');
            return;
        }

        this.showLoading('Fetching structure from PDB...');

        try {
            const response = await fetch(`https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`);
            
            if (!response.ok) {
                throw new Error(`PDB ID ${pdbId.toUpperCase()} not found`);
            }
            
            const content = await response.text();
            
            // Create virtual file
            const file = new File([content], `${pdbId.toUpperCase()}.pdb`, { type: 'text/plain' });
            await this.processFile(file);
            
            this.updateFileList();
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            this.showNotification(`Error fetching PDB ${pdbId}: ${error.message}`, 'error');
        }
    }

    async loadFromURL(url) {
        this.showLoading('Loading from URL...');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load from URL: ${response.statusText}`);
            }
            
            const content = await response.text();
            const filename = url.split('/').pop() || 'structure.pdb';
            
            // Create virtual file
            const file = new File([content], filename, { type: 'text/plain' });
            await this.processFile(file);
            
            this.updateFileList();
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            this.showNotification(`Error loading from URL: ${error.message}`, 'error');
        }
    }

    // ==========================================
    // Navigation and Visualization
    // ==========================================
    visualizeFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id == fileId);
        if (!file) return;

        // Store file data for the viewer page
        sessionStorage.setItem('proteinData', JSON.stringify({
            name: file.name,
            content: file.content,
            type: file.type,
            extension: this.getFileExtension(file.name).substring(1) // Pass extension without the dot
        }));

        // Navigate to viewer
        window.location.href = 'viewer.html';
    }

    // ==========================================
    // Progress and Loading
    // ==========================================
    showProgress(percentage, status) {
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');

        progressContainer.style.display = 'block';
        progressFill.style.width = percentage + '%';
        progressPercentage.textContent = percentage + '%';
        progressStatus.textContent = status;
    }

    hideProgress() {
        setTimeout(() => {
            document.getElementById('upload-progress').style.display = 'none';
        }, 1000);
    }

    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const title = document.getElementById('loading-title');
        const loadingMessage = document.getElementById('loading-message');

        title.textContent = 'Processing...';
        loadingMessage.textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    // ==========================================
    // Notifications
    // ==========================================
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('notifications').appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ==========================================
    // Animations
    // ==========================================
    animateElements() {
        // Animate upload sections on scroll
        gsap.set('.upload-section, .file-list-section, .quick-actions', {
            opacity: 0,
            y: 30
        });

        gsap.to('.upload-section, .file-list-section, .quick-actions', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.3
        });

        // Animate action cards on hover
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }
}

// ==========================================
// Initialize Upload Handler
// ==========================================
let proteinUploader;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('upload-page')) {
        proteinUploader = new ProteinUploader();
        console.log('Protein Uploader page loaded successfully! 🧬');
    }
});