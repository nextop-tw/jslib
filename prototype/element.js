Element.prototype.load = function () {
    const me = this;
    const args = [].slice.call(arguments);

    let url = '';
    let method = 'get'; // 預設方法

    // Step 1: 取得 URL
    if (typeof args[0] === 'string') {
        url = args.shift();
    } else {
        url = me.dataset.load || '';
    }

    // Step 2: 從 url@method 分離 (優先)
    if (url.includes('@')) {
        const parts = url.split('@');
        url = parts[0];
        method = parts[1].toLowerCase() || 'get';
    } else if (me.dataset.method) {
        // Step 3: 否則看有沒有 data-method
        method = me.dataset.method.toLowerCase();
    }

    let data = {};
    let callback = null;

    // Step 4: 解析參數
    if (typeof args[0] === 'function') {
        callback = args[0];
    } else {
        data = args[0] || {};
        if (typeof args[1] === 'function') {
            callback = args[1];
        }
    }

    // Step 5: Ajax 呼叫
    return new Promise(function (_resolve, _reject) {
        if (!url) {
            return _reject('沒有網址');
        }

        neko.use('ajax').then(function (_ajax) {
            if (typeof _ajax[method] !== 'function') {
                return _reject('不支援的 method: ' + method);
            }

            _ajax[method](url, data).then(function (response) {
                me.innerHTML = response;

                if (typeof callback === 'function') {
                    callback.call(me, response);
                }

                _resolve(response);
            }).catch(function (err) {
                _reject(err);
            });
        });
    });
};

Element.prototype.load2=function(){
    let me=this;
    let args=[].slice.call(arguments);
    if(typeof args[0]!='string'){
        let url=this.dataset.load || null;
        args.unshift(url);
    }
    let callback=args.pop();
    return new Promise(function(_resolve, _reject) {
        if(typeof callback=='function'){
            args.push(function(){
                callback.apply($(me),[].slice.call(arguments));
            });
        }else{
            args.push(callback);
            args.push(function(){
                _resolve([].slice.call(arguments));
            });
        }
        $(me).load.apply($(me),args);
    });
    // return $(this).load.apply($(this),[].slice.call(arguments));

};

Element.prototype.notify=function(_message,_className=null,_options={}){
    let className=(typeof _className=='string')?_className:'success';
    _options=(typeof _className=='object')?_className:_options;
    
    let options=Object.assign({},{
        // position :'right middle',
        position :'buttom',
        className:className,
        autoHide:false
    },_options);
    $(this).notify(_message,options);

};



// Element.prototype.modal=function(){
//     $(this).modal.apply($(this),[].slice.call(arguments));
// };

// Element.prototype.on=function(){
//     return this.addEventListener.apply(this,[].slice.call(arguments));
// };

Element.prototype.clone=function(){
    let clone_select=function(_selector,_clone){
        _clone.options.selectedIndex=_selector.options.selectedIndex;
    };
    let $clone=this.cloneNode(this,[].slice.call(arguments));
    let tagname=this.tagName.toLowerCase();
    if(tagname=='select') clone_select(this,$clone);
        
    let $selects=this.querySelectorAll('select');
    if($selects.length>0){
        $clone.querySelectorAll('select').forEach(function(_select,_index){
            clone_select($selects[_index],_select);
        });
    }
    return $clone;
};

HTMLSelectElement.prototype.clone=function(){
    let $clone=this.cloneNode(this,[].slice.call(arguments));
    $clone.options.selectedIndex=this.options.selectedIndex;
    return $clone;
};

HTMLTemplateElement.prototype.clone=HTMLTemplateElement.prototype.toClone=function(_selector=null,_source=null){
    if(typeof _selector=='string'){

    }else if(typeof _selector=='object' || _selector==null){
        _source=_selector || {};
        _selector=':first-child';
    }
    let $el=this.content.querySelector(_selector);
    if($el==null) return;
    let html=$el.outerHTML.template(_source);
    return new DOMParser().parseFromString(html, "text/html").body.firstChild;
};

Element.prototype.toObject=function(){
    return this.toFormData().toObject();
};

