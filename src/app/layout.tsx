import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Create Mock Ad Campaign Data | Optimize Your Ad Strategies',
  description: 'Generate mock data for ad campaigns, including daily spend, impressions, clicks, adds to cart, revenue, purchases, and more. Tailor metrics like target CPM, CTR, CAC, AOV, and ATC Rate to optimize your ad strategies.',
  keywords: ['mock ad data', 'ad campaign optimization', 'CPM', 'CTR', 'CAC', 'ATC Rate', 'digital marketing tools'],
  authors: [{ name: 'Your Name' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://ad-metrics-dummy-data.vercel.app/',
    title: 'Create Mock Ad Campaign Data | Optimize Your Ad Strategies',
    description: 'Generate mock data for ad campaigns, including daily spend, impressions, clicks, adds to cart, revenue, purchases, and more. Tailor metrics like target CPM, CTR, CAC, AOV, and ATC Rate to optimize your ad strategies.',
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
    title: 'Create Mock Ad Campaign Data | Optimize Your Ad Strategies',
    description: 'Generate mock data for ad campaigns, including daily spend, impressions, clicks, adds to cart, revenue, purchases, and more. Tailor metrics like target CPM, CTR, CAC, AOV, and ATC Rate to optimize your ad strategies.',
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
          "url": "https://www.yourwebsite.com/",
          "description": "Generate mock data for ad campaigns, including daily spend, impressions, clicks, adds to cart, revenue, purchases, and more. Tailor metrics like target CPM, CTR, CAC, AOV, and ATC Rate to optimize your ad strategies."
        })}
      </script>
      </body>
    </html>
  );
}
