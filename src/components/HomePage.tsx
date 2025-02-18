"use client";
import React, { useState } from "react";
import HomeLockBox from "./customComponents/HomeLockBox";
import GalleryPage from './GalleryPage'

function HomePage() {
  const [isLocked, setIsLocked] = useState(true);
  return (
    <div>
        {
            isLocked ? (
                <HomeLockBox isLocked={isLocked} setIsLocked={setIsLocked} />
            ) : (
                <GalleryPage isLocked={isLocked} />
            )
        }
    </div>
  );
}

export default HomePage;
