FormData.build_object=FormData.prototype.build_object=function(_formdata,_data='',_parentKey=''){
    return (typeof this!='function')?FormData.build_object.apply(FormData.build_object,[this].concat([].slice.call(arguments)))
      :(()=>{
            let args=Array.prototype.slice.call(arguments,1);
            if(!(_formdata instanceof FormData)){
                _parentKey=_data;
                _data=_formdata;
                _formdata=new FormData();
            }
            if (_data && typeof _data === 'object' && !(_data instanceof Date) && !(_data instanceof File)) {
                Object.keys(_data).forEach(key => {
                    _formdata.build_object(_data[key], _parentKey ? `${_parentKey}[${key}]` : key);
                });
            }else{
                const value = _data == null ? '' : _data;
                _formdata.append(_parentKey, value);
          }
          return _formdata;
      })();
};

FormData.Object=FormData.prototype.Object=FormData.fromObject=FormData.prototype.fromObject=function(_formdata,_data='',_parentKey=''){
    return (typeof this!='function')?FormData.fromObject.apply(FormData.fromObject,[this].concat([].slice.call(arguments)))
      :(()=>{
            let args=Array.prototype.slice.call(arguments,1);
            if(!(_formdata instanceof FormData)){
                _parentKey=_data;
                _data=_formdata;
                _formdata=new FormData();
            }
            if (_data && typeof _data === 'object' && !(_data instanceof Date) && !(_data instanceof File)) {
                Object.keys(_data).forEach(key => {
                    let name=key;
                    if(_parentKey){
                        if(name.indexOf('[')>0){
                            let names=name.split('[');
                            names[0]=`[${names[0]}]`;
                            name=_parentKey+names.join('[');
                        }else{
                            name=`${_parentKey}[${name}]`
                        }
                    }
                    
                    _formdata.fromObject(_data[key],name);
                });
            }else{
                const value = _data == null ? '' : _data;
                _formdata.append(_parentKey, value);
          }
          return _formdata;
      })();
};

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
            for(let [key, value] of _formdata.entries()) {
                ret=namespace(key,value,ret);
            }
  	        return ret;
      })();
};

FormData.isFormData=FormData.prototype.isFormData=function(_instance){
    return (typeof this!='function')?FormData.isFormData.apply(FormData.isFormData,[this].concat([].slice.call(arguments)))
      :(()=>{
            return _instance instanceof FormData;
      })();
}
