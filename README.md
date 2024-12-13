# TigerRooms

# Shopping cart SVG taken from https://www.svgrepo.com/svg/80543/shopping-cart-outline

# Server Dependencies

`pip install -r requirements.txt`

# React Dependencies

`npm i sweetalert2`
`npm i sweetalert2-react-content`

# CAS Certificates

Run the following to install certificates for CAS
`/Applications/Python\ 3.12/Install\ Certificates.command`
`export APP_SECRET_KEY=example`

# XSS validations

`npm install dompurify`

# Updated server build instructions

1. Create and paste the .env file in the server/ directory

2. Make sure the .env variables are loaded, by running `source .env`.

3. Execute `gunicorn --bind 127.0.0.1:$SERVER_PORT server:app` in the
   terminal to run the server. This runs on localhost for now, but can be
   changed to 0.0.0.0 to test on all devices.

# File Naming

From now on, the floorplan image names will be as follows:
{Residential College}_{Hall}_{Floor}.png
As an example, we would have Whitman_Wendell-B_3.png, or Whitman_1981_0.png
If you’re not sure about the exact name of the Residential College or Hall (you shouldn’t be unsure about floor, it’s an integer), refer to the following, in FilterComponent.js:

// Hardcoded list of residential colleges
const residentialColleges = [
"Butler",
"Forbes",
"Mathey",
"Ncw",
"Rocky",
"Whitman",
"Yeh",
];

const collegeHalls = {
Butler: [
"Yoseloff",
"Bogle",
"1976",
"1967",
"Bloomberg",
"Wilf",
"Scully",
],
Forbes: ["Main", "Annex"],
Mathey: ["Blair", "Campbell", "Edwards", "Hamilton", "Joline", "Little"],
Ncw: ["Addy", "Kanji", "Kwanza-Jones", "Jose-Feliciano"],
Rocky: ["Buyers", "Campbell", "Holder", "Witherspoon"],
Whitman: [
"1981",
"Fisher",
"Lauritzen",
"Murley-Pivirotto",
"Wendell-B",
"Wendell-C",
"Baker-E",
"Baker-S",
Hargadon
],
Yeh: ["Fu", "Grousbeck", "Hariri", "Mannion"],
};
Let’s keep this naming standard though, to make it scalable
