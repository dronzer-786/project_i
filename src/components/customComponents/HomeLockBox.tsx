"use client";
import React from "react";
import { InputOTPGroup, InputOTP, InputOTPSlot } from "../ui/input-otp";
import { toast } from "sonner";
import { BackgroundLines } from "./BackgroundLines";
import axios from 'axios'
import {UAParser} from "ua-parser-js";
type HomeLockBoxProps = {
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
};
function HomeLockBox({ isLocked, setIsLocked }: HomeLockBoxProps) {
  const [value, setValue] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const parser = new UAParser();
  const result = parser.getResult();
  const verifyOTP = async (inputValue: string) => {
    try {
      setIsVerifying(true);
      const loadingToast = toast.loading("Checking access code...", {
        duration: Infinity,
      });
  
      const res = await axios.post('/api/verify', {
        code: inputValue,
      });
  
      toast.dismiss(loadingToast);
  
      if (res.status === 200) {
        toast.success("Access granted!");
        console.log("Device Type:", result.device.type);       // e.g., "mobile"
console.log("Device Vendor:", result.device.vendor);   // e.g., "Apple", "Samsung"
console.log("Device Model:", result.device.model);     // e.g., "iPhone", "SM-G950F"
console.log("OS Name:", result.os.name);               // e.g., "iOS", "Android"
console.log("OS Version:", result.os.version);         // e.g., "16.4.1"
console.log("Browser:", result.browser.name, result.browser.version);
        setIsLocked(false);
      } else {
        toast.error("Invalid access code");
        setValue("");
      }
    } catch (error) {
      toast.error("An error occurred" + error);
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
  if (!isLocked) return null;
  return (
    <main className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <BackgroundLines className="flex flex-col items-center justify-center space-y-8">
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
        </BackgroundLines>
      </div>
    </main>
  );
}

export default HomeLockBox;
