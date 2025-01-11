import MockDataGenerator from './data/mockData.js';

class EVDashboard {
    constructor() {
        console.log('Initializing EVDashboard...');
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.charts = {};
        
        this.darkMode = false;
        this.selectedEntry = null;
        this.searchTerm = '';
        
        this.mockDataGenerator = new MockDataGenerator();
        
        this.initializeElements();
        this.loadData();
    }

    initializeElements() {
        console.log('Initializing elements...');
        // Filter elements
        this.vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
        this.manufacturerFilter = document.getElementById('manufacturerFilter');
        this.yearFilter = document.getElementById('yearFilter');
        this.resetFiltersBtn = document.getElementById('resetFilters');

        if (!this.vehicleTypeFilter || !this.manufacturerFilter || !this.yearFilter || !this.resetFiltersBtn) {
            console.error('Failed to find one or more filter elements');
            return;
        }

        // Add event listeners
        this.vehicleTypeFilter.addEventListener('change', () => this.applyFilters());
        this.manufacturerFilter.addEventListener('change', () => this.applyFilters());
        this.yearFilter.addEventListener('change', () => this.applyFilters());
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());

        // Add new elements
        this.searchInput = document.getElementById('searchInput');
        this.themeToggle = document.getElementById('themeToggle');
        this.modal = document.getElementById('detailModal');
        this.modalClose = document.getElementById('modalClose');

        if (!this.searchInput || !this.themeToggle || !this.modal || !this.modalClose) {
            console.error('Failed to find one or more UI elements');
            return;
        }

