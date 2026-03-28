import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-8xl font-extrabold gradient-title">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="text-gray-600 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button className="mt-4">Return Home</Button>
      </Link>
    </div>
  );
}
