import { ShopProvider } from "@/context/ShopContext";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import CandyCursor from "@/components/CandyCursor";
import "./globals.css";

export const metadata = {
  title: "Candy World | Imported Candy, Chocolates & Gourmet — Sri Lanka",
  description:
    "Sri Lanka's #1 importer of viral candy, premium chocolates, and gourmet groceries. Islandwide Cash on Delivery (COD) available.",
  keywords:
    "imported candy Sri Lanka, buy chocolates online Sri Lanka, gourmet food online, candy world byp, tiktok candy Sri Lanka, COD delivery sweets",
  openGraph: {
    title: "Candy World Sri Lanka — Imported Candy & Chocolates",
    description:
      "Order imported sweets, chocolates & gourmet treats with Cash on Delivery anywhere in Sri Lanka.",
    type: "website",
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Candy World Sri Lanka",
    description: "Premium imported candy, chocolates & gourmet — COD Islandwide.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white flex flex-col antialiased">
        <CandyCursor />
        <AuthProvider>
          <ShopProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
