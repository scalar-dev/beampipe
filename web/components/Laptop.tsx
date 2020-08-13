import s from "./Laptop.module.css";

export const Laptop = () => (
  <div
    className="mx-auto"
    style={{
      width: "100%",
      maxWidth: "48rem",
      maxHeight: "calc(48rem * 3 / 5)",
      height: "calc(100vw * 6 / 10)",
    }}
  >
    <div className={`${s.laptop} m-auto`}>
      <div className={s.upper}></div>
      <div className={s.lower}></div>
    </div>
  </div>
);
