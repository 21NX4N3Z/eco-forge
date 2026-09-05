/**
 * Compliance & certification roadmap — where MATEGAYCBAM stands and what it
 * targets next (Thai digital-industry ecosystem).
 */

export interface Cert {
  id: string
  name: string
  org: string
  status: 'achieved' | 'in-progress' | 'planned' | 'target'
  scope: string
  why: string
}

export const CERTS: Cert[] = [
  {
    id: 'cbam',
    name: 'EU CBAM Methodology',
    org: 'European Commission (Guidance No.1–5f)',
    status: 'achieved',
    scope: 'Calculation engine, benchmarks, default values, CBAM factor schedule',
    why: 'Core domain — engine follows the official methodology per CN code',
  },
  {
    id: 'iso',
    name: 'ISO 14040 / 14044 / 14067 alignment',
    org: 'International Organization for Standardization',
    status: 'achieved',
    scope: 'LCA cradle-to-gate method, CFP quantification principles',
    why: 'Results are consistent with international CFP standards',
  },
  {
    id: 'tgo',
    name: 'TGO CBAM Manual & CFP Guidelines',
    org: 'องค์การบริหารจัดการก๊าซเรือนกระจก (TGO)',
    status: 'achieved',
    scope: 'Thai-language reporting workflow, system boundaries',
    why: 'Local regulatory alignment for Thai exporters',
  },
  {
    id: 'dsure',
    name: 'dSURE Digital Product Certification',
    org: 'depa Thailand (สนส.)',
    status: 'planned',
    scope: 'Security (OWASP IoT/Mobile Top 10) · Safety (มอก. 1561-2556) · Functionality — 3-pillar testing at depa-accredited labs; registered in Thailand Digital Catalog',
    why: 'State-backed trust mark so Thai SMEs can rely on MATEGAYCBAM with their factory data (PDPA-aligned); enables government procurement channels',
  },
  {
    id: 'pdpa',
    name: 'PDPA compliance',
    org: 'สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล',
    status: 'in-progress',
    scope: 'Factory data stored locally/encrypted in transit; no third-party analytics',
    why: 'Factory production data is commercially sensitive',
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001 (ISMS)',
    org: 'ISO/IEC',
    status: 'target',
    scope: 'Information security management for the hosted platform',
    why: 'Enterprise-grade security posture as MATEGAYCBAM scales to multi-tenant SaaS',
  },
]

/** Compact badge line for footer / PDF. */
export function badgeLine(): string {
  return 'CBAM Methodology ✓ · ISO 14040/14044/14067 aligned ✓ · TGO aligned ✓ · PDPA (in progress) · dSURE (planned) · ISO 27001 (roadmap)'
}
