(function(a,b){if(typeof define==="function"&&define.amd){define([],b)}else{if(typeof exports==="object"){var c=b();if(typeof module==="object"&&module&&module.exports){exports=module.exports=c}exports.randomColor=c}else{a.randomColor=b()}}}(this,function(){var c={};p();var g=function(s){s=s||{};var u,t,w;if(s.count){var v=s.count,r=[];s.count=false;while(v>r.length){r.push(g(s))}return r}u=q(s);t=d(u,s);w=e(u,t,s);return k([u,t,w],s)};function q(t){var s=l(t.hue),r=n(s);if(r<0){r=360+r}return r}function d(r,u){if(u.luminosity==="random"){return n([0,100])}if(u.hue==="monochrome"){return 0}var t=b(r);var v=t[0],s=t[1];switch(u.luminosity){case"bright":v=55;break;case"dark":v=s-10;break;case"light":s=55;break}return n([v,s])}function e(u,t,s){var v,r=o(u,t),w=100;switch(s.luminosity){case"dark":w=r+20;break;case"light":r=(w+r)/2;break;case"random":r=0;w=100;break}return n([r,w])}function k(s,r){switch(r.format){case"hsvArray":return s;case"hsv":return a("hsv",s);case"rgbArray":return i(s);case"rgb":return a("rgb",i(s));default:return j(s)}}function o(z,s){var v=m(z).lowerBounds;for(var t=0;t<v.length-1;t++){var A=v[t][0],x=v[t][1];var y=v[t+1][0],w=v[t+1][1];if(s>=A&&s<=y){var r=(w-x)/(y-A),u=x-r*A;return r*s+u}}return 0}function l(t){if(typeof parseInt(t)==="number"){var s=parseInt(t);if(s<360&&s>0){return[s,s]}}if(typeof t==="string"){if(c[t]){var r=c[t];if(r.hueRange){return r.hueRange}}}return[0,360]}function b(r){return m(r).saturationRange}function m(t){if(t>=334&&t<=360){t-=360}for(var r in c){var s=c[r];if(s.hueRange&&t>=s.hueRange[0]&&t<=s.hueRange[1]){return c[r]}}return"Color not found"}function n(r){return Math.floor(r[0]+Math.random()*(r[1]+1-r[0]))}function f(r,s){return(r+s)%360}function j(s){var r=i(s);function u(w){var v=w.toString(16);return v.length==1?"0"+v:v}var t="#"+u(r[0])+u(r[1])+u(r[2]);return t}function h(u,t,w){var v=w[0][0],s=w[w.length-1][0],r=w[w.length-1][1],x=w[0][1];c[u]={hueRange:t,lowerBounds:w,saturationRange:[v,s],brightnessRange:[r,x]}}function p(){h("monochrome",null,[[0,0],[100,0]]);h("red",[-26,18],[[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]);h("orange",[19,46],[[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]);h("yellow",[47,62],[[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]);h("green",[63,158],[[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]);h("blue",[159,257],[[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]);h("purple",[258,282],[[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]);h("pink",[283,334],[[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]])}function i(z){var y=z[0];if(y===0){y=1}if(y===360){y=359}y=y/360;var H=z[1]/100,D=z[2]/100;var G=Math.floor(y*6),B=y*6-G,x=D*(1-H),w=D*(1-B*H),E=D*(1-(1-B)*H),u=256,A=256,C=256;switch(G){case 0:u=D,A=E,C=x;break;case 1:u=w,A=D,C=x;break;case 2:u=x,A=D,C=E;break;case 3:u=x,A=w,C=D;break;case 4:u=E,A=x,C=D;break;case 5:u=D,A=x,C=w;break}var F=[Math.floor(u*255),Math.floor(A*255),Math.floor(C*255)];return F}function a(s,r){return s+"("+r.join(", ")+")"}return g}));