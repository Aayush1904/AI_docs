import "./globals.css";

export const metadata = {
  title: "NeuralDocs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