        // Add new event listeners
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    async loadData() {
        try {
            console.log('Loading data...');
            // Generate mock data instead of fetching
            this.data = this.mockDataGenerator.generateData(1000);
            console.log('Generated mock data:', this.data.slice(0, 3));
            this.filteredData = [...this.data];
            
            this.populateFilters();
            this.updateDashboard();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    populateFilters() {
        console.log('Populating filters...');
        // Clear existing options first
        this.vehicleTypeFilter.innerHTML = '<option value="">Vehicle Type</option>';
        this.manufacturerFilter.innerHTML = '<option value="">Manufacturer</option>';
        this.yearFilter.innerHTML = '<option value="">Registration Year</option>';

        // Populate filter dropdowns with unique values
        const types = [...new Set(this.data.map(item => item.vehicleType))];
        const manufacturers = [...new Set(this.data.map(item => item.manufacturer))];
        const years = [...new Set(this.data.map(item => item.year))].sort();

        console.log('Unique types:', types);
        console.log('Unique manufacturers:', manufacturers);
        console.log('Unique years:', years);

        this.populateSelect(this.vehicleTypeFilter, types);
        this.populateSelect(this.manufacturerFilter, manufacturers);
        this.populateSelect(this.yearFilter, years);
    }

    populateSelect(select, options) {
        options.forEach(option => {
            const el = document.createElement('option');
            el.value = option;
            el.textContent = option;
            select.appendChild(el);
        });
    }

    applyFilters() {
        this.filteredData = this.data.filter(item => {
            const typeMatch = !this.vehicleTypeFilter.value || item.vehicleType === this.vehicleTypeFilter.value;
            const manufacturerMatch = !this.manufacturerFilter.value || item.manufacturer === this.manufacturerFilter.value;
            const yearMatch = !this.yearFilter.value || item.year.toString() === this.yearFilter.value;
            const searchMatch = !this.searchTerm || 
                Object.values(item).some(value => 
                    value.toString().toLowerCase().includes(this.searchTerm)
                );
            
            return typeMatch && manufacturerMatch && yearMatch && searchMatch;
        });

        this.currentPage = 1;
        this.updateDashboard();
    }

    resetFilters() {
        this.vehicleTypeFilter.value = '';
        this.manufacturerFilter.value = '';
        this.yearFilter.value = '';
        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.updateDashboard();
    }

    updateDashboard() {
        this.updateInsights();
        this.updateCharts();
        this.updateTable();
    }

    updateInsights() {
        // Update total vehicles
        document.getElementById('totalVehicles').textContent = this.filteredData.length;

        // Update top manufacturers
        const manufacturerCounts = this.getTopItems(this.filteredData, 'manufacturer', 5);
        const topManufacturersList = document.getElementById('topManufacturers');
        topManufacturersList.innerHTML = manufacturerCounts
            .map(([manufacturer, count]) => `<li>${manufacturer}: ${count}</li>`)
            .join('');

        // Update vehicle types
        const typeCounts = this.getTopItems(this.filteredData, 'vehicleType');
        const vehicleTypesList = document.getElementById('vehicleTypes');
        vehicleTypesList.innerHTML = typeCounts
            .map(([type, count]) => `<li>${type}: ${count}</li>`)
            .join('');
    }

    getTopItems(data, key, limit = undefined) {
        const counts = data.reduce((acc, item) => {
            acc[item[key]] = (acc[item[key]] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    updateCharts() {
        this.updateRegistrationChart();
        this.updateTypeDistributionChart();
        this.updateManufacturerChart();
    }

    updateRegistrationChart() {
        const yearCounts = this.getTopItems(this.filteredData, 'year');
        
        this.createOrUpdateChart('registrationChart', {
            type: 'line',
            data: {
                labels: yearCounts.map(([year]) => year),
                datasets: [{
                    label: 'Registrations',
                    data: yearCounts.map(([, count]) => count),
                    borderColor: '#1E88E5',
                    tension: 0.1
                }]
            }
        });
    }

    updateTypeDistributionChart() {
        const typeCounts = this.getTopItems(this.filteredData, 'vehicleType');
        
        this.createOrUpdateChart('typeDistributionChart', {
            type: 'pie',
            data: {
                labels: typeCounts.map(([type]) => type),
                datasets: [{
                    data: typeCounts.map(([, count]) => count),
                    backgroundColor: ['#1E88E5', '#FFC107', '#4CAF50', '#F44336']
                }]
            }
        });
    }

    updateManufacturerChart() {
        const manufacturerCounts = this.getTopItems(this.filteredData, 'manufacturer', 5);
        
        this.createOrUpdateChart('manufacturerChart', {
            type: 'bar',
            data: {
                labels: manufacturerCounts.map(([manufacturer]) => manufacturer),
                datasets: [{
                    label: 'Vehicles',
                    data: manufacturerCounts.map(([, count]) => count),
                    backgroundColor: '#1E88E5'
                }]
            }
        });
    }

    createOrUpdateChart(chartId, config) {
        console.log(`Creating/updating chart: ${chartId}`);
        const canvas = document.getElementById(chartId);
        
        if (!canvas) {
            console.error(`Canvas element not found: ${chartId}`);
            return;
        }
        
        if (this.charts[chartId]) {
            console.log(`Destroying existing chart: ${chartId}`);
            this.charts[chartId].destroy();
        }
        
        try {
            this.charts[chartId] = new Chart(
                canvas,
                config
            );
            console.log(`Successfully created chart: ${chartId}`);
        } catch (error) {
            console.error(`Error creating chart ${chartId}:`, error);
        }
    }

    updateTable() {
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = startIndex + this.rowsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        const tbody = document.querySelector('#dataTable tbody');
        tbody.innerHTML = pageData.map(item => `
            <tr>
                <td>${item.vehicleType}</td>
                <td>${item.manufacturer}</td>
                <td>${item.year}</td>
                <td>${item.model}</td>
                <td>${item.region}</td>
                <td>$${item.price.toLocaleString()}</td>
                <td>${item.batteryCapacity} kWh</td>
                <td>${item.range} miles</td>
            </tr>
        `).join('');

        this.updatePagination();

        // Add click handlers to rows
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.addEventListener('click', () => {
                const entry = pageData[index];
                this.showModal(entry);
            });
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.rowsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.rowsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTable();
        }
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode');
        this.updateChartTheme();
    }

    updateChartTheme() {
        const theme = this.darkMode ? {
            color: '#ffffff',
            backgroundColor: '#2d2d2d'
        } : {
            color: '#212121',
            backgroundColor: '#ffffff'
        };

        // Update all charts with new theme
        Object.values(this.charts).forEach(chart => {
            chart.options.plugins.legend.labels.color = theme.color;
            chart.options.scales.x.ticks.color = theme.color;
            chart.options.scales.y.ticks.color = theme.color;
            chart.update();
        });
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.applyFilters();
    }

    showModal(entry) {
        this.selectedEntry = entry;
        this.modal.innerHTML = this.generateModalContent(entry);
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.selectedEntry = null;
    }

    generateModalContent(entry) {
        return `
            <div class="modal-content">
                <h2>${entry.manufacturer} ${entry.model}</h2>
                <div class="modal-grid">
                    <div class="modal-item">
                        <label>Vehicle Type</label>
                        <span>${entry.vehicleType}</span>
                    </div>
                    <div class="modal-item">
                        <label>Year</label>
                        <span>${entry.year}</span>
                    </div>
                    <div class="modal-item">
                        <label>Region</label>
                        <span>${entry.region}</span>
                    </div>
                    <div class="modal-item">
                        <label>Price</label>
                        <span>$${entry.price.toLocaleString()}</span>
                    </div>
                    <div class="modal-item">
                        <label>Battery Capacity</label>
                        <span>${entry.batteryCapacity} kWh</span>
                    </div>
                    <div class="modal-item">
                        <label>Range</label>
                        <span>${entry.range} miles</span>
                    </div>
                </div>
                <button class="modal-close" onclick="this.closeModal()">Close</button>
            </div>
        `;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EVDashboard();
}); 