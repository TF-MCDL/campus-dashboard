// Portfolio Scenario Snapshots Module
class PortfolioScenariosDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.initialize();
    }

    initialize() {
        this.container.innerHTML = `
            <div class="dashboard-container">
                <h3>Portfolio Scenario Snapshots</h3>
                <p>Module under development</p>
            </div>
        `;
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioScenariosDashboard = new PortfolioScenariosDashboard('portfolioScenariosDashboard');
});

class PortfolioScenarios {
    constructor() {
        this.charts = {};
        this.currentScenario = null;
        this.scenarios = [];
        this.departments = ['Business & Economics', 'Engineering', 'Medicine', 'Arts & Sciences', 'Education'];
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
        this.setupTabListener();
    }

    init() {
        this.destroyCharts();
        this.createLayout();
        this.setupEventListeners();
        this.loadData();
    }

    createLayout() {
        const container = document.getElementById('portfolioScenariosDashboard');
        if (!container) {
            console.error('Portfolio Scenarios container not found');
            return;
        }

        container.innerHTML = `
            <div class="container-fluid p-3">
                <!-- Action Buttons -->
                <div class="row mb-3">
                    <div class="col">
                        <button class="btn btn-sm btn-primary me-2" id="newPortfolioScenarioBtn">
                            New Scenario
                        </button>
                        <button class="btn btn-sm btn-outline-primary me-2" id="savePortfolioScenarioBtn">
                            Save Scenario
                        </button>
                        <button class="btn btn-sm btn-outline-success me-2" id="exportPortfolioScenarioBtn">
                            Export Report
                        </button>
                        <select class="form-select form-select-sm d-inline-block w-auto" id="portfolioScenarioSelector">
                            <option value="baseline">Baseline</option>
                        </select>
                    </div>
                </div>

                <div class="row g-2">
                    <!-- Scenario Builder -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-3">Scenario Parameters</h6>
                                
                                <!-- Program Actions -->
                                <div class="mb-3">
                                    <label class="form-label small">Program Actions</label>
                                    <div id="programActionsContainer">
                                        <!-- Will be populated dynamically -->
                                    </div>
                                </div>

                                <!-- Resource Allocation -->
                                <div class="mb-3">
                                    <label class="form-label small">Resource Reallocation</label>
                                    <div id="resourceAllocationContainer">
                                        <!-- Will be populated dynamically -->
                                    </div>
                                </div>

                                <!-- Timeline -->
                                <div class="mb-3">
                                    <label class="form-label small">Implementation Timeline</label>
                                    <select class="form-select form-select-sm" id="implementationTimeline">
                                        <option value="1">1 Year</option>
                                        <option value="2">2 Years</option>
                                        <option value="3">3 Years</option>
                                        <option value="5">5 Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Scenario Impact -->
                    <div class="col-md-8">
                        <div class="card h-100">
                            <div class="card-body p-2">
                                <ul class="nav nav-tabs nav-sm" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active py-1 px-2" data-bs-toggle="tab" data-bs-target="#beforeAfterTab">
                                            Before/After
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 px-2" data-bs-toggle="tab" data-bs-target="#timelineTab">
                                            Timeline
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link py-1 px-2" data-bs-toggle="tab" data-bs-target="#impactTab">
                                            Impact
                                        </button>
                                    </li>
                                </ul>
                                <div class="tab-content mt-2" style="height: 400px">
                                    <div class="tab-pane fade show active" id="beforeAfterTab">
                                        <canvas id="beforeAfterChart" style="width:100%; height:100%;"></canvas>
                                    </div>
                                    <div class="tab-pane fade" id="timelineTab">
                                        <canvas id="timelineChart" style="width:100%; height:100%;"></canvas>
                                    </div>
                                    <div class="tab-pane fade" id="impactTab">
                                        <canvas id="impactChart" style="width:100%; height:100%;"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Scenario Summary -->
                <div class="row mt-3">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">Impact Summary</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm" id="impactSummaryTable">
                                        <thead>
                                            <tr>
                                                <th>Metric</th>
                                                <th>Before</th>
                                                <th>After</th>
                                                <th>Change</th>
                                                <th>Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Will be populated dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body p-2">
                                <h6 class="card-title mb-2">AI Analysis</h6>
                                <div id="aiAnalysis" class="small">
                                    <p class="text-muted">Adjust scenario parameters to see AI analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Populate dynamic content
        this.populateDynamicContent();
    }

    setupEventListeners() {
        // Tab switching events
        const tabButton = document.querySelector('button[data-bs-target="#portfolioScenarios"]');
        if (tabButton) {
            tabButton.addEventListener('shown.bs.tab', () => {
                this.destroyCharts();
                this.updateDashboard();
            });
            tabButton.addEventListener('hide.bs.tab', () => {
                this.destroyCharts();
            });
        }

        // Program action selectors
        document.querySelectorAll('.program-action').forEach(select => {
            select.addEventListener('change', () => this.updateScenario());
        });

        // Resource allocation sliders
        document.querySelectorAll('.resource-allocation').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = `${value}%`;
                this.updateScenario();
            });
        });

        // Timeline selector
        document.getElementById('implementationTimeline')?.addEventListener('change', () => this.updateScenario());

        // Button handlers
        document.getElementById('newPortfolioScenarioBtn')?.addEventListener('click', () => this.createNewScenario());
        document.getElementById('savePortfolioScenarioBtn')?.addEventListener('click', () => this.saveCurrentScenario());
        document.getElementById('exportPortfolioScenarioBtn')?.addEventListener('click', () => this.exportScenarioReport());

        // Scenario selector
        document.getElementById('portfolioScenarioSelector')?.addEventListener('change', (e) => {
            this.loadScenario(e.target.value);
        });
    }

    setupTabListener() {
        // Handle tab switching
        document.querySelector('button[data-bs-target="#portfolioScenarios"]').addEventListener('shown.bs.tab', () => {
            // Reinitialize charts when tab becomes active
            this.destroyCharts();
            this.updateDashboard();
        });

        // Cleanup when leaving tab
        document.querySelector('button[data-bs-target="#portfolioScenarios"]').addEventListener('hide.bs.tab', () => {
            this.destroyCharts();
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

    loadData() {
        this.baselineData = this.generateBaselineData();
        this.updateScenario();
    }

    generateBaselineData() {
        const departments = window.mockData.metadata.departments;
        const data = {};

        departments.forEach(dept => {
            data[dept] = {
                programs: 2 + Math.floor(Math.random() * 3),
                enrollment: 100 + Math.floor(Math.random() * 400),
                revenue: (1 + Math.random()) * 1000000,
                cost: (0.6 + Math.random() * 0.3) * 1000000
            };
        });

        return data;
    }

    updateScenario() {
        const programActions = {};
        document.querySelectorAll('.program-action').forEach(select => {
            programActions[select.dataset.dept] = select.value;
        });

        const resourceAllocations = {};
        document.querySelectorAll('.resource-allocation').forEach(slider => {
            resourceAllocations[slider.dataset.dept] = parseInt(slider.value);
        });

        const timeline = parseInt(document.getElementById('implementationTimeline').value);

        this.currentScenario = {
            programActions,
            resourceAllocations,
            timeline,
            projections: this.calculateProjections(programActions, resourceAllocations, timeline)
        };

        this.updateDashboard();
    }

    calculateProjections(actions, allocations, timeline) {
        const projections = {
            programs: {},
            enrollment: {},
            revenue: {},
            cost: {}
        };

        Object.entries(this.baselineData).forEach(([dept, data]) => {
            const action = actions[dept];
            const allocation = allocations[dept];

            // Calculate program count changes
            let programChange = 0;
            switch (action) {
                case 'merge': programChange = -1; break;
                case 'split': programChange = 1; break;
                case 'close': programChange = -1; break;
                case 'new': programChange = 1; break;
            }

            // Calculate metrics with resource allocation impact
            const allocationImpact = 1 + (allocation / 100);
            
            projections.programs[dept] = Math.max(1, data.programs + programChange);
            projections.enrollment[dept] = Math.round(data.enrollment * allocationImpact);
            projections.revenue[dept] = data.revenue * allocationImpact;
            projections.cost[dept] = data.cost * (1 + (Math.abs(allocation) / 100));
        });

        return projections;
    }

    updateDashboard() {
        this.updateCharts();
        this.updateSummaryTable();
        this.updateAIAnalysis();
    }

    updateCharts() {
        this.updateBeforeAfterChart();
        this.updateTimelineChart();
        this.updateImpactChart();
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

    createBeforeAfterChart() {
        const canvas = document.getElementById('beforeAfterChart');
        if (!canvas) {
            console.error('Before/After chart canvas not found');
            return null;
        }

        return new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Current', 'After Changes'],
                datasets: [{
                    label: 'Programs',
                    data: [this.baselineData.programs, this.currentScenario.projections.programs],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Faculty',
                    data: [this.baselineData.faculty, this.currentScenario.projections.faculty],
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }

        const timeline = this.currentScenario.timeline;
        const years = Array.from({length: timeline + 1}, (_, i) => `Year ${i}`);
        
        const totalBefore = Object.values(this.baselineData).reduce((sum, d) => sum + d.enrollment, 0);
        const totalAfter = Object.values(this.currentScenario.projections.enrollment).reduce((sum, v) => sum + v, 0);
        
        const data = years.map((_, i) => {
            const progress = i / timeline;
            return totalBefore + (totalAfter - totalBefore) * progress;
        });

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Total Enrollment',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateImpactChart() {
        const ctx = document.getElementById('impactChart');
        
        if (this.charts.impact) {
            this.charts.impact.destroy();
        }

        const metrics = ['Revenue', 'Cost', 'Enrollment'];
        const beforeData = metrics.map(metric => {
            const key = metric.toLowerCase();
            return Object.values(this.baselineData).reduce((sum, d) => sum + d[key], 0);
        });
        const afterData = metrics.map(metric => {
            const key = metric.toLowerCase();
            return Object.values(this.currentScenario.projections[key]).reduce((sum, v) => sum + v, 0);
        });

        this.charts.impact = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: metrics,
                datasets: [{
                    label: 'Before',
                    data: beforeData.map(v => v / 1000000),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)'
                }, {
                    label: 'After',
                    data: afterData.map(v => v / 1000000),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateSummaryTable() {
        const before = {
            programs: Object.values(this.baselineData).reduce((sum, d) => sum + d.programs, 0),
            enrollment: Object.values(this.baselineData).reduce((sum, d) => sum + d.enrollment, 0),
            revenue: Object.values(this.baselineData).reduce((sum, d) => sum + d.revenue, 0),
            cost: Object.values(this.baselineData).reduce((sum, d) => sum + d.cost, 0)
        };

        const after = {
            programs: Object.values(this.currentScenario.projections.programs).reduce((sum, v) => sum + v, 0),
            enrollment: Object.values(this.currentScenario.projections.enrollment).reduce((sum, v) => sum + v, 0),
            revenue: Object.values(this.currentScenario.projections.revenue).reduce((sum, v) => sum + v, 0),
            cost: Object.values(this.currentScenario.projections.cost).reduce((sum, v) => sum + v, 0)
        };

        // Update programs row
        document.getElementById('beforePrograms').textContent = before.programs;
        document.getElementById('afterPrograms').textContent = after.programs;
        const programsDiff = after.programs - before.programs;
        document.getElementById('programsDiff').textContent = this.formatDiff(programsDiff);
        document.getElementById('programsImpact').textContent = this.getImpactText(-programsDiff);

        // Update enrollment row
        document.getElementById('beforeEnrollment').textContent = before.enrollment;
        document.getElementById('afterEnrollment').textContent = after.enrollment;
        const enrollmentDiff = after.enrollment - before.enrollment;
        document.getElementById('enrollmentDiff').textContent = this.formatDiff(enrollmentDiff);
        document.getElementById('enrollmentImpact').textContent = this.getImpactText(enrollmentDiff);

        // Update revenue row
        document.getElementById('beforeRevenue').textContent = this.formatCurrency(before.revenue);
        document.getElementById('afterRevenue').textContent = this.formatCurrency(after.revenue);
        const revenueDiff = after.revenue - before.revenue;
        document.getElementById('revenueDiff').textContent = this.formatDiff(revenueDiff, true);
        document.getElementById('revenueImpact').textContent = this.getImpactText(revenueDiff);

        // Update cost row
        document.getElementById('beforeCost').textContent = this.formatCurrency(before.cost);
        document.getElementById('afterCost').textContent = this.formatCurrency(after.cost);
        const costDiff = after.cost - before.cost;
        document.getElementById('costDiff').textContent = this.formatDiff(costDiff, true);
        document.getElementById('costImpact').textContent = this.getImpactText(-costDiff);
    }

    updateAIAnalysis() {
        const analysis = this.generateAIAnalysis();
        document.getElementById('aiAnalysis').innerHTML = analysis;
    }

    generateAIAnalysis() {
        const before = {
            programs: Object.values(this.baselineData).reduce((sum, d) => sum + d.programs, 0),
            enrollment: Object.values(this.baselineData).reduce((sum, d) => sum + d.enrollment, 0),
            revenue: Object.values(this.baselineData).reduce((sum, d) => sum + d.revenue, 0),
            cost: Object.values(this.baselineData).reduce((sum, d) => sum + d.cost, 0)
        };

        const after = {
            programs: Object.values(this.currentScenario.projections.programs).reduce((sum, v) => sum + v, 0),
            enrollment: Object.values(this.currentScenario.projections.enrollment).reduce((sum, v) => sum + v, 0),
            revenue: Object.values(this.currentScenario.projections.revenue).reduce((sum, v) => sum + v, 0),
            cost: Object.values(this.currentScenario.projections.cost).reduce((sum, v) => sum + v, 0)
        };

        const programsDiff = after.programs - before.programs;
        const enrollmentDiff = after.enrollment - before.enrollment;
        const revenueDiff = after.revenue - before.revenue;
        const costDiff = after.cost - before.cost;
        const profitDiff = (after.revenue - after.cost) - (before.revenue - before.cost);

        let analysis = '<div class="mb-2">';
        
        // Overall assessment
        if (profitDiff > 0 && enrollmentDiff > 0) {
            analysis += '<div class="alert alert-success py-1 px-2 mb-2">This scenario shows positive growth in both enrollment and profitability.</div>';
        } else if (profitDiff > 0) {
            analysis += '<div class="alert alert-warning py-1 px-2 mb-2">This scenario improves profitability but may impact enrollment.</div>';
        } else {
            analysis += '<div class="alert alert-danger py-1 px-2 mb-2">This scenario may have negative financial implications.</div>';
        }

        // Key observations
        analysis += '<p class="mb-2"><strong>Key Observations:</strong></p><ul class="list-unstyled mb-0">';
        
        if (programsDiff !== 0) {
            analysis += `<li>• Portfolio ${programsDiff > 0 ? 'expansion' : 'consolidation'} by ${Math.abs(programsDiff)} programs</li>`;
        }
        
        if (Math.abs(enrollmentDiff) > 50) {
            analysis += `<li>• Significant ${enrollmentDiff > 0 ? 'increase' : 'decrease'} in enrollment (${Math.abs(enrollmentDiff)} students)</li>`;
        }
        
        if (Math.abs(revenueDiff) > 100000) {
            analysis += `<li>• ${revenueDiff > 0 ? 'Higher' : 'Lower'} revenue projection (${this.formatCurrency(Math.abs(revenueDiff))})</li>`;
        }
        
        if (Math.abs(costDiff) > 100000) {
            analysis += `<li>• Operating costs will ${costDiff > 0 ? 'increase' : 'decrease'} by ${this.formatCurrency(Math.abs(costDiff))}</li>`;
        }

        analysis += '</ul></div>';

        // Recommendations
        analysis += '<div class="mt-2">';
        analysis += '<p class="mb-2"><strong>Recommendations:</strong></p>';
        analysis += '<ul class="list-unstyled mb-0">';
        
        if (costDiff > revenueDiff) {
            analysis += '<li>• Consider optimizing resource allocation to improve cost efficiency</li>';
        }
        
        if (enrollmentDiff < 0 && programsDiff < 0) {
            analysis += '<li>• Evaluate impact on student access and program diversity</li>';
        }
        
        if (profitDiff < 0) {
            analysis += '<li>• Review timeline for potential phased implementation</li>';
        }
        
        analysis += '</ul></div>';

        return analysis;
    }

    formatDiff(value, isCurrency = false) {
        if (isCurrency) {
            return value > 0 ? 
                `+${this.formatCurrency(value)}` : 
                this.formatCurrency(value);
        }
        return value > 0 ? `+${value}` : value;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    getImpactText(value) {
        if (value > 0) return 'Positive';
        if (value < 0) return 'Negative';
        return 'Neutral';
    }

    createNewScenario() {
        const name = prompt('Enter scenario name:');
        if (!name) return;

        const scenario = {
            name,
            programActions: {},
            resourceAllocations: {},
            timeline: 1
        };

        this.scenarios.push(scenario);
        this.addScenarioOption(scenario);
    }

    addScenarioOption(scenario) {
        const select = document.getElementById('portfolioScenarioSelector');
        const option = document.createElement('option');
        option.value = scenario.name;
        option.textContent = scenario.name;
        select.appendChild(option);
    }

    saveCurrentScenario() {
        const scenarioName = document.getElementById('portfolioScenarioSelector').value;
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

        // Load program actions
        Object.entries(scenario.programActions).forEach(([dept, action]) => {
            const select = document.querySelector(`.program-action[data-dept="${dept}"]`);
            if (select) select.value = action;
        });

        // Load resource allocations
        Object.entries(scenario.resourceAllocations).forEach(([dept, value]) => {
            const slider = document.querySelector(`.resource-allocation[data-dept="${dept}"]`);
            if (slider) {
                slider.value = value;
                slider.nextElementSibling.textContent = `${value}%`;
            }
        });

        // Load timeline
        document.getElementById('implementationTimeline').value = scenario.timeline;

        this.updateScenario();
    }

    resetToBaseline() {
        // Reset program actions
        document.querySelectorAll('.program-action').forEach(select => {
            select.value = 'none';
        });

        // Reset resource allocations
        document.querySelectorAll('.resource-allocation').forEach(slider => {
            slider.value = 0;
            slider.nextElementSibling.textContent = '0%';
        });

        // Reset timeline
        document.getElementById('implementationTimeline').value = 1;

        this.updateScenario();
    }

    exportScenarioReport() {
        if (!this.currentScenario) return;

        const scenario = this.currentScenario;
        const report = {
            scenario: {
                programActions: scenario.programActions,
                resourceAllocations: scenario.resourceAllocations,
                timeline: scenario.timeline
            },
            projections: scenario.projections,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio_scenario_report.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    populateDynamicContent() {
        // Populate Program Actions
        const programActionsContainer = document.getElementById('programActionsContainer');
        if (programActionsContainer) {
            programActionsContainer.innerHTML = this.departments.map(dept => `
                <div class="mb-2">
                    <label class="form-label small">${dept}</label>
                    <select class="form-select form-select-sm program-action" data-dept="${dept}">
                        <option value="none">No Change</option>
                        <option value="merge">Merge Programs</option>
                        <option value="split">Split Program</option>
                        <option value="close">Close Program</option>
                        <option value="new">New Program</option>
                    </select>
                </div>
            `).join('');
        }

        // Populate Resource Allocation
        const resourceAllocationContainer = document.getElementById('resourceAllocationContainer');
        if (resourceAllocationContainer) {
            resourceAllocationContainer.innerHTML = this.departments.map(dept => `
                <div class="mb-2">
                    <label class="form-label small d-flex justify-content-between">
                        <span>${dept}</span>
                        <span class="allocation-value" data-dept="${dept}">0%</span>
                    </label>
                    <input type="range" class="form-range resource-allocation" 
                        data-dept="${dept}" min="-50" max="50" value="0">
                </div>
            `).join('');
        }

        // Set up resource allocation value display
        document.querySelectorAll('.resource-allocation').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const dept = e.target.dataset.dept;
                const value = e.target.value;
                document.querySelector(`.allocation-value[data-dept="${dept}"]`).textContent = `${value}%`;
                this.updateScenario();
            });
        });

        // Set up program action change handlers
        document.querySelectorAll('.program-action').forEach(select => {
            select.addEventListener('change', () => this.updateScenario());
        });

        // Initialize impact summary table
        const summaryTableBody = document.querySelector('#impactSummaryTable tbody');
        if (summaryTableBody) {
            summaryTableBody.innerHTML = `
                <tr>
                    <td>Total Programs</td>
                    <td id="beforePrograms">-</td>
                    <td id="afterPrograms">-</td>
                    <td id="programsDiff">-</td>
                    <td id="programsImpact">-</td>
                </tr>
                <tr>
                    <td>Total Enrollment</td>
                    <td id="beforeEnrollment">-</td>
                    <td id="afterEnrollment">-</td>
                    <td id="enrollmentDiff">-</td>
                    <td id="enrollmentImpact">-</td>
                </tr>
                <tr>
                    <td>Revenue</td>
                    <td id="beforeRevenue">-</td>
                    <td id="afterRevenue">-</td>
                    <td id="revenueDiff">-</td>
                    <td id="revenueImpact">-</td>
                </tr>
                <tr>
                    <td>Operating Cost</td>
                    <td id="beforeCost">-</td>
                    <td id="afterCost">-</td>
                    <td id="costDiff">-</td>
                    <td id="costImpact">-</td>
                </tr>
            `;
        }

        // Initialize scenario selector
        const scenarioSelector = document.getElementById('portfolioScenarioSelector');
        if (scenarioSelector) {
            // Add some example scenarios
            scenarioSelector.innerHTML += `
                <option value="optimization">Resource Optimization</option>
                <option value="growth">Growth Strategy</option>
                <option value="consolidation">Program Consolidation</option>
            `;
        }
    }
}

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioScenarios = new PortfolioScenarios();
}); 