import type { Metadata } from "next";
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
export const metadata: Metadata = {
  // Primary SEO and browser tab information
  title: "Space Quiz App",
  description: "A fun and interactive React-based multiple-choice quiz application about space, built with TypeScript and styled using Tailwind CSS. Features include AI-generated explanations and new questions.",

  // Open Graph metadata for social media sharing (e.g., Facebook, LinkedIn)
  openGraph: {
    title: "Space Quiz App",
    description: "Test your cosmic knowledge! A fun and interactive space quiz with AI-powered explanations and endless new questions.",
    url: "https://your-app-domain.com", // Replace with your actual deployed URL
    siteName: "Space Quiz App",
    images: [
      {
        url: "https://placehold.co/1200x630/2F2F6C/FFFFFF?text=Space+Quiz+App", // Placeholder image for social media preview
        width: 1200,
        height: 630,
        alt: "Space Quiz App Banner",
      },
      {
        url: "https://placehold.co/600x400/2F2F6C/FFFFFF?text=Space+Quiz+Logo", // Smaller image, if needed
        width: 600,
        height: 400,
        alt: "Space Quiz App Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card metadata for Twitter sharing
  twitter: {
    card: "summary_large_image",
    title: "Space Quiz App",
    description: "A cosmic trivia challenge with AI explanations and endless new questions!",
    creator: "@your_twitter_handle", // Replace with your Twitter handle if applicable
    images: ["https://placehold.co/1200x675/2F2F6C/FFFFFF?text=Space+Quiz+Twitter"], // Image for Twitter card
  },

  // Favicon and other icons
  icons: {
    icon: "/favicon.ico", // Path to your favicon file
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Author and keywords (optional but good for SEO)
  authors: [{ name: "Martin Tembo" }], // Replace with actual author
  keywords: ["space quiz", "astronomy quiz", "react app", "typescript", "tailwind css", "gemini api", "ai quiz"],

  // Canonical URL (optional, helps with SEO duplicate content issues)
  alternates: {
    canonical: "https://space-quiz-app.vercel.app/", // Replace with your actual deployed URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
