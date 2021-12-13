import React from "react";
import s from "./Spinner.module.css";

export const Spinner = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className={`m-auto ${s.skWave}`}>
      <div className={s.skWaveRect}></div>
      <div className={s.skWaveRect}></div>
      <div className={s.skWaveRect}></div>
      <div className={s.skWaveRect}></div>
      <div className={s.skWaveRect}></div>
    </div>
  </div>
);
