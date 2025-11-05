import "./globals.css";

export const metadata = {
  title: "Canvas Boat Generator",
  description: "Generate a handcrafted illustration of a boat directly in your browser."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
