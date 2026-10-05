const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500 mt-auto">
      <div className="container mx-auto px-4">
        © {new Date().getFullYear()} <span className="font-semibold text-gray-700">MyShop</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;