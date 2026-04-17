Array.pong=function(){
    return (typeof this!='function')?Array.pong.apply(Array.pong,[this].concat([].slice.call(arguments)))
    :(()=>{
        let is_right=true;
        let args=Array.prototype.slice.call(arguments);
        if(args.length==0) return [];
	    args.every(function(_value,_index,_arry) {
	        if(Array.isArray(_value)==false || _value.length==0){
	            is_right=false;
	            return false;
	        }
	        return true;
	    });
	    if(!is_right) return null;
	    let pong=function(_arr1,_arr2,..._args){
	        let ret=[];
	        _arr1.forEach(function(_value1){
	            _arr2.forEach(function(_value2){
	                let arr=Object.assign([],(Array.isArray(_value1))?_value1:[_value1]);
	                arr.push(_value2);
	                ret.push(arr);
	            });
	        });
	        if(_args.length>=1){
	            _args.unshift(ret);
	            ret=pong.apply(null,_args);
	        }
	        return ret;
	    };
	    if(args.length==1) return args[0].map(x =>[x]);
	    ret=pong.apply(null,args);
	    return ret;
    })();
};

Array.column=function(_arr,_column_key=null,_index_key=null){
	let ret={};
	let arr=[];
	if(_column_key==null && _index_key==null) return _arr;
	let column_key=(_column_key==null)?null:Array.isArray(_column_key)?_column_key:[_column_key];
	for(let key in _arr){
		let item=_arr[key];
		let value=null;
		if(_index_key!=null){
			if(typeof item[_index_key]=='undefined') continue;
			key=item[_index_key];
		}
		if(column_key==null){
			value=item;
		}else if(Array.isArray(_column_key)){
			value={};
			_column_key.forEach(function(_column){
				value[_column]=typeof(item[_column]=='undefined')?null:item[_column];item[_column];
			});
		}else{
			value=typeof(item[_column_key]=='undefined')?null:item[_column_key];
		}
		ret[key]=value;
	}
	return ret;
};

Array.to1d=Array.prototype.to1d=function(..._args){
    return (typeof this!='function')?Array.to1d.apply(Array.to1d,[this].concat([].slice.call(arguments)))
    :(()=>{
        let to_array=function(..._arrs){
            let ret=[];
            for(let i in _arrs){
                let arr=_arrs[i];
                if(Array.isArray(arr)){
                    if(Array.isArray(arr[0])){
                        arr.forEach(function(_value){
                            ret.push(_value);
                        });
                    }else{
                       ret.push(arr); 
                    }
                }
            }
            return ret;
        };
        
        let arr=to_array.apply(null,_args);
        return arr;
        // return intersection.apply(null,arr);
    })();
};

Array.intersection=Array.prototype.intersection=function(..._args){
    return (typeof this!='function')?Array.intersection.apply(Array.intersection,[this].concat([].slice.call(arguments)))
    :(()=>{
        let intersection=function(..._args){
            let args=Array.from(arguments);
            if(_args.length == 0 ) return [];
            if(_args.length == 1 ) return _args[0]; 
            let arr1=_args.shift();
            let arr2=_args.shift();
            let set1=new Set(arr1);
            let set2=new Set(arr2);
            let ret = arr1.filter((e)=>{
                return set2.has(e);
            });
            if(_args.length==0) return ret;
            _args.unshift(ret);
            return intersection.apply(null,_args);
        };
        
        let to_array=function(..._arrs){
            let ret=[];
            for(let i in _arrs){
                let arr=_arrs[i];
                if(Array.isArray(arr)){
                    if(Array.isArray(arr[0])){
                        arr.forEach(function(_value){
                            ret.push(_value);
                        });
                    }else{
                       ret.push(arr); 
                    }
                }
            }
            return ret;
        };
        
        let arr=Array.to1d.apply(Array,_args);
        return intersection.apply(null,arr);
    })();
};