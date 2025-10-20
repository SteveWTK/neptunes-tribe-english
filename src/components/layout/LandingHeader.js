import HeaderBase from "./HeaderBase";

export default function LandingHeader({ darkMode, setDarkMode }) {
  return (
    <HeaderBase type="landing" darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}
