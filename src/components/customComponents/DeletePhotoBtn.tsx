"use client";

import * as React from "react";
import Confetti from "react-confetti";
import { AlertCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function DeletePhotoBtn() {
  const [open, setOpen] = React.useState(false);
  const [showTroll, setShowTroll] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  const handleDelete = () => {
    setShowTroll(true);
    setTimeout(() => {
      setShowTroll(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          <Trash2 className="md:mr-2 h-5 w-5" />
          <span className="hidden md:block">Delete Photo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] min-h-[300px] sm:min-h-[400px] p-0 overflow-hidden">
        {open && !showTroll && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            tweenDuration={4000}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 to-red-50/80 backdrop-blur-[2px] -z-10" />
        <div className="relative p-4 sm:p-6 md:p-10">
          <div className="absolute top-0 right-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-orange-500/10 rounded-full blur-3xl" />

          {!showTroll ? (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                  <div
                    className={cn(
                      "relative flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full",
                      "before:absolute before:inset-0 before:rounded-full before:bg-red-100",
                      "after:absolute after:inset-0 after:rounded-full after:bg-red-100",
                      "before:animate-ping-slow after:animate-pulse"
                    )}
                  >
                    <AlertCircle className="relative h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
                  </div>
                  <DialogTitle className="text-center text-2xl sm:text-3xl font-bold bg-gradient-to-r">
                    Arrey Madam Jii! 😅
                  </DialogTitle>
                  <DialogDescription className="text-center text-lg sm:text-xl font-medium text-gray-600">
                    Itni pyaari photo delete nahi karo!
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 sm:justify-center mt-6 sm:mt-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1 sm:flex-none text-base sm:text-lg py-4 sm:py-6 px-4 sm:px-8 border-2 hover:bg-gray-100/80 transition-colors duration-300"
                >
                  Thik hai, rehne do
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1 sm:flex-none text-base sm:text-lg py-4 sm:py-6 px-4 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/30"
                >
                  Delete Karo!
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
              <p className="text-xl sm:text-3xl font-bold text-red-600">
                Koi Faida Nhi, Smjhi 😂
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
