(function(window,$){
	var InputSelectTree = function(options){
		var _this = this;
		_this.setting = {
			target:"",
			api:"",
			idkey:"flowId",
			triggerHandler:function(){},
			data:[]
		}
		_this.extend(_this.setting,options);

		_this.initData();
		_this.addEvent();
	}
	InputSelectTree.prototype = {
		constructor:InputSelectTree,
		set:function(key,val){
			this.setting[key] = val;
		},
		get:function(key){
			return this.setting[key]
		},
		extend:function(a,b){
			if (typeof b !== "object") {
				return
			};
			for (var k in b) {
				a[k] = b[k]
			};
		},
		initData:function(){
			var _this = this;
			if (this.get("data").length >= 1) {
				// this.get("data");
				this.bulid(this.get("data"))
			} else{
				$.ajax({
					url: this.get("api"),
					type: 'post',
					dataType: 'json',
					success:function(data){
						if ($.isArray(data)) {
							_this.bulid(data);
						} else if ($.isArray(data.data)) {
							_this.bulid(data.data);
						} else{
							alert("数据不正确");
						};
					}
				});

			};
		},
		bulid:function(data){
			var _this = this,
			target    = _this.get("target"),
			id = _this.get("idkey"),
			isLast = "",
			treeNodeData = {};
			//构建树
			//递归子集
			function _bulidTree(data){
				var domHtml = "";
				
				if (data.length <= 0) {return ""}
				domHtml += "<ul class='list-group list-wrap'>"
				for (var i = 0; i < data.length; i++) {
					// data[i]
					var children = data[i]['children'];//_bulidTree(data[i]['children']);
					var childHtml = "";
					var Nodeid = data[i][id];
					if (children) {
						childHtml = _bulidTree(children);
						isLast = "";
					}else{
						isLast = " list-child"
					};
					treeNodeData["tree_"+ Nodeid] = data[i];
					domHtml += "<li><div class='treeNode"+isLast+"' id='tree_"+Nodeid+"'>"+
						"<span class='tree-status tree-ext'></span>"+
						"<span class='tree-ico tree-ext-folder'></span>"+
						"<span class='tree-title'>"+data[i]['text']+"</span>"+childHtml+ 
					"</div></li>";
				};
				domHtml += "</ul>";
				return domHtml;
			}			
			target.after('<input name="treeHideData" type="hidden" /><div class="inputTree hide">'+_bulidTree(data)+'</div>');
			target.data({nodeDate:treeNodeData});
		},
		addEvent:function(){
			var _this = this,
			target = _this.get("target"),
			wrap = target.nextAll(".inputTree");
			wrap.on('click', '.tree-status', function(event) {
				event.preventDefault();
				/* Act on the event */
				var $this = $(this);
				if ($this.hasClass('tree-ext')) {
					$this.nextAll("ul")
					.addClass("hide")
					.removeClass("show")
					.end()
					.removeClass('tree-ext')
					.addClass('tree-shut')
					.next()
					.removeClass('tree-ext-folder')
					.addClass('tree-shut-folder');
				}else{
					$this.nextAll("ul")
					.addClass("show")
					.removeClass("hide")
					.end()
					.addClass('tree-ext')
					.removeClass('tree-shut')
					.next()
					.addClass('tree-ext-folder')
					.removeClass('tree-shut-folder');
				}
			}).on('click', '.tree-title', function(event) {
				event.preventDefault();
				/* Act on the event */
				var $this = $(this);
				var thisNodeId = $this.closest(".treeNode").attr('id');
				var data = target.data().nodeDate;
				var thisNodeData = data[thisNodeId]
				target.val($this.text());
				wrap.addClass('hide');
				_this.get("triggerHandler")(thisNodeData,data);
			});
			target.on('focus', function(event) {
				event.preventDefault();
				/* Act on the event */
				wrap.removeClass('hide');
			});
		}
	}
	$.fn.inputSelectTree = function(options){
		options.target = this;
		this.data(new InputSelectTree(options));
		return this;
	}	
})(window,jQuery)