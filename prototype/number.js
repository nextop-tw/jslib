Number.between=Number.prototype.between=function(_num=null,_arr=[],_is_inclusive=true){
    return (typeof this!='function')?Number.between.apply(Number.between,[this].concat([].slice.call(arguments)))
    :(()=>{
        if(_num==null) return false;
        let args=Array.prototype.slice.call(arguments,1);
        if(args.length == 0 ) return false; 
        let is_inclusive=args.pop();
        if(typeof is_inclusive!='boolean'){
            args.push(is_inclusive);
            is_inclusive=true;
        }
        let arr=[];
        arr=arr.concat.apply(arr,args);
        let min=Math.min.apply(null,arr),
        max=Math.max.apply(null,arr);
        return (is_inclusive)?(_num>=min && _num<=max):(_num>min && _num<max);
    })();
};


Number.toCurrency=Number.prototype.toCurrency=function(_num=null,_local=null,_currency=null){
    return (typeof this!='function')?Number.toCurrency.apply(Number.toCurrency,[this].concat([].slice.call(arguments)))
    :(()=>{
        let ret=null;
        if(_local==null){
            ret=new Intl.NumberFormat();
        }else{
            ret=new Intl.NumberFormat(_local, { style: 'currency', currency: _currency });
        }
        return ret.format(_num);
    })();
};

Number.is_numeric=Number.prototype.is_numeric=function(_num=null){
    return (typeof this!='function')?Number.is_numeric.apply(Number.is_numeric,[this].concat([].slice.call(arguments)))
    :(()=>{
        let pos=_num.toString().indexOf('.');
        if(pos==0) _num="0."+_num.toString();
        let value=(pos==-1)?Number.parseInt(_num):Number.parseFloat(_num);
        return (value==(_num))?true:false;
    })();
};

Number.is_integer=Number.prototype.is_integer=function(_num=null){
    return (typeof this!='function')?Number.is_integer.apply(Number.is_integer,[this].concat([].slice.call(arguments)))
    :(()=>{
        if(_num.toString().indexOf('.')>0) return false;
        return Number.is_numeric(_num);
    })();
};

Number.is_int=Number.prototype.is_int=Number.is_integer;

Number.to_numeric=Number.prototype.is_integer=function(_num=null){
    return (typeof this!='function')?Number.is_integer.apply(Number.is_integer,[this].concat([].slice.call(arguments)))
    :(()=>{
        let num=_num.toString().replaceAll(',','');
        console.log(num);
        if(Number.is_numeric(num)==false) return null;
        return num-0; 
    })();
};