-- Insert 89 WHO Jobs with SSAFE and IFAK 2.0 Pre-deployment Requirements
-- All jobs include SSAFE and IFAK 2.0 certification as mandatory pre-deployment requirements

-- Create a temporary array of job titles and details
WITH job_details AS (
  SELECT * FROM (
    VALUES
      -- Health Emergency Response Roles (10 jobs)
      ('JOB-HER-001', 'Emergency Coordinator - Europe', 'Geneva', 'Switzerland', 'Emergency Response', 'Regional', 'P-4', 'Fixed-term', 2, 8000, 12000, 'Coordinate emergency health response operations'),
      ('JOB-HER-002', 'Crisis Communications Officer', 'Geneva', 'Switzerland', 'Emergency Response', 'Global', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead crisis communication strategies'),
      ('JOB-HER-003', 'Emergency Operations Manager', 'New York', 'USA', 'Emergency Response', 'Headquarters', 'P-4', 'Fixed-term', 2, 7500, 11000, 'Manage emergency field operations'),
      ('JOB-HER-004', 'Field Epidemiologist - Africa', 'Nairobi', 'Kenya', 'Emergency Response', 'Regional', 'P-3', 'Fixed-term', 1, 5500, 8500, 'Field surveillance and outbreak investigation'),
      ('JOB-HER-005', 'Disaster Risk Reduction Specialist', 'Bangkok', 'Thailand', 'Emergency Response', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Strengthen disaster risk reduction initiatives'),
      ('JOB-HER-006', 'Emergency Logistics Officer', 'Accra', 'Ghana', 'Emergency Response', 'Regional', 'P-3', 'Fixed-term', 1.5, 5500, 8500, 'Manage emergency supply chain and logistics'),
      ('JOB-HER-007', 'Health Systems Crisis Lead', 'Cairo', 'Egypt', 'Emergency Response', 'Regional', 'P-4', 'Fixed-term', 2, 7000, 10500, 'Lead health system crisis management'),
      ('JOB-HER-008', 'Emergency Data Analyst', 'Brazzaville', 'Congo', 'Emergency Response', 'Regional', 'P-2', 'Fixed-term', 1, 4500, 7000, 'Real-time data analysis for emergency response'),
      ('JOB-HER-009', 'Infection Control Coordinator', 'Manila', 'Philippines', 'Emergency Response', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Coordinate infection prevention measures'),
      ('JOB-HER-010', 'Emergency Preparedness Officer', 'Mexico City', 'Mexico', 'Emergency Response', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Develop and implement preparedness plans'),

      -- Disease Surveillance Roles (12 jobs)
      ('JOB-DS-001', 'Disease Surveillance Specialist - Africa', 'Nairobi', 'Kenya', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead disease surveillance initiatives'),
      ('JOB-DS-002', 'Epidemiologist - South East Asia', 'Bangkok', 'Thailand', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Conduct epidemiological investigations'),
      ('JOB-DS-003', 'Laboratory Manager - Communicable Diseases', 'Harare', 'Zimbabwe', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Manage laboratory operations'),
      ('JOB-DS-004', 'Vector Control Officer', 'Cotonou', 'Benin', 'Disease Surveillance', 'Regional', 'P-2', 'Fixed-term', 1.5, 4500, 7000, 'Vector surveillance and control programs'),
      ('JOB-DS-005', 'Surveillance Data Manager', 'Cairo', 'Egypt', 'Disease Surveillance', 'Regional', 'P-2', 'Fixed-term', 2, 4500, 7000, 'Manage surveillance databases and systems'),
      ('JOB-DS-006', 'Antimicrobial Resistance Coordinator', 'New Delhi', 'India', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Monitor and control AMR threats'),
      ('JOB-DS-007', 'TB Control Program Officer', 'Manila', 'Philippines', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Lead TB control initiatives'),
      ('JOB-DS-008', 'HIV/AIDS Program Specialist', 'Lusaka', 'Zambia', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate HIV/AIDS programs'),
      ('JOB-DS-009', 'Vaccine-Preventable Disease Officer', 'Bogota', 'Colombia', 'Disease Surveillance', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Monitor vaccine-preventable diseases'),
      ('JOB-DS-010', 'Poliomyelitis Eradication Officer', 'Islamabad', 'Pakistan', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Support polio eradication efforts'),
      ('JOB-DS-011', 'Malaria Program Coordinator', 'Dar es Salaam', 'Tanzania', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Coordinate malaria control programs'),
      ('JOB-DS-012', 'Zoonotic Disease Surveillance Officer', 'Shanghai', 'China', 'Disease Surveillance', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Monitor zoonotic disease threats'),

      -- Public Health Program Roles (15 jobs)
      ('JOB-PH-001', 'Public Health Advisor - Africa', 'Pretoria', 'South Africa', 'Public Health', 'Regional', 'P-4', 'Fixed-term', 2, 7000, 10500, 'Advise on public health policy'),
      ('JOB-PH-002', 'Maternal and Child Health Officer', 'Dhaka', 'Bangladesh', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead MCH programs'),
      ('JOB-PH-003', 'Health Promotion Specialist', 'Bangkok', 'Thailand', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Develop health promotion initiatives'),
      ('JOB-PH-004', 'Nutrition Program Officer', 'Amman', 'Jordan', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate nutrition programs'),
      ('JOB-PH-005', 'Mental Health and Psychosocial Support Coordinator', 'Port-au-Prince', 'Haiti', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Lead MHPSS initiatives'),
      ('JOB-PH-006', 'Environmental Health Officer', 'Nairobi', 'Kenya', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Monitor environmental health threats'),
      ('JOB-PH-007', 'Health Systems Strengthening Officer', 'Kigali', 'Rwanda', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Strengthen health systems'),
      ('JOB-PH-008', 'Sexual and Reproductive Health Advisor', 'Cairo', 'Egypt', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead SRH programs'),
      ('JOB-PH-009', 'Non-Communicable Disease Coordinator', 'Moscow', 'Russia', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate NCD prevention programs'),
      ('JOB-PH-010', 'Health Education Specialist', 'Jakarta', 'Indonesia', 'Public Health', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Develop health education programs'),
      ('JOB-PH-011', 'Water and Sanitation Officer', 'Beirut', 'Lebanon', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Coordinate WASH initiatives'),
      ('JOB-PH-012', 'Occupational Health Officer', 'Hanoi', 'Vietnam', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead occupational health programs'),
      ('JOB-PH-013', 'School Health Program Officer', 'Phnom Penh', 'Cambodia', 'Public Health', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Implement school health programs'),
      ('JOB-PH-014', 'Health Equity Officer', 'Sao Paulo', 'Brazil', 'Public Health', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Promote health equity initiatives'),
      ('JOB-PH-015', 'Community Health Worker Coordinator', 'Lagos', 'Nigeria', 'Public Health', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Coordinate community health programs'),

      -- Health Systems Strengthening Roles (12 jobs)
      ('JOB-HSS-001', 'Health Financing Specialist', 'Geneva', 'Switzerland', 'Health Systems', 'Global', 'P-4', 'Fixed-term', 2, 8000, 12000, 'Strengthen health financing systems'),
      ('JOB-HSS-002', 'Health Information Manager', 'New York', 'USA', 'Health Systems', 'Headquarters', 'P-3', 'Fixed-term', 2, 6500, 9500, 'Manage health information systems'),
      ('JOB-HSS-003', 'Medical Products Procurement Officer', 'Copenhagen', 'Denmark', 'Health Systems', 'Global', 'P-3', 'Fixed-term', 2, 6500, 9500, 'Coordinate medical product procurement'),
      ('JOB-HSS-004', 'Health Workforce Development Officer', 'Pretoria', 'South Africa', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Develop health workforce initiatives'),
      ('JOB-HSS-005', 'Hospital Management Specialist', 'Kinshasa', 'Congo', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Improve hospital management'),
      ('JOB-HSS-006', 'Quality Assurance Officer', 'Dar es Salaam', 'Tanzania', 'Health Systems', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Monitor quality assurance standards'),
      ('JOB-HSS-007', 'Health Policy Analyst', 'Manila', 'Philippines', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Analyze and develop health policies'),
      ('JOB-HSS-008', 'Medical Records Officer', 'Port-au-Prince', 'Haiti', 'Health Systems', 'Regional', 'P-2', 'Fixed-term', 1.5, 4500, 7000, 'Maintain medical records systems'),
      ('JOB-HSS-009', 'Health Regulatory Affairs Officer', 'Cairo', 'Egypt', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate health regulatory affairs'),
      ('JOB-HSS-010', 'Patient Safety Officer', 'Bangkok', 'Thailand', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Improve patient safety programs'),
      ('JOB-HSS-011', 'Digital Health Specialist', 'Nairobi', 'Kenya', 'Health Systems', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Promote digital health solutions'),
      ('JOB-HSS-012', 'Health Research Coordinator', 'Hanoi', 'Vietnam', 'Health Systems', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Support health research initiatives'),

      -- Non-Communicable Disease (NCD) Prevention Roles (10 jobs)
      ('JOB-NCD-001', 'Cancer Prevention Officer', 'Cairo', 'Egypt', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Lead cancer prevention programs'),
      ('JOB-NCD-002', 'Cardiovascular Disease Specialist', 'New Delhi', 'India', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate CVD prevention initiatives'),
      ('JOB-NCD-003', 'Diabetes Control Program Officer', 'Jakarta', 'Indonesia', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Lead diabetes control programs'),
      ('JOB-NCD-004', 'Respiratory Disease Officer', 'Beijing', 'China', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate respiratory disease programs'),
      ('JOB-NCD-005', 'Tobacco Control Coordinator', 'Bangkok', 'Thailand', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Lead tobacco control initiatives'),
      ('JOB-NCD-006', 'Alcohol and Drug Abuse Officer', 'Moscow', 'Russia', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Coordinate substance abuse programs'),
      ('JOB-NCD-007', 'Physical Activity Promotion Officer', 'Canberra', 'Australia', 'NCD Prevention', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Promote physical activity initiatives'),
      ('JOB-NCD-008', 'Nutrition Policy Officer', 'Mexico City', 'Mexico', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Develop nutrition policies'),
      ('JOB-NCD-009', 'Disability and Rehabilitation Officer', 'Amman', 'Jordan', 'NCD Prevention', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Lead disability and rehabilitation programs'),
      ('JOB-NCD-010', 'Health Risk Assessment Officer', 'Sao Paulo', 'Brazil', 'NCD Prevention', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Assess health risk factors'),

      -- Humanitarian and Conflict-Affected Settings Roles (8 jobs)
      ('JOB-HAS-001', 'Humanitarian Health Coordinator', 'Geneva', 'Switzerland', 'Humanitarian', 'Global', 'P-4', 'Fixed-term', 2, 7500, 11000, 'Coordinate humanitarian health response'),
      ('JOB-HAS-002', 'Refugee Health Officer - Middle East', 'Amman', 'Jordan', 'Humanitarian', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Support refugee health services'),
      ('JOB-HAS-003', 'Mental Health Officer - Conflict Settings', 'Beirut', 'Lebanon', 'Humanitarian', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Provide mental health support'),
      ('JOB-HAS-004', 'WASH Officer - Humanitarian', 'Port-au-Prince', 'Haiti', 'Humanitarian', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Coordinate WASH in emergencies'),
      ('JOB-HAS-005', 'Nutrition Officer - Crisis Settings', 'Mogadishu', 'Somalia', 'Humanitarian', 'Regional', 'P-3', 'Fixed-term', 1.5, 5500, 8500, 'Manage nutrition programs'),
      ('JOB-HAS-006', 'Protection Officer - Health', 'Damascus', 'Syria', 'Humanitarian', 'Regional', 'P-3', 'Fixed-term', 1.5, 5500, 8500, 'Ensure protection in health settings'),
      ('JOB-HAS-007', 'Health Education Officer - Camps', 'Dar es Salaam', 'Tanzania', 'Humanitarian', 'Regional', 'P-2', 'Fixed-term', 2, 4500, 7000, 'Conduct health education in camps'),
      ('JOB-HAS-008', 'Disease Outbreak Coordinator - Humanitarian', 'Kinshasa', 'Congo', 'Humanitarian', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Monitor disease outbreaks in emergencies'),

      -- Administrative and Support Roles (6 jobs)
      ('JOB-ADM-001', 'Finance Officer', 'Geneva', 'Switzerland', 'Administration', 'Global', 'P-3', 'Fixed-term', 2, 6500, 9500, 'Manage financial operations'),
      ('JOB-ADM-002', 'Human Resources Officer', 'New York', 'USA', 'Administration', 'Headquarters', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Support HR operations'),
      ('JOB-ADM-003', 'Procurement Officer', 'Copenhagen', 'Denmark', 'Administration', 'Global', 'P-2', 'Fixed-term', 2, 5500, 8000, 'Manage procurement processes'),
      ('JOB-ADM-004', 'Office Administrator', 'Nairobi', 'Kenya', 'Administration', 'Regional', 'P-2', 'Fixed-term', 2, 4500, 7000, 'Manage office operations'),
      ('JOB-ADM-005', 'Supply Chain Officer', 'Bangkok', 'Thailand', 'Administration', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Coordinate supply chain'),
      ('JOB-ADM-006', 'Communications Officer', 'Cairo', 'Egypt', 'Administration', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Manage communications'),

      -- Technical and Training Roles (8 jobs)
      ('JOB-TECH-001', 'IT Systems Administrator', 'Geneva', 'Switzerland', 'Technology', 'Global', 'P-3', 'Fixed-term', 2, 6500, 9500, 'Manage IT systems'),
      ('JOB-TECH-002', 'Database Administrator', 'New York', 'USA', 'Technology', 'Headquarters', 'P-3', 'Fixed-term', 2, 7000, 10000, 'Administer databases'),
      ('JOB-TECH-003', 'Training Coordinator', 'Bangkok', 'Thailand', 'Training', 'Regional', 'P-2', 'Fixed-term', 2, 5000, 7500, 'Coordinate training programs'),
      ('JOB-TECH-004', 'Trainer - Public Health', 'Nairobi', 'Kenya', 'Training', 'Regional', 'P-3', 'Fixed-term', 2, 5500, 8500, 'Deliver public health training'),
      ('JOB-TECH-005', 'Curriculum Developer', 'Manila', 'Philippines', 'Training', 'Regional', 'P-3', 'Fixed-term', 2, 6000, 9000, 'Develop training curricula'),
      ('JOB-TECH-006', 'GIS Specialist', 'Dar es Salaam', 'Tanzania', 'Technology', 'Regional', 'P-2', 'Fixed-term', 2, 5500, 8000, 'Support GIS mapping initiatives'),
      ('JOB-TECH-007', 'Data Analyst', 'Cairo', 'Egypt', 'Technology', 'Regional', 'P-2', 'Fixed-term', 2, 5500, 8000, 'Analyze health data'),
      ('JOB-TECH-008', 'Web Developer', 'Mexico City', 'Mexico', 'Technology', 'Regional', 'P-2', 'Fixed-term', 2, 6000, 8500, 'Develop web applications')
  ) AS jobs(ref_number, title, city, country, department, level, grade, contract_type, duration, salary_min, salary_max, description)
)
-- Insert jobs
INSERT INTO jobs (
  job_reference_number,
  title,
  location,
  country,
  duty_station,
  department,
  level,
  grade,
  contract_type,
  contract_duration,
  salary_min,
  salary_max,
  salary_currency,
  job_description,
  requirements,
  is_active,
  created_at
)
SELECT
  ref_number,
  title,
  CONCAT(city, ', ', country),
  country,
  city,
  department,
  level,
  grade,
  contract_type,
  CONCAT(duration::text, ' years'),
  salary_min,
  salary_max,
  'USD',
  description,
  jsonb_build_object(
    'mandatory_certifications', jsonb_build_array(
      jsonb_build_object('name', 'SSAFE', 'description', 'Sphere Standard for Accountability and Fitness in Emergencies - Pre-deployment requirement', 'type', 'pre_deployment'),
      jsonb_build_object('name', 'IFAK 2.0', 'description', 'International First Aid Kit 2.0 certification - Pre-deployment requirement', 'type', 'pre_deployment')
    ),
    'minimum_education', 'Bachelor''s degree in related field',
    'years_experience', 5,
    'languages', jsonb_build_array('English', 'One local language preferred'),
    'key_skills', jsonb_build_array(
      'Project Management',
      'Team Leadership',
      'Data Analysis',
      'Cross-cultural Communication',
      'Problem Solving'
    )
  ),
  true,
  NOW()
FROM job_details
ON CONFLICT (job_reference_number) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_jobs_inserted FROM jobs WHERE job_reference_number LIKE 'JOB-%';
