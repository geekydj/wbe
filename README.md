# ProteinView3D - Advanced Molecular Visualization Platform

🧬 A modern, interactive web-based protein structure visualization tool with beautiful animations and comprehensive analysis features.

## Features

### 🎨 Beautiful UI/UX
- **GSAP Animations**: Smooth, professional animations throughout the interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Styling**: Clean, gradient-based design with interactive elements
- **Loading Animations**: Engaging loading screens and transitions

### 🔬 Advanced 3D Visualization
- **3Dmol.js Integration**: Powerful WebGL-based molecular rendering
- **Multiple Rendering Modes**: Cartoon, stick, sphere, and surface representations
- **Color Schemes**: Spectrum, chain-based, amino acid, secondary structure, and more
- **Interactive Controls**: Rotation, zoom, spin, and rock animations

### 📁 File Management
- **Drag & Drop Upload**: Intuitive file upload with real-time validation
- **Multiple Formats**: Support for PDB, CIF, and MOL2 files
- **PDB Database Integration**: Direct fetching from RCSB PDB
- **File Validation**: Comprehensive structure validation and error reporting

### 🛠 Analysis Tools
- **Measurement Tools**: Distance and angle measurements
- **Selection System**: Atom, residue, and chain selection modes
- **Structure Analysis**: Secondary structure and surface area analysis
- **Export Options**: High-resolution images and structure files

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Modern web browser with WebGL support

### Installation

1. **Clone or extract the project**
   ```bash
   cd protein-viewer-ultimate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   The application will automatically open at `http://localhost:3000`

## Usage

### Landing Page
- Beautiful animated landing page with feature overview
- Smooth GSAP animations and interactive elements
- Direct navigation to viewer and upload pages

### Upload Page
- **Drag & Drop**: Simply drag PDB files onto the upload zone
- **File Browser**: Click to browse and select files
- **PDB Fetch**: Enter a PDB ID to download directly from RCSB
- **URL Loading**: Load structures from direct URLs
- **Sample Structures**: Try built-in examples

### 3D Viewer
- **Load Structures**: From uploaded files or PDB database
- **Visualization Controls**: Change rendering styles and colors
- **Animation**: Enable spinning or rocking motions
- **Analysis Tools**: Measure distances and angles
- **Export**: Save high-resolution images or structure files

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animations**: GSAP (GreenSock Animation Platform)
- **3D Rendering**: 3Dmol.js WebGL library
- **Icons**: Font Awesome
- **Development**: Live-server for hot reloading

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

**Note**: WebGL support is required for 3D visualization features.

## File Format Support

### PDB (Protein Data Bank)
- Primary format for protein structures
- Full atomic coordinate support
- Chain and residue information

### CIF (Crystallographic Information File)
- mmCIF format support
- Enhanced metadata handling

### MOL2 (Tripos Mol2)
- Small molecule support
- Atom type and bond information

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **3Dmol.js** - WebGL molecular visualization
- **GSAP** - Professional animation library
- **RCSB PDB** - Protein structure database
- **Font Awesome** - Icon library

## Support

For questions, bug reports, or feature requests, please visit our GitHub repository or contact the development team.

---

**ProteinView3D** - Making molecular visualization beautiful and accessible to everyone. 🧬✨