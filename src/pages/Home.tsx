import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Pizza, Clock, Truck, Award, ChevronRight } from 'lucide-react'
import { getPizzas } from '../lib/supabase'
import PizzaCard from '../components/PizzaCard'
import LoadingSpinner from '../components/LoadingSpinner'

const features = [
  {
    icon: Pizza,
    title: 'Fresh Ingredients',
    description: 'We use only the freshest, locally-sourced ingredients for authentic taste.'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Hot pizza at your door in 30 minutes or less, guaranteed.'
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Enjoy free delivery on all orders over $25.'
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Voted best pizza in town for 5 consecutive years.'
  }
]

export default function Home() {
  const { data: pizzas, isLoading } = useQuery({
    queryKey: ['pizzas', 'featured'],
    queryFn: () => getPizzas(),
  })

  const featuredPizzas = pizzas?.slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 container-custom text-center text-white">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
            Authentic Italian
            <span className="block text-gradient bg-gradient-to-r from-orange-400 to-red-500">
              Pizza Paradise
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-200">
            Handcrafted with love, baked to perfection. Experience the taste of Italy in every bite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn-primary text-lg px-8 py-4">
              Order Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/menu" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4">
              View Menu
            </Link>
          </div>
        </div>

        {/* Floating Pizza Animation */}
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="relative w-48 h-48 animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 blur-2xl" />
            <Pizza className="w-48 h-48 text-orange-400 pizza-spin" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pizzas Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">
            Our <span className="text-gradient">Featured</span> Pizzas
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredPizzas?.map((pizza) => (
                <PizzaCard key={pizza.id} pizza={pizza} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/menu" className="btn-primary text-lg">
              View Full Menu
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-orange-500 text-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Special Deal!
              </h2>
              <p className="text-xl mb-6 text-white/90">
                Get 20% off on your first order. Use code: <span className="font-bold">FIRST20</span>
              </p>
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg">
                Claim Offer
              </Link>
            </div>
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-6xl font-bold">20%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="section-title">
            What Our <span className="text-gradient">Customers</span> Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                text: 'Best pizza I\'ve ever had! The crust is perfectly crispy and the toppings are always fresh.',
              },
              {
                name: 'Michael Chen',
                rating: 5,
                text: 'Fast delivery and amazing taste. Their Margherita pizza is absolutely divine!',
              },
              {
                name: 'Emily Rodriguez',
                rating: 5,
                text: 'The online ordering is so easy, and the pizza arrived hot and delicious. Highly recommend!',
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Browse our menu and discover your new favorite pizza. Fast delivery, amazing taste!
          </p>
          <Link to="/menu" className="btn-primary text-lg px-10 py-4">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  )
}