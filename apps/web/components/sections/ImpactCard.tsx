// components/ImpactCard.tsx
interface ImpactCardProps {
    title: string;
    description: string;
  }
  

export const impactData = [
    {
      title: "Capacity Building",
      description: "Strengthened government institutions and agricultural systems across multiple African nations through targeted training and infrastructure development."
    },
    {
      title: "Farmer Support",
      description: "Equipped thousands of farmers and SMEs with access to improved seeds, technologies, and agronomic practices for sustainable food production."
    },
    {
      title: "Community Impact",
      description: "Created lasting networks of farmer cooperatives and enterprises that continue to drive agricultural transformation beyond our direct involvement."
    },
    {
      title: "Sustainable Growth",
      description: "Established scalable models that enable continued innovation and improvement in agricultural productivity and climate resilience across the continent."
    }
  ];


export const ImpactCard: React.FC<ImpactCardProps> = ({ title, description }) => {
    return (
      <div className="bg-white p-6 transition-shadow">
        <h4 className="font-semibold text-primary-green text-xl mb-4">
          {title}
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
    );
  };
  