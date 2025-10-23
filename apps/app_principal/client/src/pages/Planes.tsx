import { CheckCircle2 } from 'lucide-react';

interface PlanCardProps {
  title: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const PlanCard = ({ title, price, features, popular = false }: PlanCardProps) => {
  return (
    <div className={`border rounded-2xl p-6 flex flex-col ${popular ? 'border-violet-400 border-2' : 'border-gray-200'}`}>
      {popular && <div className="text-center mb-4"><span className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full">Más Popular</span></div>}
      <h3 className="text-2xl font-bold text-center text-gray-800">{title}</h3>
      <p className="text-center text-gray-500 mt-2">USD <span className="text-4xl font-bold text-gray-900">${price}</span> /mes</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-violet-500 mr-3 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-auto w-full py-3 rounded-lg font-semibold text-lg ${popular ? 'bg-violet-500 text-white hover:bg-violet-600' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}>
        Seleccionar Plan
      </button>
    </div>
  );
};

const CurrentPlanCard = () => {
  return (
    <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800">Tu Plan Actual</h3>
        <p className="text-3xl font-bold text-violet-600 mt-2">Cuenta de Prueba</p>
        <p className="text-gray-600 mt-2">Tienes acceso a todas las funcionalidades mientras desarrollamos y probamos la aplicación.</p>
    </div>
  )
}

export default function Planes() {
  const plans = [
    {
      title: 'Básico',
      price: '8',
      features: [
        'Visualización de datos básicos',
        'Historial de 30 días',
        'Alertas simples por email',
        'Soporte estándar',
      ],
    },
    {
      title: 'Plus',
      price: '18',
      popular: true,
      features: [
        'Todo en Básico',
        'Alertas avanzadas y personalizadas',
        'Análisis de tendencias de salud',
        'Exportación de datos (CSV)',
        'Integración con tu veterinario',
      ],
    },
    {
      title: 'Pro',
      price: '35',
      features: [
        'Todo en Plus',
        'Reconocimiento de mascota por cámara (IA)',
        'Pronósticos de salud (Beta)',
        'Acceso a la API para desarrolladores',
        'Soporte prioritario',
      ],
    },
  ];

  return (
    <div className="p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Planes Flexibles para Cada Necesidad</h1>
        <p className="text-lg text-gray-500 mt-2">Elige el plan que mejor se adapte al cuidado de tu mascota.</p>
      </div>

      <div className="mb-10">
        <CurrentPlanCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard key={plan.title} {...plan} />
        ))}
      </div>
    </div>
  );
}
