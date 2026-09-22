import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod_sys_design_2026',
    title: 'Advanced System Design Playbook',
    subtitle: 'Microservices, Event Streams, High-Throughput & Fault Tolerance',
    category: 'Engineering & Architecture',
    price: 49.00,
    currency: 'USD',
    pages: 4,
    fileKey: 'ebooks/2026/system-design-playbook-v4.pdf',
    fileSize: '3.4 MB',
    coverGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    description: 'Complete end-to-end architectural guide containing real-world blueprints, distributed consensus patterns, rate-limiting algorithms, and latency mitigation strategies.'
  },
  {
    id: 'prod_sec_blueprint',
    title: 'Full-Stack Security Blueprint',
    subtitle: 'Zero Trust, OAuth 2.1, API Threat Modeling & Hardening',
    category: 'Cybersecurity',
    price: 39.00,
    currency: 'USD',
    pages: 4,
    fileKey: 'ebooks/2026/security-blueprint-confidential.pdf',
    fileSize: '2.8 MB',
    coverGradient: 'from-emerald-600 via-teal-800 to-slate-950',
    description: 'Practitioner manual detailing defense-in-depth, encrypted payload streams, presigned URL access patterns, and automated security verification.'
  },
  {
    id: 'prod_cloud_scale',
    title: 'Cloud Architecture & High-Scale Systems',
    subtitle: 'Multi-Region Kubernetes, Edge Caching & Global Data Fabrics',
    category: 'Cloud Infrastructure',
    price: 59.00,
    currency: 'USD',
    pages: 4,
    fileKey: 'ebooks/2026/cloud-scale-architecture.pdf',
    fileSize: '4.1 MB',
    coverGradient: 'from-amber-600 via-orange-700 to-zinc-900',
    description: 'In-depth reference manual for enterprise architects constructing 99.999% SLA services across multi-cloud regions with zero single point of failure.'
  }
];

export const DEFAULT_USER = {
  id: 'usr_89f4102',
  name: 'Shivendra Singh',
  email: 'shivendrasingh4102@gmail.com',
  ipAddress: '198.51.100.42'
};
