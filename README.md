# Campus Dashboard

An interactive dashboard for campus management with 12 independent modules. Each module is designed to be completely independent, allowing parallel development by different teams.

## Live Demo
Access the live demo at: `https://[your-github-username].github.io/campus-dashboard/`

## Features

- **Faculty Load Analysis**: Track and analyze faculty workload distribution
- **Workload Gap Analysis**: Identify and address workload imbalances
- **Smart Allocation**: AI-driven resource allocation recommendations
- **Faculty Planning**: Long-term faculty recruitment and development planning
- **Program Viability**: Analyze program performance and sustainability
- **Portfolio Scenarios**: Model different program portfolio scenarios
- **Program Analytics**: Detailed program performance metrics
- **KPI Summary**: Key performance indicators dashboard
- **Employability Tracking**: Graduate employment outcomes
- **Skills Map**: Program and market skills alignment
- **Impact Analysis**: Program and institutional impact metrics
- **Alumni Network**: Alumni engagement and success tracking

## Technology Stack

- HTML5
- CSS3 (Bootstrap 5.3.0)
- JavaScript (ES6+)
- Chart.js 4.3.0
- D3.js 7.8.5
- DataTables 1.13.4
- jQuery 3.6.0

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/[your-github-username]/campus-dashboard.git
   ```

2. Navigate to the project directory:
   ```bash
   cd campus-dashboard
   ```

3. Start a local server (you can use Python's built-in server):
   ```bash
   # For Python 3.x
   python -m http.server 8000
   
   # For Python 2.x
   python -m SimpleHTTPServer 8000
   ```

4. Open your browser and visit:
   ```
   http://localhost:8000
   ```

### GitHub Pages Deployment

1. Create a new repository on GitHub named `campus-dashboard`

2. Initialize git in your local project (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/[your-github-username]/campus-dashboard.git
   ```

4. Push to GitHub:
   ```bash
   git push -u origin main
   ```

5. Go to your GitHub repository settings:
   - Navigate to "Pages" under "Settings"
   - Select "main" branch as source
   - Click "Save"

Your dashboard will be available at `https://[your-github-username].github.io/campus-dashboard/`

## Project Structure

```
campus-dashboard/
├── css/
│   ├── styles.css
│   └── facultyPlanning.css
├── js/
│   ├── config/
│   │   └── mockData.js
│   └── modules/
│       ├── facultyLoad.js
│       ├── workloadGap.js
│       ├── smartAllocation.js
│       ├── facultyPlanning.js
│       ├── programViability.js
│       ├── portfolioScenarios.js
│       ├── programAnalytics.js
│       ├── kpiSummary.js
│       ├── employability.js
│       ├── skillsMap.js
│       ├── impact.js
│       └── alumni.js
├── index.html
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [your-email@example.com]
Project Link: [https://github.com/[your-github-username]/campus-dashboard](https://github.com/[your-github-username]/campus-dashboard) 