Element.prototype.formData=Element.prototype.toFormData=function(){
    let $form=document.createElement('form');
    this.querySelectorAll('[name]').forEach(function(_input){
        if(_input.disabled==true || _input.classList.contains('disabled')) return;
        let $clone=_input.clone(true);
        $form.appendChild($clone);
    });
    let formData=new FormData($form);
    let counter={};
    let values=formData.values();
    let renew={
        'append':[],
        'delete':{}
    };

    $form.querySelectorAll('[name][data-split]').forEach(function(_input){
        if(_input.disabled) return;
        let split=_input.dataset.split;
        let name=_input.name;

        let value=_input.value.trim();
        formData.delete(name);
        let newname=(name.slice(-2)=='[]')?name:`${name}[]`;
        if(value==''){
            newname=(name.slice(-2)=='[]')?name.slice(0,-2):name;
            //formData.set(name.replace('[]',''),[]);
            formData.set(name,'');
        }else{
            value.split(split).forEach(function(_value){
                formData.append(newname,_value);
            });
        }
    });

    $form.querySelectorAll('[name][data-type="json"]').forEach(function(_input){
        let name=_input.name;
        let value=_input.value.trim();
        if(value=='') return ;
        value=value.toJSON();
        if(typeof value!=='object') return;
        formData.delete(name);
        formData.Object(value,name);

    });

    

    for (var name of formData.keys()) {
        let value=values.next().value;
        let prefix=name.slice(0,-2);
        let footer=name.slice(-2);
        let matchs = prefix.match(/(.*)\[(['']*)\]/);
        if(matchs!=null){
            if(typeof counter[prefix] =="undefined") counter[prefix]=0;
            let index=counter[prefix];
            let new_prefix = prefix.replace(/\[\]/,"["+index+"]");
            renew.append.push([new_prefix+footer,value]);
            renew.delete[name]=1;
            //if($(my).attr("type")=="file") return;
            counter[prefix]+=1;
        }
    }

    if(renew.append.length>0){
        Object.keys(renew.delete).forEach(function(_value){
            formData.delete(_value);
        });
        renew.append.forEach(function(_item){
            formData.append(_item[0],_item[1]);
        });
    }
    $form.remove();
    return formData;
};

Element.prototype.sortable=function(_options={}){
    let me=this;
    let args=[].slice.call(arguments);
    let callback=args.pop();
    return new Promise(function(_resolve, _reject) {
        neko.use('sortable').then(function(_Sortable){
            me.Sortable=new _Sortable(me,_options)
            _resolve.apply(me,[sortable]);
        });
    });
    // return $(this).load.apply($(this),[].slice.call(arguments));

};

HTMLInputElement.prototype.switchery=function(){
    let me=this;
    if(typeof this.value=='undefined') this.value='1';
    if(typeof this.Switchery!=='undefined') return ;
    this.Switchery=new Switchery(this);
    
    this.toggle=function(_checked=null){
        me.checked=(_checked==null)?me.checked?false:true:_checked;
        me.Switchery.setPosition(false);
    };
};

Element.isElement=function(_el){
    try {
        return _el instanceof HTMLElement;
    }catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (typeof _el==="object") &&
        (_el.nodeType===1) && (typeof _el.style === "object") &&
        (typeof _el.ownerDocument ==="object");
    }
};

Element.prototype.colorpicker=function(_options={}){
    // let $input=this.querySelector('input');
    // let $span=this.querySelector('span');
    // let $picker=this.querySelector('[data-picker="color"]');
    // if($picker==null){
    //     $picker=document.createElement('input');
    //     $picker.dataset.picker="color";
    //     $picker.style.display='none';
    //     this.appendChild($picker);
    //     $(document).ready(function(){
    //         $($picker).colorpicker();
    //         $($picker).on('colorpickerChange',function(_event){
    //             $span.style.backgroundColor=_event.color.toString();
    //         });
    //     });
    // }
   
    
    let $input=this.querySelector('input');
    let $span=this.querySelector('span');
    if($input.value=='') $input.value='#000000';	
    $(document).ready(function(){
        $($input).colorpicker();
        $($input).on('colorpickerChange',function(_event){
            $span.style.backgroundColor=_event.color.toString();
        });
    });
    $span.style.backgroundColor=$input.value;
    $span.style.cursor="pointer";
    $span.addEventListener('click',function(){
        // $picker.focus();
        $input.focus();
    });
    this.on=function(){
        $($input).on.apply($($input),[].slice.call(arguments));
    };
};

