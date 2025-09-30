export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-primary-950 py-6 text-center text-sm">
      {" "}
      © {new Date().getFullYear()} Habitat. All rights reserved.
    </footer>
  );
}
