import { Outlet } from "react-router-dom";
import TopNavbar from "./TopNavbar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-clay selection:text-paper">
      <TopNavbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-2 pb-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
