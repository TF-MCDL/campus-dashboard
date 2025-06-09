// Program Analytics Dashboard Module
class ProgramAnalyticsDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <h3>Program Analytics Dashboard</h3>
                <p>Module under development</p>
            </div>
        `;
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.programAnalyticsDashboard = new ProgramAnalyticsDashboard('programAnalyticsDashboard');
});

class ProgramAnalytics {
    constructor() {
        this.charts = {};
        this.filters = {
            year: 2023,
            department: 'All',
            metric: 'enrollment'
        };
        
        this.years = ['2019', '2020', '2021', '2022', '2023'];
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        const container = document.getElementById('programAnalyticsDashboard');
        if (!container) {
            console.error('Program Analytics container not found');
            return;
        }
        this.createLayout();
        this.setupEventListeners();
        this.loadData();
    }

    createLayout() {
        const container = document.getElementById('programAnalyticsDashboard');
        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Filters Row -->
                <div class="row g-2 mb-3">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Academic Year</label>
                            <select class="form-select form-select-sm" id="analyticsYearFilter">
                                ${this.years.map(year => 
                                    `<option value="${year}" ${year === '2023' ? 'selected' : ''}>${year}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Department</label>
                            <select class="form-select form-select-sm" id="analyticsDeptFilter">
                                <option value="All">All Departments</option>
                                ${window.mockData.metadata.departments.map(dept => 
                                    `<option value="${dept}">${dept}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Primary Metric</label>
                            <select class="form-select form-select-sm" id="analyticsMetricFilter">
                                <option value="enrollment">Enrollment</option>
                                <option value="revenue">Revenue</option>
                                <option value="cost">Cost</option>
                                <option value="profitability">Profitability</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- KPI Summary -->
                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Total Programs</h6>
                                        <h4 id="totalPrograms" class="card-title mb-0">-</h4>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted d-block" id="programsTrend">vs prev year</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Avg Enrollment</h6>
                                        <h4 id="avgEnrollment" class="card-title mb-0">-</h4>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted d-block" id="enrollmentTrend">vs prev year</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Avg Revenue</h6>
                                        <h4 id="avgRevenue" class="card-title mb-0">-</h4>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted d-block" id="revenueTrend">vs prev year</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Profitability Index</h6>
                                        <h4 id="profitabilityIndex" class="card-title mb-0">-</h4>
                                    </div>
                                    <div class="text-end">
                                        <small class="text-muted d-block" id="profitabilityTrend">vs prev year</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-2">
                    <!-- Main Chart -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Program Performance</h6>
                                <div style="height: 400px">
                                    <canvas id="performanceChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trend Analysis -->
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Trend Analysis</h6>
                                <div style="height: 400px">
                                    <canvas id="trendChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Program Details -->
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Program Details</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover" id="programDetailsTable">
                                        <thead>
                                            <tr>
                                                <th>Program</th>
                                                <th>Department</th>
                                                <th>Enrollment</th>
                                                <th>Revenue</th>
                                                <th>Cost</th>
                                                <th>Profitability</th>
                                                <th>Trend</th>
                                                <th>Benchmark</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Filter change handlers
        ['Year', 'Dept', 'Metric'].forEach(filter => {
            const element = document.getElementById(`analytics${filter}Filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[filter.toLowerCase()] = e.target.value;
                    if (filter === 'Year') {
                        this.filters[filter.toLowerCase()] = parseInt(e.target.value);
                    }
                    this.updateDashboard();
                });
            }
        });
    }

    loadData() {
        this.programData = this.generateProgramData();
        this.updateDashboard();
    }

    generateProgramData() {
        const programs = [];
        const departments = window.mockData.metadata.departments;
        const programTypes = ['Science', 'Engineering', 'Business', 'Arts', 'Technology'];
        const years = Array.from({length: 5}, (_, i) => 2019 + i);

        departments.forEach(dept => {
            const numPrograms = 2 + Math.floor(Math.random() * 3); // 2-4 programs per department
            
            for (let i = 0; i < numPrograms; i++) {
                const type = programTypes[Math.floor(Math.random() * programTypes.length)];
                const baseEnrollment = 50 + Math.floor(Math.random() * 150);
                const baseRevenue = baseEnrollment * (50000 + Math.random() * 30000);
                const baseCost = baseRevenue * (0.6 + Math.random() * 0.2);
                
                const yearlyData = {};
                years.forEach(year => {
                    const growthFactor = 1 + (Math.random() * 0.2 - 0.1); // -10% to +10%
                    const enrollment = Math.round(baseEnrollment * growthFactor);
                    const revenue = baseRevenue * growthFactor;
                    const cost = baseCost * (growthFactor * 0.9); // Costs grow slower than revenue
                    
                    yearlyData[year] = {
                        enrollment,
                        revenue,
                        cost,
                        profitability: (revenue - cost) / revenue
                    };
                });

                programs.push({
                    name: `${type} Program ${i + 1}`,
                    department: dept,
                    yearlyData
                });
            }
        });

        return programs;
    }

    updateDashboard() {
        this.updateKPIs();
        this.updateCharts();
        this.updateProgramTable();
    }

    updateKPIs() {
        const currentYearData = this.getYearData(this.filters.year);
        const prevYearData = this.getYearData(this.filters.year - 1);

        // Update total programs
        const totalPrograms = currentYearData.length;
        document.getElementById('totalPrograms').textContent = totalPrograms;
        document.getElementById('programsTrend').textContent = 
            this.calculateTrendText(totalPrograms, prevYearData.length);

        // Update average enrollment
        const avgEnrollment = Math.round(
            currentYearData.reduce((sum, p) => sum + p.enrollment, 0) / totalPrograms
        );
        const prevAvgEnrollment = Math.round(
            prevYearData.reduce((sum, p) => sum + p.enrollment, 0) / prevYearData.length
        );
        document.getElementById('avgEnrollment').textContent = avgEnrollment;
        document.getElementById('enrollmentTrend').textContent = 
            this.calculateTrendText(avgEnrollment, prevAvgEnrollment);

        // Update average revenue
        const avgRevenue = 
            currentYearData.reduce((sum, p) => sum + p.revenue, 0) / totalPrograms;
        const prevAvgRevenue = 
            prevYearData.reduce((sum, p) => sum + p.revenue, 0) / prevYearData.length;
        document.getElementById('avgRevenue').textContent = this.formatCurrency(avgRevenue);
        document.getElementById('revenueTrend').textContent = 
            this.calculateTrendText(avgRevenue, prevAvgRevenue);

        // Update profitability index
        const profitabilityIndex = Math.round(
            currentYearData.reduce((sum, p) => sum + p.profitability, 0) / totalPrograms * 100
        );
        const prevProfitabilityIndex = Math.round(
            prevYearData.reduce((sum, p) => sum + p.profitability, 0) / prevYearData.length * 100
        );
        document.getElementById('profitabilityIndex').textContent = `${profitabilityIndex}%`;
        document.getElementById('profitabilityTrend').textContent = 
            this.calculateTrendText(profitabilityIndex, prevProfitabilityIndex);
    }

    updateCharts() {
        this.updatePerformanceChart();
        this.updateTrendChart();
    }

    updatePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const currentYearData = this.getYearData(this.filters.year);
        const metric = this.filters.metric;
        
        const data = currentYearData.map(p => ({
            x: p.enrollment,
            y: p.revenue,
            r: Math.abs(p.profitability) * 20,
            program: p
        }));

        this.charts.performance = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Programs',
                    data: data,
                    backgroundColor: data.map(d => {
                        const p = d.program.profitability;
                        if (p >= 0.2) return 'rgba(40, 167, 69, 0.7)';
                        if (p >= 0) return 'rgba(255, 193, 7, 0.7)';
                        return 'rgba(220, 53, 69, 0.7)';
                    })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Enrollment'
                        },
                        min: 0
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Revenue (AED)'
                        },
                        min: 0
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const p = context.raw.program;
                                return [
                                    `${p.name} (${p.department})`,
                                    `Enrollment: ${p.enrollment}`,
                                    `Revenue: ${this.formatCurrency(p.revenue)}`,
                                    `Profitability: ${Math.round(p.profitability * 100)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    updateTrendChart() {
        const ctx = document.getElementById('trendChart');
        
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        const years = Array.from({length: 5}, (_, i) => this.filters.year - 4 + i);
        const metric = this.filters.metric;
        
        const datasets = [];
        if (this.filters.department === 'All') {
            // Show average by department
            const departments = [...new Set(this.programData.map(p => p.department))];
            departments.forEach(dept => {
                const data = years.map(year => {
                    const yearData = this.getYearData(year).filter(p => p.department === dept);
                    return yearData.reduce((sum, p) => sum + p[metric], 0) / yearData.length;
                });

                datasets.push({
                    label: dept,
                    data: data,
                    borderColor: this.getRandomColor(),
                    tension: 0.4
                });
            });
        } else {
            // Show individual programs for selected department
            const programs = this.programData.filter(p => p.department === this.filters.department);
            programs.forEach(program => {
                const data = years.map(year => program.yearlyData[year][metric]);
                
                datasets.push({
                    label: program.name,
                    data: data,
                    borderColor: this.getRandomColor(),
                    tension: 0.4
                });
            });
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: this.getMetricLabel(metric)
                        }
                    }
                }
            }
        });
    }

    updateProgramTable() {
        const tbody = document.querySelector('#programDetailsTable tbody');
        tbody.innerHTML = '';

        const currentYearData = this.getYearData(this.filters.year);
        const prevYearData = this.getYearData(this.filters.year - 1);
        
        const nationalAvg = {
            enrollment: currentYearData.reduce((sum, p) => sum + p.enrollment, 0) / currentYearData.length,
            revenue: currentYearData.reduce((sum, p) => sum + p.revenue, 0) / currentYearData.length,
            cost: currentYearData.reduce((sum, p) => sum + p.cost, 0) / currentYearData.length,
            profitability: currentYearData.reduce((sum, p) => sum + p.profitability, 0) / currentYearData.length
        };

        currentYearData.forEach(program => {
            const prevYear = prevYearData.find(p => 
                p.name === program.name && p.department === program.department
            );

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${program.name}</td>
                <td>${program.department}</td>
                <td>
                    ${program.enrollment}
                    <small class="text-muted d-block">
                        ${this.calculateTrendText(program.enrollment, prevYear?.enrollment)}
                    </small>
                </td>
                <td>
                    ${this.formatCurrency(program.revenue)}
                    <small class="text-muted d-block">
                        ${this.calculateTrendText(program.revenue, prevYear?.revenue)}
                    </small>
                </td>
                <td>
                    ${this.formatCurrency(program.cost)}
                    <small class="text-muted d-block">
                        ${this.calculateTrendText(program.cost, prevYear?.cost)}
                    </small>
                </td>
                <td>
                    ${Math.round(program.profitability * 100)}%
                    <small class="text-muted d-block">
                        ${this.calculateTrendText(program.profitability, prevYear?.profitability)}
                    </small>
                </td>
                <td>
                    <div class="sparkline">
                        ${this.generateSparkline(program)}
                    </div>
                </td>
                <td>
                    ${this.generateBenchmarkIndicator(program, nationalAvg)}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getYearData(year) {
        return this.programData
            .filter(p => this.filters.department === 'All' || p.department === this.filters.department)
            .map(p => ({
                name: p.name,
                department: p.department,
                ...p.yearlyData[year]
            }));
    }

    calculateTrendText(current, previous) {
        if (!previous) return 'N/A';
        const diff = ((current - previous) / previous) * 100;
        return diff > 0 ? 
            `+${diff.toFixed(1)}%` : 
            `${diff.toFixed(1)}%`;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    getMetricLabel(metric) {
        switch (metric) {
            case 'enrollment': return 'Enrollment';
            case 'revenue': return 'Revenue (AED)';
            case 'cost': return 'Cost (AED)';
            case 'profitability': return 'Profitability (%)';
            default: return metric;
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    generateSparkline(program) {
        // Ensure program data exists and has enrollment data
        if (!program || !program.yearlyData) {
            return 'N/A';
        }

        // Create array of enrollment values, defaulting to 0 if data is missing
        const values = this.years.map(year => {
            return (program.yearlyData[year]?.enrollment || 0);
        });

        // Generate sparkline only if we have valid data
        if (values.some(v => v !== 0)) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 30;
            const ctx = canvas.getContext('2d');
            
            const max = Math.max(...values);
            const min = Math.min(...values);
            const range = max - min;
            const height = canvas.height - 4;
            
            // Draw sparkline
            ctx.beginPath();
            ctx.strokeStyle = '#0d6efd';
            ctx.lineWidth = 1.5;
            
            values.forEach((value, i) => {
                const x = (i / (values.length - 1)) * (canvas.width - 4) + 2;
                const y = height - (((value - min) / (range || 1)) * height) + 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            return canvas.toDataURL();
        }
        
        return 'N/A';
    }

    generateBenchmarkIndicator(program, nationalAvg) {
        const metrics = ['enrollment', 'revenue', 'cost', 'profitability'];
        const scores = metrics.map(metric => {
            const value = program[metric];
            const avg = nationalAvg[metric];
            return value >= avg ? 1 : 0;
        });
        
        const totalScore = scores.reduce((a, b) => a + b, 0);
        
        let color, text;
        if (totalScore >= 3) {
            color = 'success';
            text = 'Above Average';
        } else if (totalScore >= 2) {
            color = 'warning';
            text = 'Average';
        } else {
            color = 'danger';
            text = 'Below Average';
        }

        return `<span class="badge bg-${color}">${text}</span>`;
    }
}

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.programAnalytics = new ProgramAnalytics();
}); 