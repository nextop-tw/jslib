/*
$("#tree").fancytree("getTree").visit(function(node){
            node.setExpanded();
        });
*/
if(typeof Neko=="undefined") Neko={};
Neko.tree=(function(){
    //fancytree
    var tree=function($_elem,_options){
        this.options=null;
        this.sources={};
        this.rootNode=null;
        this.menu=null;
        this.events={};
        this.$elem=$_elem;
        this.isDraw=false;
        this.defaults={
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

        this.movers={
            moveTo:{},  //key為移動項目的key,value:新的父key
            sorts:{}
        };

        this.appendOptions(_options);
        return this;
    };

    tree.prototype.get_tree=function(){
        return this.$elem.fancytree('getTree');
    };

    tree.prototype.dragoptions=function(_options){
        var me=this;
        return {
            "dnd":{
                autoExpandMS: 400,
                draggable:{
                    zIndex: 1000,
                    scroll: false,
                    containment: "parent",
                    revert: "invalid"
                },
                preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

                dragStart: function(node, data) {
                      // This function MUST be defined to enable dragging for the tree.
                      // Return false to cancel dragging of node.
                //    if( data.originalEvent.shiftKey ) ...          
                //    if( node.isFolder() ) { return false; }
                    return true;
                },
                dragEnter: function(node, data) {
                
                  /* data.otherNode may be null for non-fancytree droppables.
                   * Return false to disallow dropping on node. In this case
                   * dragOver and dragLeave are not called.
                   * Return 'over', 'before, or 'after' to force a hitMode.
                   * Return ['before', 'after'] to restrict available hitModes.
                   * Any other return value will calc the hitMode from the cursor position.
                   */
                  // Prevent dropping a parent below another parent (only sort
                  // nodes under the same parent):
            //    if(node.parent !== data.otherNode.parent){
            //      return false;
            //    }
                  // Don't allow dropping *over* a node (would create a child). Just
                  // allow changing the order:
            //    return ["before", "after"];
                  // Accept everything:
                  return true;
                },
                 dragExpand: function(node, data) {
                  // return false to prevent auto-expanding data.node on hover
                },
                dragOver: function(node, data) {
                },
                dragLeave: function(node, data) {
                },
                dragStop: function(node, data) {
                },
                dragDrop: function(node, data) {
                    
                    var moverKey=data.otherNode.key;
                    var parentKey=data.otherNode.parent.key;
                    var moveToNode=node;
                    
                    if(data.hitMode=="over"){   //移到某個項目中
                        if(moveToNode.key=="" || moveToNode.key<0) return false;
                        me.movers.moveTo[moverKey]=moveToNode.key;
                        me.movers.sorts[moveToNode.key]=true;
                        
                    }else{  //插入某個節點之前或之後
                        //比對兩者的父節點是否相同
                        if(parentKey!=moveToNode.parent.key) {
                            me.movers.moveTo[moverKey]=moveToNode.parent.key;
                            me.movers.sorts[moveToNode.parent.key]=true;
                        }
                    }
                    me.movers.sorts[parentKey]=true;
                    data.otherNode.moveTo(node, data.hitMode);
                   
                    /*
                    var mover=data.otherNode.key;
                    var moveTo=node.key
                    console.log(mover+" to "+ moveTo);
                   
                  // This function MUST be defined to enable dropping of items on the tree.
                  // data.hitMode is 'before', 'after', or 'over'.
                  // We could for example move the source to the new target:
                    data.otherNode.moveTo(node, data.hitMode);
                    */

                }
            }
        };
    };

    tree.prototype.init=function(_options){
        this.options=null;
        this.sources={};
        this.rootNode=null;
        this.menu=null;
        this.events={};
        this.initMovers();
    };

    tree.prototype.initMovers=function(_options){
        this.movers={
            moveTo:{},  //key為移動項目的key,value:新的父key
            sorts:{}
        };
    };

    tree.prototype.appendOptions=function(_options){
        var me=this;
        var options={};
        if(this.options===null){
            options=$.extend({},this.defaults.options);
        }else{
            options=$.extend({},this.options);
        }

        if(typeof _options.checkbox==true){
            options.selectMode=3;
        }
       
        if(typeof _options.rootNode!="undefined"){
            var rootNode=$.extend({},this.defaults.rootNode);
            this.rootNode=$.extend(rootNode,_options.rootNode);
            delete _options.rootNode;
        }

        if(typeof _options.menu!="undefined"){
            if(this.menu==null) {
                this.menu={};
                this.menu=$.extend({},this.defaults.menu);
            }
            this.menu=$.extend(this.menu,_options.menu);
            delete _options.menu;
        }

        if(typeof _options.drag!="undefined"){
            var dragoptions=this.dragoptions();
            var drag=$.extend({},_options.drag);
            delete _options["drag"];
            for(var i in drag){
                dragoptions["dnd"][i]= drag[i];
            }
            options=$.extend(options,dragoptions);
            delete _options.drag;
        }

        if(typeof _options.events!="undefined"){
            this.events=$.extend(this.events,_options.events);
            if(typeof _options.events.click=="function"){
                options.click=function(_event, _data){
                    var key=_data.node.key;
                    _data.source=me.sources[key];
                    me.events.click.apply(this,[_event,_data]);
                };
            }
        }
        this.options=$.extend(options,_options);
        return this;

    };

    tree.prototype.getOptions=function(){
        var me=this;
        if(this.rootNode==null) this.rootNode=$.extend({},this.defaults.rootNode);
        return this.options;
    };

    tree.prototype.draw=function(_url,_params){
        var me=this;
        var list=[];
        if(typeof _url=="string"){   //表示為網址
            _params= _params || {};
            Neko.ajax.get(_url,_params,function(_httpcode, _data){
                if(_httpcode=="200"){
                    if(typeof _data.result =="undefined") return false;
                    if(typeof _data.result.list =="undefined") return false;
                    list=_data.result.list;
                    me.drawTree(list);
                }
            }); 
        }else{
            list=_url;  //source
            this.drawTree(list);
        }
    };

    tree.prototype.drawTree=function(_list){
        if(this.rootNode==null) this.rootNode=$.extend({},this.defaults.rootNode);
        var rootNode=$.extend({},this.rootNode);
        //[rootNode,_list]=this.replace_root(rootNode,_list);
        rootNode=this.appendToTree(rootNode,_list);
        this.options.source=[rootNode];

        if(this.isDraw==false){
            this.isDraw=true;
            this.$elem.fancytree(this.options);
        }else{
            this.$elem.fancytree('getTree').reload(this.options.source);
        }
        
        if(!(typeof this.menu=="undefined" || this.menu==null) ){
            this.$elem.contextMenu(this.menu);
        
        }
    };

    tree.prototype.replace_root=function(_root,_list){
        var len=_list.length;
        if(_root.code!=''){
             for(var i=0;i<len;i+=1){
                var item=_list[i];
                if(item.code==_root.code){
                    _root=Object.assign({},item);
                    delete _root.children;
                    _list=item.children;
                    return [_root,_list];
                }
             }
        }
        return [_root,_list];
    };

    tree.prototype.appendToTree=function(_root,_list){
        var len=_list.length;
        if(len>0){
            _root["children"]=[];
            for(var i=0;i<len;i+=1){
                var item=_list[i];
                delete item.expanded;
                var expanded=item.expanded;
                if(item.selected=="N") item.selected=false;
                if(item.selected=="Y") item.selected=true;
                try{
                    if(item.selected==true) expanded=true;
                }catch(e){}
                //var data=$.extend({},item);
                var data={};

                if(typeof this.events.draw=="function"){
                    data=this.events.draw.apply(this,[item]);
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
                this.sources[key]=tmp;
                if(typeof item.children!="undefined") {
                    data=this.appendToTree(data,item.children);
                }
                _root["children"].push(data);
            }
        }
        return _root;
    }



    /**取得選擇的node
    */
    tree.prototype.selected=function(){
        return this.$elem.fancytree('getTree').getSelectedNodes();
         var selKeys = $.map(selNodes, function(node){
            if(node.children==null) return node.key ;
          });
    };

    /**取得選擇的key
    *@params _folder bool false:只取的子節點編號,取得所有節點編號
    *@retrun 選中節點的編號
    */
    tree.prototype.selectedID=function(_folder){
        var folder=_folder || false;
        var nodes=this.selected();
        return $.map(nodes, function(node){
            if(folder==false){
                if(node.children==null) return node.key ;
            }else{
                return node.key
            }
        });
    };

    tree.prototype.getNodeByKey=function(_k){
        return this.$elem.fancytree('getTree').getNodeByKey(_k.toString());
    };
    /**取得移動資料
    */
    tree.prototype.getMovers=function(){
        var sortList={};
        var sorts=this.movers.sorts;
        for(var i in sorts){
            var key=i;
            var node=this.getNodeByKey(key);
            if(typeof node.children!="undefined"){
                if(node.children!=null){
                    sortList[key]=[];
                    var len=node.children.length;
                    for(var j=0;j<len;j+=1){
                        var child=node.children[j];
                        sortList[key].push(child.key);
                    }
                }
            }
        }
        return {
            movers:$.extend({},this.movers.moveTo),
            sorts: sortList
        };
    };

   return tree;
})();