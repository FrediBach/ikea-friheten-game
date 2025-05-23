import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="flex justify-start items-left pt-8 pb-8">
        <div 
          className="cursor-pointer text-2xl font-bold text-primary" 
          style={{ color: "#0057AD" }}
          onClick={() => router.push("/")}
        >
          Friheten - Ikea Sofa Game
        </div>
      </div>
    </div>
  );
};

export default Header;