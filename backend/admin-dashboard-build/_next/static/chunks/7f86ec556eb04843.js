(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,83583,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},25729,(e,t,r)=>{"use strict";var a=e.r(85481),o="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=a.useSyncExternalStore,n=a.useRef,s=a.useEffect,l=a.useMemo,u=a.useDebugValue;r.useSyncExternalStoreWithSelector=function(e,t,r,a,c){var d=n(null);if(null===d.current){var p={hasValue:!1,value:null};d.current=p}else p=d.current;var f=i(e,(d=l(function(){function e(e){if(!s){if(s=!0,i=e,e=a(e),void 0!==c&&p.hasValue){var t=p.value;if(c(t,e))return n=t}return n=e}if(t=n,o(i,e))return t;var r=a(e);return void 0!==c&&c(t,r)?(i=e,t):(i=e,n=r)}var i,n,s=!1,l=void 0===r?null:r;return[function(){return e(t())},null===l?void 0:function(){return e(l())}]},[t,r,a,c]))[0],d[1]);return s(function(){p.hasValue=!0,p.value=f},[f]),u(f),f}},79661,(e,t,r)=>{"use strict";t.exports=e.r(25729)},46131,e=>{"use strict";var t=e.i(85481),r=e.i(79661);function a(e){e()}var o={notify(){},get:()=>[]},i="u">typeof window&&void 0!==window.document&&void 0!==window.document.createElement,n="u">typeof navigator&&"ReactNative"===navigator.product,s=i||n?t.useLayoutEffect:t.useEffect;function l(e,t){return e===t?0!==e||0!==t||1/e==1/t:e!=e&&t!=t}function u(e,t){if(l(e,t))return!0;if("object"!=typeof e||null===e||"object"!=typeof t||null===t)return!1;let r=Object.keys(e),a=Object.keys(t);if(r.length!==a.length)return!1;for(let a=0;a<r.length;a++)if(!Object.prototype.hasOwnProperty.call(t,r[a])||!l(e[r[a]],t[r[a]]))return!1;return!0}var c=Symbol.for("react-redux-context"),d="u">typeof globalThis?globalThis:{},p=function(){if(!t.createContext)return{};let e=d[c]??=new Map,r=e.get(t.createContext);return r||(r=t.createContext(null),e.set(t.createContext,r)),r}(),f=function(e){let{children:r,context:a,serverState:i,store:n}=e,l=t.useMemo(()=>{let e=function(e,t){let r,a=o,i=0,n=!1;function s(){c.onStateChange&&c.onStateChange()}function l(){if(i++,!r){let t,o;r=e.subscribe(s),t=null,o=null,a={clear(){t=null,o=null},notify(){let e=t;for(;e;)e.callback(),e=e.next},get(){let e=[],r=t;for(;r;)e.push(r),r=r.next;return e},subscribe(e){let r=!0,a=o={callback:e,next:null,prev:o};return a.prev?a.prev.next=a:t=a,function(){r&&null!==t&&(r=!1,a.next?a.next.prev=a.prev:o=a.prev,a.prev?a.prev.next=a.next:t=a.next)}}}}}function u(){i--,r&&0===i&&(r(),r=void 0,a.clear(),a=o)}let c={addNestedSub:function(e){l();let t=a.subscribe(e),r=!1;return()=>{r||(r=!0,t(),u())}},notifyNestedSubs:function(){a.notify()},handleChangeWrapper:s,isSubscribed:function(){return n},trySubscribe:function(){n||(n=!0,l())},tryUnsubscribe:function(){n&&(n=!1,u())},getListeners:()=>a};return c}(n);return{store:n,subscription:e,getServerState:i?()=>i:void 0}},[n,i]),u=t.useMemo(()=>n.getState(),[n]);return s(()=>{let{subscription:e}=l;return e.onStateChange=e.notifyNestedSubs,e.trySubscribe(),u!==n.getState()&&e.notifyNestedSubs(),()=>{e.tryUnsubscribe(),e.onStateChange=void 0}},[l,u]),t.createElement((a||p).Provider,{value:l},r)};function m(e=p){return function(){return t.useContext(e)}}var h=m();function y(e=p){let t=e===p?h:m(e),r=()=>{let{store:e}=t();return e};return Object.assign(r,{withTypes:()=>r}),r}var g=y(),b=function(e=p){let t=e===p?g:y(e),r=()=>t().dispatch;return Object.assign(r,{withTypes:()=>r}),r}(),v=(e,t)=>e===t,x=function(e=p){let a=e===p?h:m(e),o=(e,o={})=>{let{equalityFn:i=v}="function"==typeof o?{equalityFn:o}:o,{store:n,subscription:s,getServerState:l}=a();t.useRef(!0);let u=t.useCallback({[e.name]:t=>e(t)}[e.name],[e]),c=(0,r.useSyncExternalStoreWithSelector)(s.addNestedSub,n.getState,l||n.getState,u,i);return t.useDebugValue(c),c};return Object.assign(o,{withTypes:()=>o}),o}();e.s(["Provider",()=>f,"ReactReduxContext",()=>p,"batch",()=>a,"shallowEqual",()=>u,"useDispatch",()=>b,"useSelector",()=>x,"useStore",()=>g])},47637,e=>{"use strict";let t,r;var a,o=e.i(85481);let i={data:""},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,s=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,u=(e,t)=>{let r="",a="",o="";for(let i in e){let n=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+n+";":a+="f"==i[1]?u(n,i):i+"{"+u(n,"k"==i[1]?"":t)+"}":"object"==typeof n?a+=u(n,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=n&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=u.p?u.p(i,n):i+":"+n+";")}return r+(t&&o?t+"{"+o+"}":o)+a},c={},d=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+d(e[r]);return t}return e};function p(e){let t,r,a=this||{},o=e.call?e(a.p):e;return((e,t,r,a,o)=>{var i;let p=d(e),f=c[p]||(c[p]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(p));if(!c[f]){let t=p!==e?e:(e=>{let t,r,a=[{}];for(;t=n.exec(e.replace(s,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);c[f]=u(o?{["@keyframes "+f]:t}:t,r?"":"."+f)}let m=r&&c.g?c.g:null;return r&&(c.g=c[f]),i=c[f],m?t.data=t.data.replace(m,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),f})(o.unshift?o.raw?(t=[].slice.call(arguments,1),r=a.p,o.reduce((e,a,o)=>{let i=t[o];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":u(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"")):o.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):o,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(a.target),a.g,a.o,a.k)}p.bind({g:1});let f,m,h,y=p.bind({k:1});function g(e,t){let r=this||{};return function(){let a=arguments;function o(i,n){let s=Object.assign({},i),l=s.className||o.className;r.p=Object.assign({theme:m&&m()},s),r.o=/ *go\d+/.test(l),s.className=p.apply(r,a)+(l?" "+l:""),t&&(s.ref=n);let u=e;return e[0]&&(u=s.as||e,delete s.as),h&&u[0]&&h(s),f(u,s)}return t?t(o):o}}var b=(e,t)=>"function"==typeof e?e(t):e,v=(t=0,()=>(++t).toString()),x=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},w="default",k=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return k(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},S=[],E={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},A=(e,t=w)=>{C[t]=k(C[t]||E,e),S.forEach(([e,r])=>{e===t&&r(C[t])})},j=e=>Object.keys(C).forEach(t=>A(e,t)),O=(e=w)=>t=>{A(t,e)},T={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=(e={},t=w)=>{let[r,a]=(0,o.useState)(C[t]||E),i=(0,o.useRef)(C[t]);(0,o.useEffect)(()=>(i.current!==C[t]&&a(C[t]),S.push([t,a]),()=>{let e=S.findIndex(([e])=>e===t);e>-1&&S.splice(e,1)}),[t]);let n=r.toasts.map(t=>{var r,a,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||T[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...r,toasts:n}},$=e=>(t,r)=>{let a,o=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||v()}))(t,e,r);return O(o.toasterId||(a=o.id,Object.keys(C).find(e=>C[e].toasts.some(e=>e.id===a))))({type:2,toast:o}),o.id},P=(e,t)=>$("blank")(e,t);P.error=$("error"),P.success=$("success"),P.loading=$("loading"),P.custom=$("custom"),P.dismiss=(e,t)=>{let r={type:3,toastId:e};t?O(t)(r):j(r)},P.dismissAll=e=>P.dismiss(void 0,e),P.remove=(e,t)=>{let r={type:4,toastId:e};t?O(t)(r):j(r)},P.removeAll=e=>P.remove(void 0,e),P.promise=(e,t,r)=>{let a=P.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?b(t.success,e):void 0;return o?P.success(o,{id:a,...r,...null==r?void 0:r.success}):P.dismiss(a),e}).catch(e=>{let o=t.error?b(t.error,e):void 0;o?P.error(o,{id:a,...r,...null==r?void 0:r.error}):P.dismiss(a)}),e};var N=1e3,I=(e,t="default")=>{let{toasts:r,pausedAt:a}=D(e,t),i=(0,o.useRef)(new Map).current,n=(0,o.useCallback)((e,t=N)=>{if(i.has(e))return;let r=setTimeout(()=>{i.delete(e),s({type:4,toastId:e})},t);i.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),o=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&P.dismiss(r.id);return}return setTimeout(()=>P.dismiss(r.id,t),a)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let s=(0,o.useCallback)(O(t),[t]),l=(0,o.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),u=(0,o.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),c=(0,o.useCallback)(()=>{a&&s({type:6,time:Date.now()})},[a,s]),d=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:i}=t||{},n=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),s=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<s&&e.visible).length;return n.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)n(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:u,startPause:l,endPause:c,calculateOffset:d}}},_=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,L=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,z=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${_} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${R} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,M=y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,F=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${M} 1s linear infinite;
`,H=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,U=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,V=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,B=g("div")`
  position: absolute;
