var addEvent = (evnt, elem, func) => {
  'use strict';
  if (!evnt || !elem || !func) {
    console.warn('event attach failed on: ');
    console.warn(evnt);
    console.warn(elem);
    console.warn(func);
    return false;
  }
   if (elem.addEventListener)  {
	  elem.addEventListener(evnt,func,false);
   } else if (elem.attachEvent) {
	  elem.attachEvent('on' + evnt, func);
   } else {
	  elem[evnt] = func;
   }
};

export default addEvent;
