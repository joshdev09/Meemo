/** @type {import('tailwindcss').Config} */
module.exports = {
  // Path to all your component files
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // className="font-zalando"
        zalando: ["Zalando-Sans"],
        // className="font-inter"
        inter: ["Inter-Regular"],
        // className="font-serif"
        serif: ["EB-Garamond"], 
        // className="font-roboto"
        roboto: ["Roboto-Regular"],
      },
    },
  },
  plugins: [],
}