-- Real UAE jobs v2: salary ranges + apply URLs on existing seed jobs,
-- plus 8 new high-credibility UAE tech roles.
-- Re-runnable: all updates are idempotent, inserts use ON CONFLICT DO NOTHING.

do $$
declare
  v_source_id uuid := 'a1a10000-0000-0000-0000-000000000001'::uuid;
begin

  -- ── Enrich existing seed jobs with salary + apply URL ────────────────────

  update public.jobs set
    salary_min = 22000, salary_max = 32000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/noon-ecommerce/jobs/'
  where canonical_key = 'mock-noon-senior-react-engineer';

  update public.jobs set
    salary_min = 18000, salary_max = 26000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/careem/jobs/'
  where canonical_key = 'mock-careem-backend-engineer';

  update public.jobs set
    salary_min = 16000, salary_max = 24000, salary_currency = 'AED',
    apply_url = 'https://careers.wiobank.com/'
  where canonical_key = 'mock-wio-fullstack-engineer';

  update public.jobs set
    salary_min = 22000, salary_max = 30000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/injazat/jobs/'
  where canonical_key = 'mock-injazat-senior-python-developer';

  update public.jobs set
    salary_min = 17000, salary_max = 25000, salary_currency = 'AED',
    apply_url = 'https://www.accenture.com/ae-en/careers'
  where canonical_key = 'mock-accenture-cloud-engineer';

  update public.jobs set
    salary_min = 15000, salary_max = 22000, salary_currency = 'AED',
    apply_url = 'https://careers.du.ae/'
  where canonical_key = 'mock-du-devops-engineer';

  update public.jobs set
    salary_min = 24000, salary_max = 34000, salary_currency = 'AED',
    apply_url = 'https://www.emiratesnbd.com/en/careers'
  where canonical_key = 'mock-enbd-senior-java-engineer';

  update public.jobs set
    salary_min = 16000, salary_max = 23000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/chalhoub-group/jobs/'
  where canonical_key = 'mock-chalhoub-data-engineer';

  update public.jobs set
    salary_min = 14000, salary_max = 20000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/serviceplan-middle-east/jobs/'
  where canonical_key = 'mock-serviceplan-frontend-developer';

  update public.jobs set
    salary_min = 15000, salary_max = 22000, salary_currency = 'AED',
    apply_url = 'https://www.linkedin.com/company/talabat/jobs/'
  where canonical_key = 'mock-talabat-react-native-developer';

  update public.jobs set
    salary_min = 35000, salary_max = 50000, salary_currency = 'SAR',
    apply_url = 'https://www.linkedin.com/company/tamara-fintech/jobs/'
  where canonical_key = 'mock-tamara-tech-lead';

  update public.jobs set
    salary_min = 45000, salary_max = 65000, salary_currency = 'SAR',
    apply_url = 'https://www.aramco.com/en/careers'
  where canonical_key = 'mock-aramco-software-architect';

  -- ── New UAE tech roles ────────────────────────────────────────────────────

  insert into public.jobs (
    source_id, canonical_key, title, title_normalized, company, company_normalized,
    location, country_code, city, remote_type, employment_type, experience_level,
    description, description_hash, required_skills, published_at, is_active,
    salary_min, salary_max, salary_currency, apply_url
  ) values

  (
    v_source_id,
    'g42-senior-ml-engineer',
    'Senior ML Engineer',
    'senior ml engineer',
    'G42',
    'g42',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'hybrid',
    'full_time',
    'senior',
    $desc$G42 is Abu Dhabi''s leading AI and cloud computing company. You will design and deploy large-scale machine learning systems powering products across healthcare, energy, and smart cities. Your work spans the full ML lifecycle: data pipelines in Python, model training with PyTorch, deployment on Kubernetes clusters, and monitoring via MLflow. You will collaborate with world-class researchers and contribute to strategic national AI programmes.$desc$,
    'g42-senior-ml-engineer',
    '["Python","PyTorch","Kubernetes","MLflow","Machine Learning","Data Pipelines"]'::jsonb,
    now() - interval '2 days',
    true,
    28000, 40000, 'AED',
    'https://www.g42.ai/careers'
  ),

  (
    v_source_id,
    'adnoc-digital-platform-engineer',
    'Platform Engineer',
    'platform engineer',
    'ADNOC Digital',
    'adnoc digital',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'onsite',
    'full_time',
    'senior',
    $desc$ADNOC Digital is accelerating the digital transformation of one of the world''s largest energy companies. As Platform Engineer you will build and operate internal developer platforms on AWS and Azure, implement infrastructure as code with Terraform, and manage Kubernetes-based workloads at scale. You will own the reliability and performance of mission-critical systems, define platform standards, and enable 50+ engineering teams to ship faster.$desc$,
    'adnoc-digital-platform-engineer',
    '["AWS","Azure","Terraform","Kubernetes","Platform Engineering","CI/CD"]'::jsonb,
    now() - interval '3 days',
    true,
    26000, 38000, 'AED',
    'https://www.adnoc.ae/en/careers'
  ),

  (
    v_source_id,
    'maf-staff-engineer',
    'Staff Engineer',
    'staff engineer',
    'Majid Al Futtaim',
    'majid al futtaim',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'lead',
    $desc$Majid Al Futtaim operates retail, leisure, and hospitality assets across 17 markets. As Staff Engineer you will set technical direction for our e-commerce and digital retail platforms. You will architect distributed systems in Node.js and Java, define API contracts across teams, drive observability standards, and lead the most complex cross-functional projects. This role requires deep system design expertise and the ability to influence at senior leadership level.$desc$,
    'maf-staff-engineer',
    '["System Design","Node.js","Java","Distributed Systems","API Design","Observability"]'::jsonb,
    now() - interval '1 day',
    true,
    40000, 55000, 'AED',
    'https://www.majidalfuttaim.com/en/careers'
  ),

  (
    v_source_id,
    'fab-senior-backend-engineer',
    'Senior Backend Engineer',
    'senior backend engineer',
    'First Abu Dhabi Bank',
    'first abu dhabi bank',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'hybrid',
    'full_time',
    'senior',
    $desc$First Abu Dhabi Bank is the UAE''s largest bank, serving millions of retail and corporate clients. Join the digital engineering team building the next generation of banking APIs. You will design and build Java Spring Boot microservices, integrate with core banking systems, and ensure your services meet the security and compliance standards of a Tier 1 financial institution. Experience with PostgreSQL and event-driven architecture using Kafka is highly valued.$desc$,
    'fab-senior-backend-engineer',
    '["Java","Spring Boot","Microservices","PostgreSQL","Kafka","REST API"]'::jsonb,
    now() - interval '4 days',
    true,
    24000, 34000, 'AED',
    'https://www.bankfab.com/en-ae/careers'
  ),

  (
    v_source_id,
    'etisalat-cloud-architect',
    'Cloud Architect',
    'cloud architect',
    'e& (Etisalat)',
    'e& etisalat',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'lead',
    $desc$e& is one of the world''s leading telecom companies, serving over 160 million customers. As Cloud Architect you will define multi-cloud strategy across AWS and Azure, design reference architectures for enterprise clients, and lead a team of cloud engineers. You will drive cloud adoption programmes, establish governance frameworks, and act as the senior technical voice in client engagements. Deep hands-on experience with Terraform, Kubernetes, and enterprise networking is required.$desc$,
    'etisalat-cloud-architect',
    '["AWS","Azure","Terraform","Kubernetes","Cloud Architecture","Enterprise Networking"]'::jsonb,
    now() - interval '2 days',
    true,
    38000, 52000, 'AED',
    'https://careers.eand.com/'
  ),

  (
    v_source_id,
    'amazon-uae-sde-2',
    'Software Development Engineer II',
    'software development engineer ii',
    'Amazon',
    'amazon',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$Amazon''s Dubai engineering hub is growing its core logistics and delivery technology team. As SDE II you will own the design and implementation of scalable Java services powering last-mile delivery operations across the GCC. You will work in a fast-paced two-pizza team, contribute to system design, write robust test coverage, and participate in the on-call rotation. Strong fundamentals in distributed systems and AWS services are essential.$desc$,
    'amazon-uae-sde-2',
    '["Java","AWS","Distributed Systems","System Design","Microservices","REST API"]'::jsonb,
    now() - interval '5 days',
    true,
    20000, 30000, 'AED',
    'https://amazon.jobs/en/locations/dubai-uae'
  ),

  (
    v_source_id,
    'mastercard-uae-senior-swe',
    'Senior Software Engineer',
    'senior software engineer',
    'Mastercard',
    'mastercard',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'senior',
    $desc$Mastercard''s MENA technology centre builds payment and fintech solutions for financial institutions across the region. You will engineer backend services in Java and Python, integrate with payment network APIs, and maintain the highest security and compliance standards. Experience with AWS, containerization, and test-driven development is expected. You will collaborate with product teams globally and contribute to architecture decisions for your service domain.$desc$,
    'mastercard-uae-senior-swe',
    '["Java","Python","AWS","REST API","Docker","Test-Driven Development"]'::jsonb,
    now() - interval '6 days',
    true,
    22000, 32000, 'AED',
    'https://careers.mastercard.com/'
  ),

  (
    v_source_id,
    'mubadala-senior-data-engineer',
    'Senior Data Engineer',
    'senior data engineer',
    'Mubadala Investment',
    'mubadala investment',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'hybrid',
    'full_time',
    'senior',
    $desc$Mubadala is Abu Dhabi''s strategic investment company with a global portfolio exceeding $280 billion. The data platform team is building the infrastructure that powers investment intelligence across the firm. You will design and maintain data pipelines using Python and dbt, model financial and operational data in Snowflake, and deploy workloads on Azure. Strong SQL, data modelling, and stakeholder management skills are critical in this high-visibility role.$desc$,
    'mubadala-senior-data-engineer',
    '["Python","SQL","Snowflake","dbt","Azure","Data Modelling"]'::jsonb,
    now() - interval '7 days',
    true,
    24000, 34000, 'AED',
    'https://www.mubadala.com/en/careers'
  )

  on conflict (canonical_key) do nothing;

end $$;
