# Mock data for Briefd Demo scans (to avoid rate limits and API consumption for onboarding)

NOTION_BRIEFING = """# Notion (Demo) — Competitive Briefing

## Company Snapshot
Notion is a single space where you can think, write, and plan. It is a unified wiki, docs, and project management tool designed to coordinate teams and knowledge.
- **HQ**: San Francisco, CA
- **Founded**: 2013
- **Business Model**: freemium SaaS, team-based seat subscriptions, and enterprise licenses.
- **Funding**: Over $340M raised, valued at $10B+.

## Competitor Profiles
1. **Confluence (Atlassian)**: Enterprise-grade wiki with strong integration with Jira and Trello. Primarily targets developers and large organizations.
2. **Coda**: A docs-focused app that combines writing and coding. Strong calculation/spreadsheet capabilities.
3. **Obsidian**: A popular local-first markdown note-taking app that is highly extensible.

## Differentiators
- **Database Engine**: Powerful inline databases (Kanban boards, tables, lists, calendars) that link and sync data bidirectionally.
- **Community & Templates**: A massive marketplace of user-generated templates, making onboarding very fast.
- **Notion AI**: Integrated assistant that summarizes pages, generates action items, and rewrites text directly inside docs.

## Market Insights
- Collaborative workspace sector is growing at 12% CAGR, driven by hybrid and remote work dynamics.
- Consolidating tool stacks is a key trend: teams are replacing separate wiki (Confluence), docs (Google Docs), and projects (Trello/Asana) tools with unified platforms like Notion.

## Strategic Risks
- Performance scaling issues when workspaces accumulate millions of database blocks.
- Strong competition from Microsoft Loop and Google Vids copying block-based collaborative editors.
"""

STRIPE_BRIEFING = """# Stripe (Demo) — Competitive Briefing

## Company Snapshot
Stripe is a suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes.
- **HQ**: South San Francisco, CA / Dublin, Ireland
- **Founded**: 2010
- **Business Model**: Pay-as-you-go transactional fees (typically 2.9% + 30c) and enterprise volume discounts.
- **Funding**: Over $2.2B raised, valued at $65B+.

## Competitor Profiles
1. **Adyen**: Global payment platform popular for omni-channel (online + POS) commerce, primarily targeting large enterprise accounts.
2. **PayPal (Braintree)**: Legacy payment leader with deep consumer trust, utilizing Braintree for merchant API integrations.
3. **Checkout.com**: High-performance payment gateway specializing in global payment options and low transaction processing fees.

## Differentiators
- **Developer Experience**: Industry-best documentation, robust APIs, and sandboxed test environments that make integration extremely fast.
- **Unified Suite**: Covers subscriptions (Billing), fraud protection (Radar), tax compliance (Tax), and global payouts (Connect).
- **Stripe Issuing & Treasury**: Provides banking-as-a-service features for modern tech platforms to issue cards and manage balances.

## Market Insights
- Global e-commerce payments CAGR is projected at 10.5% through 2030.
- Payment platforms are expanding into embedded finance, offering lending, banking accounts, and payroll services to SaaS customers.

## Strategic Risks
- Interchange fee compressions from card networks and regional regulations (e.g. PIX in Brazil, UPI in India).
- Adyen capturing large enterprise margins due to lower pricing models and direct acquiring bank integrations.
"""

NOTION_SWOT = {
    "strengths": [
        "Highly flexible and customizable block-based document model",
        "Extensive community-driven ecosystem with thousands of templates",
        "Powerful database views (kanban, timeline, tables) that sync bidirectionally",
        "Fast product iteration with Notion AI integrated directly into the workspace"
    ],
    "weaknesses": [
        "Performance lag when loading large databases or long pages",
        "Relatively steep learning curve for advanced database features",
        "Limited offline editing and sync support compared to native apps",
        "Lacks advanced financial or calculation formula capabilities found in spreadsheets"
    ],
    "opportunities": [
        "Expansion into enterprise knowledge hubs as companies consolidate software stacks",
        "Monetization of the template marketplace and developer platform integrations",
        "Developing deep AI agents that automate task coordination and project updates",
        "Growth in education and startup sectors via customized templates and plans"
    ],
    "threats": [
        "Microsoft Loop bundling similar block-based layouts for free in Office 365",
        "Google Workspace releasing Google Vids and smart canvas features to lock in users",
        "Coda winning users who require advanced spreadsheet formulas and automation triggers",
        "Security concerns from enterprise IT departments regarding cloud-hosted proprietary wikis"
    ],
    "executive_summary": "Notion dominates the modern collaborative workspace market through its community ecosystem and database flexibility. To defend its position against Microsoft Loop and Google Workspace bundling, Notion must resolve performance scaling bottlenecks and strengthen offline enterprise security safeguards."
}

