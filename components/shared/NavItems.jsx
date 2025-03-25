'use client'
import { headerLinks } from '../../constants/index'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const NavItems = () => {
    const pathname = usePathname();

  return (
    <ul className='md:flex md:justify-between md:items-center flex w-full flex-col items-start gap-5 md:flex-row'>
        {headerLinks.map((link) => {
            const isActive = pathname === link.route;
            return(
                <li key={link.route} className={`${isActive && 'text-primary-500'} flex justify-center items-center whitespace-nowrap text-[16px] font-medium leading-[24px]`}>
                    <Link href={link.route}>{link.label}</Link>
                </li>
            )
        })}
    </ul>
  )
}

export default NavItems
