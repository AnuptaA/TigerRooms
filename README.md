# TigerRooms

# Shopping cart SVG from https://www.svgrepo.com/svg/80543/shopping-cart-outline

# couldn't find creator to credit

# PDF Parsing instructions (outdated)

1. Install tabula by executing
   pip install tabula-py

2. Install jpype by executing
   pip install jpype1

3. Add available rooms to directory

4. Give PDF as command line argument to pdfparser.py
   python pdfparser.py somepath

5. View output

# Database

`pip install psycopg2-binary`
`brew install postgresql`
`export PATH="/usr/local/opt/postgresql/bin:$PATH"`
`pip install psycopg2`

# PDF Upload page

`npm i sweetalert2`
`npm i sweetalert2-react-content`
`npm install -D tailwindcss postcss autoprefixer`

Run the following to install certificates for CAS
`/Applications/Python\ 3.12/Install\ Certificates.command`
`export APP_SECRET_KEY=example`

# Updated server build instructions

1. Create the two .env files in the server/ and react/ directories
   respectively. Copy and paste them from the groupchat exactly.

2. Make sure the .env variables are loaded, run `source .env` if they
   are not, or if the start command gives errors saying a variable is an
   empty string or NONE.

3. Execute `gunicorn --bind 127.0.0.1:$SERVER_PORT server:app` in the
   terminal to run the server. This runs on localhost for now, but can be
   changed to 0.0.0.0 to test on all devices.

# General Deployment Updates

1. Anytime you import a new python module, add it to `requirements.txt`.
   When Render builds our server, it needs to install the newly added
   packages.

2. Anytime you import a new React module, add it to the list of packages
   installed above using `npm` (i.e. where sweetalert2 is currently). When
   Render builds our actual website, it needs these packages.

3. All commits will by default automatically affect our deployment. If
   you want a commit to not be reflected in the deployment, add `[skip render]`
   or `[render skip]` to the beginning of your commit message.

4. If your repository ever gets corrupted, just delete it, clone it back,
   and run `npm install` followed by the installation of any React modules
   installed above.

5. The PDFparser has been updated to run without a JVM environment, but
   it lacks proper testing. Only using files of the format `Wendell*.pdf`
   for testing until the parser has been properly tested.

6. Whenever you create a new JS page, use `const apiUrl = process.env.REACT_APP_API_URL;`
   to get the server URL at the top of the block, and if this is used in a useEffect,
   add it to the dependency array so that load errors do not occur. No more hardcoding!

7. All server routes with the exception of the index MUST begin with `/api`. This
   makes debugging easier during deployment.

---

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
],
Yeh: ["Fu", "Grousbeck", "Hariri", "Mannion"],
};
Let’s keep this naming standard though, to make it scalable
