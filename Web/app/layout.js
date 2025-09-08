import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "NeuralDocs",
};

export default function RootLayout({ children }) {
  // Check if Clerk keys are available
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey || publishableKey === "pk_test_placeholder") {
    // Fallback for build time or missing keys
    return (
      <html lang="en">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