HTMLInputElement.prototype.datepicker=function(){
    let me=this;
    let args=[].slice.call(arguments);
    if(args.length==0){


    }else{
        
    }
    if(typeof this.$datepicker=='undefined'){
        let format=this.dataset.format || 'yyyy-mm-dd';
        let options={};
        if(!format.includes('m')){
            options={

            };
        }else if(!format.includes('d')){
            //month
            options={
                startView: "months", 
                minViewMode: "months",
            };
        }
        options=Object.assign(options,{
            language:'zh-TW',
            format: format,
            defaultViewDate: "today",
            orientation: "bottom",
        },args[0] || {});
        console.log(options);
        if(typeof this.dataset.max!='undefined'){
            let endDate=new Date(this.dataset.max);
            options.maxDate=endDate;
            options.endDate=endDate;
        }

        if(typeof this.dataset.min!='undefined'){
            let startDate=new Date(this.dataset.min);
            options.startDate=startDate;
            options.minDate=startDate;
        }
        // $($d1).datepicker({
        //     toggleActive: true,
        //     format: 'yyyy-mm-dd',
        //     language: 'zh-TW',
        //     // startDate: 'today',
        //     // minDate: 'today',
        // })
        // .on('changeDate',function(e){
        //     change();
        // });

        this.$datepicker=$(this).datepicker(options)
        .on('changeDate', function(event) {
            event.target.dispatchEvent(new Event('change'));
            if(typeof options.change=='function'){
                options.change.apply($(me),[].slice.call(arguments));
            }
            if(typeof options.changeDate=='function'){
                options.changeDate.apply($(me),[].slice.call(arguments));
            }
        });

    }
    return this.$datepicker;


    // if(typeof this.$datepicker!='undefined'){
    //     let args=[].slice.call(arguments);
    //     if(args.length==0)
    //     return this.$datepicker;
    // } 
    // let format=this.dataset.format || 'yyyy-mm-dd';
    // let options={};
    // if(!format.includes('m')){
    //     options={

    //     };
    // }else if(!format.includes('d')){
    //     //month
    //     options={
    //         startView: "months", 
    //         minViewMode: "months",
    //     };
    // }
    // options=Object.assign(options,{
    //     language:'zh-TW',
    //     format: format,
    //     defaultViewDate: "today",
    // },_options);
    // this.$datepicker=$(this).datepicker(options)
    // .on('changeDate', function(event) {
    //     event.target.dispatchEvent(new Event('change'));
    //     if(typeof _options.change=='function'){
    //         _options.change.apply($(me),[].slice.call(arguments));
    //     }
    // });

    
    // // ;
    // // this.datepicker.on()
    // // $(document).ready(function(){
    // //     $(me).datepicker(options)
    // //     .on('changeDate', function(event) {
    // //         event.target.dispatchEvent(new Event('change'));
    // //     });
    // // });
    // this.on=function(){
    //     $(me).on.apply($(me),[].slice.call(arguments));
    // };
};

HTMLInputElement.prototype.timepicker=function(_options={}){
    let me=this;
    let format=this.dataset.format || 'HH:mm:ss';
    let options=Object.assign({
        timeFormat:format,
        dynamic: false,
        dropdown: true,
        scrollbar: true,
    },_options); 
    $(document).ready(function(){
        $(this).timepicker(Object.assign(options,{
            change:function(e){
                this.dispatchEvent(new Event('change'));
                if(typeof _options.change=='function'){
                    _options.change.apply($(me),[].slice.call(arguments));
                }
            }
    
        }));
    });
    this.on=function(){
        $(me).on.apply($(me),[].slice.call(arguments));
    };
};

HTMLInputElement.prototype.sliderbar=function(_options={}){
    let me=this;
    let options=Object.assign({},_options);
    if(this.dataset.sliderLock_to_ticks=='true' || this.dataset.sliderLock_to_ticks=='1') options.lock_to_ticks=true;
    this.Slider=new Slider(this,options);
    this.Slider.on('slideStop',function(_res){
        me.dispatchEvent(new Event('change'));
    });
    this.addEventListener('change',function(e){
        if(me.Slider.getValue()!=this.value){
            me.Slider.setValue(this.value,false);
            e.stopPropagation();
            return false;
        } 
    });
    
};

Element.prototype.neko=async function(_classname,..._args){
    let me=this;

    return new Promise(function(_resolve, _reject) {
        neko.use(_classname).then(function(_class){
            _args.unshift(me);
            let instance=Reflect.construct(_class,_args);
            _resolve.apply(me,[instance]);
        });
    });
};

Element.prototype.Form=async function(){
    let me=this;
    return new Promise(function(_resolve,_reject){
        neko.use('form').then(function(_Form){
            me.form=new _Form(me);
            _resolve(me.form);

        });
    });
    
};

NodeList.prototype.indexOf=Array.prototype.indexOf;




