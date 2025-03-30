import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/shared/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "NeuralDocs",
  icons: {
    icon: "",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <body className={`${poppins.variable}`}>
            <Toaster position="top-right" />
            {children}
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
