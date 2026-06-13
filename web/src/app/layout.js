import { QueryProvider } from '@/components/providers/QueryProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider } from 'antd';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Apna Bazaar - Fresh Vegetables & Fruits Delivered Daily | Best Prices",
  description: "Shop fresh, organic vegetables and fruits delivered daily from farms. Best prices, quality guaranteed, same-day delivery available. 100% fresh produce or money back!",
  keywords: "fresh vegetables online, fruits delivery, organic produce, online grocery shopping, farm fresh, same-day delivery, India",
  authors: [{ name: "Apna Bazaar Team" }],
  creator: "Apna Bazaar",
  publisher: "Apna Bazaar",
  openGraph: {
    title: "Apna Bazaar - Fresh Vegetables & Fruits Delivered Daily",
    description: "Buy fresh vegetables and fruits online with same-day delivery. 100% farm fresh produce guaranteed!",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com",
    siteName: "Apna Bazaar",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com"}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Apna Bazaar - Fresh Vegetables & Fruits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apna Bazaar - Fresh Vegetables & Fruits",
    description: "Fresh produce delivered to your doorstep daily",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com"}/twitter-image.jpg`],
  },
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1700292067500977"
     crossorigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#16A34A',  // Fresh green primary color
                  colorSuccess: '#22C55E',   // Light green for success
                  colorWarning: '#FACC15',   // Yellow accent
                  colorInfo: '#16A34A',
                  borderRadius: 8,
                  fontFamily: 'var(--font-geist-sans)',
                },
              }}
            >
              <App>
                {children}
              </App>
            </ConfigProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
