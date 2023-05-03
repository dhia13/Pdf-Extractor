// /** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT")
module.exports = withMT({
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
				glow: ["0 0 5px #03e9f4", "0 0 25px #03e9f4", "0 0 50px #03e9f4", "0 0 100px #03e9f4"],
			},
			screens: {
				xxsm: "300px",
				xsm: "470px",
			},
			cursor: {
				delete: "url(/images/delete.png), pointer",
				erace: "url(/images/eraceCursor.png), pointer",
				pen: "url(/images/penCursor.png),pointer",
				fill: "url(/images/fillCursor.png) 15 15, pointer",
				fillA: "url(/images/fillCursorActive.png) 15 15, pointer",
				plan: "url(/images/planCursor.png),pointer",
				planA: "url(/images/planCursor.png),pointer",
				splitV: "url(/images/splitVerticalCursor.png) 15 15, pointer",
				splitVA: "url(/images/splitVerticalActiveCursor.png) 15 15, pointer",
				splitH: "url(/images/splitHorizantalCursor.png)15 15, pointer",
				splitHA: "url(/images/splitHorizantalActiveCursor.png) 15 15, pointer",
			},
		},
	},
	plugins: [],
})
