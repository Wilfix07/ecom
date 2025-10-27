import React, { useState } from 'react';
import { ArrowLeft, Store, Heart, Shield, Award, Users, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const AboutUsPage = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('creole');

  const content = {
    creole: {
      title: '🇭🇹 KONSÈNAN NOU',
      mainText: `Deb Online Store se yon boutik sou entènèt ki la pou fè lavi w pi fasil.
Nou kwè nan yon sèvis senp, rapid, ak onèt kote chak kliyan jwenn sa l bezwen san tèt chaje.
Nan platfòm nou an, ou ka achte pwodui ou renmen yo, peye an HTG oswa USD, epi jwenn livrezon kote ou ye.

Nou travay chak jou pou ofri ou:

**Pwodwi bon kalite**

**Pri ki jis**

**Yon eksperyans kliyan ki chofe kè w**

Mèsi paske ou fè konfyans Deb Online Store. Nou la pou sèvi ou avèk respè, senplisite, ak souri 😊`,
      features: [
        {
          icon: Award,
          title: 'Pwodwi Bon Kalite',
          description: 'Nou chwazi sèlman pi bon pwodui yo pou ou.',
          color: 'bg-blue-100 text-blue-600'
        },
        {
          icon: Shield,
          title: 'Pri Ki Jis',
          description: 'Transparan ak senp. Pa gen kòmisyòn kache, pa gen s&pris.',
          color: 'bg-green-100 text-green-600'
        },
        {
          icon: Heart,
          title: 'Eksperyans Kliyan',
          description: 'Ou se priori nou. Nou fè tout pou eksperyans ou sant plezi.',
          color: 'bg-pink-100 text-pink-600'
        },
        {
          icon: Globe,
          title: 'Multi-Lang',
          description: 'Kominike nan lang w preferans ou: Kreyòl, Franse, oswa Anglè.',
          color: 'bg-purple-100 text-purple-600'
        },
        {
          icon: Store,
          title: 'Multi-Monnen',
          description: 'Peye ak kòb ou pito: HTG oswa USD. Konvèsyon en chak moman.',
          color: 'bg-orange-100 text-orange-600'
        },
        {
          icon: Users,
          title: 'Sèvis 24/7',
          description: 'Ekip nou an toujou la pou reponn kesyon ou a chak moman.',
          color: 'bg-yellow-100 text-yellow-600'
        }
      ]
    },
    french: {
      title: '🇫🇷 À PROPOS DE NOUS',
      mainText: `Deb Online Store est une boutique en ligne créée pour rendre votre vie plus simple.
Nous croyons en un service honnête, rapide et facile, où chaque client trouve ce qu'il cherche sans complications.

Sur notre plateforme, vous pouvez acheter vos produits préférés, payer en HTG ou en USD, et recevoir votre commande là où vous êtes.

Nos engagements :

**Produits de qualité**

**Prix justes et transparents**

**Une expérience client agréable et amicale**

Merci de faire confiance à Deb Online Store. Nous sommes là pour vous servir avec le sourire 😊`,
      features: [
        {
          icon: Award,
          title: 'Produits de Qualité',
          description: 'Nous ne sélectionnons que les meilleurs produits pour vous.',
          color: 'bg-blue-100 text-blue-600'
        },
        {
          icon: Shield,
          title: 'Prix Justes',
          description: 'Transparent et simple. Pas de commissions cachées, pas de surprises.',
          color: 'bg-green-100 text-green-600'
        },
        {
          icon: Heart,
          title: 'Expérience Client',
          description: 'Vous êtes notre priorité. Nous faisons tout pour rendre votre expérience agréable.',
          color: 'bg-pink-100 text-pink-600'
        },
        {
          icon: Globe,
          title: 'Multi-Langue',
          description: 'Communiquez dans votre langue préférée: Créole, Français ou Anglais.',
          color: 'bg-purple-100 text-purple-600'
        },
        {
          icon: Store,
          title: 'Multi-Devise',
          description: 'Payez avec la monnaie de votre choix: HTG ou USD. Conversion à chaque instant.',
          color: 'bg-orange-100 text-orange-600'
        },
        {
          icon: Users,
          title: 'Service 24/7',
          description: 'Notre équipe est toujours là pour répondre à vos questions à tout moment.',
          color: 'bg-yellow-100 text-yellow-600'
        }
      ]
    },
    english: {
      title: '🇺🇸 ABOUT US',
      mainText: `Deb Online Store is an online shop built to make your life easier.
We believe in simple, honest, and fast service where every customer finds exactly what they need without stress.

On our platform, you can buy your favorite products, pay in HTG or USD, and get delivery right where you are.

We're committed to giving you:

**Quality products**

**Fair prices**

**A friendly shopping experience**

Thank you for trusting Deb Online Store. We're here to serve you with respect, simplicity, and a smile 😊`,
      features: [
        {
          icon: Award,
          title: 'Quality Products',
          description: 'We only select the best products for you.',
          color: 'bg-blue-100 text-blue-600'
        },
        {
          icon: Shield,
          title: 'Fair Prices',
          description: 'Transparent and simple. No hidden fees, no surprises.',
          color: 'bg-green-100 text-green-600'
        },
        {
          icon: Heart,
          title: 'Customer Experience',
          description: 'You are our priority. We do everything to make your experience enjoyable.',
          color: 'bg-pink-100 text-pink-600'
        },
        {
          icon: Globe,
          title: 'Multi-Language',
          description: 'Communicate in your preferred language: Creole, French, or English.',
          color: 'bg-purple-100 text-purple-600'
        },
        {
          icon: Store,
          title: 'Multi-Currency',
          description: 'Pay with your preferred currency: HTG or USD. Instant conversion anytime.',
          color: 'bg-orange-100 text-orange-600'
        },
        {
          icon: Users,
          title: '24/7 Service',
          description: 'Our team is always available to answer your questions at any time.',
          color: 'bg-yellow-100 text-yellow-600'
        }
      ]
    }
  };

  const currentContent = content[selectedLanguage];

  const formatText = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        const cleanLine = line.replace(/\*\*/g, '');
        return <strong key={index} className="text-primary font-semibold">{cleanLine}</strong>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-3">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retounen
          </Button>
          
          {/* Language Selector */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-black text-gray-800">
              {currentContent.title}
            </h1>
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setSelectedLanguage('creole')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedLanguage === 'creole'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🇭🇹 KR
              </button>
              <button
                onClick={() => setSelectedLanguage('french')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedLanguage === 'french'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🇫🇷 FR
              </button>
              <button
                onClick={() => setSelectedLanguage('english')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedLanguage === 'english'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="p-8 mb-8 shadow-lg">
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {formatText(currentContent.mainText)}
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentContent.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users size={28} />
                {selectedLanguage === 'creole' && 'Kontakte Nou'}
                {selectedLanguage === 'french' && 'Contactez-Nous'}
                {selectedLanguage === 'english' && 'Contact Us'}
              </h3>
              <div className="space-y-3 text-orange-50">
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <span>support@techmarthaiti.com</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📞</span>
                  <span>+509 1234-5678</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <span>
                    {selectedLanguage === 'creole' && 'Chat dirèk 24/7'}
                    {selectedLanguage === 'french' && 'Chat direct 24/7'}
                    {selectedLanguage === 'english' && 'Direct chat 24/7'}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <span>Pòtoprens, Ayiti</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe size={28} />
                {selectedLanguage === 'creole' && 'Sosyal'}
                {selectedLanguage === 'french' && 'Social'}
                {selectedLanguage === 'english' && 'Social'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center">
                  <div className="text-3xl mb-2">📘</div>
                  <div className="text-sm font-semibold">Facebook</div>
                </a>
                <a href="#" className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm font-semibold">Instagram</div>
                </a>
                <a href="#" className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center">
                  <div className="text-3xl mb-2">🐦</div>
                  <div className="text-sm font-semibold">Twitter</div>
                </a>
                <a href="#" className="p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center">
                  <div className="text-3xl mb-2">📺</div>
                  <div className="text-sm font-semibold">YouTube</div>
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={onBack}
            variant="default"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retounen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;

