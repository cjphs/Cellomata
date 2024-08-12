(()=>{var t={686:(t,e,n)=>{"use strict";n.r(e),n.d(e,{default:()=>i});const i=class{constructor(t,e,n,i,l){this.width=t,this.height=e,this.rules=n,this.wrap=l,this.grid=this.getEmptyGrid(),this.stateCounts={},this.stateCols={},console.log("maybe"),this.rules.states.forEach((t=>{this.stateCounts[t]=0}))}getEmptyGrid=function(){console.log("callme");const t=[[]];for(let e=0;e<this.height;e++){t[e]=[];for(let n=0;n<this.width;n++)t[e][n]=this.rules.getDefaultState()}return t};getStateCounts=function(){return this.stateCounts};resetGrid=function(t=!1){if(t)for(let t=0;t<this.height;t++)for(let e=0;e<this.width;e++)this.rules.states.includes(this.getCellState(e,t))||this.setCellState(e,t,this.rules.getDefaultState());else console.log("hey i just"),this.grid=this.getEmptyGrid()};coordinatesInBounds=function(t,e){return t>=0&t<this.width&e>=0&e<this.height};getCellState=function(t,e){this.wrap&&(t=(this.width+t)%this.width,e=(this.height+e)%this.height);var n="";return this.coordinatesInBounds(t,e)&&(n=this.grid[e][t]),n};setCellState=function(t,e,n){this.coordinatesInBounds(t,e)&&(this.grid[e][t]=n)};evolve=function(){console.log("hey i just");var t=this.getEmptyGrid();let e={};this.rules.states.forEach((t=>{e[t]=0}));for(var n=0;n<this.height;n++)for(var i=0;i<this.width;i++){var l=this.getCellState(i,n);t[n][i]=l;for(var s=this.rules.getStatesDict(),o=i-1;o<i+2;o++)for(var r=n-1;r<n+2;r++)if(o!=i||r!=n){var a=this.getCellState(o,r);""!=a&&(s[a]+=1)}s["*below"]=this.getCellState(i,n+1),s["*above"]=this.getCellState(i,n-1),s["*left"]=this.getCellState(i-1,n),s["*right"]=this.getCellState(i+1,n),s["*bottomleft"]=this.getCellState(i-1,n+1),s["*bottomright"]=this.getCellState(i+1,n+1),s["*topleft"]=this.getCellState(i-1,n-1),s["*topright"]=this.getCellState(i+1,n-1);t:for(let o=0;o<this.rules.clauses[l].length;o++){let r=this.rules.clauses[l][o];if(!r.do_evaluation)continue t;let a=r.evaluate(s);if(a)for(;null!=r.conjucted_with&&(r=r.conjucted_with,a=r.evaluate(s),a););if(a){t[n][i]=r.transformState,e[t[n][i]]+=1;break t}}}this.stateCounts=e,this.grid=t};asString=function(t=",",e="\n"){let n="";for(let i=0;i<this.height;i++){for(let e=0;e<this.width;e++)n+=this.grid[i][e]+(e<this.width-1?t:"");n+=e}return n}}},829:(t,e,n)=>{"use strict";n.r(e),n.d(e,{interpretRules:()=>v,recalc_grid_size:()=>p,reset_grid:()=>f,state_cols:()=>g,variables:()=>w});const i=class{constructor(t,e,n="",i=-1,l=1,s=0,o=9){this.transformState=t,this.localityCheckType=e,this.localityCheckState=n,this.localityCount=i,this.localityRangeMin=s,this.localityRangeMax=o,this.chance=l,this.conjucted_with=null,this.do_evaluation=!0,this.equality_type="="}conjunctWith=function(t){this.conjucted_with=t};evaluate=function(t){if(Math.random()>=this.chance)return!1;switch(this.localityCheckType){case"always":return!0;case"nearby":{let e=t[this.localityCheckState];return this.localityRangeMin<=e&&e<=this.localityRangeMax}case"majority":{let e=0,n="";return states.forEach((i=>{t[i]>e&&(e=t[i],n=i)})),n===this.localityCheckState}default:return 0!==this.localityCount?t["*"+this.localityCheckType]===this.localityCheckState:t["*"+this.localityCheckType]!==this.localityCheckState}}},l=class{constructor(t){this.states=t,this.clauses={},this.states.forEach((t=>{this.clauses[t]=[]})),console.log(this.states),console.log(this.clauses)}addRule=function(t,e){this.clauses[t].push(e)};getDefaultState=function(){return this.states[0]};getStatesDict=function(t=0){const e={};return this.states.forEach((n=>{e[n]=t})),e}},s=["with","w/","w"],o=["chance","probability","prob","%"],r=["becomes:","->",":"],a=["and","&"],c=["@width","@w"],h=["@height","@h"],u=["@wrap"],d=["@colors","@colours"];let g={},f=!1,p=!1,y=[],w={};const v=function(t){console.log(t);let e=100,n=100,g=!1,w=0,v=null,b="",C={},k={};return p=!1,t.split("\n").forEach((t=>{if("#"!==(t=t.trim()).charAt(0)&&""!==t.trim())switch(w){case 0:{const e=t.replaceAll(" ","").split(",");let n=0;e.forEach((t=>{y.includes(t)&&n++})),f=!(n==y.length),y=e,v=new l(y),console.log(y,"STATES"),w=1;break}case 100:{const e=t.replaceAll(" ","").split(",");let n=0;y.forEach((t=>{k[t]=e[n++]})),w=1;break}case 1:var I,_=t.split(" ");if(S(_[0],c))(I=_[1]in C?parseInt(C[_[1]]):parseInt(_[1]))!=e&&(e=I,f=!0,p=!0);else if(S(_[0],h)){var R;(R=_[1]in C?parseInt(C[_[1]]):parseInt(_[1]))!=n&&(n=R,f=!0,p=!0)}else S(_[0],u)&&(g="true"===_[1]);S(_[0],d)?w=100:_.length>1&&S(_[1],r)?(b=_[0],w=2):_.length>1&"="==_[1]&&(C[_[0]]=_[2],console.log(C));break;case 2:E("DEFINE_CONDITIONALS"),_=t.split(" "),console.log(_[_.length-1].slice(-1));var A=!1;"."==_[_.length-1].slice(-1)&&(E("TERMINATION "+_[0]),1==_.length&&(_[0]=_[0].slice(0,-1)),A=!0);var M=1;if(_.length>1&&S(_[1],s)&&S(_[2],o)&&(E("CHANCE"),_[3]in C&&(_[3]=C[_[3]]),M=parseFloat(_[3]),_.splice(1,3)),_.length>1&&"if"==_[1]){E("IF");for(var D=!1,j=null;!D;){var B=_[2].split("*");let t="",e=-1,n="=",l=1,s=9;if(B.length>1){let e=m(B[0]);l=e[0],s=e[1],t=B[1]}else t=B[0];const o=_[3];let r=new i(_[0],o,t,e,M,l,s);r.equality_type=n,v.addRule(b,r),null!=j&&(j.conjunctWith(r),r.do_evaluation=!1),_.length>4&&S(_[4],a)?(j=r,_.splice(2,3)):D=!0}}else{let t=new i(_[0],"always","",-1,M);v.addRule(b,t)}A&&(w=1)}})),console.log(v),{gridWidth:e,gridHeight:n,ruleset:v,wrap:g,stateCols:k}};function m(t){let e,n;if("["===t[0]&&"]"===t[t.length-1])t=(t=t.substring(1,t.length-1)).split(","),e=b(t[0]),n=b(t[1]);else if(">"===t[0]||"<"===t[0]){const i="="===t[1],l=t[0];t=t.substring(i?2:1,t.length),">"===l?(e=b(t),n=1/0,i||(e+=1)):"<"===l&&(e=0,n=b(t),i||(n+=1))}else e=b(t),n=e;return[e,n]}const b=function(t){return t in w?parseInt(w[t]):parseInt(t)},S=function(t,e){return e.includes(t.toLowerCase())},E=function(t){console.log("INTERPRETER: "+t)}},803:(t,e,n)=>{"use strict";n.r(e),n.d(e,{clearGrid:()=>A,evolveDraw:()=>D,loadPreset:()=>B,pauseUnpause:()=>b,play:()=>C,recalculateGridSize:()=>d,updateRules:()=>R});var i=n(686),l=n(829),s=n(632);const o=document.getElementById("grid-canvas"),r=o.getContext("2d");let a=64,c=64,h=o.clientWidth/a,u=o.clientHeight/c;function d(){S(),h=o.clientWidth/a,u=o.clientHeight/c,g.width=a,g.height=c,M(_,!1)}let g=null,f=!1,p=0,y="",w=null,v={};const m=function(){if(console.log(g),null!=g){console.log(g);for(let t=0;t<c;t++)for(let e=0;e<a;e++)r.fillStyle=v[g.getCellState(e,t)],r.fillRect(Math.floor(h*e),Math.floor(u*t),Math.ceil(h),Math.ceil(u))}},b=function(){f?S():(E(),C())},S=function(){f=!1,document.getElementById("play-button").innerHTML="Play"},E=function(){f=!0,document.getElementById("play-button").innerHTML="Pause"},C=function(){console.log("frame"),f&&(p++%10==0&&D(),requestAnimationFrame(C))},k=function(t,e){const n=document.getElementById(t);null!=n&&(n.style.animation="none",n.offsetWidth,n.style.animation=e)},I=function(t){null!=w&&(w.style.boxShadow="none"),w=document.getElementById(t),w.style.boxShadow="white 0 0 10px",y=t};let _=null;const R=function(t=!1){const e=document.getElementById("rule_input_box").value||_;if(""==e)return;const n=(0,l.interpretRules)(e);a=n.gridWidth,c=n.gridHeight,_=n.ruleset,console.log(_),v=n.stateCols,console.log(n),console.log("wah?");const s=document.getElementById("state_picker");s.innerHTML="",_.states.forEach((t=>{const e=document.createElement("div");e.id=t,e.className="state",e.style.backgroundColor=v[t],e.onclick=function(){I(t)},s.appendChild(e)})),null==g||n.gridWidth!=g.width||n.gridHeight!=g.height?(g=new i.default(n.gridWidth,n.gridHeight,_,v,n.wrap),d()):g.rules=_,console.log(g),t?(d(),M(_)):I(y),k("grid_canvas","rules_save 1s")},A=function(){g.resetGrid(),console.log("rerrr"),I(g.rules.getDefaultState()),k("grid_canvas","grid_clear 1s"),m()},M=function(t,e=!0){g.resetGrid(e),I(t.getDefaultState()),m()},D=function(){g.evolve(),m()};m(),document.onkeydown=function(t){if((t=t||window).ctrlKey)switch(t.key){case"s":R(),m(),t.preventDefault(),t.stopPropagation();break;case"x":A()}};let j=!1;o.addEventListener("mousedown",(function(){j=!0}),!1),o.addEventListener("mouseup",(function(){j=!1}),!1),o.addEventListener("mousemove",(t=>{if(j){const e=t.target.getBoundingClientRect(),n=t.clientX-e.left,i=t.clientY-e.top,l=Math.floor(n/h),s=Math.floor(i/u);g.setCellState(l,s,y),m()}}),!1);const B=function(t){_=s.default.get(t),console.log(_),document.getElementById("rule_input_box").value=_,R(!0)};console.log("wuppa"),B("life"),document.addEventListener("DOMContentLoaded",(function(){document.getElementById("step").addEventListener("click",(function(){console.log("evolve"),g.evolve(),console.log("draw"),m()})),document.getElementById("updateRules").addEventListener("click",R),document.getElementById("clear-grid").addEventListener("click",A),document.getElementById("play-button").addEventListener("click",b),document.getElementById("template_selection_box").addEventListener("change",(function(){B(this.value)}))}))},632:(t,e,n)=>{"use strict";n.r(e),n.d(e,{default:()=>s});const i=new Map,l=n(177);l.keys().forEach((t=>{const e=l(t).default,n=t.split("/")[1].split(".")[0];i.set(n,e)}));const s=i},761:(t,e,n)=>{"use strict";n.r(e),n.d(e,{default:()=>i});const i="Void, Air, Wall\n@colors\nblack, white, black\n\np = .5\n\nVoid ->\nAir with chance p\nWall.\n\nq = .9\n\nAir ->\nWall with prob q if >4*Wall nearby\nAir.\n\nWall ->\nWall if >3*Wall nearby\nAir.\n\n@width 64\n@height 64\n@wrap true"},609:(t,e,n)=>{"use strict";n.r(e),n.d(e,{default:()=>i});const i="Void, Dead, Alive\n@colors\nblack, black, white\n\np = .2\n\nVoid ->\nAlive with chance p\nDead otherwise.\n\nDead ->\nAlive if 3*Alive nearby\nDead otherwise.\n\nAlive ->\nAlive if [2,3]*Alive nearby\nDead otherwise.\n\n@width 100\n@height 100\n@wrap true"},133:(t,e,n)=>{"use strict";n.r(e),n.d(e,{default:()=>i});const i="Nil, Rock, Paper, Scissors\n@colors\nblack, red, yellow, orange\n\nNil ->\nRock with chance .3\nPaper with chance .3\nScissors with chance .3\nNil.\n\nt = 3\np = 1\n\nRock ->\nPaper with prob p if >=t*Paper nearby\nRock otherwise.\n\nPaper ->\nScissors with prob p if >=t*Scissors nearby\nPaper otherwise.\n\nScissors ->\nRock with prob p if >=t*Rock nearby\nScissors otherwise.\n\n@width 100\n@height 100\n@wrap true"},177:(t,e,n)=>{var i={"./caves.js":761,"./life.js":609,"./rockpaperscissors.js":133};function l(t){var e=s(t);return n(e)}function s(t){if(!n.o(i,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return i[t]}l.keys=function(){return Object.keys(i)},l.resolve=s,t.exports=l,l.id=177}},e={};function n(i){var l=e[i];if(void 0!==l)return l.exports;var s=e[i]={exports:{}};return t[i](s,s.exports,n),s.exports}n.d=(t,e)=>{for(var i in e)n.o(e,i)&&!n.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),n.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n(829),n(632),n(686),n(803)})();