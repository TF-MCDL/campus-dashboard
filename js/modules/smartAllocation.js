// Smart Allocation Suggestions Module
class SmartAllocationDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <h3>Smart Allocation Suggestions</h3>
                <p>Module under development</p>
            </div>
        `;
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.smartAllocationDashboard = new SmartAllocationDashboard('smartAllocationDashboard');
});

class SmartAllocation {
    constructor() {
        this.charts = {};
        this.currentMetrics = {
            utilization: 65,
            coverage: 75
        };
        this.optimizedMetrics = {
            utilization: 85,
            coverage: 90
        };
        this.currentFilters = {
            year: 2023,
            department: 'All',
            term: 'Fall',
            confidence: 70
        };
        this.suggestions = [];
        
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
        const container = document.getElementById('smartAllocationDashboard');
        if (!container) {
            console.error('Smart Allocation container not found');
            return;
        }

        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Filters Row -->
                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Academic Year</label>
                            <select class="form-select form-select-sm" id="smartAllocYearFilter">
                                <option value="2023" selected>2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Department</label>
                            <select class="form-select form-select-sm" id="smartAllocDeptFilter">
                                <option value="All">All Departments</option>
                                <option value="Business">Business & Economics</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Arts">Arts & Sciences</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Term</label>
                            <select class="form-select form-select-sm" id="smartAllocTermFilter">
                                <option value="Fall">Fall</option>
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Minimum Confidence</label>
                            <input type="range" class="form-range" id="smartAllocConfidenceFilter" 
                                min="0" max="100" step="5" value="70">
                            <small class="text-muted" id="confidenceValue">70%</small>
                        </div>
                    </div>
                </div>

                <!-- Summary Stats -->
                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Suggestions</h6>
                                        <h4 id="suggestionCount" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-muted">Total</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Impact Score</h6>
                                        <h4 id="impactScore" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-muted">Out of 100</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Affected Faculty</h6>
                                        <h4 id="affectedFaculty" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-muted">Members</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card h-100 border-0 bg-light">
                            <div class="card-body p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-subtitle mb-1 text-muted small">Potential Savings</h6>
                                        <h4 id="potentialSavings" class="card-title mb-0">-</h4>
                                    </div>
                                    <small class="text-muted">Credit Hours</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-2">
                    <!-- Suggestions Table -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Rebalancing Suggestions</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-hover" id="suggestionsTable">
                                        <thead>
                                            <tr>
                                                <th>Department</th>
                                                <th>Suggestion</th>
                                                <th>Impact</th>
                                                <th>Confidence</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Impact Analysis -->
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <ul class="nav nav-tabs nav-sm" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active py-1 px-2" data-bs-toggle="tab" data-bs-target="#beforeAfterTab">
                                            Before/After
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 px-2" data-bs-toggle="tab" data-bs-target="#impactForecastTab">
                                            Forecast
                                        </button>
                                    </li>
                                </ul>
                                <div class="tab-content mt-2" style="height: 300px">
                                    <div class="tab-pane fade show active" id="beforeAfterTab">
                                        <canvas id="beforeAfterChart" style="width:100%; height:100%;"></canvas>
                                    </div>
                                    <div class="tab-pane fade" id="impactForecastTab">
                                        <canvas id="impactForecastChart" style="width:100%; height:100%;"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab switching events
        const tabButton = document.querySelector('button[data-bs-target="#smartAllocation"]');
        if (tabButton) {
            tabButton.addEventListener('shown.bs.tab', () => {
                this.destroyCharts();
                this.updateDashboard();
            });
            tabButton.addEventListener('hide.bs.tab', () => {
                this.destroyCharts();
            });
        }

        // Add event listeners to filters
        const filters = ['Year', 'Dept', 'Term'];
        filters.forEach(filter => {
            const element = document.getElementById(`smartAlloc${filter}Filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[filter.toLowerCase()] = e.target.value;
                    if (filter === 'Year') {
                        this.currentFilters[filter.toLowerCase()] = parseInt(e.target.value);
                    }
                    this.updateDashboard();
                });
            }
        });

        // Confidence slider
        const confidenceSlider = document.getElementById('smartAllocConfidenceFilter');
        const confidenceValue = document.getElementById('confidenceValue');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                confidenceValue.textContent = `${value}%`;
                this.currentFilters.confidence = parseInt(value);
                this.updateDashboard();
            });
        }

        // Comment form submission
        document.getElementById('submitComment')?.addEventListener('click', () => {
            const comment = document.getElementById('commentText').value;
            const decision = document.querySelector('input[name="decision"]:checked').value;
            this.handleSuggestionAction(this.currentSuggestionId, decision, comment);
            const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
            modal.hide();
        });
    }

    destroyCharts() {
        // Destroy all chart instances
        Object.entries(this.charts).forEach(([key, chart]) => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
                delete this.charts[key];
            }
        });

        // Reset all canvases
        ['beforeAfterChart'].forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                // Remove and recreate the canvas to ensure a clean state
                const parent = canvas.parentNode;
                const newCanvas = document.createElement('canvas');
                newCanvas.id = canvasId;
                newCanvas.width = canvas.width;
                newCanvas.height = canvas.height;
                parent.removeChild(canvas);
                parent.appendChild(newCanvas);
            }
        });

        // Clear charts object
        this.charts = {};
    }

    createBeforeAfterChart() {
        const canvas = document.getElementById('beforeAfterChart');
        if (!canvas) {
            console.error('Before/After chart canvas not found');
            return null;
        }

        return new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Current', 'Optimized'],
                datasets: [{
                    label: 'Faculty Utilization',
                    data: [this.currentMetrics.utilization, this.optimizedMetrics.utilization],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Course Coverage',
                    data: [this.currentMetrics.coverage, this.optimizedMetrics.coverage],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => `${context.dataset.label}: ${context.parsed.y}%`
                        }
                    }
                }
            }
        });
    }

    updateBeforeAfterChart() {
        try {
            // Ensure any existing chart is destroyed
            this.destroyCharts();

            // Create new chart
            this.charts.beforeAfter = this.createBeforeAfterChart();
            
            if (!this.charts.beforeAfter) {
                console.error('Failed to create before/after chart');
            }
        } catch (error) {
            console.error('Error updating before/after chart:', error);
        }
    }

    updateCharts() {
        // Only update charts if we're in the active tab
        const isTabActive = document.querySelector('#smartAllocation').classList.contains('active');
        if (!isTabActive) return;

        this.updateBeforeAfterChart();
        // ... other chart updates
    }

    updateDashboard() {
        // Only update if we're in the active tab
        const isTabActive = document.querySelector('#smartAllocation').classList.contains('active');
        if (!isTabActive) return;

        this.updateCharts();
        // ... other dashboard updates
    }

    loadData() {
        this.generateSuggestions();
        this.updateDashboard();
    }

    generateSuggestions() {
        const data = this.getFilteredData();
        if (!data) return;

        // Generate suggestions based on workload data
        this.suggestions = [];
        
        // Group faculty by department
        const deptGroups = {};
        data.forEach(d => {
            if (!deptGroups[d.department]) {
                deptGroups[d.department] = [];
            }
            deptGroups[d.department].push(d);
        });

        // Generate suggestions for each department
        Object.entries(deptGroups).forEach(([dept, faculty]) => {
            const overloaded = faculty.filter(f => f.averageLoad > 15);
            const underloaded = faculty.filter(f => f.averageLoad < 9);
            
            if (overloaded.length > 0 && underloaded.length > 0) {
                this.suggestions.push({
                    id: this.suggestions.length + 1,
                    department: dept,
                    suggestion: `Redistribute ${Math.ceil(overloaded.length * 3)} credit hours from ${overloaded.length} overloaded faculty to ${underloaded.length} underloaded faculty`,
                    impact: this.calculateImpact(overloaded.length, underloaded.length),
                    confidence: Math.floor(70 + Math.random() * 20),
                    status: 'pending'
                });
            }

            if (overloaded.length > 2) {
                this.suggestions.push({
                    id: this.suggestions.length + 1,
                    department: dept,
                    suggestion: `Consider hiring ${Math.ceil(overloaded.length / 3)} new faculty members to reduce overload`,
                    impact: this.calculateImpact(overloaded.length, 0),
                    confidence: Math.floor(60 + Math.random() * 20),
                    status: 'pending'
                });
            }
        });
    }

    calculateImpact(overloaded, underloaded) {
        // Simple impact calculation
        return Math.min(100, Math.floor((overloaded + underloaded) * 10));
    }

    updateKPIs(suggestions) {
        document.getElementById('suggestionCount').textContent = suggestions.length;
        
        const impactScores = suggestions.map(s => s.impact);
        const avgImpact = impactScores.length > 0 
            ? Math.floor(impactScores.reduce((a, b) => a + b, 0) / impactScores.length)
            : 0;
        document.getElementById('impactScore').textContent = avgImpact;

        const affectedFaculty = suggestions.reduce((sum, s) => {
            const match = s.suggestion.match(/\d+/);
            return sum + (match ? parseInt(match[0]) : 0);
        }, 0);
        document.getElementById('affectedFaculty').textContent = affectedFaculty;

        const potentialSavings = suggestions.reduce((sum, s) => {
            const match = s.suggestion.match(/(\d+) credit hours/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        document.getElementById('potentialSavings').textContent = potentialSavings;
    }

    updateSuggestionsTable(suggestions) {
        const tbody = document.querySelector('#suggestionsTable tbody');
        tbody.innerHTML = '';

        suggestions.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.department.split(' ').slice(-1)[0]}</td>
                <td>${s.suggestion}</td>
                <td>
                    <div class="progress" style="height: 15px;">
                        <div class="progress-bar bg-primary" style="width: ${s.impact}%">
                            ${s.impact}%
                        </div>
                    </div>
                </td>
                <td>
                    <div class="progress" style="height: 15px;">
                        <div class="progress-bar ${s.confidence >= 80 ? 'bg-success' : 'bg-warning'}" 
                            style="width: ${s.confidence}%">
                            ${s.confidence}%
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="window.smartAllocation.openCommentModal(${s.id})">
                        Review
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    openCommentModal(suggestionId) {
        this.currentSuggestionId = suggestionId;
        const modal = new bootstrap.Modal(document.getElementById('commentModal'));
        modal.show();
    }

    handleSuggestionAction(suggestionId, decision, comment) {
        const suggestion = this.suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
            suggestion.status = decision;
            suggestion.comment = comment;
            this.updateDashboard();
        }
    }

    getFilteredData() {
        const yearData = window.mockData.workload.find(d => d.year === this.currentFilters.year);
        if (!yearData) return null;

        let filteredData = yearData.facultyData;
        if (this.currentFilters.department !== 'All') {
            filteredData = filteredData.filter(d => d.department === this.currentFilters.department);
        }

        return filteredData;
    }
}

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.smartAllocation = new SmartAllocation();
}); 