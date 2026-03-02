export {};

declare global {
  interface Window {
    beampipe: (event: string) => void;
  }
}
