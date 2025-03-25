import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Logo from './logo';

const Footer = () => {
  return (
    <footer className='border-t'>
      <div className='max-w-7xl mx-auto flex flex-col items-center gap-4 p-2 text-center sm:flex-row justify-between'>
        {/* <Link href='/'>
          <Logo />
        </Link> */}
        <p className='text-sm'>© 2025 NeuralDocs. All Rights Reserved.</p>
        <div className='flex gap-4'>
          <Link href='/about' className='hover:underline'>
            About Us
          </Link>
          <Link href='/contact' className='hover:underline'>
            Contact
          </Link>
          <Link href='/privacy' className='hover:underline'>
            Privacy Policy
          </Link>
          <Link href='/terms' className='hover:underline'>
            Terms of Service
          </Link>
        </div>
        <div className='flex gap-4 text-xl'>
          <Link href='https://facebook.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-500'>
            <FaFacebook />
          </Link>
          <Link href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-400'>
            <FaTwitter />
          </Link>
          <Link href='https://instagram.com' target='_blank' rel='noopener noreferrer' className='hover:text-pink-500'>
            <FaInstagram />
          </Link>
          <Link href='https://linkedin.com' target='_blank' rel='noopener noreferrer' className='hover:text-blue-600'>
            <FaLinkedin />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;