STRIPE_SWOT = {
    "strengths": [
        "Best-in-class developer APIs and self-serve onboarding documents",
        "Massive global footprint covering over 135+ currencies and dozens of local payment methods",
        "Comprehensive add-on modules (Stripe Billing, Connect, Radar, Tax) integrated natively",
        "Strong platform locks with multi-sided marketplace payout operations (Stripe Connect)"
    ],
    "weaknesses": [
        "Relatively high transaction fees compared to direct acquiring bank providers",
        "Support can be difficult to access for smaller merchants without paid premium support contracts",
        "Complex compliance requirements for international merchants",
        "Margin dilution from legacy payment rails in emerging markets"
    ],
    "opportunities": [
        "Expansion into embedded financial services (SaaS credit lines, payroll, business banking)",
        "Capturing rapid payment digitalization in emerging markets (Latin America, Southeast Asia)",
        "Automated AI tax filing and accounting reconciliation modules for global enterprises",
        "In-person checkout POS terminals scaling via tap-to-pay mobile hardware support"
    ],
    "threats": [
        "Adyen's competitive pricing winning large enterprise accounts on high transaction volumes",
        "Regulatory caps on card interchange fees and rising compliance audits across regions",
        "Alternative decentralized digital payment networks (instant bank transfers, UPI, crypto rails)",
        "Braintree leveraging PayPal's consumer-base wallet integrations to capture checkout conversions"
    ],
    "executive_summary": "Stripe leads online payments through its unparalleled developer ecosystem and platform suite. However, to sustain high growth against enterprise-focused alternatives like Adyen, Stripe must expand its high-margin embedded finance services and defend against fee erosion from instant bank-to-bank checkout rails."
}

NOTION_COMPETITORS = {
  "target_company_name": "Notion (Demo)",
  "competitors": [
    {
      "name": "Confluence (Atlassian)",
      "strengths": ["Deep integration with Jira/Trello", "Robust permissions", "Enterprise scaling"],
      "weaknesses": ["Clunky user interface", "Slow template adoption", "Poor mobile experience"],
      "scale": "Enterprise/Large Corporate",
      "pricing_model": "Seat-based SaaS",
      "differentiator": "Developer-centric wiki",
      "strength_score": 8
    },
    {
      "name": "Coda",
      "strengths": ["Advanced formulas/Packs", "Powerful automation triggers", "Rich app-like docs"],
      "weaknesses": ["High complexity for new users", "Mobile app is slower", "Higher price point"],
      "scale": "Mid-Market / SMBs",
      "pricing_model": "Maker-based pricing",
      "differentiator": "App-document hybrid",
      "strength_score": 7
    },
    {
      "name": "Obsidian",
      "strengths": ["Local-first markdown files", "Extremely fast", "End-to-end encryption"],
      "weaknesses": ["No native database sharing", "Sync is a paid add-on", "High technical setup"],
      "scale": "Individual / Prosumer",
      "pricing_model": "Free / Paid Sync",
      "differentiator": "Private knowledge graph",
      "strength_score": 5
    }
  ],
  "key_features": [
    {
      "feature_name": "Inline Databases",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Confluence (Atlassian)", "has": False},
        {"competitor_name": "Coda", "has": True},
        {"competitor_name": "Obsidian", "has": False}
      ]
    },
    {
      "feature_name": "Block-Based Editor",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Confluence (Atlassian)", "has": False},
        {"competitor_name": "Coda", "has": True},
        {"competitor_name": "Obsidian", "has": True}
      ]
    },
    {
      "feature_name": "Community Template Marketplace",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Confluence (Atlassian)", "has": False},
        {"competitor_name": "Coda", "has": True},
        {"competitor_name": "Obsidian", "has": True}
      ]
    },
    {
      "feature_name": "Offline Native Editing",
      "target_has": False,
      "competitors_have": [
        {"competitor_name": "Confluence (Atlassian)", "has": False},
        {"competitor_name": "Coda", "has": False},
        {"competitor_name": "Obsidian", "has": True}
      ]
    },
    {
      "feature_name": "Embedded AI Assistant",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Confluence (Atlassian)", "has": True},
        {"competitor_name": "Coda", "has": True},
        {"competitor_name": "Obsidian", "has": False}
      ]
    }
  ]
}

