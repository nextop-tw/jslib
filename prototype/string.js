String.format=String.prototype.format=function(_str,_params={}){
    return (typeof this!='function')?String.format.apply(String.format,[this].concat([].slice.call(arguments)))
    :(()=>{
        let args=Array.prototype.slice.call(arguments,1);
        if(args.length == 0 ) return _str; 
        args=(typeof args[0]=="object")?args[0]:args;
        for(var i in args){
            let match="\\{" + i + "\\}";
            match=match.replaceAll('-','\\-');
            match=match.replaceAll('[','\\[');
            let reg = new RegExp(match, "gm");             
            _str = _str.replaceAll(reg, args[i]);
        }
        return _str;
    })();
}

String.prototype.stripNonNumeric = function() {
    var str = this + '';
    var rgx = /^\d|\.|-$/;
    var out = '';
    for( var i = 0; i < str.length; i++ ) {
        if( rgx.test( str.charAt(i) ) ) {
            if( !( ( str.charAt(i) == '.' && out.indexOf( '.' ) != -1 ) ||
            ( str.charAt(i) == '-' && out.length != 0 ) ) ) {
                out += str.charAt(i);
            }
        }
    }
    return out;
};

/** 16進位轉10進位
*/
String.prototype.hex2dec=function(){
	return parseInt(this,16);
}


String.prototype.replaceHtmlEntites = function() {
	var s = this;
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">"};
	return ( s.replace(translate_re, function(match, entity) {
	  return translate[entity];
	}) );
};

String.count=String.prototype.count=function(_str,_search){
    return (typeof this!='function')?String.count.apply(String.count,[this].concat([].slice.call(arguments)))
    :(()=>{
        //console.log(arguments);
        return (_str.match(new RegExp(_search, 'g')) || []).length;
    })();
};

String.template=String.prototype.template=function(_str,_params={}){
    return (typeof this!='function')?String.template.apply(String.template,[this].concat([].slice.call(arguments)))
    :(()=>{
        let args=Array.prototype.slice.call(arguments,1);
        let generate=(function(){
            let cache={};
            return function(_temp){
                let fn=cache[_temp];
                if(!fn){
                    var sanitized = _temp
                        .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, function(_, match){
                            return `\$\{map.${match.trim()}\}`;
                        });
                        // Afterwards, replace anything that's not ${map.expressions}' (etc) with a blank string.
                        //.replace(/(\$\{(?!map\.)[^}]+\})/g, '');

                    fn = Function('map', `return \`${sanitized}\``);
                }
                return fn;
            };
        })();
        return generate(_str).apply(null,args);
    })();
};

String.toJSON=String.prototype.toJSON=function(_str){
    return (typeof this!='function')?String.toJSON.apply(String.toJSON,[this].concat([].slice.call(arguments)))
    :(()=>{
        let defaults=null;
        let ret=null;
        let args=Array.prototype.slice.call(arguments,0);
        if(args.length>1){
            if(typeof args[1]=='function'){
                defaults=args[2] || defaults;
                args=args.slice(0,2);
            }else{
                defaults=args[1];
                args=args.slice(0,1);
            }
        }
        try{
            ret=JSON.parse.apply(null,args);
        }catch(e){
            ret=defaults;
        }
        return ret;
        
    })();
};

String.toNumber=String.prototype.toNumber=function(_str,_default=NaN){
    return (typeof this!='function')?String.toNumber.apply(String.toNumber,[this].concat([].slice.call(arguments)))
    :(()=>{
        let ret=Number(_str);
        if(isNaN(ret)) return _default;
        return ret;
    })();
};

String.toCurrency=String.prototype.toCurrency=function(_str=null,_local=null,_currency=null){
    return (typeof this!='function')?String.toCurrency.apply(String.toCurrency,[this].concat([].slice.call(arguments)))
    :(()=>{
        let ret=_str.toNumber(_str);
        if(isNaN(ret)) return '';
        return ret.toCurrency(_local,_currency);
    })();
};
