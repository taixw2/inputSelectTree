(function(window,$){
	var InputSelectTree = function(options){
		var _this = this;
		_this.setting = {
			target:"",
			api:"",
			apiRight:"",
			idkey:"flowId",
			triggerHandler:function(){},
			width:0,
			height:0,
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
			width = _this.get("width"),
			height = _this.get("height"),
			isLast = "",	
			apiRight = _this.get("apiRight"),	
			treeNodeData = {};
			//构建树
			//递归子集
			function _bulidTree(data){
				var domHtml = "",templet = "";
				templet = "<li><div class='treeNode @isLast' GuId='@Nodeid'><span class='tree-status tree-ext'></span><span class='tree-ico tree-ext-folder'></span><span class='tree-title'>@data</span>@childHtml</div></li>";
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
					treeNodeData[Nodeid] = data[i];
					//isLast
					//Nodeid
					//data[i]['text']
					//childHtml
					domHtml += templet.split("@isLast").join(isLast)
					.split("@Nodeid").join(Nodeid)
					.split("@data").join(data[i]['text'])
					.split("@childHtml").join(childHtml);
				};
				domHtml += "</ul>";
				return domHtml;
			}
			target.after('<input name="treeHideData" type="hidden" /><div class="inputTree hide">'+_bulidTree(data)+'</div>');
			var treeWrap = target.nextAll('div.inputTree');
			var targetLeft = target.offset().left;
			var targetTop = target.offset().top + target.height() + 6;
			if (width && height) {
				treeWrap.css({
					height: height,
					width: width,
				});
			};

			treeWrap.css({
				left: targetLeft,
				top: targetTop
			});		

			if (apiRight) {
				treeWrap.after("<div class='selectRight hide'></div>");
				var selRit = treeWrap.next();
				if (width && height) {
					selRit.css({
						height: height,
						width: width - 30
					});
				};
				selRit.css({
					left: targetLeft + treeWrap.width(),
					top: targetTop
				});	
			};			
			
			target.data({nodeDate:treeNodeData});
		},
		bulidRight:function(apiRight,thisNodeData){
			var _this = this,
			target = _this.get("target"),
			id = _this.get("idkey"),
			wrap = target.nextAll(".inputTree"),
			wrapReg = wrap.next();
			wrapReg.removeClass('hide');		
			$.ajax({
				url: apiRight,
				type: 'post',
				data:{
					flowId:thisNodeData[id]
				},
				dataType: 'json',
				success:function(data){
					var myData = data.data;
					var myStr = "";
					myStr = "<div  class='list-group'>"
					for (var i = 0; i < myData.length; i++) {
						myStr += "<a title='"+myData[i].text+"' class='list-group-item right-title' guid='"+myData[i][id]+"'>"+myData[i].text+"</a>"
					};
					myStr += "</div >";
					wrapReg.html(myStr);
				}
			});
		},
		addEvent:function(){
			var _this = this,
			target = _this.get("target"),
			id = _this.get("idkey"),
			wrap = target.nextAll(".inputTree"),
			wrapReg = wrap.next();
			var apiRight     = _this.get("apiRight");
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
				var $this        = $(this);
				var thisNodeId   = $this.closest(".treeNode").attr('Guid');
				var data         = target.data().nodeDate;
				var thisNodeData = data[thisNodeId];
				
				_this.get("triggerHandler")(thisNodeData);
				if (apiRight) {
					_this.bulidRight(apiRight,thisNodeData);
				}else{
					wrap.addClass('hide');
					target.val($this.text());
				}
			});
			wrapReg.on('click', '.right-title', function(event) {
				event.preventDefault();
				/* Act on the event */
				var $this        = $(this);
				wrap.addClass('hide');
				wrapReg.addClass('hide');
				target.val($this.text());
				
			});
			target.on('focus', function(event) {
				event.preventDefault();
				/* Act on the event */
				wrap.removeClass('hide');
			});
		}
	};
	$.fn.inputSelectTree = function(options){
		options.target = this;
		this.data(new InputSelectTree(options));
		return this;
	}	
})(window,jQuery)