import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const ContactPage = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('creole');

  const content = {
    creole: {
      title: '🇭🇹 KONSÈNAN NOU',
      mainText: `Deb Online Store se yon boutik sou entènèt ki la pou fè lavi w pi fasil.
Nou kwè nan yon sèvis senp, rapid, ak onèt kote chak kliyan jwenn sa l bezwen san tèt chaje.

Nan platfòm nou an, ou ka achte pwodwi ou renmen yo, peye an HTG oswa USD, epi jwenn livrezon kote ou ye.

Nou travay chak jou pou ofri ou:

**Pwodwi bon kalite**

**Pri ki jis**

**Yon eksperyans kliyan ki chofe kè w**

Mèsi paske ou fè konfyans Deb Online Store. Nou la pou sèvi ou avèk respè, senplisite, ak souri 😊`,
      contactTitle: 'Kontakte Nou',
      contactDetails: {
        email: 'support@techmarthaiti.com',
        phone: '+509 1234-5678',
        chat: 'Chat dirèk 24/7',
        address: 'Pòtoprens, Ayiti'
      }
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
      contactTitle: 'Contactez-Nous',
      contactDetails: {
        email: 'support@techmarthaiti.com',
        phone: '+509 1234-5678',
        chat: 'Chat direct 24/7',
        address: 'Port-au-Prince, Haïti'
      }
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
      contactTitle: 'Contact Us',
      contactDetails: {
        email: 'support@techmarthaiti.com',
        phone: '+509 1234-5678',
        chat: 'Direct chat 24/7',
        address: 'Port-au-Prince, Haiti'
      }
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

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mail size={28} />
            {currentContent.contactTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
                <Mail size={24} />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${currentContent.contactDetails.email}`} className="text-orange-50 hover:underline">
                    {currentContent.contactDetails.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
                <Phone size={24} />
                <div>
                  <p className="font-semibold">Telefòn</p>
                  <a href={`tel:${currentContent.contactDetails.phone.replace(/\s/g, '')}`} className="text-orange-50 hover:underline">
                    {currentContent.contactDetails.phone}
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
                <MessageSquare size={24} />
                <div>
                  <p className="font-semibold">Chat</p>
                  <p className="text-orange-50">{currentContent.contactDetails.chat}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
                <MapPin size={24} />
                <div>
                  <p className="font-semibold">Adrès</p>
                  <p className="text-orange-50">{currentContent.contactDetails.address}</p>
                </div>
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

export default ContactPage;

