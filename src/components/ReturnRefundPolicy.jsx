import React from 'react';
import { ArrowLeft, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';

const ReturnRefundPolicy = ({ onBack }) => {
  const policies = [
    {
      icon: Clock,
      title: 'Tan Limit pou Retounen',
      content: 'Ou gen 14 jou (2 semèn) pou retounen yon pwodui apre dat achat. Pwodui ki fèt karakteristik yo dwe an bon eta ak orijinal enpak.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Kondisyon pou Retounen',
      content: 'Pwodui a dwe nan eta orijinal li: pa itilize, pa gate, ak tout akseswa orijinal yo. Cha tote oswa etikèt yo pa dwe detache oswa gate.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Proses Retounen',
      content: '1. Kontakte nou nan 48 èdtan apre resi pwodui a. 2. Nou pral voye yon etikèt retounen pou ou. 3. Awoy pwodui a ak etikèt la nan adrès nou an. 4. Nou pral remèt ou nan 7-14 jou.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: XCircle,
      title: 'Pwodui ki pa ka retounen',
      content: 'Pwodui koutim ki te fèt karakteristik ou yo, pwodui ki itilize (san enpak), pwodui gate oswa manke pou lòt rezon pase defò nan manifaktiring.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Clock,
      title: 'Remboursman',
      content: 'Y ap remèt ou nan menm fòm ak menm metòd peman ki te itilize nan achat orijinal la. Tanpou a pral aparèt sou kont w nan 7-14 jou apre nou resive pwodui retounen an.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Shield,
      title: 'Chanjman Ansanm Defò',
      content: 'Si pwodui a gen yon defò manifaktiring nan 30 premye jou yo, nou pral chanje li gratis oswa remèt ou. Kontakte nou imedyatman si ou jwenn yon defò.',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retounen nan Checkout
          </Button>
          <h1 className="text-4xl font-black text-gray-800 mb-4">
            Politik Retounen ak Rebay
          </h1>
          <p className="text-lg text-gray-600">
            Dènye mizajou: {new Date().toLocaleDateString('fr-HT', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {policies.map((policy, index) => {
            const Icon = policy.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${policy.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {policy.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {policy.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ⚠️ Tanpri Li Byen
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold mb-2">Kontakte Nou</p>
              <p className="text-sm">
                Pou kòmanse yon pwosesis retounen, kontakte ekip sipò kliyan nou an nan 48 èdtan apre ou resi pwodui a.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-semibold mb-2">Kostim Livrezon</p>
              <p className="text-sm">
                You pral responsab pou kostim livrezon an nan ka sa yo: si pwodui a pa ka tounen (pou rezon nan lis la), oswa si pwodui a fè defò poutèt neglijans ou.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <p className="font-semibold mb-2">Pwodui Elektwonik</p>
              <p className="text-sm">
                Pou pwodui elektronik: mechan antripò, tablit, telefòn, yo dwe retounen nan bokset orijinal yo ak tout akseswa. Nou pral verifye seri pwodui a pou konfime achat ou.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Shield size={20} />
              Nòt Legal
            </h3>
            <p className="text-sm text-blue-800">
              Politik sa a respekte tout lwa lokal yo ki aplike. Si gen nenpòt konfli ant politik sa a ak lwa aplike yo, lwa yo pral pran priyorite. Si ou gen kèkkesyon ou endike sou politik sa a, tanpri kontaktè ajans konsomatè lokal ou oswa nou dirèkteman.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Bezwen Èd?
          </h3>
          <p className="mb-6 opacity-90">
            Si ou gen kèkkesyon ou endike sou politik retounen ak rebay nou an, pa ezite kontakte ekip sipò kliyan nou an.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">📧 Email</p>
              <p className="text-sm opacity-90">support@techmarthaiti.com</p>
            </div>
            <div>
              <p className="font-semibold mb-1">📞 Telefòn</p>
              <p className="text-sm opacity-90">+509 1234-5678</p>
            </div>
            <div>
              <p className="font-semibold mb-1">💬 Chat Direk</p>
              <p className="text-sm opacity-90">Disponib 24/7 nan kanal chat la</p>
            </div>
            <div>
              <p className="font-semibold mb-1">📍 Adrès</p>
              <p className="text-sm opacity-90">Pòtoprens, Ayiti</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={onBack}
            variant="default"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retounen nan Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;

