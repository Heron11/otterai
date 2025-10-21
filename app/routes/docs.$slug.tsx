import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { PlatformLayout } from '~/components/platform/layout/PlatformLayout';
import { Markdown } from '~/components/chat/Markdown';

// Define available documentation pages
const DOCS: Record<string, { title: string; content: string; lastUpdated: string }> = {
  'terms-of-service': {
    title: 'Terms of Service',
    lastUpdated: '2025-01-20',
    content: `# Terms of Service

**Last Updated: January 20, 2025**

## 1. Acceptance of Terms

By accessing and using OtterAI ("Service"), you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License

Permission is granted to temporarily access the Service for personal, non-commercial transitory viewing only.

### This is the grant of a license, not a transfer of title, and under this license you may not:

- Modify or copy the materials
- Use the materials for any commercial purpose or for any public display
- Attempt to reverse engineer any software contained on OtterAI's platform
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server

## 3. User Accounts

When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.

You are responsible for safeguarding the password and for all activities that occur under your account.

## 4. Acceptable Use

You agree not to use the Service:

- In any way that violates any applicable national or international law or regulation
- To transmit, or procure the sending of, any advertising or promotional material without our prior written consent
- To impersonate or attempt to impersonate OtterAI, an OtterAI employee, another user, or any other person or entity
- In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful

## 5. Intellectual Property

The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of OtterAI.

## 6. User-Generated Content

Users retain ownership of code and content they create using our Service. By using our Service, you grant us a license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.

## 7. Subscription and Billing

- Subscriptions are billed in advance on a monthly basis
- Subscriptions automatically renew unless cancelled
- You can cancel your subscription at any time through your account settings
- No refunds are provided for partial months of service

## 8. Termination

We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.

## 9. Limitation of Liability

In no event shall OtterAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.

## 10. Changes to Terms

We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.

## 11. Contact Us

If you have any questions about these Terms, please contact us at: support@otterai.net`,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: '2025-01-20',
    content: `# Privacy Policy

**Last Updated: January 20, 2025**

## Introduction

OtterAI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

## Information We Collect

### Personal Information
- Email address
- Name
- Profile information
- Payment information (processed securely through Stripe)

### Usage Information
- Projects and code you create
- API usage and interactions
- Device information
- Log data and analytics

### Automatically Collected Information
- IP address
- Browser type
- Operating system
- Usage patterns and preferences

## How We Use Your Information

We use the information we collect to:

- Provide, maintain, and improve our Service
- Process your transactions and manage your subscription
- Send you technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage
- Detect, prevent, and address technical issues
- Provide customer support

## Data Storage and Security

- Your data is stored securely using industry-standard encryption
- We use Cloudflare's infrastructure for reliable and secure hosting
- Payment information is processed through Stripe and never stored on our servers
- We implement appropriate technical and organizational measures to protect your data

## Data Sharing and Disclosure

We do not sell your personal information. We may share your information only in the following circumstances:

- **With your consent**: When you explicitly agree to share information
- **Service providers**: With third-party vendors who perform services on our behalf (Clerk for authentication, Stripe for payments, Anthropic for AI services)
- **Legal requirements**: When required by law or to protect our rights
- **Business transfers**: In connection with any merger, sale, or acquisition

## Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Export your data
- Opt-out of marketing communications
- Withdraw consent at any time

## Cookies and Tracking

We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

## Third-Party Services

Our Service uses third-party services:

- **Clerk**: Authentication and user management
- **Stripe**: Payment processing
- **Anthropic**: AI model services
- **Cloudflare**: Hosting and CDN

Each service has its own privacy policy governing the use of your information.

## Children's Privacy

Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## International Data Transfers

Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction.

## Data Retention

We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.

## Changes to Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
- Email: privacy@otterai.net
- Website: https://otterai.net`,
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    lastUpdated: '2025-01-20',
    content: `# Acceptable Use Policy

**Last Updated: January 20, 2025**

## Overview

This Acceptable Use Policy outlines prohibited uses of OtterAI's services. By using our Service, you agree to comply with this policy.

## Prohibited Activities

You may not use OtterAI to:

### 1. Illegal Activities
- Engage in any illegal activities
- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Distribute malware, viruses, or harmful code

### 2. Abusive Behavior
- Harass, threaten, or abuse others
- Impersonate any person or entity
- Attempt to gain unauthorized access to systems
- Interfere with other users' access to the Service

### 3. Harmful Content
- Generate or distribute content that is:
  - Illegal or promotes illegal activities
  - Defamatory, discriminatory, or hateful
  - Sexually explicit or exploitative
  - Violent or promotes violence
  - Fraudulent or deceptive

### 4. System Abuse
- Attempt to circumvent usage limits or restrictions
- Use automated systems to access the Service excessively
- Reverse engineer or attempt to extract source code
- Overload or disrupt our infrastructure

### 5. Commercial Misuse
- Resell or redistribute our Service without authorization
- Use the Service to compete with OtterAI
- Scrape or harvest data from our platform

## AI-Specific Guidelines

When using our AI-powered features:

- Do not attempt to generate malicious code
- Do not use the service to create spam or phishing content
- Do not attempt to manipulate or "jailbreak" the AI
- Respect the intended use of the AI assistant

## Code of Conduct

Users are expected to:

- Treat other users with respect
- Provide accurate information
- Report violations of this policy
- Use the Service responsibly and ethically

## Reporting Violations

If you become aware of any violation of this policy, please report it to: abuse@otterai.net

## Consequences of Violations

Violations of this policy may result in:

- Warning and request to cease the violating activity
- Temporary suspension of your account
- Permanent termination of your account
- Legal action if necessary
- Reporting to law enforcement authorities

## Enforcement

We reserve the right to:

- Investigate suspected violations
- Remove or disable access to violating content
- Suspend or terminate accounts
- Cooperate with law enforcement
- Take any other appropriate action

## Updates to Policy

We may update this Acceptable Use Policy at any time. Continued use of the Service after changes constitutes acceptance of the updated policy.

## Contact

For questions about this policy, contact us at: legal@otterai.net`,
  },
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Not Found - OtterAI' }];
  }
  
  return [
    { title: `${data.doc.title} - OtterAI` },
    { name: 'description', content: `${data.doc.title} for OtterAI` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug || !DOCS[slug]) {
    throw new Response('Not Found', { status: 404 });
  }
  
  return json({ 
    doc: DOCS[slug],
    slug,
    availableDocs: Object.keys(DOCS).map(key => ({
      slug: key,
      title: DOCS[key].title,
    })),
  });
}

