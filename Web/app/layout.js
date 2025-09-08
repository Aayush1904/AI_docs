import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";

export const metadata = {
  title: "NeuralDocs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
