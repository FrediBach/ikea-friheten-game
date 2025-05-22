import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div 
          className="cursor-pointer text-2xl font-bold text-primary" 
          onClick={() => router.push("/")}
        >
          Friheten - Ikea Sofa Game
        </div>
      </div>
    </div>
  );
};

export default Header;