export const dynamicParams = false;
export const dynamic = 'error';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export function generateStaticParams() {
  // Return empty array - no static paths for now since chat isn't implemented
  return [];
}
