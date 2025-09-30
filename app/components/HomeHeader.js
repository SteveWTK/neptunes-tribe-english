import HeaderBase from "./HeaderBase";

export default function HomeHeader({ darkMode, setDarkMode }) {
  return (
    <HeaderBase type="home" darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}
