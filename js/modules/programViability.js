// Program Viability Matrix Module
class ProgramViability {
    constructor() {
        this.chart = null;
        this.filters = {
            year: 2023,
            department: 'All',
            level: 'All'
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        const container = document.getElementById('programViabilityDashboard');
        if (!container) {
            console.error('Program Viability container not found');
            return;
        }
        this.createLayout();
        this.setupEventListeners();
        this.loadData();
    }

    createLayout() {
        const container = document.getElementById('programViabilityDashboard');
        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Filters Row -->
                <div class="row g-2 mb-3">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Academic Year</label>
                            <select class="form-select form-select-sm" id="viabilityYearFilter">
                                ${window.mockData.facultyLoad.map(d => 
                                    `<option value="${d.year}" ${d.year === 2023 ? 'selected' : ''}>${d.year}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Department</label>
                            <select class="form-select form-select-sm" id="viabilityDeptFilter">
                                <option value="All">All Departments</option>
                                ${window.mockData.metadata.departments.map(dept => 
                                    `<option value="${dept}">${dept}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label small mb-1">Degree Level</label>
                            <select class="form-select form-select-sm" id="viabilityLevelFilter">
                                <option value="All">All Levels</option>
                                <option value="Bachelors">Bachelors</option>
                                <option value="Masters">Masters</option>
                                <option value="Doctorate">Doctorate</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row g-2">
                    <!-- Bubble Chart -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Program Viability Matrix</h6>
                                <div style="height: 500px">
                                    <canvas id="viabilityBubbleChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Program Details -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Program Details</h6>
                                <div id="programDetails">
                                    <p class="text-muted small">Click a program bubble to view details</p>
                                </div>
                            </div>
                        </div>

                        <!-- Risk Distribution -->
                        <div class="card mt-2">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Risk Distribution</h6>
                                <div class="d-flex justify-content-between mb-2">
                                    <div>
                                        <span class="badge bg-success">Viable</span>
                                        <span id="viableCount" class="ms-1">0</span>
                                    </div>
                                    <div>
                                        <span class="badge bg-warning">Watch</span>
                                        <span id="watchCount" class="ms-1">0</span>
                                    </div>
                                    <div>
                                        <span class="badge bg-danger">At Risk</span>
                                        <span id="riskCount" class="ms-1">0</span>
                                    </div>
                                </div>
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-success" id="viableBar" style="width: 0%"></div>
                                    <div class="progress-bar bg-warning" id="watchBar" style="width: 0%"></div>
                                    <div class="progress-bar bg-danger" id="riskBar" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Program List -->
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Program List</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover" id="programTable">
                                        <thead>
                                            <tr>
                                                <th>Program</th>
                                                <th>Department</th>
                                                <th>Level</th>
                                                <th>Enrollment</th>
                                                <th>Employability</th>
                                                <th>Cost Efficiency</th>
                                                <th>Status</th>
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
        ['Year', 'Dept', 'Level'].forEach(filter => {
            const element = document.getElementById(`viability${filter}Filter`);
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

        // Chart click handler
        document.getElementById('viabilityBubbleChart')?.addEventListener('click', (e) => {
            const points = this.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (points.length) {
                const point = points[0];
                const data = this.chart.data.datasets[point.datasetIndex].data[point.index];
                this.showProgramDetails(data);
            }
        });
    }

    loadData() {
        // Generate mock program data
        this.programData = this.generateProgramData();
        this.updateDashboard();
    }

    generateProgramData() {
        const programs = [];
        const departments = window.mockData.metadata.departments;
        const levels = ['Bachelors', 'Masters', 'Doctorate'];
        const programTypes = ['Science', 'Engineering', 'Business', 'Arts', 'Technology'];

        departments.forEach(dept => {
            const numPrograms = 2 + Math.floor(Math.random() * 3); // 2-4 programs per department
            
            for (let i = 0; i < numPrograms; i++) {
                const level = levels[Math.floor(Math.random() * levels.length)];
                const type = programTypes[Math.floor(Math.random() * programTypes.length)];
                
                const enrollment = 20 + Math.floor(Math.random() * 180); // 20-200 students
                const employability = 40 + Math.floor(Math.random() * 55); // 40-95%
                const costEfficiency = 30 + Math.floor(Math.random() * 60); // 30-90%

                programs.push({
                    name: `${level} in ${type}`,
                    department: dept,
                    level,
                    enrollment,
                    employability,
                    costEfficiency,
                    status: this.calculateStatus(enrollment, employability, costEfficiency)
                });
            }
        });

        return programs;
    }

    calculateStatus(enrollment, employability, costEfficiency) {
        const score = (enrollment / 200 + employability / 100 + costEfficiency / 100) / 3;
        if (score >= 0.7) return 'Viable';
        if (score >= 0.4) return 'Watch';
        return 'At Risk';
    }

    updateDashboard() {
        const filteredData = this.programData.filter(p => 
            (this.filters.department === 'All' || p.department === this.filters.department) &&
            (this.filters.level === 'All' || p.level === this.filters.level)
        );

        this.updateBubbleChart(filteredData);
        this.updateProgramTable(filteredData);
        this.updateRiskDistribution(filteredData);
    }

    updateBubbleChart(data) {
        const ctx = document.getElementById('viabilityBubbleChart');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = data.map(p => ({
            x: p.enrollment,
            y: p.employability,
            r: p.costEfficiency / 10,
            ...p
        }));

        this.chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Programs',
                    data: chartData,
                    backgroundColor: chartData.map(d => {
                        switch (d.status) {
                            case 'Viable': return 'rgba(40, 167, 69, 0.7)';
                            case 'Watch': return 'rgba(255, 193, 7, 0.7)';
                            default: return 'rgba(220, 53, 69, 0.7)';
                        }
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
                        min: 0,
                        max: 200
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Employability (%)'
                        },
                        min: 0,
                        max: 100
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const d = context.raw;
                                return [
                                    `${d.name} (${d.department})`,
                                    `Enrollment: ${d.enrollment}`,
                                    `Employability: ${d.employability}%`,
                                    `Cost Efficiency: ${d.costEfficiency}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    updateProgramTable(data) {
        const tbody = document.querySelector('#programTable tbody');
        tbody.innerHTML = '';

        data.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.department}</td>
                <td>${p.level}</td>
                <td>${p.enrollment}</td>
                <td>${p.employability}%</td>
                <td>${p.costEfficiency}%</td>
                <td>
                    <span class="badge bg-${p.status === 'Viable' ? 'success' : 
                        p.status === 'Watch' ? 'warning' : 'danger'}">
                        ${p.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateRiskDistribution(data) {
        const counts = {
            Viable: data.filter(p => p.status === 'Viable').length,
            Watch: data.filter(p => p.status === 'Watch').length,
            'At Risk': data.filter(p => p.status === 'At Risk').length
        };

        const total = data.length;
        
        // Update counts
        document.getElementById('viableCount').textContent = counts.Viable;
        document.getElementById('watchCount').textContent = counts.Watch;
        document.getElementById('riskCount').textContent = counts['At Risk'];

        // Update progress bars
        document.getElementById('viableBar').style.width = `${(counts.Viable / total) * 100}%`;
        document.getElementById('watchBar').style.width = `${(counts.Watch / total) * 100}%`;
        document.getElementById('riskBar').style.width = `${(counts['At Risk'] / total) * 100}%`;
    }

    showProgramDetails(program) {
        const details = document.getElementById('programDetails');
        details.innerHTML = `
            <h5 class="mb-3">${program.name}</h5>
            <div class="mb-2">
                <small class="text-muted">Department</small>
                <div>${program.department}</div>
            </div>
            <div class="mb-2">
                <small class="text-muted">Level</small>
                <div>${program.level}</div>
            </div>
            <div class="mb-2">
                <small class="text-muted">Status</small>
                <div>
                    <span class="badge bg-${program.status === 'Viable' ? 'success' : 
                        program.status === 'Watch' ? 'warning' : 'danger'}">
                        ${program.status}
                    </span>
                </div>
            </div>
            <hr>
            <div class="mb-2">
                <small class="text-muted">Enrollment</small>
                <div class="progress mt-1" style="height: 15px;">
                    <div class="progress-bar bg-primary" style="width: ${(program.enrollment / 200) * 100}%">
                        ${program.enrollment} students
                    </div>
                </div>
            </div>
            <div class="mb-2">
                <small class="text-muted">Employability</small>
                <div class="progress mt-1" style="height: 15px;">
                    <div class="progress-bar bg-success" style="width: ${program.employability}%">
                        ${program.employability}%
                    </div>
                </div>
            </div>
            <div class="mb-2">
                <small class="text-muted">Cost Efficiency</small>
                <div class="progress mt-1" style="height: 15px;">
                    <div class="progress-bar bg-info" style="width: ${program.costEfficiency}%">
                        ${program.costEfficiency}%
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.programViability = new ProgramViability();
}); 