"use client";
import React, { useEffect } from "react";
import { InputOTPGroup, InputOTP, InputOTPSlot } from "../ui/input-otp";
import bcrypt from "bcryptjs";
import { toast } from "sonner";

type HomeLockBoxProps = {
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
};
function HomeLockBox({ isLocked, setIsLocked }: HomeLockBoxProps) {
  const [value, setValue] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  const verifyOTP = async (inputValue: string) => {
    try {
      if (
        !process.env.NEXT_PUBLIC_HASHED_PASSWORD ||
        !process.env.NEXT_PUBLIC_PEPPER
      ) {
        throw new Error("Missing environment variables");
      }
      console.log(
        process.env.NEXT_PUBLIC_HASHED_PASSWORD,
        process.env.NEXT_PUBLIC_PEPPER
      );

      setIsVerifying(true);
      const loadingToast = toast.loading("Checking access code...", {
        duration: Infinity,
      });

      const pepperedInput = inputValue + process.env.NEXT_PUBLIC_PEPPER;

      // Decode the stored hash before comparing
      const decodedHash = Buffer.from(
        process.env.NEXT_PUBLIC_HASHED_PASSWORD,
        "base64"
      ).toString();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isMatch = await bcrypt.compare(pepperedInput, decodedHash);

      toast.dismiss(loadingToast);

      if (isMatch) {
        toast.success("Access granted! Redirecting...");
        setIsLocked(false);
      } else {
        toast.error("Invalid access code");
        setValue("");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred during verification");
      setValue("");
    } finally {
      setIsVerifying(false);
    }
  };

  // Watch for complete OTP entry
  React.useEffect(() => {
    if (value.length === 4) {
      verifyOTP(value);
    }
  }, [value]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <div className="flex flex-col items-center justify-center space-y-8">
          <InputOTP
            maxLength={4}
            value={value}
            onChange={(value) => setValue(value)}
            className="gap-4 md:gap-6"
            disabled={isVerifying}
          >
            <InputOTPGroup className="flex items-center">
              {[0, 1, 2, 3].map((index) => (
                <React.Fragment key={index}>
                  <InputOTPSlot
                    index={index}
                    className="w-16 h-16 md:w-24 md:h-24 text-4xl md:text-6xl border rounded-md bg-gray-100"
                  />
                  {index < 3 && (
                    <span className="text-4xl md:text-6xl text-gray-400 mx-2 md:mx-3">
                      -
                    </span>
                  )}
                </React.Fragment>
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="text-center text-lg md:text-xl">
            {isVerifying ? (
              <>Verifying...</>
            ) : value === "" ? (
              <>Enter your access code.</>
            ) : (
              <>Checking access code...</>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomeLockBox;
