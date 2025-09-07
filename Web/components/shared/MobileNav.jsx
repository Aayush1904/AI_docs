import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import Image from "next/image";
import { Separator } from "../ui/separator";
import NavItems from "./NavItems";
import Logo from "./logo";

const MobileNav = () => {
  return (
    <nav className="md:hidden">
      <Sheet>
        <SheetTrigger className="align-middle">
          <Image src="/Menu.jpg" alt="Menu" width={24} height={24} className="cursor-pointer" />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-6 bg-white md:hidden p-4">
          {/* Logo with proper alignment and size */}
          <div className="flex justify-center">
            <Logo />
          </div>
          <Separator className="border border-gray-50" />
          <NavItems />
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;