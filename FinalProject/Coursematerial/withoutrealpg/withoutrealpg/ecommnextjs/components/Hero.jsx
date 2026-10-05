const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-rose-100 to-rose-100">
      <div className="container mx-auto flex flex-col md:flex-row items-center px-6">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="text-rose-600">MyShop</span>
          </h1>
          <p className="text-gray-700 mb-6">
            Discover the best clothing & electronics products at unbeatable prices.
          </p>
          <a
            href="/product"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
          >
            🛍️ Shop Now
          </a>
        </div>

        <div className="w-full md:w-1/2">
          <img
            src="/hero-image.png"
            alt="Hero Banner"
            className="w-full h-auto rounded"
          />
        </div>
    </div>
  </section>
  )
}

export default Hero