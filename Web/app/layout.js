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
  // Remove or set icon to undefined/null to avoid empty href
  // icons: { icon: undefined },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/search"
      afterSignUpUrl="/search"
    >
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
