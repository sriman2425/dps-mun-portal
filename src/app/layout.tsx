import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "DPSA MUN Season 2",
  description: "Official management portal for DPSA Model United Nations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: "80vh" }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