`,q=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,K=y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,W=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${K} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Y=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(W,null,t):t:"blank"===r?null:o.createElement(q,null,o.createElement(F,{...a}),"loading"!==r&&o.createElement(B,null,"error"===r?o.createElement(z,{...a}):o.createElement(V,{...a})))},Z=g("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,G=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,J=o.memo(({toast:e,position:t,style:r,children:a})=>{let i=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,o]=x()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${y(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${y(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},n=o.createElement(Y,{toast:e}),s=o.createElement(G,{...e.ariaProps},b(e.message,e));return o.createElement(Z,{className:e.className,style:{...i,...r,...e.style}},"function"==typeof a?a({icon:n,message:s}):o.createElement(o.Fragment,null,n,s))});a=o.createElement,u.p=void 0,f=a,m=void 0,h=void 0;var Q=({id:e,className:t,style:r,onHeightUpdate:a,children:i})=>{let n=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:n,className:t,style:r},i)},X=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:i,toasterId:n,containerStyle:s,containerClassName:l})=>{let{toasts:u,handlers:c}=I(r,n);return o.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},u.map(r=>{let n,s,l=r.position||t,u=c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}),d=(n=l.includes("top"),s=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:x()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${u*(n?1:-1)}px)`,...n?{top:0}:{bottom:0},...s});return o.createElement(Q,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?X:"",style:d},"custom"===r.type?b(r.message,r):i?i(r):o.createElement(J,{toast:r,position:l}))}))};e.s(["CheckmarkIcon",()=>V,"ErrorIcon",()=>z,"LoaderIcon",()=>F,"ToastBar",()=>J,"ToastIcon",()=>Y,"Toaster",()=>ee,"default",()=>P,"resolveValue",()=>b,"toast",()=>P,"useToaster",()=>I,"useToasterStore",()=>D],47637)},93978,12702,e=>{"use strict";var t=e.i(46131);e.s(["useAppDispatch",0,()=>(0,t.useDispatch)()],93978);var r=e.i(89974),a=e.i(70302);let o=(0,r.createSlice)({name:"auth",initialState:{user:null,token:null,isAuthenticated:!1,loading:!0},reducers:{setCredentials:(e,t)=>{e.user=t.payload.user,e.token=t.payload.token,e.isAuthenticated=!0,e.loading=!1,a.default.set("admin_token",t.payload.token,{expires:30})},logout:e=>{e.user=null,e.token=null,e.isAuthenticated=!1,e.loading=!1,a.default.remove("admin_token")},setLoading:(e,t)=>{e.loading=t.payload},restoreAuth:(e,t)=>{t.payload?(e.user=t.payload.user,e.token=t.payload.token,e.isAuthenticated=!0):(e.user=null,e.token=null,e.isAuthenticated=!1),e.loading=!1}}}),{setCredentials:i,logout:n,setLoading:s,restoreAuth:l}=o.actions,u=o.reducer;e.s(["default",0,u,"logout",0,n,"restoreAuth",0,l,"setCredentials",0,i,"setLoading",0,s],12702)},27861,e=>{"use strict";var t=e.i(63113),r=e.i(46131);e.i(31583);var a=e.i(85481),o=e.i(70302),i=e.i(93978),n=e.i(12702);function s({children:e}){let r=(0,i.useAppDispatch)();(0,a.useEffect)(()=>{s()},[]);let s=async()=>{try{r((0,n.setLoading)(!0));let e=o.default.get("admin_token");if(e)try{let t=await fetch("https://munns-production.up.railway.app/api/auth/profile",{headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(t.ok){let a=await t.json();a.success&&a.user?r((0,n.setCredentials)({user:a.user,token:e})):(o.default.remove("admin_token"),r((0,n.restoreAuth)(null)))}else o.default.remove("admin_token"),r((0,n.restoreAuth)(null))}catch(e){console.error("Error fetching user profile:",e),o.default.remove("admin_token"),r((0,n.restoreAuth)(null))}else r((0,n.restoreAuth)(null))}catch(e){console.error("Error loading stored auth:",e),r((0,n.restoreAuth)(null))}};return(0,t.jsx)(t.Fragment,{children:e})}var l=e.i(89974),u=e.i(64164),c=e.i(7995);let d=(0,l.configureStore)({reducer:{[c.adminApiSlice.reducerPath]:c.adminApiSlice.reducer,auth:n.default},middleware:e=>e({serializableCheck:{ignoredActions:["persist/PERSIST","persist/REHYDRATE"]}}).concat(c.adminApiSlice.middleware),devTools:!1});function p({children:e}){return(0,t.jsx)(r.Provider,{store:d,children:(0,t.jsx)(s,{children:e})})}(0,u.setupListeners)(d.dispatch),e.s(["Providers",()=>p],27861)}]);