Date.format=Date.prototype.format=function(_date=null,_format=null){
    return (typeof this!='function')?Date.format.apply(Date.format,[this].concat([].slice.call(arguments)))
    :(()=>{
        let keys=['y','m','d','h','i','s'];
        let used={};
        let ret=[];
        if(_format==null){
            _format=_date;
            _date=new Date();
        }else{
            _date=(typeof _date=='string' || typeof _date=='number')?[_date]:_date;
            if(Array.isArray(_date)) _date=new (Function.prototype.bind.apply(Date,[null].concat(_date)));
        }
        let args=[_date.getFullYear(),_date.getMonth()+1,_date.getDate(),_date.getHours(),_date.getMinutes(),_date.getSeconds()];
        let str=_format.toLowerCase();
        for(let i=0;i<str.length;i+=1){
            let s=str[i];
            let index=keys.indexOf(s);
            if(index>=0){
                if(typeof used[index]!='undefined') continue;
                let char=keys[index];
                let count=str.count(char);
                //計算個數
                used[index]=true;
                ret.push(args[index].toString().padStart(count, '0'));
            }else{
                ret.push(s);
            }
        }
        return ret.join('');
    })();
};

Date.unixtime=function(_unixtime=null){
    return new Date(_unixtime*1000);
};

Date.toUnixtime=Date.prototype.toUnixtime=Date.prototype.unixtime=function(_date=null){
    return (typeof this!='function')?Date.toUnixtime.apply(Date.toUnixtime,[this].concat([].slice.call(arguments)))
    :(()=>{
        return _date.getTime()/1000;
    })();
};

Date.addYears=Date.prototype.addYears=function(){
    return ((_date,_years=0)=>{
        _date.setYear(_date.getFullYear()+(_years-0));
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addMonths=Date.prototype.addMonths=function(){
    return ((_date,_months=0)=>{
        _date.setMonth(_date.getMonth()+(_months-0));
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addWeeks=Date.prototype.addWeeks=function(){
    return ((_date,_weeks=0)=>{
        _date.addDays(_weeks*7);
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addDays=Date.prototype.addDays=function(){
    return ((_date,_days=0)=>{
        _date.setDate(_date.getDate()+(_days-0));
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addHours=Date.prototype.addHours=function(){
    return ((_date,_hours=0)=>{
        _date.addMinutes(_hours*60);
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addMinutes=Date.prototype.addMinutes=function(){
    return ((_d,_m=0)=>{
        _date.addSeconds(_m*60);
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addSeconds=Date.prototype.addSeconds=function(){
    return ((_date,_sec=0)=>{
        _date.setTime(_date.valueOf()+((_sec-0)*1000));
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.addDate=Date.prototype.addDate=function(){
    return ((_date,_years=0,_months=0,_days=0,_hours=0,_m=0,_sec=0)=>{
        let methods={
            'addYears':['Y','y','year','years'],
            'addMonths':['M','m','month','days'],
            'addDays':['D','d','day','days'],
            'addHours':['H','h','hour','hours'],
            'addMinutes':['I','i'],
            'addSeconds':['S','s','sec','secs','second','seconds'],
        };

        let add=function(){
            let funcs=Object.keys(methods);
            Array.from(arguments).forEach(function(_value,_index){
                if(_value==0) return;
                _date[funcs[_index]].apply(_d,[_value]);
            });
           return _date;
        };

        if(Array.isArray(_years)){
            add.apply(_date,_years);
        }else if(typeof _years=="object"){
            let matches=function(){
                let ret=[];
                Object.entries(methods).forEach(([_key, _value]) => {
                   let keys=[..._value];
                   let values=_value.fill(_key);
                   ret.push(Object.assign.apply({},keys.map( (v, i)=>({[v]: values[i]}))));
                 });
                 ret=Object.assign.apply({},ret);
                 return ret;
             }();


            for(let key in _years){
                let value=_years[key];
                if(!Number.is_numeric(value)) continue;
                if(typeof matches[key]=='undefined') continue;
                _date[matches[key]].apply(_date,[value]);
            }

        }else{
            add.apply(_date,Array.prototype.slice.call(arguments,1));
        }
        return _date;
    }).apply(null,(typeof this=='object')?[this].concat([].slice.call(arguments)):[new Date(arguments[0].getTime())].concat([].slice.call(arguments,1)));
};

Date.diff=Date.prototype.diff=function(_date1,_date2){
    return (typeof this!='function')?Date.diff.apply(Date.diff,[this].concat([].slice.call(arguments)))
    :(()=>{
        _date2=(typeof _date2=='string')?new Date(_date2):_date2;
        return {
            toYears:function(){
                return _date1.getFullYear()-_date2.getFullYear();
            },
            toMonths:function(){
                let d1Y = _date1.getFullYear();
                let d2Y = _date2.getFullYear();
                let d1M = _date1.getMonth();
                let d2M = _date2.getMonth();
                return (d2M+12*d2Y)-(d1M+12*d1Y);
            },
            toWeeks:function(){
                let t2 = _date2.getTime();
                let t1 = _date1.getTime();
                return parseInt((t2-t1)/(24*3600*1000*7));
            },
            toDays:function(){
                let t2 = _date2.getTime();
                let t1 = _date1.getTime();
                let ret=parseInt((t2-t1)/(24*3600*1000));
                // console.log('ret='+ret);
                return ret;
            },
            toHours:function(){
                let t2 = _date2.getTime();
                let t1 = _date1.getTime();
                return parseInt((t2-t1)/(3600*1000));
            },
            toMinutes:function(){
                let t2 = _date2.getTime();
                let t1 = _date1.getTime();
                return parseInt((t2-t1)/(60*1000));
            },
            toSeconds:function(){
                let t2 = _date2.getTime();
                let t1 = _date1.getTime();
                return parseInt((t2-t1)/(1000));
            },
        };
    })();
};