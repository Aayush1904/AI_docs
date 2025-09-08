import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "NeuralDocs",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
