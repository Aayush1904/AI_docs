import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import NavItems from './NavItems';
import MobileNav from './MobileNav';
import Logo from './logo';

const Header = () => {
  return (
    <header className='w-full bg-white shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-18'>
        <Link href="/" className='flex items-center'>
          <Logo/>
        </Link>

        <SignedIn>
          <nav className='hidden md:flex md:justify-between md:items-center w-full max-w-xs'>
            <NavItems />
          </nav>
        </SignedIn>

        <div className='flex items-center gap-4'>
          <SignedIn>
            <UserButton afterSignOutUrl='/' />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button asChild className="rounded-full bg-primary text-white hover:bg-teal-600 transition duration-200" size="lg">
              <Link href="/sign-in">
                Login
              </Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

export default Header;
