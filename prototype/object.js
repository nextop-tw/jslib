// if (!Object.keys) {
//   Object.keys = (function() {
//     'use strict';
//     var hasOwnProperty = Object.prototype.hasOwnProperty,
//         hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
//         dontEnums = [
//           'toString',
//           'toLocaleString',
//           'valueOf',
//           'hasOwnProperty',
//           'isPrototypeOf',
//           'propertyIsEnumerable',
//           'constructor'
//         ],
//         dontEnumsLength = dontEnums.length;

//     return function(obj) {
//       if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
//         throw new TypeError('Object.keys called on non-object');
//       }

//       var result = [], prop, i;

//       for (prop in obj) {
//         if (hasOwnProperty.call(obj, prop)) {
//           result.push(prop);
//         }
//       }

//       if (hasDontEnumBug) {
//         for (i = 0; i < dontEnumsLength; i++) {
//           if (hasOwnProperty.call(obj, dontEnums[i])) {
//             result.push(dontEnums[i]);
//           }
//         }
//       }
//       return result;
//     };
//   }());
// };

if(!Object.prototype.forEach) {
    Object.defineProperty(Object.prototype, 'forEach', {
        value: function (callback, thisArg) {
            if (this == null) {
                throw new TypeError('Not an object');
            }
            thisArg = thisArg || window;
            let index=0;
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    callback.call(thisArg, this[key], key,index, this);
                    index++;
                }
            }
        }
    });
}

FormData.toObject=FormData.prototype.toObject=FormData.serialize=FormData.prototype.serialize=function(_formdata){
    return (typeof this!='function')?FormData.serialize.apply(FormData.serialize,[this].concat([].slice.call(arguments)))
      :(()=>{
            let args=Array.prototype.slice.call(arguments,1);
            let ret={};
            let namespace=function(_ns,_value,_ret={}){
                _ns=_ns.replaceAll("[",".");
                _ns=_ns.replaceAll("]","");
                var parts=_ns.split("."),
                    parent=_ret;


                for(var i=0,len=parts.length;i<len;i+=1){
                    if(typeof parent[parts[i]] =="undefined"){
                    parent[parts[i]]={};
                    }
                    if(i==parts.length-1){
                        parent[parts[i]]=_value;
                    }else{
                    parent=parent[parts[i]];
                    }

                }
                return _ret;
            };
            _formdata.forEach((_value,_key) => {
                ret=namespace(_key,_value,ret);
            });
            // for (let key of _formdata.keys()){
            //     ret=namespace(key,_formdata.get(key),ret);
            // }
            return ret;
      })();
};
