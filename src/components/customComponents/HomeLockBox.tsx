"use client";
import React from "react";
import { InputOTPGroup, InputOTP, InputOTPSlot } from "../ui/input-otp";
import { toast } from "sonner";
import { BackgroundLines } from "./BackgroundLines";
import axios from "axios";
import { UAParser } from "ua-parser-js";
import { sendMail } from "@/lib/mail/mailConfiguration";
import { useRouter } from "next/navigation";

function HomeLockBox() {
  const [value, setValue] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const parser = new UAParser();
  const result = parser.getResult();
  const now = new Date();
  const router = useRouter();

  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const day = now.getDate(); // Day of the month (1-31)
  const month = now.getMonth() + 1; // Months are 0-based
  const year = now.getFullYear();

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekday = daysOfWeek[now.getDay()];
  const verifyOTP = async (inputValue: string) => {
    try {
      setIsVerifying(true);
      const loadingToast = toast.loading("Checking access code...", {
        duration: Infinity,
      });

      const res = await axios.post("/api/verify", {
        code: inputValue,
      });

      toast.dismiss(loadingToast);

      if (res.status === 200) {
        router.push(`/s/${res.data.redirectUrl}`);
        // toast.success("Access granted!");
        if (
          result.os.name !== "Windows" &&
          result.device.vendor !== undefined
        ) {
          await sendMail({
            subject: `New Visitor in Project- i (${result.os.name})`,
            body: `
        Hi Boss (taqui),

Alert! Some had opened the project - i 🎯

Here are some quick details:
- 📅 Visit Time: ${weekday}, ${day}/${month}/${year} - ${hour}:${minute}:${second}

- 🖥️ Device Info: ${
              result.os.name === "Windows"
                ? result.os.name + ", " + result.browser.name
                : result.device.vendor +
                  ", " +
                  result.device.model +
                  ", " +
                  result.os.name
            }
- 📍 Location: Ramgarh, Jharkhand



Team security,
Created by Md Taqui imam 😉 
        
        
        `,
          });
        }
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
          <div className="text-center font-mono text-lg md:text-xl">
            {isVerifying ? (
              <>Verifying...</>
            ) : value === "" ? (
              <>Enter your access code.</>
            ) : ''}
          </div>
        </BackgroundLines>
      </div>
    </main>
  );
}

export default HomeLockBox;
