/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        glow: [
          "0 0 5px #03e9f4",
          "0 0 25px #03e9f4",
          "0 0 50px #03e9f4",
          "0 0 100px #03e9f4",
        ],
      },
      screens: {
        xxsm: "300px",
        xsm: "470px",
      },
      cursor: {
        delete: "url(/images/delete.png), pointer",
        erace: "url(/images/erace.png), pointer",
      },
    },
  },
  plugins: [],
};
