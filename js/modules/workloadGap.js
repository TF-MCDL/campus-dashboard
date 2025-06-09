// Workload Gap Report Module
class WorkloadGapDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <h3>Workload Gap Report</h3>
                <p>Module under development</p>
            </div>
        `;
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workloadGapDashboard = new WorkloadGapDashboard('workloadGapDashboard');
});

class WorkloadGap {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            year: 2023,
            department: 'All',
            term: 'Fall'
        };
        this.equityThresholds = {
            low: 0.85,
            high: 1.15
        };
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.destroyCharts();
        this.createLayout();
        this.setupEventListeners();
        this.loadData();
    }

    createLayout() {
        const container = document.getElementById('workloadGapDashboard');
        if (!container) {
            console.error('Workload Gap container not found');
            return;
        }

        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Header with Purpose - Fixed Height -->
                <div class="row mb-3" style="min-height: 60px">
                    <div class="col">
                        <h5 class="mb-1">Workload Gap Report</h5>
                        <p class="text-muted small mb-0">Identify shortages, overloads, and workload imbalances across departments</p>
                    </div>
                </div>

                <!-- Filters Row - Fixed Height -->
                <div class="row g-2 mb-3" style="min-height: 70px">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Academic Year</label>
                            <select class="form-select form-select-sm" id="workloadYearFilter">
                                <option value="2023" selected>2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Department</label>
                            <select class="form-select form-select-sm" id="workloadDeptFilter">
                                <option value="All">All Departments</option>
                                <option value="Business">Business & Economics</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Arts">Arts & Sciences</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Term</label>
                            <select class="form-select form-select-sm" id="workloadTermFilter">
                                <option value="Fall">Fall</option>
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Summary Stats - Fixed Height -->
                <div class="row g-2 mb-3" style="min-height: 100px">
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Equity Index</h6>
                                        <h4 id="equityIndex" class="card-title mb-0">-</h4>
                                    </div>
                                    <div id="equityIndicator" class="badge bg-success">Balanced</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Overloaded Faculty</h6>
                                        <h4 id="overloadCount" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-danger">Above Target</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Underloaded Faculty</h6>
                                        <h4 id="underloadCount" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-warning">Below Target</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Total Gap</h6>
                                        <h4 id="totalGap" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-muted">Credit Hours</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row - Fixed Height -->
                <div class="row g-2 mb-3" style="height: 400px">
                    <!-- Stacked Bar Chart -->
                    <div class="col-md-8">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Workload Distribution by Department</h6>
                                <div style="height: calc(100% - 30px)">
                                    <canvas id="workloadDistChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Pie Charts -->
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Workload Balance</h6>
                                <div style="height: calc(100% - 30px)">
                                    <canvas id="workloadBalanceChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Drill-Down Table - Fixed Height -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center mb-2" style="min-height: 31px">
                                    <h6 class="card-title mb-0">Faculty Workload Details</h6>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-secondary" id="exportWorkloadBtn">
                                            Export Report
                                        </button>
                                    </div>
                                </div>
                                <div class="table-responsive" style="height: 300px; overflow-y: auto;">
                                    <table class="table table-sm table-hover" id="workloadTable">
                                        <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                                            <tr>
                                                <th>Faculty</th>
                                                <th>Department</th>
                                                <th>Current Load</th>
                                                <th>Target Load</th>
                                                <th>Gap</th>
                                                <th>Status</th>
                                                <th>Alerts</th>
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
        ['Year', 'Dept', 'Term'].forEach(filter => {
            const element = document.getElementById(`workload${filter}Filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[filter.toLowerCase()] = e.target.value;
                    this.updateDashboard();
                });
            }
        });

        // Export button handler
        const exportBtn = document.getElementById('exportWorkloadBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
    }

    destroyCharts() {
        Object.entries(this.charts).forEach(([key, chart]) => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
                delete this.charts[key];
            }
        });

        ['workloadDistChart', 'workloadBalanceChart'].forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const parent = canvas.parentNode;
                const newCanvas = document.createElement('canvas');
                newCanvas.id = canvasId;
                newCanvas.style.height = '300px';
                parent.removeChild(canvas);
                parent.appendChild(newCanvas);
            }
        });

        this.charts = {};
    }

    loadData() {
        // Simulated data - replace with actual API call
        this.workloadData = {
            departments: ['Business', 'Engineering', 'Medicine', 'Arts'],
            faculty: [
                { name: 'Dr. Smith', department: 'Business', currentLoad: 12, targetLoad: 9, alerts: ['High Research Load'] },
                { name: 'Dr. Johnson', department: 'Engineering', currentLoad: 6, targetLoad: 9, alerts: ['Administrative Duties'] },
                { name: 'Dr. Williams', department: 'Medicine', currentLoad: 9, targetLoad: 9, alerts: [] },
                { name: 'Dr. Brown', department: 'Arts', currentLoad: 15, targetLoad: 9, alerts: ['Overload Warning'] }
            ]
        };
        this.updateDashboard();
    }

    updateDashboard() {
        this.updateKPIs();
        this.updateWorkloadDistChart();
        this.updateWorkloadBalanceChart();
        this.updateWorkloadTable();
    }

    updateKPIs() {
        const data = this.workloadData.faculty;
        const overloaded = data.filter(f => f.currentLoad > f.targetLoad * this.equityThresholds.high).length;
        const underloaded = data.filter(f => f.currentLoad < f.targetLoad * this.equityThresholds.low).length;
        const totalGap = data.reduce((sum, f) => sum + Math.abs(f.currentLoad - f.targetLoad), 0);
        const equityIndex = 1 - (totalGap / (data.reduce((sum, f) => sum + f.targetLoad, 0)));

        document.getElementById('overloadCount').textContent = overloaded;
        document.getElementById('underloadCount').textContent = underloaded;
        document.getElementById('totalGap').textContent = totalGap.toFixed(1);
        document.getElementById('equityIndex').textContent = equityIndex.toFixed(2);

        const indicator = document.getElementById('equityIndicator');
        if (equityIndex >= 0.9) {
            indicator.className = 'badge bg-success';
            indicator.textContent = 'Balanced';
        } else if (equityIndex >= 0.8) {
            indicator.className = 'badge bg-warning';
            indicator.textContent = 'Moderate';
        } else {
            indicator.className = 'badge bg-danger';
            indicator.textContent = 'Imbalanced';
        }
    }

    updateWorkloadDistChart() {
        const ctx = document.getElementById('workloadDistChart');
        if (!ctx) return;

        // Set canvas to fill container while maintaining aspect ratio
        ctx.style.width = '100%';
        ctx.style.height = '100%';

        const departments = [...new Set(this.workloadData.faculty.map(f => f.department))];
        const overloadData = departments.map(dept => 
            this.workloadData.faculty
                .filter(f => f.department === dept && f.currentLoad > f.targetLoad)
                .reduce((sum, f) => sum + (f.currentLoad - f.targetLoad), 0)
        );
        const underloadData = departments.map(dept => 
            this.workloadData.faculty
                .filter(f => f.department === dept && f.currentLoad < f.targetLoad)
                .reduce((sum, f) => sum + (f.targetLoad - f.currentLoad), 0)
        );

        this.charts.workloadDist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: departments,
                datasets: [{
                    label: 'Overload',
                    data: overloadData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Underload',
                    data: underloadData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Credit Hours'
                        }
                    }
                }
            }
        });
    }

    updateWorkloadBalanceChart() {
        const ctx = document.getElementById('workloadBalanceChart');
        if (!ctx) return;

        // Set canvas to fill container while maintaining aspect ratio
        ctx.style.width = '100%';
        ctx.style.height = '100%';

        const data = this.workloadData.faculty;
        const balanced = data.filter(f => 
            f.currentLoad >= f.targetLoad * this.equityThresholds.low && 
            f.currentLoad <= f.targetLoad * this.equityThresholds.high
        ).length;
        const overloaded = data.filter(f => f.currentLoad > f.targetLoad * this.equityThresholds.high).length;
        const underloaded = data.filter(f => f.currentLoad < f.targetLoad * this.equityThresholds.low).length;

        this.charts.workloadBalance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Balanced', 'Overloaded', 'Underloaded'],
                datasets: [{
                    data: [balanced, overloaded, underloaded],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateWorkloadTable() {
        const tableBody = document.querySelector('#workloadTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = this.workloadData.faculty
            .filter(f => this.currentFilters.department === 'All' || f.department === this.currentFilters.department)
            .map(faculty => {
                const gap = faculty.currentLoad - faculty.targetLoad;
                const status = gap > 0 ? 'Overloaded' : gap < 0 ? 'Underloaded' : 'Balanced';
                const statusClass = gap > 0 ? 'danger' : gap < 0 ? 'warning' : 'success';

                return `
                    <tr>
                        <td>${faculty.name}</td>
                        <td>${faculty.department}</td>
                        <td>${faculty.currentLoad}</td>
                        <td>${faculty.targetLoad}</td>
                        <td class="text-${statusClass}">${gap > 0 ? '+' : ''}${gap}</td>
                        <td><span class="badge bg-${statusClass}">${status}</span></td>
                        <td>${faculty.alerts.map(alert => 
                            `<span class="badge bg-secondary">${alert}</span>`
                        ).join(' ')}</td>
                    </tr>
                `;
            }).join('');
    }

    exportReport() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `workload-gap-report-${timestamp}.csv`;
        
        const headers = ['Faculty', 'Department', 'Current Load', 'Target Load', 'Gap', 'Status', 'Alerts'];
        const rows = this.workloadData.faculty.map(f => [
            f.name,
            f.department,
            f.currentLoad,
            f.targetLoad,
            f.currentLoad - f.targetLoad,
            f.currentLoad > f.targetLoad ? 'Overloaded' : f.currentLoad < f.targetLoad ? 'Underloaded' : 'Balanced',
            f.alerts.join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the module
document.addEventListener('DOMContentLoaded', () => {
    new WorkloadGap();
}); 