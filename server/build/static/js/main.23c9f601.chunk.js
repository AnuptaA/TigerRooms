(window.webpackJsonp=window.webpackJsonp||[]).push([[0],[,,,function(e,t,a){},,,,,,,function(e,t,a){e.exports=a.p+"static/media/upload-file-svgrepo-com.36402c62.svg"},function(e,t,a){e.exports=a(27)},,,,,,,,function(e,t,a){},function(e,t,a){var l={"./Whitman_Wendell-B_2.png":21,"./Whitman_Wendell-B_3.png":22,"./Whitman_Wendell-B_4.png":23,"./Whitman_Wendell-C_2.png":24,"./Whitman_Wendell-C_3.png":25,"./Whitman_Wendell-C_4.png":26};function n(e){var t=r(e);return a(t)}function r(e){if(!a.o(l,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return l[e]}n.keys=function(){return Object.keys(l)},n.resolve=r,e.exports=n,n.id=20},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-B_2.02f85678.png"},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-B_3.2908d517.png"},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-B_4.fa5a94e0.png"},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-C_2.16f9ca52.png"},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-C_3.a0526f19.png"},function(e,t,a){e.exports=a.p+"static/media/Whitman_Wendell-C_4.624b148c.png"},function(e,t,a){"use strict";a.r(t);var l=a(0),n=a.n(l),r=a(5),o=a.n(r),c=(a(19),a(4)),s=a(2);a(3);const i=e=>{let{availabilityInfo:t}=e;const a=t.length>0?Math.max(...t.map(e=>e.floors.length)):0;if(0===t.length)return n.a.createElement("div",null,n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("br",null),n.a.createElement("h2",{className:"res-college-title"},"No results matched your parameters"),n.a.createElement("img",{id:"lockup",src:"/misc/PU_lockup.png",alt:"lockup"}));const l=(e,t,a)=>{return`../floorplans/hallfloor?resco=${e}&hall=${t}&floor=${a[0]}`};return n.a.createElement("div",{className:"table-container"},n.a.createElement("table",{className:"availability-table"},n.a.createElement("thead",null,n.a.createElement("tr",null,t.map((e,t)=>n.a.createElement("th",{key:t},e.hall)))),n.a.createElement("tbody",{className:"floorplan-table"},[...Array(a)].map((e,a)=>n.a.createElement("tr",{key:a},t.map((e,t)=>n.a.createElement("td",{key:t},e.floors[a]?n.a.createElement("a",{href:l("Whitman",e.hall,e.floors[a])},e.floors[a]):"")))))))};var m=()=>{const e=Object(s.m)(),t=new URLSearchParams(e.search),a=t.get("resco"),r=t.get("hall"),o=t.get("floor"),c=t.get("occupancy"),m=t.get("minSquareFootage"),u=t.get("resco")||"",d=t.get("hall")||"",p=t.get("floor")||"",h=t.get("occupancy")||"",f=t.get("minSquareFootage")||"",[E,g]=Object(l.useState)([]);return Object(l.useEffect)(()=>{document.cookie=`resco=${u}; path=/;`,document.cookie=`hall=${d}; path=/;`,document.cookie=`floor=${p}; path=/;`,document.cookie=`occupancy=${h}; path=/;`,document.cookie=`minSquareFootage=${f}; path=/;`},[u,d,p,h,f]),Object(l.useEffect)(()=>{let e="";a&&(e+=`resco=${encodeURIComponent(a)}&`),r&&(e+=`hall=${encodeURIComponent(r)}&`),o&&(e+=`floor=${encodeURIComponent(o)}&`),c&&(e+=`occupancy=${encodeURIComponent(c)}&`),m&&(e+=`minSquareFootage=${encodeURIComponent(m)}&`),e.endsWith("&")&&(e=e.slice(0,-1)),fetch(`/api/floorplans${e?`?${e}`:""}`).then(e=>{if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return e.json()}).then(e=>{g(e)}).catch(e=>console.error("Error fetching floor plans:",e))},[a,r,o,c,m]),n.a.createElement("div",null,n.a.createElement("h1",{className:"results-page-title"},"Showing results for all floor plans"),n.a.createElement("h1",{className:"res-college-title"},null===a?"All Residential Colleges":a),n.a.createElement(i,{availabilityInfo:E}))};var u=()=>{const[e,t]=Object(l.useState)(""),[a,r]=Object(l.useState)(""),[o,c]=Object(l.useState)(""),[i,m]=Object(l.useState)(""),[u,d]=Object(l.useState)(0),[p,h]=Object(l.useState)(!1),[f,E]=Object(l.useState)(""),g=Object(s.o)();return n.a.createElement("div",{className:"filter-container"},n.a.createElement("h1",{className:"filter-container-title"},"Welcome to TigerRooms"),n.a.createElement("br",null),n.a.createElement("h3",{className:"filter-container-subtitle"},"Looking for an available room?"),n.a.createElement("div",{className:"dropdown-container"},n.a.createElement("div",{className:"dropdown-group"},n.a.createElement("label",{className:"filter-label",htmlFor:"residentialCollege"},"Residential College*"),n.a.createElement("select",{className:"filter-select",id:"residentialCollege",value:e,onChange:e=>t(e.target.value),style:{borderColor:p?"red":""}},n.a.createElement("option",{value:"",className:"placeholder-option"},"Select Residential College"),["Butler","Forbes","Mathey","Ncw","Rocky","Whitman","Yeh"].map((e,t)=>n.a.createElement("option",{key:t,value:e},e))),p&&n.a.createElement("p",{className:"error-message"},"Please select a Residential College.")),n.a.createElement("div",{className:"dropdown-group"},n.a.createElement("label",{className:"filter-label",htmlFor:"hall"},"Hall"),n.a.createElement("select",{className:"filter-select",id:"hall",value:a,onChange:e=>r(e.target.value),disabled:!e},n.a.createElement("option",{value:"",className:"placeholder-option"},"Select Hall"),e&&{Butler:["Yoseloff","Bogle","1976","1967","Bloomberg","Wilf","Scully"],Forbes:["Main","Annex"],Mathey:["Blair","Campbell","Edwards","Hamilton","Joline","Little"],Ncw:["Addy","Kanji","Kwanza-Jones","Jose-Feliciano"],Rocky:["Buyers","Campbell","Holder","Witherspoon"],Whitman:["1981","Fisher","Lauritzen","Murley-Pivirotto","Wendell-B","Wendell-C","Baker-E","Baker-S"],Yeh:["Fu","Grousbeck","Hariri","Mannion"]}[e].map((e,t)=>n.a.createElement("option",{key:t,value:e},e)))),n.a.createElement("div",{className:"dropdown-group"},n.a.createElement("label",{className:"filter-label",htmlFor:"floor"},"Floor"),n.a.createElement("select",{className:"filter-select",id:"floor",value:o,onChange:e=>c(e.target.value)},n.a.createElement("option",{value:"",className:"placeholder-option"},"Select Floor"),[0,1,2,3,4].map((e,t)=>n.a.createElement("option",{key:t,value:e},e)))),n.a.createElement("div",{className:"dropdown-group"},n.a.createElement("label",{className:"filter-label",htmlFor:"occupancy"},"Occupancy"),n.a.createElement("select",{className:"filter-select",id:"occupancy",value:i,onChange:e=>m(e.target.value)},n.a.createElement("option",{value:"",className:"placeholder-option"},"Select Occupancy"),[1,2,3,4].map((e,t)=>n.a.createElement("option",{key:t,value:e},e)))),n.a.createElement("div",{className:"dropdown-group"},n.a.createElement("label",{className:"filter-label",htmlFor:"squareFootage"},"Minimum Square Footage"),n.a.createElement("input",{type:"number",id:"squareFootage",min:"0",value:u,onChange:e=>{const t=e.target.value;""===t||Number.isInteger(Number(t))&&Number(t)>=0?(d(t),E("")):E("Please enter a valid positive integer.")},className:"filter-select",placeholder:"Enter min sqft"}),f&&n.a.createElement("p",{className:"error-message"},f))),n.a.createElement("div",{className:"button-container"},n.a.createElement("button",{className:"filter-submit-button",onClick:()=>{if(!e)return void h(!0);if(u<0||isNaN(u))return void E("Please enter a valid positive integer for square footage.");h(!1),E("");let t="/floorplans?";t+=`resco=${encodeURIComponent(e)}`;let l=[];a&&l.push(`hall=${encodeURIComponent(a)}`),o&&l.push(`floor=${encodeURIComponent(o)}`),i&&l.push(`occupancy=${encodeURIComponent(i)}`),u&&l.push(`minSquareFootage=${encodeURIComponent(u)}`),l.length>0&&(t+="&"+l.join("&")),g(t)}},n.a.createElement("strong",null,"SUBMIT")),n.a.createElement("button",{className:"filter-reset-button",onClick:()=>{t(""),r(""),c(""),m(""),d(0),h(!1),E("")}},n.a.createElement("strong",null,"RESET"))))};const d=e=>{let{roomInfo:t,expandedRows:a,toggleExpandRow:l,handleSaveToggle:r,hallName:o}=e;return n.a.createElement("table",{border:"1",cellPadding:"10",className:"room-availability-table"},n.a.createElement("thead",{className:"room-info-thead"},n.a.createElement("tr",null,n.a.createElement("th",{className:"availability-table-th"},"Availability Info"))),n.a.createElement("tbody",null,t.map((e,t)=>n.a.createElement(n.a.Fragment,{key:t},n.a.createElement("tr",null,n.a.createElement("td",{className:"availability-table-td",onClick:()=>l(t)},n.a.createElement("div",{className:"availability"},n.a.createElement("div",{style:{width:"1.4vh",height:"1.4vh",backgroundColor:"T"===e.isAvailable?"green":"red",borderRadius:"T"===e.isAvailable?"50%":"0",marginRight:"1.4vh"}}),n.a.createElement("strong",null,e.name)," "),n.a.createElement("div",{style:{userSelect:"none"}},a.includes(t)?"\u2796":"\u2795"))),a.includes(t)&&n.a.createElement("tr",null,n.a.createElement("td",{className:"availability-table-td",colSpan:"3"},n.a.createElement("div",{style:{padding:"10px",backgroundColor:"#f9f9f9"}},n.a.createElement("strong",null,e.size)," ",n.a.createElement("br",null),n.a.createElement("strong",null,e.occupancy)," ",n.a.createElement("br",null),n.a.createElement("strong",null,"Total Saves: ",e.total_saves),n.a.createElement("br",null),n.a.createElement("button",{onClick:()=>r(e.name.split(" ")[1],o,e.isSaved),style:{marginTop:"10px",padding:"5px 10px",cursor:"pointer"}},e.isSaved?"Unsave":"Save"))))))),n.a.createElement("tfoot",null,n.a.createElement("tr",null,n.a.createElement("td",{id:"availability-key-td"},n.a.createElement("strong",null,"Draw Availability Key"),n.a.createElement("div",{style:{display:"block",marginTop:"10px"}},n.a.createElement("div",{style:{marginBottom:"5px",display:"flex",alignItems:"center"}},n.a.createElement("div",{style:{width:"10px",height:"10px",backgroundColor:"green",borderRadius:"50%",marginRight:"5px"}}),n.a.createElement("span",null,"Available")),n.a.createElement("div",{style:{display:"flex",alignItems:"center"}},n.a.createElement("div",{style:{width:"10px",height:"10px",backgroundColor:"red",marginRight:"5px"}}),n.a.createElement("span",null,"Unavailable")))))))};var p=e=>{let{username:t}=e;console.log("hallfloor route hit");const r=Object(s.m)(),o=new URLSearchParams(r.search),[c,i]=Object(l.useState)([]),[m,u]=Object(l.useState)([]),[p,h]=Object(l.useState)(!1),f=o.get("resco"),E=o.get("hall"),g=o.get("floor");let b;Object(l.useEffect)(()=>{fetch(`/api/floorplans/hallfloor?netid=${t}&hall=${E}&floor=${g}`).then(e=>{if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return e.json()}).then(e=>{i(e)}).catch(e=>console.error("Error fetching room data:",e))},[g,t]);try{b=a(20)(`./${f}_${E}_${g}.png`),console.log(b)}catch(w){return console.log("non-existent combination of resco, hall and floor"),n.a.createElement("div",{className:"floor-plan-error-container"},n.a.createElement("h1",{className:"floor-plan-error-message"},"No results matched your parameters"),n.a.createElement("h3",{className:"floor-plan-error-message"},"Click"," ",n.a.createElement("a",{href:"/",className:"back-to-floorplans"},"here")," ","to do another search"))}const v=e=>{const t=document.cookie.split("; ");for(const a of t){const[t,l]=a.split("=");if(t===e)return l||""}return""},y=`/floorplans?resco=${v("resco")||""}&hall=${v("hall")||""}&floor=${v("floor")||""}&occupancy=${v("occupancy")||""}&minSquareFootage=${v("minSquareFootage")||""}`;return n.a.createElement("div",{className:"floor-plan-flexbox"},n.a.createElement("div",{className:"floor-plan-map"},n.a.createElement("h1",{className:"floor-plan-title"},f+" College, "+E+" Hall, Floor "+g),n.a.createElement("img",{src:b,alt:"HallMap",className:"floor-plan-image"}),n.a.createElement("h3",{className:"back-link"},"Click"," ",n.a.createElement("a",{href:y,className:"back-to-floorplans"},"here")," ","to return to floor plans list")),n.a.createElement("div",{className:"available-rooms-table"},n.a.createElement(d,{roomInfo:c,expandedRows:m,toggleExpandRow:e=>{m.includes(e)?u(m.filter(t=>t!==e)):u([...m,e])},handleSaveToggle:(e,a,l)=>{p||(h(!0),fetch(`/api/${l?"unsave_room":"save_room"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({netid:t,room_number:e,hall:a})}).then(e=>e.json()).then(t=>{i(t=>t.map(t=>t.name===`${a} ${e}`?l&&0===t.total_saves?{...t,isSaved:!1}:{...t,isSaved:!l,total_saves:l?t.total_saves-1:t.total_saves+1}:t))}).catch(e=>console.error("Error toggling save status:",e)).finally(()=>{setTimeout(()=>{h(!1)},500)}))},hallName:E})))};var h=()=>{const[e,t]=Object(l.useState)("Error, please try again");return Object(l.useEffect)(()=>{fetch("/logoutcas",{method:"GET",credentials:"include"}).then(e=>{if(!e.ok)throw new Error("Network response was not ok");return e.json()}).then(e=>{window.location.href=e.logout_url,t(e.message)}).catch(e=>{console.error("Error during logout:",e),alert("Something went wrong. Please try again.")})},["http://localhost:4000"]),n.a.createElement("div",null,n.a.createElement("h1",null,e))},f=a(8),E=a.n(f),g=a(9),b=a.n(g),v=a(10),y=a.n(v);var w=e=>{let{adminStatus:t}=e;const[a,r]=Object(l.useState)("No file selected"),[o,c]=Object(l.useState)(null),[s,i]=Object(l.useState)(!0),m=b()(E.a);if(!t)return n.a.createElement("div",{style:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"90vh",backgroundColor:"#f4f4f4",padding:"0 5vw"}},n.a.createElement("h1",{style:{color:"red",fontSize:"8vw",fontWeight:"bold",textAlign:"center",marginBottom:"2vh",textTransform:"uppercase",letterSpacing:"2px",wordWrap:"break-word"}},"Unauthorized Access"),n.a.createElement("p",{style:{color:"darkred",fontSize:"4vw",fontWeight:"bold",textAlign:"center",marginTop:"1vh",wordWrap:"break-word"}},"You do not have permission to access this page. Please contact an admin."));return n.a.createElement("div",{className:"pdf-upload-page-cont"},n.a.createElement("h1",{id:"pdf-upload-text"},"Upload the latest PDF here! Our students will thank you!"),n.a.createElement("div",{id:"upload-pdfs-cont"},n.a.createElement("form",{id:"pdf-form",onSubmit:async e=>{if(e.preventDefault(),!s)return;if(i(!1),m.fire({title:"Loading...",html:"Please wait a moment.",allowOutsideClick:!1}),m.showLoading(),!o)return m.hideLoading(),m.fire({icon:"error",title:"Oops...",text:"Please select a file to upload."}),void i(!0);const t=new FormData;t.append("request-type",1),t.append("rooms-pdf",o);try{const e=await fetch("/api/uploadpdf",{method:"POST",body:t}),l=await e.json();m.hideLoading(),e.ok?m.fire({title:"Thank you!",text:l.message,icon:"success"}):m.fire({icon:"error",title:"Oops...",text:l.error})}catch(a){m.fire({icon:"error",title:"Oops...",text:"An error occurred while uploading the file."})}i(!0)}},n.a.createElement("div",{id:"file-upload",onClick:()=>{document.getElementById("upload-pdf").click()}},n.a.createElement("label",{htmlFor:"upload-pdf"},n.a.createElement("img",{src:y.a,alt:"Upload"}),n.a.createElement("span",{className:"pdf-text"}," Drag & Drop "),n.a.createElement("span",{className:"pdf-text"}," or browse")),n.a.createElement("input",{type:"file",id:"upload-pdf",name:"rooms-pdf",accept:".pdf",onChange:e=>{const t=e.target.files[0];r(t?t.name:"No file selected"),c(t||null)},style:{display:"none"}}),n.a.createElement("small",null,"Supports: PDF"),n.a.createElement("div",{className:"uploaded-file-name"},n.a.createElement("span",null,"Uploaded file:"),"\xa0",n.a.createElement("span",null,a))),n.a.createElement("button",{type:"submit"},"Submit"))),n.a.createElement("div",null,n.a.createElement("button",{id:"reset-pdf-btn",onClick:async e=>{e.preventDefault(),m.fire({title:"Are you sure?",text:"You won't be able to revert this!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Yes, reset it!"}).then(async e=>{if(e.isConfirmed){m.fire({title:"Loading...",html:"Please wait a moment.",allowOutsideClick:!1}),m.showLoading();const e=new FormData;e.append("request-type",0);try{const a=await fetch("/api/uploadpdf",{method:"POST",body:e}),l=await a.json();m.hideLoading(),a.ok?m.fire({title:"Reset Complete!",text:l.message,icon:"success"}):m.fire({icon:"error",title:"Oops...",text:l.error})}catch(t){m.fire({icon:"error",title:"Oops...",text:"An error occurred while resetting the file."})}}})}},"Reset Database")))};var N=()=>{const[e,t]=Object(l.useState)(""),a="http://localhost:4000";return Object(l.useEffect)(()=>{(async()=>{try{const l=await fetch(`${a}/api/getupdatedtime`,{method:"GET"});if(l.ok){const e=await l.json();t(e.timestamp)}else console.error("Error fetching date:",l.status)}catch(e){console.error("Fetch error:",e)}})()},[a]),n.a.createElement("footer",null,n.a.createElement("img",{id:"lockup",src:"/misc/PU_lockup.png",alt:"lockup"}),n.a.createElement("div",{id:"middle-text-cont"},n.a.createElement("ul",null,n.a.createElement("li",{id:"update-text"},"Last Updated:"," ",n.a.createElement("span",{id:"timestamp"},e||"Loading...")),n.a.createElement("li",null,"Website created by TigerRooms group (COS333 Fall '24 Project)"))),n.a.createElement("div",{className:"right-text-cont"},n.a.createElement("p",null,"TigerRooms"),n.a.createElement("p",null,"\xa9 2024 The Trustees of Princeton University"),n.a.createElement("p",null,n.a.createElement("a",{href:"https://www.princeton.edu/content/copyright-infringement"},"Copyright Infringement"," ")," ","|",n.a.createElement("a",{href:"https://www.princeton.edu/privacy-notice"}," ","Privacy Notice"," "))))};var S=e=>{let{adminStatus:t}=e;const a=Object(s.o)();return n.a.createElement("nav",null,n.a.createElement("div",{class:"logo-cont"},n.a.createElement("img",{id:"logo",src:"/misc/princeton-logo.png",alt:"Princeton"})),n.a.createElement("ul",{id:"nav-options"},n.a.createElement("li",null,n.a.createElement("ul",{id:"left-options"},n.a.createElement("li",null,n.a.createElement("a",{href:"/"},"Home")),n.a.createElement("li",null,n.a.createElement("a",{href:"/floorplans"},"Floor Plans")),t&&n.a.createElement("li",null,n.a.createElement("a",{href:"/upload-pdfs"},"Upload PDFs")))),n.a.createElement("li",null,n.a.createElement("ul",{id:"right-options"},n.a.createElement("li",null,n.a.createElement("a",{href:"/logout"},"Log Out")),n.a.createElement("li",null,n.a.createElement("button",{id:"cart-btn",onClick:()=>{a("/cart")}},n.a.createElement("img",{id:"cart-svg",src:"/misc/cart.svg",alt:"View Cart"})))))))};var k=e=>{let{username:t}=e;const[a,r]=Object(l.useState)([]);Object(l.useEffect)(()=>{fetch(`/api/saved_rooms?user_id=${t}`).then(e=>{if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return e.json()}).then(e=>{const t=e.saved_rooms.sort((e,t)=>t.availability-e.availability);r(t)}).catch(e=>console.error("Error fetching saved rooms:",e))},[t]);return n.a.createElement("div",{className:"cart-page"},n.a.createElement("h1",{className:"cart-title"},"Your Saved Rooms"),a.length>0?n.a.createElement(n.a.Fragment,null,n.a.createElement("table",{className:"saved-rooms-table"},n.a.createElement("thead",{className:"saved-rooms-thead"},n.a.createElement("tr",null,n.a.createElement("th",null,"Room"),n.a.createElement("th",null,"Total Saves"),n.a.createElement("th",null,"Availability"),n.a.createElement("th",null))),n.a.createElement("tbody",null,a.map((e,a)=>n.a.createElement("tr",{key:a},n.a.createElement("td",null,`${e.hall} ${e.room_number}`),n.a.createElement("td",null,void 0!==e.total_saves?e.total_saves:"N/A"),n.a.createElement("td",null,n.a.createElement("div",{style:{width:"1vw",height:"1vw",borderRadius:"0.2vw",backgroundColor:!0===e.availability?"green":"red",margin:"0 auto"}})),n.a.createElement("td",null,n.a.createElement("button",{className:"trash-button",onClick:()=>((e,a)=>{window.confirm("Are you sure you want to remove this room from your cart?")&&fetch("/api/unsave_room",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({netid:t,room_number:e,hall:a})}).then(e=>e.json()).then(()=>{r(t=>t.filter(t=>!(t.room_number===e&&t.hall===a)))}).catch(e=>console.error("Error unsaving room:",e))})(e.room_number,e.hall)},"\ud83d\uddd1\ufe0f")))))),n.a.createElement("button",{className:"clear-drawn-rooms-button",onClick:()=>{window.confirm("Are you sure you want to clear all drawn rooms from the cart?")&&fetch("/api/clear_drawn_rooms",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({netid:t})}).then(e=>e.json()).then(()=>{r(e=>e.filter(e=>!0===e.availability))}).catch(e=>console.error("Error clearing drawn rooms:",e))}},"Clear All Unavailable (Drawn) Rooms From Cart")):n.a.createElement("p",{className:"no-saved-rooms"},"You haven't saved any rooms yet."))};var C=()=>{const[e,t]=n.a.useState(""),[a,l]=n.a.useState(!1);return n.a.useEffect(()=>{const e=async()=>{try{const n=await fetch("/api/user"),r=await n.json();r.username?(t(r.username),l(r.admin_status),console.log(`my username is ${r.username}`),console.log(`my admin status is ${r.admin_status}`)):(console.alert("NetID is not set, retrying..."),setTimeout(e,2e3))}catch(a){console.error("An error occurred: ",a)}};e()},[]),n.a.createElement(c.a,null,n.a.createElement(S,{adminStatus:a}),n.a.createElement(s.c,null,n.a.createElement(s.a,{path:"/floorplans",element:n.a.createElement(m,null)}),n.a.createElement(s.a,{path:"/",element:n.a.createElement(u,null)}),n.a.createElement(s.a,{path:"/floorplans/hallfloor",element:n.a.createElement(p,{username:e})}),n.a.createElement(s.a,{path:"/logout",element:n.a.createElement(h,null)}),n.a.createElement(s.a,{path:"/upload-pdfs",element:n.a.createElement(w,{adminStatus:a})}),n.a.createElement(s.a,{path:"/cart",element:n.a.createElement(k,{username:e})})),n.a.createElement(N,null))};var x=e=>{e&&e instanceof Function&&a.e(3).then(a.bind(null,28)).then(t=>{let{getCLS:a,getFID:l,getFCP:n,getLCP:r,getTTFB:o}=t;a(e),l(e),n(e),r(e),o(e)})};o.a.createRoot(document.getElementById("root")).render(n.a.createElement(n.a.StrictMode,null,n.a.createElement(C,null))),x()}],[[11,1,2]]]);
//# sourceMappingURL=main.23c9f601.chunk.js.map