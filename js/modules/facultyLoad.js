// Faculty Load Summary Dashboard Module
class FacultyLoadDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.charts = {};
        this.filters = {
            year: 2023,
            term: 'Fall',
            department: 'all',
            program: 'all',
            facultyType: 'all'
        };
        this.terms = ['Fall', 'Spring', 'Summer'];
        this.initialize();
    }

    initialize() {
        this.createLayout();
        this.setupFilters();
        this.createCharts();
        this.updateDashboard();
    }

    createLayout() {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <!-- Filters Section -->
                <div class="filters-section">
                    <div class="row">
                        <div class="col-md-2">
                            <div class="filter-group">
                                <label class="filter-label">Year</label>
                                <select class="form-select" id="yearFilter"></select>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="filter-group">
                                <label class="filter-label">Term</label>
                                <select class="form-select" id="termFilter"></select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="filter-group">
                                <label class="filter-label">Department</label>
                                <select class="form-select" id="departmentFilter"></select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="filter-group">
                                <label class="filter-label">Program</label>
                                <select class="form-select" id="programFilter"></select>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="filter-group">
                                <label class="filter-label">Faculty Type</label>
                                <select class="form-select" id="facultyTypeFilter"></select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Alerts Section -->
                <div id="alertsSection" class="mb-4"></div>

                <!-- KPI Cards -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <div class="kpi-label">Total Current FTE</div>
                            <div class="kpi-value" id="totalFTE">-</div>
                            <div class="kpi-trend" id="fteTrend"></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <div class="kpi-label">Required FTE</div>
                            <div class="kpi-value" id="requiredFTE">-</div>
                            <div class="kpi-trend" id="requiredFTETrend"></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card warning">
                            <div class="kpi-label">Overloaded Faculty</div>
                            <div class="kpi-value" id="overloadedCount">-</div>
                            <div class="kpi-detail" id="overloadedDetail"></div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card danger">
                            <div class="kpi-label">Underloaded Faculty</div>
                            <div class="kpi-value" id="underloadedCount">-</div>
                            <div class="kpi-detail" id="underloadedDetail"></div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="chart-container">
                            <canvas id="fteTrendChart"></canvas>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="chart-container">
                            <canvas id="departmentComparisonChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-md-12">
                        <div class="chart-container">
                            <div id="loadHeatmap"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Program-Level Analysis -->
                <div class="row mt-4">
                    <div class="col-md-12">
                        <div class="chart-container">
                            <h4>Program-Level FTE Analysis</h4>
                            <div class="table-responsive">
                                <table id="programAnalysisTable" class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Program</th>
                                            <th>Current FTE</th>
                                            <th>Required FTE</th>
                                            <th>Gap</th>
                                            <th>Status</th>
                                            <th>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupFilters() {
        // Year Filter
        const yearFilter = document.getElementById('yearFilter');
        mockData.facultyLoad.forEach(data => {
            const option = document.createElement('option');
            option.value = data.year;
            option.textContent = data.year;
            if (data.year === this.filters.year) option.selected = true;
            yearFilter.appendChild(option);
        });

        // Term Filter
        const termFilter = document.getElementById('termFilter');
        this.terms.forEach(term => {
            const option = document.createElement('option');
            option.value = term;
            option.textContent = term;
            if (term === this.filters.term) option.selected = true;
            termFilter.appendChild(option);
        });

        // Department Filter
        const departmentFilter = document.getElementById('departmentFilter');
        const departments = ['all', ...mockData.metadata.departments];
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept === 'all' ? 'All Departments' : dept;
            departmentFilter.appendChild(option);
        });

        // Program Filter
        this.updateProgramFilter();

        // Faculty Type Filter
        const facultyTypeFilter = document.getElementById('facultyTypeFilter');
        const types = ['all', ...mockData.metadata.facultyTypes];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type === 'all' ? 'All Types' : type;
            facultyTypeFilter.appendChild(option);
        });

        // Event Listeners
        yearFilter.addEventListener('change', (e) => {
            this.filters.year = parseInt(e.target.value);
            this.updateDashboard();
        });

        termFilter.addEventListener('change', (e) => {
            this.filters.term = e.target.value;
            this.updateDashboard();
        });

        departmentFilter.addEventListener('change', (e) => {
            this.filters.department = e.target.value;
            this.filters.program = 'all'; // Reset program when department changes
            this.updateProgramFilter();
            this.updateDashboard();
        });

        document.getElementById('programFilter').addEventListener('change', (e) => {
            this.filters.program = e.target.value;
            this.updateDashboard();
        });

        facultyTypeFilter.addEventListener('change', (e) => {
            this.filters.facultyType = e.target.value;
            this.updateDashboard();
        });
    }

    updateProgramFilter() {
        const programFilter = document.getElementById('programFilter');
        programFilter.innerHTML = ''; // Clear existing options

        // Add "All Programs" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Programs';
        programFilter.appendChild(allOption);

        // Add department-specific programs
        if (this.filters.department !== 'all') {
            const programs = mockData.metadata.programs[this.filters.department] || [];
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program;
                option.textContent = program;
                programFilter.appendChild(option);
            });
        }
    }

    updateAlerts(yearData) {
        const alertsSection = document.getElementById('alertsSection');
        const alerts = [];

        // Generate alerts based on data
        yearData.departments.forEach(dept => {
            const ratio = dept.currentFTE / dept.requiredFTE;
            if (ratio < 0.8) {
                alerts.push({
                    type: 'danger',
                    message: `Critical understaffing in ${dept.department}: Only ${Math.round(ratio * 100)}% of required FTE`
                });
            } else if (ratio < 0.9) {
                alerts.push({
                    type: 'warning',
                    message: `Potential understaffing in ${dept.department}: ${Math.round(ratio * 100)}% of required FTE`
                });
            } else if (ratio > 1.2) {
                alerts.push({
                    type: 'warning',
                    message: `Overstaffing in ${dept.department}: ${Math.round(ratio * 100)}% of required FTE`
                });
            }
        });

        // Display alerts
        if (alerts.length > 0) {
            alertsSection.innerHTML = alerts.map(alert => `
                <div class="alert alert-${alert.type}" role="alert">
                    ${alert.message}
                </div>
            `).join('');
        } else {
            alertsSection.innerHTML = `
                <div class="alert alert-success" role="alert">
                    All departments are adequately staffed.
                </div>
            `;
        }
    }

    updateProgramAnalysis(yearData) {
        const tableBody = document.querySelector('#programAnalysisTable tbody');
        tableBody.innerHTML = '';

        Object.entries(mockData.metadata.programs).forEach(([dept, programs]) => {
            if (this.filters.department === 'all' || this.filters.department === dept) {
                programs.forEach(program => {
                    if (this.filters.program === 'all' || this.filters.program === program) {
                        // Generate mock program-level data
                        const currentFTE = (Math.random() * 10 + 5).toFixed(1);
                        const requiredFTE = (Math.random() * 10 + 5).toFixed(1);
                        const gap = (currentFTE - requiredFTE).toFixed(1);
                        const trend = Math.random() > 0.5 ? 'up' : 'down';
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${program} (${dept})</td>
                            <td>${currentFTE}</td>
                            <td>${requiredFTE}</td>
                            <td class="${gap < 0 ? 'text-danger' : 'text-success'}">${gap}</td>
                            <td>${this.getStatusBadge(gap)}</td>
                            <td>${this.getTrendArrow(trend)}</td>
                        `;
                        tableBody.appendChild(row);
                    }
                });
            }
        });
    }

    getStatusBadge(gap) {
        if (gap < -2) return '<span class="badge bg-danger">Understaffed</span>';
        if (gap < 0) return '<span class="badge bg-warning">Slight Shortage</span>';
        if (gap > 2) return '<span class="badge bg-warning">Overstaffed</span>';
        return '<span class="badge bg-success">Optimal</span>';
    }

    getTrendArrow(trend) {
        return trend === 'up' 
            ? '<span class="text-success">↑</span>'
            : '<span class="text-danger">↓</span>';
    }

    updateDashboard() {
        const yearData = mockData.facultyLoad.find(d => d.year === this.filters.year);
        if (!yearData) return;

        this.updateKPIs(yearData);
        this.updateFTETrendChart();
        this.updateDepartmentComparisonChart(yearData);
        this.updateHeatmap(yearData);
        this.updateAlerts(yearData);
        this.updateProgramAnalysis(yearData);
    }

    updateKPIs(yearData) {
        let filteredData = yearData.departments;
        if (this.filters.department !== 'all') {
            filteredData = filteredData.filter(d => d.department === this.filters.department);
        }

        const totalFTE = filteredData.reduce((sum, dept) => sum + dept.currentFTE, 0);
        const requiredFTE = filteredData.reduce((sum, dept) => sum + dept.requiredFTE, 0);
        const overloaded = filteredData.reduce((sum, dept) => sum + dept.overloaded, 0);
        const underloaded = filteredData.reduce((sum, dept) => sum + dept.underloaded, 0);

        document.getElementById('totalFTE').textContent = totalFTE.toFixed(1);
        document.getElementById('requiredFTE').textContent = requiredFTE.toFixed(1);
        document.getElementById('overloadedCount').textContent = overloaded;
        document.getElementById('underloadedCount').textContent = underloaded;
    }

    updateFTETrendChart() {
        const data = mockData.facultyLoad;
        const labels = data.map(d => d.year);
        
        let currentFTE = data.map(d => {
            let total = 0;
            d.departments.forEach(dept => {
                if (this.filters.department === 'all' || this.filters.department === dept.department) {
                    total += dept.currentFTE;
                }
            });
            return total;
        });

        let requiredFTE = data.map(d => {
            let total = 0;
            d.departments.forEach(dept => {
                if (this.filters.department === 'all' || this.filters.department === dept.department) {
                    total += dept.requiredFTE;
                }
            });
            return total;
        });

        this.charts.fteTrend.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Current FTE',
                    data: currentFTE,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true
                },
                {
                    label: 'Required FTE',
                    data: requiredFTE,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true
                }
            ]
        };
        this.charts.fteTrend.update();
    }

    updateDepartmentComparisonChart(yearData) {
        let departments = this.filters.department === 'all' 
            ? yearData.departments 
            : yearData.departments.filter(d => d.department === this.filters.department);

        const labels = departments.map(d => d.department);
        const currentFTE = departments.map(d => d.currentFTE);
        const requiredFTE = departments.map(d => d.requiredFTE);

        this.charts.deptComparison.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Current FTE',
                    data: currentFTE,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)'
                },
                {
                    label: 'Required FTE',
                    data: requiredFTE,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)'
                }
            ]
        };
        this.charts.deptComparison.update();
    }

    updateHeatmap(yearData) {
        const departments = this.filters.department === 'all'
            ? yearData.departments
            : yearData.departments.filter(d => d.department === this.filters.department);

        const data = departments.map(d => ({
            department: d.department,
            load: (d.currentFTE / d.requiredFTE) * 100
        }));

        const svg = this.charts.heatmap.svg;
        const width = this.charts.heatmap.width;
        const height = this.charts.heatmap.height;

        // Clear previous content
        svg.selectAll('*').remove();

        // Create color scale
        const colorScale = d3.scaleSequential()
            .domain([50, 150])
            .interpolator(d3.interpolateRdYlBu);

        // Create rectangles
        const rectHeight = height / data.length;
        
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * rectHeight)
            .attr('width', width)
            .attr('height', rectHeight)
            .style('fill', d => colorScale(d.load));

        // Add department labels
        svg.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('x', -10)
            .attr('y', (d, i) => i * rectHeight + rectHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(d => d.department);

        // Add load percentage labels
        svg.selectAll('.load-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'load-label')
            .attr('x', width / 2)
            .attr('y', (d, i) => i * rectHeight + rectHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', 'white')
            .text(d => `${Math.round(d.load)}%`);

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Faculty Load Intensity (Current/Required FTE %)');
    }

    createCharts() {
        // FTE Trend Chart
        const fteTrendCtx = document.getElementById('fteTrendChart').getContext('2d');
        this.charts.fteTrend = new Chart(fteTrendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'FTE Trends Over Time'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Department Comparison Chart
        const deptCompCtx = document.getElementById('departmentComparisonChart').getContext('2d');
        this.charts.deptComparison = new Chart(deptCompCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Current vs Required FTE by Department'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Initialize Heat Map
        this.createHeatmap();
    }

    createHeatmap() {
        const heatmapContainer = document.getElementById('loadHeatmap');
        const margin = {top: 30, right: 30, bottom: 50, left: 100};
        const width = heatmapContainer.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select('#loadHeatmap')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        this.charts.heatmap = {
            svg: svg,
            width: width,
            height: height
        };
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.facultyLoadDashboard = new FacultyLoadDashboard('facultyLoadDashboard');
}); 