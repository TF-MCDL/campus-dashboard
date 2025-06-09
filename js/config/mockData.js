// Mock Data Generator for UAE Higher Education Dashboard
const MockDataGenerator = {
    // Configuration
    years: Array.from({length: 10}, (_, i) => 2014 + i),
    departments: [
        'College of Business',
        'College of Engineering & IT',
        'College of Medicine & Health Sciences',
        'College of Humanities & Social Sciences',
        'College of Education',
        'College of Law'
    ],
    programs: {
        'College of Business': [
            'Bachelor of Business Administration',
            'Master of Business Administration',
            'Bachelor of Finance',
            'Bachelor of Accounting',
            'Master of Islamic Banking'
        ],
        'College of Engineering & IT': [
            'Bachelor of Computer Science',
            'Bachelor of Civil Engineering',
            'Bachelor of Electrical Engineering',
            'Master of Engineering Management',
            'Bachelor of Artificial Intelligence'
        ],
        'College of Medicine & Health Sciences': [
            'Bachelor of Medicine (MBBS)',
            'Bachelor of Dental Surgery',
            'Bachelor of Pharmacy',
            'Master of Public Health',
            'Bachelor of Nursing'
        ],
        'College of Humanities & Social Sciences': [
            'Bachelor of Arabic Language & Literature',
            'Bachelor of Islamic Studies',
            'Bachelor of International Relations',
            'Master of Translation Studies',
            'Bachelor of Media & Communication'
        ],
        'College of Education': [
            'Bachelor of Education',
            'Master of Educational Leadership',
            'Bachelor of Early Childhood Education',
            'Master of Special Education',
            'Bachelor of TESOL'
        ],
        'College of Law': [
            'Bachelor of Laws (LLB)',
            'Master of Laws (LLM)',
            'Bachelor of Sharia & Law',
            'Master of International Law',
            'Master of Commercial Law'
        ]
    },
    facultyTypes: ['Full-time', 'Adjunct', 'Visiting', 'Research'],
    employmentSectors: [
        'Government',
        'Semi-Government',
        'Private Sector',
        'Education',
        'Healthcare',
        'Banking & Finance',
        'Oil & Gas',
        'Technology',
        'Tourism & Hospitality'
    ],
    skills: [
        'Arabic Language',
        'English Proficiency',
        'Digital Literacy',
        'Research Methods',
        'Data Analysis',
        'Project Management',
        'Leadership',
        'Innovation & Entrepreneurship',
        'Cultural Awareness',
        'Sustainability Practices'
    ],

    // Helper Functions
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomFloat(min, max, decimals = 2) {
        const num = Math.random() * (max - min) + min;
        return Number(num.toFixed(decimals));
    },

    randomTrend(baseValue, yearIndex, volatility = 0.1) {
        // Add slight upward trend to reflect UAE's growing education sector
        const trend = 1 + (yearIndex * 0.08); // 8% year-over-year growth
        const random = this.randomFloat(1 - volatility, 1 + volatility);
        return Math.round(baseValue * trend * random);
    },

    // Data Generators
    generateFacultyLoadData() {
        return this.years.map((year, index) => {
            const departmentData = this.departments.map(dept => {
                // Larger departments have more FTEs
                const baseFTE = dept.includes('Engineering') || dept.includes('Business') ? 25 : 18;
                
                return {
                    department: dept,
                    currentFTE: this.randomTrend(baseFTE, index, 0.2),
                    requiredFTE: this.randomTrend(baseFTE * 1.2, index, 0.1), // Slight understaffing trend
                    overloaded: this.randomInt(2, 5),
                    underloaded: this.randomInt(1, 3)
                };
            });

            return {
                year,
                departments: departmentData,
                totalFTE: departmentData.reduce((sum, dept) => sum + dept.currentFTE, 0),
                requiredTotalFTE: departmentData.reduce((sum, dept) => sum + dept.requiredFTE, 0)
            };
        });
    },

    generateWorkloadData() {
        return this.years.map((year, index) => {
            const facultyData = this.departments.flatMap(dept => 
                this.facultyTypes.map(type => {
                    // Adjust loads based on faculty type
                    const baseLoad = type === 'Full-time' ? 12 :
                                   type === 'Research' ? 6 :
                                   type === 'Adjunct' ? 9 : 8;
                    
                    return {
                        department: dept,
                        facultyType: type,
                        averageLoad: this.randomFloat(baseLoad - 2, baseLoad + 2, 1),
                        overloadHours: this.randomInt(0, 6),
                        facultyCount: this.randomTrend(
                            type === 'Full-time' ? 12 :
                            type === 'Adjunct' ? 8 : 4,
                            index, 0.15
                        )
                    };
                })
            );

            return {
                year,
                facultyData,
                averageLoadByDept: this.departments.map(dept => ({
                    department: dept,
                    averageLoad: this.randomFloat(10, 14, 1)
                }))
            };
        });
    },

    generateProgramData() {
        return this.years.map((year, index) => {
            const programData = Object.entries(this.programs).flatMap(([dept, programs]) =>
                programs.map(program => {
                    // Adjust metrics based on program type
                    const isMasters = program.toLowerCase().includes('master');
                    const baseEnrollment = isMasters ? 30 : 60;
                    const baseCost = isMasters ? 800000 : 600000;
                    
                    return {
                        department: dept,
                        program: program,
                        enrollment: this.randomTrend(baseEnrollment, index, 0.2),
                        revenue: this.randomTrend(baseCost * 1.4, index, 0.15),
                        cost: this.randomTrend(baseCost, index, 0.1),
                        employabilityRate: this.randomFloat(0.75, 0.95),
                        satisfaction: this.randomFloat(3.8, 4.8)
                    };
                })
            );

            return {
                year,
                programs: programData
            };
        });
    },

    generateEmployabilityData() {
        return this.years.map((year, index) => {
            const employmentData = Object.entries(this.programs).flatMap(([dept, programs]) =>
                programs.map(program => {
                    // Adjust employment metrics based on field
                    const isEngineering = dept.includes('Engineering');
                    const isBusiness = dept.includes('Business');
                    const isMedicine = dept.includes('Medicine');
                    
                    const baseRate = isEngineering || isMedicine ? 0.85 :
                                   isBusiness ? 0.82 : 0.78;
                    const baseSalary = isEngineering || isMedicine ? 25000 :
                                     isBusiness ? 22000 : 18000;
                    
                    return {
                        department: dept,
                        program: program,
                        employmentRate: this.randomFloat(baseRate, baseRate + 0.1),
                        averageSalary: this.randomTrend(baseSalary, index, 0.1),
                        employerSatisfaction: this.randomFloat(4.0, 4.9),
                        sectorDistribution: this.employmentSectors.map(sector => ({
                            sector,
                            percentage: this.randomFloat(0.05, 0.25)
                        }))
                    };
                })
            );

            return {
                year,
                employment: employmentData
            };
        });
    },

    generateSkillsData() {
        return this.years.map((year, index) => {
            const skillsData = Object.entries(this.programs).flatMap(([dept, programs]) =>
                programs.map(program => ({
                    department: dept,
                    program: program,
                    requiredSkills: this.skills.map(skill => {
                        // Adjust skill importance based on program type
                        const isIT = program.toLowerCase().includes('computer') || 
                                   program.toLowerCase().includes('technology');
                        const isBusiness = dept.includes('Business');
                        
                        let importance = 3;
                        if ((isIT && skill.includes('Digital')) || 
                            (isBusiness && skill.includes('Management'))) {
                            importance = 5;
                        }
                        
                        return {
                            skill,
                            importance: this.randomFloat(importance - 0.5, importance + 0.5),
                            studentProficiency: this.randomFloat(2.8, 4.5),
                            marketDemand: this.randomFloat(0.7, 0.95)
                        };
                    })
                }))
            );

            return {
                year,
                skills: skillsData
            };
        });
    },

    // Main Data Generation
    generateAllData() {
        return {
            facultyLoad: this.generateFacultyLoadData(),
            workload: this.generateWorkloadData(),
            programs: this.generateProgramData(),
            employability: this.generateEmployabilityData(),
            skills: this.generateSkillsData(),
            metadata: {
                lastUpdated: new Date().toISOString(),
                departments: this.departments,
                programs: this.programs,
                facultyTypes: this.facultyTypes,
                employmentSectors: this.employmentSectors,
                skills: this.skills,
                region: 'UAE',
                currency: 'AED',
                academicSystem: 'American'
            }
        };
    }
};

// Generate and expose the mock data
const mockData = MockDataGenerator.generateAllData();
window.mockData = mockData; // Make it globally available 