import s from "./Laptop.module.css";

export const Laptop = () => (
  <div className="w-full py-12">
    <div className={`${s.laptop} m-auto`}>
      <div className={s.upper}></div>
      <div className={s.lower}></div>
    </div>
  </div>
);
