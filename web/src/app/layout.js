import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Runs before paint to avoid a light-mode flash for users with dark saved.
const noFlashThemeScript = `
try {
  var stored = JSON.parse(localStorage.getItem('green-basket-theme'));
  var theme = stored && stored.state && stored.state.theme;
  if (theme === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "Green Basket - Fresh Vegetables & Fruits Delivered Daily | Best Prices",
  description:
    "Shop fresh, organic vegetables and fruits delivered daily from farms. Best prices, quality guaranteed, same-day delivery available. 100% fresh produce or money back!",
  keywords:
    "fresh vegetables online, fruits delivery, organic produce, online grocery shopping, farm fresh, same-day delivery, India",
  authors: [{ name: "Green Basket Team" }],
  creator: "Green Basket",
  publisher: "Green Basket",
  openGraph: {
    title: "Green Basket - Fresh Vegetables & Fruits Delivered Daily",
    description:
      "Buy fresh vegetables and fruits online with same-day delivery. 100% farm fresh produce guaranteed!",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com",
    siteName: "Green Basket",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com"}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Green Basket - Fresh Vegetables & Fruits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Basket - Fresh Vegetables & Fruits",
    description: "Fresh produce delivered to your doorstep daily",
    images: [
      `${process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com"}/twitter-image.jpg`,
    ],
  },
  robots:
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://apnabazaar.com",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <QueryProvider>
          <AuthProvider>
            <AntdRegistry>
              <ThemeProvider>{children}</ThemeProvider>
            </AntdRegistry>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
