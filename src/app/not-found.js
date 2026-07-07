import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl select-none">🍬</div>
        <h1 className="text-4xl font-black text-gray-900">Page Not Found</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Oops! We couldn&apos;t find what you were looking for. It may have been moved or the URL might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold px-6 py-3 rounded-full shadow-md transition-all hover:-translate-y-0.5 text-sm"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold px-6 py-3 rounded-full transition-all text-sm"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