export default function DocPage() {
  const { doc, slug, availableDocs } = useLoaderData<typeof loader>();
  
  return (
    <PlatformLayout>
      <div className="min-h-screen bg-bolt-elements-background-depth-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="sticky top-24 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-bolt-elements-textSecondary uppercase tracking-wider mb-3">
                  Legal & Policies
                </h3>
                {availableDocs.map((docItem) => (
                  <a
                    key={docItem.slug}
                    href={`/docs/${docItem.slug}`}
                    className={`
                      block px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${slug === docItem.slug 
                        ? 'bg-[#e86b47] text-white' 
                        : 'text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2'
                      }
                    `}
                  >
                    {docItem.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden mb-8">
              <label htmlFor="docs-select" className="sr-only">
                Select a document
              </label>
              <select
                id="docs-select"
                value={slug}
                onChange={(e) => window.location.href = `/docs/${e.target.value}`}
                className="block w-full px-4 py-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-[#e86b47]"
              >
                {availableDocs.map((docItem) => (
                  <option key={docItem.slug} value={docItem.slug}>
                    {docItem.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="bg-bolt-elements-background-depth-2 rounded-2xl border border-bolt-elements-borderColor p-8 lg:p-12">
                {/* Header */}
                <div className="mb-8 pb-8 border-b border-bolt-elements-borderColor">
                  <h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-3">
                    {doc.title}
                  </h1>
                  <p className="text-sm text-bolt-elements-textSecondary">
                    Last updated: {new Date(doc.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Document Content */}
                <div className="prose prose-invert max-w-none">
                  <Markdown html>{doc.content}</Markdown>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-bolt-elements-borderColor">
                  <div className="bg-bolt-elements-background-depth-1 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-2">
                      Questions?
                    </h3>
                    <p className="text-bolt-elements-textSecondary mb-4">
                      If you have any questions about this document, please don't hesitate to contact us.
                    </p>
                    <a
                      href="mailto:legal@otterai.net"
                      className="inline-flex items-center px-4 py-2 bg-[#e86b47] text-white rounded-lg font-medium hover:bg-[#d45a36] transition-colors"
                    >
                      Contact Legal Team
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

