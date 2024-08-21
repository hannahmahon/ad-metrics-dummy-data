import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid

const inter = Inter({ subsets: ["latin"] });
const title = 'Create Mock Ad Campaign Data | Optimize Your Marketing Strategies'
const description = 'Generate mock data for ad or marketing campaigns, including daily spend, impressions, clicks, adds to cart, revenue, purchases, and more. Tailor metrics like target CPM, CTR, CAC, AOV, and ATC Rate to optimize your marketing or media buying strategies.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['mock ad data', 'ad campaign optimization', 'CPM', 'CTR', 'CAC', 'AOV', 'ATC Rate', 'digital marketing tools', 'media buying tools', 'marketing campaign'],
  authors: [{ name: 'Hannah Mahon' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://ad-metrics-dummy-data.vercel.app/',
    title,
    description,
    images: [
      {
        url: 'https://ad-metrics-dummy-data.vercel.app/image.png',
        width: 1200,
        height: 630,
        alt: 'Mock Ad Campaign Data Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [
      {
        url: 'https://ad-metrics-dummy-data.vercel.app/image.png',
        alt: 'Mock Ad Campaign Data Preview',
      },
    ],
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Mock Ad Campaign Data Generator",
          "url": "https://ad-metrics-dummy-data.vercel.app",
          "description": description
        })}
      </script>
      </body>
    </html>
  );
}
