// Faculty Planning Simulation Module
class FacultyPlanning {
    constructor() {
        this.charts = {};
        this.scenarios = [];
        this.currentScenario = null;
        this.baselineData = null;
        
        this.filters = {
            year: 2023,
            department: 'All',
            term: 'Fall'
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        const container = document.getElementById('facultyPlanningDashboard');
        if (!container) {
            console.error('Faculty Planning container not found');
            return;
        }
        this.createLayout();
        this.setupEventListeners();
        this.loadData();
    }

    createLayout() {
        const container = document.getElementById('facultyPlanningDashboard');
        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Filters Row -->
                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Academic Year</label>
                            <select class="form-select form-select-sm" id="planningYearFilter">
                                ${window.mockData.facultyLoad.map(d => 
                                    `<option value="${d.year}" ${d.year === 2023 ? 'selected' : ''}>${d.year}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Department</label>
                            <select class="form-select form-select-sm" id="planningDeptFilter">
                                <option value="All">All Departments</option>
                                ${window.mockData.metadata.departments.map(dept => 
                                    `<option value="${dept}">${dept}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Term</label>
                            <select class="form-select form-select-sm" id="planningTermFilter">
                                <option value="Fall">Fall</option>
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label small mb-1">Scenario</label>
                            <select class="form-select form-select-sm" id="scenarioSelector">
                                <option value="baseline">Baseline</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="row mb-3">
                    <div class="col">
                        <button class="btn btn-sm btn-primary me-2" id="newScenarioBtn">
                            New Scenario
                        </button>
                        <button class="btn btn-sm btn-outline-primary me-2" id="saveScenarioBtn">
                            Save Scenario
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-2" id="compareScenarioBtn">
                            Compare Scenarios
                        </button>
                        <button class="btn btn-sm btn-outline-success me-2" id="exportScenarioBtn">
                            Export Report
                        </button>
                    </div>
                </div>

                <div class="row g-2">
                    <!-- Scenario Builder -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-3">Scenario Parameters</h6>
                                
                                <!-- Faculty Changes -->
                                <div class="mb-3">
                                    <label class="form-label small">New Faculty Hires</label>
                                    <input type="range" class="form-range" id="newHiresSlider" 
                                        min="0" max="20" step="1" value="0">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">0</small>
                                        <small class="text-muted" id="newHiresValue">0</small>
                                        <small class="text-muted">20</small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small">Expected Retirements</label>
                                    <input type="range" class="form-range" id="retirementsSlider" 
                                        min="0" max="10" step="1" value="0">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">0</small>
                                        <small class="text-muted" id="retirementsValue">0</small>
                                        <small class="text-muted">10</small>
                                    </div>
                                </div>

                                <!-- Course Load Changes -->
                                <div class="mb-3">
                                    <label class="form-label small">Average Course Load Change</label>
                                    <input type="range" class="form-range" id="loadChangeSlider" 
                                        min="-3" max="3" step="0.5" value="0">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">-3</small>
                                        <small class="text-muted" id="loadChangeValue">0</small>
                                        <small class="text-muted">+3</small>
                                    </div>
                                </div>

                                <!-- Department Allocations -->
                                <div class="mb-3">
                                    <label class="form-label small">Department Allocation %</label>
                                    <div id="deptAllocationContainer">
                                        ${window.mockData.metadata.departments.map(dept => `
                                            <div class="mb-2">
                                                <label class="form-label small">${dept}</label>
                                                <input type="range" class="form-range dept-allocation" 
                                                    data-dept="${dept}" min="0" max="100" value="0">
                                                <small class="text-muted allocation-value">0%</small>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Projections -->
                    <div class="col-md-8">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <ul class="nav nav-tabs nav-sm" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active py-1 px-2" data-bs-toggle="tab" data-bs-target="#fteProjectionsTab">
                                            FTE Projections
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 px-2" data-bs-toggle="tab" data-bs-target="#costProjectionsTab">
                                            Cost Analysis
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 px-2" data-bs-toggle="tab" data-bs-target="#gapProjectionsTab">
                                            Gap Analysis
                                        </button>
                                    </li>
                                </ul>
                                <div class="tab-content" style="height: 400px">
                                    <div class="tab-pane fade show active" id="fteProjectionsTab">
                                        <canvas id="fteProjectionsChart"></canvas>
                                    </div>
                                    <div class="tab-pane fade" id="costProjectionsTab">
                                        <canvas id="costProjectionsChart"></canvas>
                                    </div>
                                    <div class="tab-pane fade" id="gapProjectionsTab">
                                        <canvas id="gapProjectionsChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scenario Details -->
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Scenario Impact Summary</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm" id="scenarioSummaryTable">
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Current</th>
                                                <th>Projected</th>
                                                <th>Change</th>
                                                <th>Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Total FTE</td>
                                                <td id="currentFTE">-</td>
                                                <td id="projectedFTE">-</td>
                                                <td id="fteDiff">-</td>
                                                <td id="fteImpact">-</td>
                                            </tr>
                                            <tr>
                                                <td>Average Load</td>
                                                <td id="currentLoad">-</td>
                                                <td id="projectedLoad">-</td>
                                                <td id="loadDiff">-</td>
                                                <td id="loadImpact">-</td>
                                            </tr>
                                            <tr>
                                                <td>Total Cost</td>
                                                <td id="currentCost">-</td>
                                                <td id="projectedCost">-</td>
                                                <td id="costDiff">-</td>
                                                <td id="costImpact">-</td>
                                            </tr>
                                            <tr>
                                                <td>Workload Gap</td>
                                                <td id="currentGap">-</td>
                                                <td id="projectedGap">-</td>
                                                <td id="gapDiff">-</td>
                                                <td id="gapImpact">-</td>
                                            </tr>
                                        </tbody>
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
            const element = document.getElementById(`planning${filter}Filter`);
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

        // Slider change handlers
        const sliders = ['newHires', 'retirements', 'loadChange'];
        sliders.forEach(slider => {
            const element = document.getElementById(`${slider}Slider`);
            const valueElement = document.getElementById(`${slider}Value`);
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueElement.textContent = value;
                    this.updateProjections();
                });
            }
        });

        // Department allocation sliders
        document.querySelectorAll('.dept-allocation').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = `${value}%`;
                this.updateProjections();
            });
        });

        // Button handlers
        document.getElementById('newScenarioBtn')?.addEventListener('click', () => this.createNewScenario());
        document.getElementById('saveScenarioBtn')?.addEventListener('click', () => this.saveCurrentScenario());
        document.getElementById('compareScenarioBtn')?.addEventListener('click', () => this.compareScenarios());
        document.getElementById('exportScenarioBtn')?.addEventListener('click', () => this.exportScenarioReport());

        // Scenario selector
        document.getElementById('scenarioSelector')?.addEventListener('change', (e) => {
            this.loadScenario(e.target.value);
        });

        // Tab change handler
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                this.updateCharts();
            });
        });
    }

    loadData() {
        // Load baseline data
        const yearData = window.mockData.workload.find(d => d.year === this.filters.year);
        if (!yearData) return;

        this.baselineData = yearData.facultyData;
        this.updateDashboard();
    }

    updateDashboard() {
        this.updateProjections();
        this.updateCharts();
        this.updateSummaryTable();
    }

    updateProjections() {
        if (!this.baselineData) return;

        const newHires = parseInt(document.getElementById('newHiresSlider').value);
        const retirements = parseInt(document.getElementById('retirementsSlider').value);
        const loadChange = parseFloat(document.getElementById('loadChangeSlider').value);

        // Calculate projections
        const projectedData = this.calculateProjections(newHires, retirements, loadChange);
        this.currentScenario = {
            name: 'Current Scenario',
            projections: projectedData,
            parameters: {
                newHires,
                retirements,
                loadChange,
                departmentAllocations: this.getDepartmentAllocations()
            }
        };

        this.updateCharts();
        this.updateSummaryTable();
    }

    calculateProjections(newHires, retirements, loadChange) {
        const baselineFTE = this.baselineData.length;
        const projectedFTE = baselineFTE + newHires - retirements;
        
        const baselineLoad = this.baselineData.reduce((sum, f) => sum + f.averageLoad, 0) / baselineFTE;
        const projectedLoad = baselineLoad + loadChange;

        const years = Array.from({length: 5}, (_, i) => this.filters.year + i);
        
        return {
            years,
            fte: years.map((_, i) => projectedFTE * (1 + i * 0.02)),
            cost: years.map((_, i) => projectedFTE * 100000 * (1 + i * 0.03)),
            gap: years.map((_, i) => Math.max(0, (projectedLoad * projectedFTE) - (baselineLoad * baselineFTE)) * (1 - i * 0.1))
        };
    }

    updateCharts() {
        this.updateFTEChart();
        this.updateCostChart();
        this.updateGapChart();
    }

    updateFTEChart() {
        const ctx = document.getElementById('fteProjectionsChart');
        
        if (this.charts.fte) {
            this.charts.fte.destroy();
        }

        const projections = this.currentScenario.projections;

        this.charts.fte = new Chart(ctx, {
            type: 'line',
            data: {
                labels: projections.years,
                datasets: [{
                    label: 'Projected FTE',
                    data: projections.fte,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Full-Time Equivalents'
                        }
                    }
                }
            }
        });
    }

    updateCostChart() {
        const ctx = document.getElementById('costProjectionsChart');
        
        if (this.charts.cost) {
            this.charts.cost.destroy();
        }

        const projections = this.currentScenario.projections;

        this.charts.cost = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: projections.years,
                datasets: [{
                    label: 'Projected Cost',
                    data: projections.cost,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Cost (AED)'
                        }
                    }
                }
            }
        });
    }

    updateGapChart() {
        const ctx = document.getElementById('gapProjectionsChart');
        
        if (this.charts.gap) {
            this.charts.gap.destroy();
        }

        const projections = this.currentScenario.projections;

        this.charts.gap = new Chart(ctx, {
            type: 'line',
            data: {
                labels: projections.years,
                datasets: [{
                    label: 'Projected Gap',
                    data: projections.gap,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Workload Gap (Hours)'
                        }
                    }
                }
            }
        });
    }

    updateSummaryTable() {
        if (!this.currentScenario) return;

        const projections = this.currentScenario.projections;
        const currentYear = projections.years[0];
        const finalYear = projections.years[projections.years.length - 1];

        // FTE
        document.getElementById('currentFTE').textContent = Math.round(projections.fte[0]);
        document.getElementById('projectedFTE').textContent = Math.round(projections.fte[projections.fte.length - 1]);
        const fteDiff = projections.fte[projections.fte.length - 1] - projections.fte[0];
        document.getElementById('fteDiff').textContent = fteDiff > 0 ? `+${Math.round(fteDiff)}` : Math.round(fteDiff);
        document.getElementById('fteImpact').textContent = this.getImpactText(fteDiff);

        // Load
        const currentLoad = this.baselineData.reduce((sum, f) => sum + f.averageLoad, 0) / this.baselineData.length;
        const projectedLoad = currentLoad + this.currentScenario.parameters.loadChange;
        document.getElementById('currentLoad').textContent = currentLoad.toFixed(1);
        document.getElementById('projectedLoad').textContent = projectedLoad.toFixed(1);
        const loadDiff = projectedLoad - currentLoad;
        document.getElementById('loadDiff').textContent = loadDiff > 0 ? `+${loadDiff.toFixed(1)}` : loadDiff.toFixed(1);
        document.getElementById('loadImpact').textContent = this.getImpactText(-loadDiff);

        // Cost
        document.getElementById('currentCost').textContent = this.formatCurrency(projections.cost[0]);
        document.getElementById('projectedCost').textContent = this.formatCurrency(projections.cost[projections.cost.length - 1]);
        const costDiff = projections.cost[projections.cost.length - 1] - projections.cost[0];
        document.getElementById('costDiff').textContent = costDiff > 0 ? 
            `+${this.formatCurrency(costDiff)}` : this.formatCurrency(costDiff);
        document.getElementById('costImpact').textContent = this.getImpactText(-costDiff);

        // Gap
        document.getElementById('currentGap').textContent = Math.round(projections.gap[0]);
        document.getElementById('projectedGap').textContent = Math.round(projections.gap[projections.gap.length - 1]);
        const gapDiff = projections.gap[projections.gap.length - 1] - projections.gap[0];
        document.getElementById('gapDiff').textContent = gapDiff > 0 ? 
            `+${Math.round(gapDiff)}` : Math.round(gapDiff);
        document.getElementById('gapImpact').textContent = this.getImpactText(-gapDiff);
    }

    getImpactText(value) {
        if (value > 0) return 'Positive';
        if (value < 0) return 'Negative';
        return 'Neutral';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    getDepartmentAllocations() {
        const allocations = {};
        document.querySelectorAll('.dept-allocation').forEach(slider => {
            allocations[slider.dataset.dept] = parseInt(slider.value);
        });
        return allocations;
    }

    createNewScenario() {
        const name = prompt('Enter scenario name:');
        if (!name) return;

        const scenario = {
            name,
            parameters: {
                newHires: 0,
                retirements: 0,
                loadChange: 0,
                departmentAllocations: {}
            }
        };

        this.scenarios.push(scenario);
        this.addScenarioOption(scenario);
    }

    addScenarioOption(scenario) {
        const select = document.getElementById('scenarioSelector');
        const option = document.createElement('option');
        option.value = scenario.name;
        option.textContent = scenario.name;
        select.appendChild(option);
    }

    saveCurrentScenario() {
        if (!this.currentScenario) return;
        
        const scenarioName = document.getElementById('scenarioSelector').value;
        if (scenarioName === 'baseline') {
            alert('Cannot modify baseline scenario');
            return;
        }

        const scenario = this.scenarios.find(s => s.name === scenarioName);
        if (scenario) {
            Object.assign(scenario, this.currentScenario);
            alert('Scenario saved successfully');
        }
    }

    loadScenario(name) {
        if (name === 'baseline') {
            this.resetToBaseline();
            return;
        }

        const scenario = this.scenarios.find(s => s.name === name);
        if (!scenario) return;

        // Load parameters
        document.getElementById('newHiresSlider').value = scenario.parameters.newHires;
        document.getElementById('newHiresValue').textContent = scenario.parameters.newHires;

        document.getElementById('retirementsSlider').value = scenario.parameters.retirements;
        document.getElementById('retirementsValue').textContent = scenario.parameters.retirements;

        document.getElementById('loadChangeSlider').value = scenario.parameters.loadChange;
        document.getElementById('loadChangeValue').textContent = scenario.parameters.loadChange;

        // Load department allocations
        Object.entries(scenario.parameters.departmentAllocations).forEach(([dept, value]) => {
            const slider = document.querySelector(`.dept-allocation[data-dept="${dept}"]`);
            if (slider) {
                slider.value = value;
                slider.nextElementSibling.textContent = `${value}%`;
            }
        });

        this.updateProjections();
    }

    resetToBaseline() {
        document.getElementById('newHiresSlider').value = 0;
        document.getElementById('newHiresValue').textContent = '0';

        document.getElementById('retirementsSlider').value = 0;
        document.getElementById('retirementsValue').textContent = '0';

        document.getElementById('loadChangeSlider').value = 0;
        document.getElementById('loadChangeValue').textContent = '0';

        document.querySelectorAll('.dept-allocation').forEach(slider => {
            slider.value = 0;
            slider.nextElementSibling.textContent = '0%';
        });

        this.updateProjections();
    }

    compareScenarios() {
        // Implementation for scenario comparison
        alert('Scenario comparison feature coming soon');
    }

    exportScenarioReport() {
        if (!this.currentScenario) return;

        const scenario = this.currentScenario;
        const projections = scenario.projections;

        const report = {
            scenarioName: scenario.name,
            parameters: scenario.parameters,
            projections: {
                years: projections.years,
                fte: projections.fte,
                cost: projections.cost,
                gap: projections.gap
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scenario_report_${scenario.name.toLowerCase().replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.facultyPlanning = new FacultyPlanning();
}); 