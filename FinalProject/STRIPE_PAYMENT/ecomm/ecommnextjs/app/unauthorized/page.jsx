import Link from "next/link";

const Unauthorized = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4 text-3xl">
        🚫
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 max-w-md mb-6">
        You do not have administrative permissions to view or modify this page.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;