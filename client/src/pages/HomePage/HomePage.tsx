import { Activity, Calendar, Heart, Stethoscope, Users, Clock, Shield, Zap, Award, DollarSign } from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: Calendar,
      title: t('easyAppointments'),
      description: t('easyAppointmentsDesc'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Activity,
      title: t('labResultsTitle'),
      description: t('labResultsDesc'),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Heart,
      title: t('digitalHealthCard'),
      description: t('digitalHealthCardDesc'),
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      icon: Stethoscope,
      title: t('expertDoctors'),
      description: t('expertDoctorsDesc'),
      gradient: 'from-orange-500 to-amber-500'
    }
  ];

  const whyChooseFeatures = [
    {
      icon: Zap,
      title: t('feature1Title'),
      description: t('feature1Desc'),
      color: 'blue'
    },
    {
      icon: Award,
      title: t('feature2Title'),
      description: t('feature2Desc'),
      color: 'green'
    },
    {
      icon: Shield,
      title: t('feature3Title'),
      description: t('feature3Desc'),
      color: 'purple'
    },
    {
      icon: DollarSign,
      title: t('feature4Title'),
      description: t('feature4Desc'),
      color: 'orange'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: t('happyPatients') },
    { icon: Stethoscope, value: '50+', label: t('expertDoctorsLabel') },
    { icon: Calendar, value: '25,000+', label: t('appointmentsLabel') },
    { icon: Clock, value: '24/7', label: t('support247') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="home" isAuthenticated={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-40">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('yourHealthOurPriority')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button
              onClick={() => navigate('register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all shadow-lg text-lg font-semibold transform hover:scale-105"
            >
              {t('getStarted')}
            </button>
            <button
              onClick={() => navigate('appointments')}
              className="px-8 py-4 glass-effect text-blue-600 rounded-xl hover:bg-white transition-all shadow-lg text-lg font-semibold border-2 border-blue-200 transform hover:scale-105"
            >
              {t('bookAppointment')}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 px-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="liquid-glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 transform group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 text-white mb-16 shadow-2xl mx-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center transform hover:scale-110 transition-transform">
                  <div className="flex justify-center mb-3">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-sm sm:text-base">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="liquid-glass rounded-3xl p-8 sm:p-12 shadow-2xl mx-4 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            {t('howItWorks')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('step1Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('step1Desc')}</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('step2Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('step2Desc')}</p>
            </div>
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-500 to-green-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t('step3Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
          </div>
        </div>

        <div className="liquid-glass rounded-3xl p-8 sm:p-12 shadow-2xl mx-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            {t('whyChooseUs')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600'
              }[feature.color];
              return (
                <div key={index} className="text-center group">
                  <div className={`${colorClasses} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6" />
                <span className="text-xl font-bold">HealthCare+</span>
              </div>
              <p className="text-gray-400">{t('footerText')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">{t('aboutUs')}</li>
                <li className="hover:text-white cursor-pointer">{t('services')}</li>
                <li className="hover:text-white cursor-pointer">{t('contact')}</li>
                <li className="hover:text-white cursor-pointer">{t('faq')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('contactInfo')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@healthcareplus.com</li>
                <li>Phone: 1-800-HEALTH</li>
                <li>Address: 123 Medical Center Dr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealthCare+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
