import { Link } from 'react-router-dom'
import { CheckCircle, Package, Clock, Home } from 'lucide-react'

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Thank you for your order. We're preparing your delicious pizza!
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Order Received</h3>
                <p className="text-sm text-gray-500">We've received your order</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Preparing</h3>
                <p className="text-sm text-gray-500">Est. 15-20 minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">On the Way</h3>
                <p className="text-sm text-gray-500">We'll deliver to your door</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-primary-600 to-orange-500 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
            <ul className="text-left space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>You'll receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>We'll text you when your order is on the way</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Track your order status in the "My Orders" section</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="btn-primary text-lg">
              View My Orders
            </Link>
            <Link to="/" className="btn-secondary text-lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Promo */}
          <div className="mt-12 p-6 bg-gray-100 rounded-2xl">
            <p className="text-gray-600 mb-2">Enjoyed your experience?</p>
            <p className="text-lg font-semibold text-gray-900">
              Use code <span className="text-primary-600">PIZZA10</span> for 10% off your next order!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}