var addEvent = (evnt, elem, func) => {
  'use strict';
   if (elem.addEventListener)  {
	  elem.addEventListener(evnt,func,false);
   } else if (elem.attachEvent) {
	  elem.attachEvent('on' + evnt, func);
   } else {
	  elem[evnt] = func;
   }
};

export default addEvent;
