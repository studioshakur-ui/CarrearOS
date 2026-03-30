-- Phase 3 seed: mock job source and Gulf tech job listings.
-- Re-runnable: all inserts use ON CONFLICT DO NOTHING.

do $$
declare
  v_source_id uuid := 'a1a10000-0000-0000-0000-000000000001'::uuid;
begin

  -- ── Job source ────────────────────────────────────────────────────────────
  insert into public.job_sources (id, source_key, source_type, source_name, fetch_strategy, is_active)
  values (v_source_id, 'mock-gulf-tech', 'api', 'Gulf Tech Jobs (Seed)', 'poll', true)
  on conflict (source_key) do nothing;

  -- ── Jobs ─────────────────────────────────────────────────────────────────

  insert into public.jobs (
    source_id, canonical_key, title, title_normalized, company, company_normalized,
    location, country_code, city, remote_type, employment_type, experience_level,
    description, description_hash, required_skills, published_at, is_active
  ) values

  -- 1
  (
    v_source_id,
    'mock-noon-senior-react-engineer',
    'Senior React Engineer',
    'senior react engineer',
    'Noon',
    'noon',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'senior',
    $desc$You will lead frontend development for our core e-commerce platform, building fast and accessible user interfaces with React and TypeScript. Our stack runs on Next.js with GraphQL APIs backed by PostgreSQL. You will own the full frontend delivery pipeline, collaborate closely with product and design, and mentor junior engineers. Strong knowledge of REST API integration and component design patterns is essential.$desc$,
    'mock-noon-senior-react-engineer',
    '["React","TypeScript","Next.js","GraphQL","PostgreSQL","REST API"]'::jsonb,
    now() - interval '1 day',
    true
  ),

  -- 2
  (
    v_source_id,
    'mock-careem-backend-engineer',
    'Backend Engineer',
    'backend engineer',
    'Careem',
    'careem',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$Join our platform engineering team building the services that power mobility and delivery across the Middle East. You will design and maintain Node.js microservices, implement REST APIs, and optimise PostgreSQL and Redis data layers. Docker is used throughout our development and deployment workflows. You should be comfortable with TypeScript, async patterns, and distributed system trade-offs.$desc$,
    'mock-careem-backend-engineer',
    '["Node.js","TypeScript","PostgreSQL","Redis","Docker","REST API","Microservices"]'::jsonb,
    now() - interval '2 days',
    true
  ),

  -- 3
  (
    v_source_id,
    'mock-wio-fullstack-engineer',
    'Full Stack Engineer',
    'full stack engineer',
    'Wio Bank',
    'wio bank',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'onsite',
    'full_time',
    'mid',
    $desc$Wio Bank is building the region''s first platform bank. As a Full Stack Engineer you will develop customer-facing features using React on the frontend and Node.js services on the backend, all deployed on AWS with Docker. We work in TypeScript across the entire codebase. PostgreSQL is our primary database. You''ll ship features end-to-end and participate in architecture discussions.$desc$,
    'mock-wio-fullstack-engineer',
    '["React","Node.js","TypeScript","Docker","AWS","PostgreSQL"]'::jsonb,
    now() - interval '3 days',
    true
  ),

  -- 4
  (
    v_source_id,
    'mock-injazat-senior-python-developer',
    'Senior Python Developer',
    'senior python developer',
    'Injazat',
    'injazat',
    'Abu Dhabi, UAE',
    'AE',
    'Abu Dhabi',
    'onsite',
    'full_time',
    'senior',
    $desc$We are seeking an experienced Python developer to build data-driven applications for government and enterprise clients. Your work will involve Python and Django REST API backends, PostgreSQL databases, Redis caching, and Docker-based deployment pipelines. You will contribute to system design decisions and collaborate with data science teams. Experience with secure coding practices is important in our regulated environment.$desc$,
    'mock-injazat-senior-python-developer',
    '["Python","Django","PostgreSQL","Redis","Docker","REST API"]'::jsonb,
    now() - interval '4 days',
    true
  ),

  -- 5
  (
    v_source_id,
    'mock-accenture-cloud-engineer',
    'Cloud Engineer',
    'cloud engineer',
    'Accenture',
    'accenture',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$You will design and implement cloud infrastructure for enterprise clients across the Gulf. Deep hands-on experience with AWS services is required. You will use Terraform for infrastructure as code, Docker and Kubernetes for container orchestration, and build CI/CD pipelines for automated delivery. Linux administration skills are essential. You will advise clients on cloud migration strategies and best practices.$desc$,
    'mock-accenture-cloud-engineer',
    '["AWS","Terraform","Docker","Kubernetes","CI/CD","Linux"]'::jsonb,
    now() - interval '5 days',
    true
  ),

  -- 6
  (
    v_source_id,
    'mock-du-devops-engineer',
    'DevOps Engineer',
    'devops engineer',
    'du Telecom',
    'du telecom',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'onsite',
    'full_time',
    'mid',
    $desc$du is modernising its internal platform engineering capabilities. As a DevOps Engineer you will maintain and improve our Docker and Kubernetes cluster infrastructure, build CI/CD automation, manage Jenkins pipelines, and support Linux-based systems. Ansible is used for configuration management. You will work closely with development teams to reduce friction in the deployment process and improve reliability.$desc$,
    'mock-du-devops-engineer',
    '["Docker","Kubernetes","CI/CD","Jenkins","Linux","Ansible"]'::jsonb,
    now() - interval '5 days',
    true
  ),

  -- 7
  (
    v_source_id,
    'mock-enbd-senior-java-engineer',
    'Senior Java Engineer',
    'senior java engineer',
    'Emirates NBD',
    'emirates nbd',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'onsite',
    'full_time',
    'senior',
    $desc$Emirates NBD''s digital engineering team is building the next generation of banking products. You will develop high-throughput Java and Spring Boot microservices, design PostgreSQL schemas, and build REST APIs consumed by web and mobile clients. Docker is used for local development and testing. You will contribute to system design reviews and have a strong focus on performance, security, and code quality.$desc$,
    'mock-enbd-senior-java-engineer',
    '["Java","Spring Boot","PostgreSQL","Microservices","Docker","REST API"]'::jsonb,
    now() - interval '7 days',
    true
  ),

  -- 8
  (
    v_source_id,
    'mock-chalhoub-data-engineer',
    'Data Engineer',
    'data engineer',
    'Chalhoub Group',
    'chalhoub group',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$Chalhoub Group''s data platform team is building the infrastructure that powers retail analytics across our 300+ brand portfolio. You will build and maintain ETL pipelines using Python and Apache Spark, model data in PostgreSQL, and deploy workloads on AWS. SQL proficiency and understanding of data warehouse patterns are essential. Experience with dbt or similar transformation tools is a plus.$desc$,
    'mock-chalhoub-data-engineer',
    '["Python","SQL","PostgreSQL","Apache Spark","AWS","ETL"]'::jsonb,
    now() - interval '8 days',
    true
  ),

  -- 9
  (
    v_source_id,
    'mock-serviceplan-frontend-developer',
    'Frontend Developer',
    'frontend developer',
    'Serviceplan Middle East',
    'serviceplan middle east',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$You will build interactive marketing and campaign websites for leading regional and global brands from our Dubai studio. We work primarily in React and TypeScript, consume GraphQL and REST APIs, and write clean maintainable CSS. Attention to pixel-perfect implementation and cross-browser performance is expected. Collaboration with design teams and creative directors is a core part of the role.$desc$,
    'mock-serviceplan-frontend-developer',
    '["React","TypeScript","CSS","GraphQL","REST API"]'::jsonb,
    now() - interval '9 days',
    true
  ),

  -- 10
  (
    v_source_id,
    'mock-talabat-react-native-developer',
    'React Native Developer',
    'react native developer',
    'Talabat',
    'talabat',
    'Dubai, UAE',
    'AE',
    'Dubai',
    'hybrid',
    'full_time',
    'mid',
    $desc$Talabat''s mobile engineering team ships to millions of users across the GCC. You will work on our React Native codebase, building features that work across iOS and Android from a single TypeScript codebase. You will integrate REST APIs, manage state with Redux, and work with our QA team to maintain a high-quality release cadence. Understanding of native mobile performance is a strong plus.$desc$,
    'mock-talabat-react-native-developer',
    '["React Native","TypeScript","Redux","REST API","iOS","Android"]'::jsonb,
    now() - interval '10 days',
    true
  ),

  -- 11
  (
    v_source_id,
    'mock-tamara-tech-lead',
    'Tech Lead',
    'tech lead',
    'Tamara',
    'tamara',
    'Riyadh, Saudi Arabia',
    'SA',
    'Riyadh',
    'hybrid',
    'full_time',
    'lead',
    $desc$Tamara is the leading BNPL platform in Saudi Arabia. As Tech Lead you will guide a team of engineers building our consumer and merchant products in React and Node.js, all written in TypeScript. You will own system design decisions, set code quality standards, drive Docker-based deployment strategies on AWS, and balance technical debt with product velocity. Strong communication and mentorship skills are as important as technical depth.$desc$,
    'mock-tamara-tech-lead',
    '["React","Node.js","TypeScript","System Design","Docker","AWS"]'::jsonb,
    now() - interval '12 days',
    true
  ),

  -- 12
  (
    v_source_id,
    'mock-aramco-software-architect',
    'Senior Software Architect',
    'senior software architect',
    'Saudi Aramco Digital',
    'saudi aramco digital',
    'Dhahran, Saudi Arabia',
    'SA',
    'Dhahran',
    'onsite',
    'full_time',
    'lead',
    $desc$Saudi Aramco Digital is driving the largest digital transformation programme in the energy sector. As Senior Software Architect you will define the technical direction for enterprise-grade Java platforms, design AWS-based cloud architecture, enforce Microservices patterns across teams, orchestrate workloads with Docker and Kubernetes, and contribute to group-wide System Design standards. This is a senior role requiring experience in large-scale distributed systems.$desc$,
    'mock-aramco-software-architect',
    '["Java","AWS","Microservices","Docker","Kubernetes","System Design"]'::jsonb,
    now() - interval '14 days',
    true
  )

  on conflict (canonical_key) do nothing;

end $$;
