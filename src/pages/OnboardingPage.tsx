import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Store, Shirt, Smartphone, Package, Coffee, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const businessTypes = [
  { id: 'boutique', name: 'Fashion Boutique', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  { id: 'electronics', name: 'Electronics Store', icon: Smartphone, color: 'from-blue-500 to-indigo-500' },
  { id: 'grocery', name: 'Grocery/Provisions', icon: ShoppingBag, color: 'from-green-500 to-emerald-500' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Package, color: 'from-red-500 to-pink-500' },
  { id: 'cafe', name: 'Café/Restaurant', icon: Coffee, color: 'from-amber-500 to-orange-500' },
  { id: 'general', name: 'General Store', icon: Store, color: 'from-purple-500 to-violet-500' },
];

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    businessType: '',
    currency: 'NGN',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { updateProfile } = useBusiness();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Register new user and get the user object
      const newUser = await register(formData.email, formData.password, formData.name);
      
      // Create business profile using the returned user ID
      await updateProfile({
        name: formData.businessName,
        type: formData.businessType,
        currency: formData.currency,
        theme: 'light',
        accent_color: 'primary'
      }, newUser.id);

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Check if the error is due to user already existing
      if (error.message && error.message.toLowerCase().includes('user already exists')) {
        try {
          // Attempt to log in with the provided credentials
          await login(formData.email, formData.password);
          navigate('/dashboard');
          return; // Exit early on successful login
        } catch (loginError: any) {
          console.error('Login attempt failed:', loginError);
          setError('User already exists. Please check your password and try signing in instead.');
        }
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to LedgerLoom!
              </h2>
              <p className="text-gray-600">
                Let's start by creating your account
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={handleLogin}
                  disabled={!formData.email || !formData.password || isLoading}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Type of Business Do You Run?
              </h2>
              <p className="text-gray-600">
                This helps us customize LedgerLoom for your specific needs
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {businessTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.businessType === type.id;
                
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('businessType', type.id)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary-600 ml-auto" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tell Us About Your Business
              </h2>
              <p className="text-gray-600">
                Just a few more details to get you started
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>

            <div className="bg-primary-50 p-6 rounded-xl">
              <h3 className="font-semibold text-primary-900 mb-2">
                🎉 You're all set!
              </h3>
              <p className="text-primary-700">
                We'll create a customized Chart of Accounts based on your business type, 
                and you'll be ready to start weaving your business story.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password;
      case 2:
        return formData.businessType;
      case 3:
        return formData.businessName;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" padding="lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              isLoading={isLoading}
            >
              Complete Setup
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingPage;