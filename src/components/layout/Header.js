import HeaderLogo from "./HeaderLogo";
import Navigation from "./Navigation";
// import HeaderNavigation from "./HeaderNavigation";

function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 border-b border-primary-50 px-8 pt-5 pb-3 ml-3 mr-3">
      <div className="flex flex-col gap-3 justify-end items-center max-w-7xl mx-auto lg:flex-row lg:justify-between">
        <HeaderLogo />
        <Navigation className="m-2" />
        {/* <HeaderNavigation /> */}
      </div>
    </header>
  );
}

export default Header;
