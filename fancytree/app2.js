/*
$("#tree").fancytree("getTree").visit(function(node){
            node.setExpanded();
        });
*/
var tree={};
(function(_tree){
    var userOptions={};
    var userMenu={};

    var isInit=false;
    var events={};
    var defaults={
        options:{
            extensions: ["dnd","edit"],
            edit: {
                adjustWidthOfs: 0,
                inputCss: {minWidth: "0"}
            }
        },
        rootNode: {
            title: "root",
            expanded: true,
            folder: true,
            key: 0,
            children:[]
        },
        menu: {
            selector: "span.fancytree-title",
            autoFocus: true 
        }
    };

    var sources={};
    var _createTree=function(_root,_list){
        var len=_list.length;
        if(len>0){
            _root["children"]=[];
            for(var i=0;i<len;i+=1){
                var item=_list[i];
                delete item.expanded;
                var expanded=item.expanded;
                try{
                    if(item.selected==true) expanded=true;
                }catch(e){}
                //var data=$.extend({},item);
                var data={};

                if(typeof events.draw=="function"){
                    data=events.draw.apply(this,[item]);
                    //data=$.extend(data,events.draw.apply(this,[item]));
                }else{
                    /*
                    data=$.extend(data,{
                        "key": item.key,
                        "title": item.title,
                        "expanded": expanded
                    });
                    */
                    /*
                    data={
                        "key": item.key,
                        "title": item.title,
                        "expanded": expanded
                    };
                    */
                }
                if(typeof data=="undefined") data={};
                var tmp=$.extend({},item);
                delete tmp.children;
                data=$.extend(tmp,data);
                data.expanded=expanded;
                //data.selected=false;
                //delete data.children;
                var key=data.key;
                if(typeof item.children!="undefined") {
                    data=_createTree(data,item.children);
                }
                sources[key]=item;
                delete sources[key]["children"];
                _root["children"].push(data);
            }
        }
        return _root;
    };

    

    var drawTree=function($_dom,_options,_menu,_rootNode,_list){
        var rootNode=_createTree(_rootNode,_list);
        _options.source=[rootNode];

        if(isInit==false){
            isInit=true;
            $_dom.fancytree(_options);
        }else{
            $_dom.fancytree('getTree').reload(_options.source);
        }
        
        if(!(typeof _menu=="undefined" || _menu==null) ){
            $_dom.contextMenu(_menu);
        
        }
    };

    /**設定選項
    */
    var setUserOptions=function(_option){
        userOptions=_option;
    };

    
    var draw=function($_dom,_options,_url,_params){
        var rootNode=$.extend({},defaults.rootNode);
        var uEvent={};
        if(typeof userOptions.events!="undefined"){
            uEvent=$.extend({},userOptions.events);
            //delete userOptions["events"];
        } 
        if(typeof _options.events!="undefined") uEvent=$.extend(uEvent,_options.events);    //取得傳入的events
        events=uEvent;
        var options=$.extend({},defaults.options);  //預設的object
        var menu=$.extend({},defaults.menu);
        var isMenu=false;
        if(typeof userOptions.menu!="undefined") {
            menu=$.extend(menu,userOptions.menu);
            isMenu=true;
            //delete userOptions["menu"];
        }
        if(typeof _options.menu !="undefined"){
            menu=$.extend(menu,_options.menu);
            isMenu=true;
        }

        if(isMenu==false) menu=null;
        rootNode=$.extend(rootNode,_options.rootNode);
        delete _options["rootNode"];
        delete _options["events"];
        delete _options["menu"];
        options=$.extend(options,userOptions);
        options=$.extend(options,_options);
        options=$.extend(options,{
            "click": function(event, data){
                var key=data.node.key;
                data.source=sources[key];
                if(typeof events!="undefined"){
                    if(typeof events.click=="function"){
                        events.click.apply(this,[event,data]);
                    }
                }
            }

        });
        var url=false;
        var list=[];
        var params={};
        if(typeof _url=="string"){
            url=_url;
            params=_params || {};
        }else{
            list=_url;
        }
        if(url!=false){
            Neko.ajax.get(url,params,function(_httpcode, _data){
                if(_httpcode=="200"){
                    if(typeof _data.result =="undefined") return false;
                    if(typeof _data.result.list =="undefined") return false;
                    list=_data.result.list;
                    drawTree($_dom,options,menu,rootNode,list);
                }
            }); 
        }else{
            drawTree($_dom,options,menu,rootNode,list);
        }
    };

    _tree.draw=draw;
    _tree.options=setUserOptions;
})(tree);