STRIPE_COMPETITORS = {
  "target_company_name": "Stripe (Demo)",
  "competitors": [
    {
      "name": "Adyen",
      "strengths": ["Direct acquiring integration", "Single contract globally", "Excellent pricing at scale"],
      "weaknesses": ["No developer-first self-serve tier", "High entry barrier", "Limited merchant billing analytics"],
      "scale": "Large Enterprise / Global",
      "pricing_model": "Volume Interchange-plus",
      "differentiator": "Direct global acquirer",
      "strength_score": 9
    },
    {
      "name": "PayPal (Braintree)",
      "strengths": ["High conversion consumer trust", "Venmo integration built-in", "Legacy platform presence"],
      "weaknesses": ["Fragmented dashboard tools", "Arbitrary account holds", "Clunky SDK setups"],
      "scale": "SMBs / Mid-Market",
      "pricing_model": "Fixed Flat fees",
      "differentiator": "PayPal consumer lock-in",
      "strength_score": 8
    },
    {
      "name": "Checkout.com",
      "strengths": ["Flexible custom routing", "Strong presence in Europe/MENA", "Low transactional fees"],
      "weaknesses": ["Fewer billing add-on options", "Brand awareness is lower", "Slightly clunkier docs"],
      "scale": "Mid-Market / Enterprise",
      "pricing_model": "Tiered transactional",
      "differentiator": "High-volume cross-border gateway",
      "strength_score": 6
    }
  ],
  "key_features": [
    {
      "feature_name": "Developer Sandbox & Instant Setup",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Adyen", "has": False},
        {"competitor_name": "PayPal (Braintree)", "has": True},
        {"competitor_name": "Checkout.com", "has": True}
      ]
    },
    {
      "feature_name": "Global Payout Orchestration (Connect)",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Adyen", "has": True},
        {"competitor_name": "PayPal (Braintree)", "has": False},
        {"competitor_name": "Checkout.com", "has": False}
      ]
    },
    {
      "feature_name": "No-Code Billing & Invoicing Pages",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Adyen", "has": False},
        {"competitor_name": "PayPal (Braintree)", "has": True},
        {"competitor_name": "Checkout.com", "has": False}
      ]
    },
    {
      "feature_name": "SaaS Embedded Lending (Treasury/Capital)",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Adyen", "has": False},
        {"competitor_name": "PayPal (Braintree)", "has": False},
        {"competitor_name": "Checkout.com", "has": False}
      ]
    },
    {
      "feature_name": "Automated Sales Tax Calculator",
      "target_has": True,
      "competitors_have": [
        {"competitor_name": "Adyen", "has": False},
        {"competitor_name": "PayPal (Braintree)", "has": False},
        {"competitor_name": "Checkout.com", "has": False}
      ]
    }
  ]
}

def is_demo_company(company: str) -> bool:
    return company.strip().lower() in ["notion (demo)", "stripe (demo)"]

def get_demo_briefing(company: str) -> str:
    cleaned = company.strip().lower()
    if cleaned == "notion (demo)":
        return NOTION_BRIEFING
    elif cleaned == "stripe (demo)":
        return STRIPE_BRIEFING
    return ""

def get_demo_swot(company: str) -> dict:
    cleaned = company.strip().lower()
    if cleaned == "notion (demo)":
        return NOTION_SWOT
    elif cleaned == "stripe (demo)":
        return STRIPE_SWOT
    return {}

def get_demo_competitors(company: str) -> dict:
    cleaned = company.strip().lower()
    if cleaned == "notion (demo)":
        return NOTION_COMPETITORS
    elif cleaned == "stripe (demo)":
        return STRIPE_COMPETITORS
    return {}
