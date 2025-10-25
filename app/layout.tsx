import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MindYourEvent",
  description: "Schedule events without the back-and-forth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
