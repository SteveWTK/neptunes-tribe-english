import HeaderLogo from "./HeaderLogo";
import HeaderNavigation from "./HeaderNavigation";

function Header() {
  return (
    <header className="border-b border-primary-50 px-8 pt-5 pb-3">
      <div className="flex flex-col gap-3 justify-end items-center max-w-7xl mx-auto lg:flex-row lg:justify-between">
        <HeaderLogo />
        <HeaderNavigation />
      </div>
    </header>
  );
}

export default Header;
