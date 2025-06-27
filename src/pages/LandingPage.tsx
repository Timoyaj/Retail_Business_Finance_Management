import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  Star
} from 'lucide-react';
import Button from '../components/UI/Button';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Real-time Financial Insights',
      description: 'Track your Profit Pulse, Cash Flow Compass, and Asset Atlas with beautiful visualizations that make sense.'
    },
    {
      icon: Zap,
      title: 'Lightning-fast Transaction Entry',
      description: 'Record sales, expenses, and inventory changes in seconds with our intuitive interface designed for busy retail owners.'
    },
    {
      icon: TrendingUp,
      title: 'Retail-Specific Analytics',
      description: 'Monitor shrinkage, track product performance, and optimize your inventory with insights tailored for retail businesses.'
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: 'Your financial data is protected with enterprise-grade encryption and security measures you can trust.'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Manage your business finances on the go with our responsive design that works perfectly on any device.'
    },
    {
      icon: Users,
      title: 'Built for Small Retail',
      description: 'Designed specifically for small retail businesses with features that understand your unique challenges and needs.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Trendy Boutique',
      quote: 'LedgerLoom transformed how I understand my business. The colorful dashboards make financial management actually enjoyable!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      business: 'Tech Gadgets Store',
      quote: 'Finally, accounting software that speaks retail. The inventory tracking and shrinkage monitoring saved me thousands.',
      rating: 5
    },
    {
      name: 'Aisha Okonkwo',
      business: 'Beauty Supply Co.',
      quote: 'The real-time insights help me make better buying decisions. My profit margins have improved significantly since using LedgerLoom.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">LL</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">LedgerLoom</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/onboarding" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link to="/onboarding">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8">
              Weaving Your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Business Story
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
              Transform complex retail finances into colorful, engaging insights. LedgerLoom makes 
              accounting feel less like a chore and more like storytelling.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/onboarding">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to{' '}
              <span className="text-primary-600">Thrive</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for small retail businesses, with features that understand 
              your unique challenges and help you make better decisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by{' '}
              <span className="text-primary-600">Retail Owners</span>
            </h2>
            <p className="text-xl text-gray-600">
              See what business owners are saying about their LedgerLoom experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto">
              Join thousands of retail business owners who have made financial management 
              engaging and insightful with LedgerLoom.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/onboarding">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center mt-8 space-x-6 text-primary-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Free 14-day trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LL</span>
              </div>
              <span className="text-xl font-bold">LedgerLoom</span>
            </div>
            <p className="text-gray-400">
              © 2025 LedgerLoom. Weaving your business story.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;