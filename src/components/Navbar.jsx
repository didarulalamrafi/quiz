"use client";
import { useState } from "react";
import { Link, Button } from "@heroui/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <Link href="/">
              <h1 className="text-2xl font-bold text-red-600">BGC</h1>
            </Link>
          </div>
        </div>
        <ul className="items-center gap-4 flex">
          <li>
            <Link href="/quiz">Quiz</Link>
          </li>
          <li>
            <Link href="result">Result </Link>
          </li>
          {/* <li>
            <Link href="/favourite">Favourite </Link>
          </li> */}
        </ul>
      </header>
    </nav>
  );
}
