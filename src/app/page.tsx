import { redirect } from 'next/navigation';

// Handles client-side navigations to "/" that bypass middleware.
// Middleware handles server-side redirects; this catches client-side ones.
export default function RootPage() {
  redirect('/en');
}
