/*
 *  Copyright 2012-2014, Jensen ，v1.1
 *  Date: 2014-05-24 18:00 
 * 说明：窗口拖拽效果
 * 注意：iframe框架的拖动会有问题，需要加个背景层，判断弹出框是否有遮罩层，没有给加个
 *      针对每个不同的窗口各自操作互不影响
 *      iframe跨框架mouseup事件捕捉不到--未解决
 */


(function($){
	
	function logs(s){
		return console.log(s);
	};
	
	$.fn.dialogDrag = function(params){
		if(typeof params === 'undefined') params = [];
		
		var opts = $.extend({
			//paretntId : params.paretntId,      //窗口id
			dragId    : params.dragId,         //窗口id
			objWidth  : params.objWidth,       //窗口宽度
			objHeight : params.objHeight,      //窗口高度
			titleCont : params.titleCont,      //窗口标题名称
			toMin     : params.toMin || true,  //窗口缩小
			toMax     : params.toMin || true,  //窗口放大
			//posLeft   : params.posLeft || 50, //窗口定位离左侧距离
			//posTop    : params.posTop || 50,  //窗口定位离上侧距离
			zIndex    : params.zIndex || 5100, //窗口浮动层级
			minWidth  : 10,                   //窗口缩放的最小宽度
			minHeight : 10
		},params);
		
		return this.each(function(){
			//初始化窗口属性
			$(this).css({'width':opts.objWidth,'height':opts.objHeight,'z-index':opts.zIndex,'positon':'absolute'});
			var _obj = $(this);
			var _objHead = $(opts.dragId);   
			var _objHead = $(this).find('.boxHeader');
			var _x = 0;
			var _y = 0;
			var r_x = 0;
			var r_y = 0;
			var lastWid = 0;    //拖动底部放大前的窗口宽度
			var lastHig = 0;
			var _oldWidth = 0;
			var _oldHeight = 0;
			var _oldLeft = 0;
			var _oldTop = 0;
			var borderWidth = _obj.css('border-left-width').replace('px','');     //窗口的border宽度
			
			//去除拖动时候选中文字，背景蓝色
			function removeBlue(){
				if(typeof userSelect === "string"){
		             return document.documentElement.style[userSelect] = "none";
		       };
		        document.unselectable  = "on";
		        document.onselectstart = function(){
		           return false;
		        };
			};
			
			//窗口头部点击
			_objHead.bind('mousedown',function(e){
				e = e || window.event;
				_x = e.pageX - _obj.offset().left;
				_y = e.pageY - _obj.offset().top;
				removeBlue();
				 
				topClearEvent = _stop(e);
				 
				//窗口头部点击后部放移动
				$(document).mousemove(function(e){
					e = e || window.event;
					//_obj.children().css('cursor','default');
					var now_x = e.pageX - _x;
					var now_y = e.pageY - _y;
					if(now_x < 0) now_x = 0;
					if(now_y < 0) now_y = 0;
					var oWidth = parseInt($(window).width() - _obj.width()) - borderWidth*2; 
					var oHeight = parseInt($(window).height() - _obj.height()) - borderWidth*2 + 1; 
					//console.log('bWidth='+bWidth);
					if (now_x > oWidth)  now_x = oWidth; 
					if (now_y > oHeight) now_y =  oHeight; 
					_obj.css({left:now_x,top:now_y});
				});
			});
			
			//ie判断不能粘着跟着鼠标移动
			//if(ie){
				//_objHead.mouseout(function(){
					//$(document).unbind('mousemove');
				//});
			//};
			
			var overHtml = '<div class="overBoxr" style="display:none;position:absolute;left:0;top:0;width:100%;height:100%;border:1px dashed #868e91;background-color:#e1ebed;filter:alpha(opacity=40);opacity:0.4;cursor:nw-resize;"></div>';
		    _obj.append(overHtml);
			//右下角拖放改变大小
			_obj.find('.dialogbottom').bind('mousedown',function(e){
				e = e || window.event;
				r_x = e.pageX;
				r_y = e.pageY;
				lastWid = _obj.width();
			    lastHig = _obj.height();
			    removeBlue();
			    var rel_x, rel_y, wid, heig;
				$(document).mousemove(function(e){
					e = e || window.event;
					rel_x = e.pageX - r_x;
					rel_y = e.pageY - r_y;
					wid = lastWid + rel_x;
					heig = lastHig + rel_y;
					if(wid <= opts.minWidth) wid = opts.minWidth;
					if(heig <= opts.minHeight) heig = opts.minHeight;
				    _obj.find('.overBoxr').show().css({width:wid,height:heig});
				});
				$(document).mouseup(function(e){
					_obj.find('.overBoxr').hide();
					_obj.css({width:wid,height:heig});
				});
			});
			
			//点击最大化
			_obj.find('.box-max').toggle(function(){
				//记录窗口初始信息
				_oldWidth = _obj.width();
				_oldHeight = _obj.height();
				_oldLeft = _obj.css('left');
				_oldTop = _obj.css('top');
				_obj.css({left:0,top:0,width:$(window).width()-2,height:$(window).height()-1});
				//$(this).removeClass().addClass('box-max-back');
				//最大化后图标切换
				$(this).hover(function(){
					$(this).css('background-position','0 -250px');
				},function(){
					$(this).css('background-position','0 -200px');
				});
			},function(){
				_obj.css({left:_oldLeft,top:_oldTop,width:_oldWidth,height:_oldHeight});
				$(this).hover(function(){
					$(this).css('background-position','0 -150px');
				},function(){
					$(this).css('background-position','0 -100px');
				});
			});
			
			//鼠标按键弹起
			$(document).mouseup(function(e){
				topClearEvent = null;
				_stop(e);
			});
			
			$('.dialogbottom').mouseup(function(e){
				_stop(e);
			});
			
			//关闭移除对话框
			//$('.box-close').click(function(){
				//_remove();
			//});
			
			function _stop(e){
				$(document).unbind('mousemove');
				_obj.find('.dialogbottom').unbind('mousedown');
				//可以选中背景蓝色
				if(typeof userSelect === "string"){
	                return document.documentElement.style[userSelect] = "text";
	           };
	            document.unselectable  = "off";
	            document.onselectstart = null;
			};
			
			function _remove(){
				_objHead.parent().hide();
			};       });
	};	
	
	//跳出iframe框架的窗口拖动	
	$.fn.dialogDragParent = function(params){
		if(typeof params === 'undefined') params = [];
		var opts = $.extend({
			//paretntId : params.paretntId,      //窗口id
			dragId    : params.dragId,         //窗口id
			objWidth  : params.objWidth,       //窗口宽度
			objHeight : params.objHeight,      //窗口高度
			titleCont : params.titleCont,      //窗口标题名称
			toMin     : params.toMin || true,  //窗口缩小
			toMax     : params.toMin || true,  //窗口放大
			//posLeft   : params.posLeft || 100, //窗口定位离左侧距离
			//posTop    : params.posTop || 100,  //窗口定位离上侧距离
			zIndex    : params.zIndex || 5100, //窗口浮动层级
			minWidth  : 150,                   //窗口缩放的最小宽度
			minHeight : 120
		},params);
		
		return this.each(function(){
		
		//初始化窗口属性
		var _obj = $(this);
		var _objHead = $(this).find('.boxHeader');    //前面引用的时候可以省掉，默认调用窗口的头部导航;
		_obj.css({'width':opts.objWidth,'height':opts.objHeight,'z-index':opts.zIndex,'positon':'absolute'});
		var _x = 0;
		var _y = 0;
		var r_x = 0;
		var r_y = 0;
		var lastWid = 0;        //拖动底部放大前的窗口宽度
		var lastHig = 0;        //拖动底部放大前的窗口高度
		var _oldWidth = 0;
		var _oldHeight = 0;
		var _oldLeft = 0;
		var _oldTop = 0;		var borderWidth = _obj.css('border-left-width').replace('px','');     //窗口的border宽度
		
		//去除拖动时候选中文字，背景蓝色
		function removeBlue(){
			if(typeof userSelect === "string"){
	             return documentElement.style[userSelect] = "none";
	        };
	        window.parent.document.unselectable  = "on";
	        window.parent.document.onselectstart = function(){
	           return false;
	        };
		};
		var totalWidth;
		var totalHeight;
		var minWidth = 120;
	    var minHeight = 100;
		if(ie6){
			totalWidth = $(window.parent.document).width();
	        totalHeight = $(window.parent.document).height();
		}else{
			totalWidth = '100%';
			totalHeight = '100%';
		};
		var allHtmls = '<div class="windowOver" style="position:absolute;left:0;top:0;width:'+totalWidth+';height:'+totalHeight+';border:1px dashed #1fc6e7;background-color:#e1ebed;filter:alpha(opacity=10);opacity:0.1;z-index:4900;"></div>';
        //增加拖动时候的虚框
	    var overHtml = '<div class="overBoxr" style="display:none;position:absolute;left:0;top:0;width:100%;height:100%;border:1px dashed #868e91;background-color:#e1ebed;filter:alpha(opacity=40);opacity:0.4;cursor:nw-resize;"></div>';
		//窗口头部点击
		_objHead.mousedown(function(e){
			//判断弹出框没有遮罩层给弹出框窗口加个背景层覆盖全部，iframe拖动和改变大小的BUG解决方法
			if(!$('body',window.parent.document).find('#pageOverlays')[0] && !$('body',window.parent.document).find('.windowOver')[0]) $('body',window.parent.document).append(allHtmls);
			var e = e || window.event;
			_x = e.pageX - _obj.offset().left;
			_y = e.pageY - _obj.offset().top;
			 removeBlue();
			//窗口头部点击后部放移动
			$(window.parent.document).mousemove(function(e){
				var e = e || window.event;
				_objHead.css('cursor','move');
				var now_x = e.pageX - _x;
				var now_y = e.pageY - _y;
				if(now_x < 0) now_x = 0;
				if(now_y < 0) now_y = 0;
				var oWidth = parseInt($(window.parent.document).width() - _obj.width()) - borderWidth*2; 
				var oHeight = parseInt($(window.parent.document).height() - _obj.height()) - borderWidth*2; 
				if (now_x > oWidth)  now_x = oWidth; 
				if (now_y > oHeight) now_y =  oHeight; 
				_obj.css({left:now_x,top:now_y});
			});
			
		});
		
		//右下角拖放改变大小
		_obj.find('.dialogbottom',window.parent.document).mousedown(function(e){
			if(!_obj.find('.overBoxr')[0]) _obj.append(overHtml);
			if(!$('body',window.parent.document).find('#pageOverlays')[0] && !$('body',window.parent.document).find('.windowOver')[0]) $('body',window.parent.document).append(allHtmls);
			var e = e || window.parent.window.event;
			r_x = e.pageX;
		    r_y = e.pageY;
			//IE兼容
			if(ie){
				$(_obj,window.parent.document).mousedown(function(e){
			    	r_x = e.pageX;
				    r_y = e.pageY;
			    });
			};
			lastWid = _obj.width();
		    lastHig = _obj.height();
		    removeBlue();
		    var rel_x, rel_y, wid, heig;
			$(window.parent.document).mousemove(function(e){
				var e = e || window.parent.window.event;
				rel_x = e.pageX - r_x;
				rel_y = e.pageY - r_y;
				wid = lastWid + rel_x;
				heig = lastHig + rel_y;
				if(wid <= minWidth) wid = minWidth;
				if(heig <= minHeight) heig = minHeight;
			    _obj.find('.overBoxr').show().css({width:wid,height:heig});
			});
			$(window.parent.document).mouseup(function(e){
				$('.overBoxr',window.parent.document).hide();
				_obj.css({width:wid,height:heig});
			});
			$('.dashedBox',window.parent.document).hide();    //拖动改变大小时先把虚线向左下移动框隐藏
	   });
		
		//点击最大化
		_obj.find('.box-max',window.parent.document).toggle(function(){
			//记录窗口初始信息
			_oldWidth = _obj.width();
			_oldHeight = _obj.height();
			_oldLeft = _obj.css('left');
			_oldTop = _obj.css('top');
			_obj.css({left:0,top:0,width:$(window.parent.document).width()-borderWidth*2,height:$(window.parent.document).height()-borderWidth*2});
			_obj.find('.dialogBoxCont').children().css({width:'100%',height:$(window.parent.document).height()-borderWidth*2});
			//$(this).removeClass().addClass('box-max-back');
			//最大化后图标切换
			$(this).hover(function(){
				$(this).css('background-position','0 -250px');
			},function(){
				$(this).css('background-position','0 -200px');
			});
		},function(){
			_obj.css({left:_oldLeft,top:_oldTop,width:_oldWidth,height:_oldHeight});
			_obj.find('.dialogBoxCont').children().css({width:'100%',height:_oldHeight-_obj.find('.dialogBoxHeader').height()});
			$(this).hover(function(){
				$(this).css('background-position','0 -150px');
			},function(){
				$(this).css('background-position','0 -100px');
			});
		});

	    var tWidth, tHeight, tLeft = 0, tTop = 0, mHeight = 0;
		//虚线窗口逐渐变小往下收缩消失
		function tominSize(s,t){
			var _obj = s;
			var l_left = 0;
			var t_top = $(window.parent.document).height() - 30;
			tWidth = _obj.width();
			tHeight = _obj.height();
			tLeft = parseInt(_obj.css('left').replace('px',''));
			tTop = parseInt(_obj.css('top').replace('px',''));
			//弹出窗口左上角到底部标签的坐标间的移动路径，2点连线，弹出窗口左上角向下与底部标签左上角向右的交点，连接成直角三角形
			mHeight = Math.floor(t_top - tTop);
			var mors = mHeight / tLeft;
			var mors1 = tLeft / mHeight;
			//console.log('mors1='+mors1);
			var mod;              //虚线窗口宽高比，三角形
			var mot = 0;          //虚线窗口左下角移动的步长
			var modNubLeft = 20;  //虚线窗口左下角移动水平距离
			var modNubTop = 20;   //虚线窗口左下角移动垂直距离
			var modWidth = 25;    //虚线窗口等比例收缩长度
			//算出比例，窗口的左上角到底部标签的左上角的三角形，高于宽比,算出对应移动的高或宽值
			if(mors < 1){
				mod = mors;
				modNubTop = Math.floor(modNubTop * mod);
				mot = Math.floor(tLeft/20);
			}; 
			if(mors1 < 1){
				mod = mors1;
				modNubLeft = Math.floor(modNubLeft * mod);
				mot = Math.floor(mHeight/20);
			};
			modWidth = Math.floor(tWidth / mot);
			//console.log('modWidth='+modWidth);
			l_left = $('.toMinMoreUl li').length * (110 + 2);
	        //console.log('l_left='+l_left);
		    //console.log('t_top='+t_top);
			var setInters = setInterval(function(){
				tWidth = tWidth - modWidth;
				var ys = tWidth / (tWidth + modWidth);
				tHeight = Math.floor(tHeight * ys);    //等比例缩小虚线框
				tLeft -= modNubLeft;
				tTop += modNubTop;
				if(tLeft < l_left || tTop > t_top){
					clearInterval(setInters);
					$('.dashedBox',window.parent.document).hide();
				};
				$('.dashedBox',window.parent.document).css({width:tWidth,height:tHeight,left:tLeft,top:tTop});
			},5);
		};		
		//点击最小化
		 _obj.find('.box-min').click(function(){
		 	if(contains(retLi,_rels)) return false;
		 	if($('.toMinMore li',window.parent.document).length == 0){
		 	 	retLi = [];
		 	};
	  	    var _rels = _obj.attr('rel');
	    	_remove2();
	    	//层上层弹出框缩小的时候背景层依次去掉
	    	if($('#pageOverlays',window.parent.document)[0] && $('#pageOverlays2',window.parent.document)[0]){
	    		 $('#pageOverlays2',window.parent.document).remove();
	    	}else if($('#pageOverlays',window.parent.document)[0]){
	    		 $('#pageOverlays',window.parent.document).remove();
	    	};
	    	//console.log(retLi);
	    	//retLi = retLi.unique();
	    	
	    	//把原窗口隐藏，虚线窗口向左下方移动缩小消失
	    	//console.log('111='+_obj.css('left'));
		    $('.dashedBox',window.parent.document).css({width:_obj.width(),height:_obj.height(),left:_obj.css('left'),top:_obj.css('top')}).show();
		    tominSize(_obj,_rels);
		    var box_title = $(this).parent().prev().find('font').html();
		    $('.toMinMore',window.parent.document).animate({'bottom':0},200).show();
		    var bottomHtml = '<li class="bottomAddLi" onclick="openParentDialog('+_rels+')" onmouseover="hoverFuc(this)" onmouseout="outFun(this)" rel='+_rels+'><span>'+box_title+'</span><s></s><div class="dotCloseBottom" onclick="bottomClose(this,'+_rels+')"></div></li>';
		    //把底部标签所有的rel加入到retLi数组
		    //$('.toMinMoreUl li',window.parent.document).each(function(){
		    	//retLi.push($(this).attr('rel'));
		    //});
		    //判断不重复的在底部标签增加
		    //console.log(retLi);
		    if(!contains(retLi,_rels))  $('.toMinMoreUl',window.parent.document).append(bottomHtml);  
		    if(!contains(retLi,_rels))  retLi.push(_rels);
		    //console.log('retLi='+retLi);
		 });
		
		//鼠标按键弹起
		$(window.parent.document).mouseup(function(e){
			_stop();
		});
		
		$('.dialogbottom',window.parent.document).mouseup(function(e){
			_stop();
		});
		
		//关闭移除对话框
		_obj.find('.box-close',window.parent.document).click(function(){
		   _obj.hide();
		   //$('.windowOver',window.parent.document).remove();    //判断拖动层的背景存在的时候，关闭时候隐藏
	       $('.windowOver',window.parent.document).remove();    //判断拖动层的背景存在的时候，关闭时候隐藏
	       var terlt = _obj.attr('rel');
		   $('.toMinMoreUl li',window.parent.document).each(function(){
	     	  var rels = $(this).attr('rel');
	     	  if(rels == terlt) $(this).remove();
	       });
		   if($('.toMinMore li',window.parent.document).length == 0){
		   	  $('.toMinMore',window.parent.document).animate({'bottom':'-29px'},200,function(){
			     $('.toMinMore',window.parent.document).hide();
		      });
		      retLi = [];    //清空装载底部标签含rel的数组
		   };
		   retLi = delArray(retLi,_obj.attr('rel'));
		   $("#pageOverlays",window.parent.document).remove();   //关闭遮罩层
		});
		//解除绑定事件和移除禁止选中文字的蓝色背景
		function _stop(){
			try{
				if(null != window.parent) $(window.parent.document).unbind('mousemove');
			}catch(e){
				
			};
			//$(window.parent.document).unbind('mousedown');
			//$(window.parent.document).unbind('mouseup');
			//可以选中背景蓝色
			
			if(typeof userSelect === "string"){
                return documentElement.style[userSelect] = "text";
            }
            window.parent.document.unselectable  = "off";
            window.parent.document.onselectstart = null;
		};
		
		//弹出框隐藏和背景遮罩层的隐藏或删除
		function _remove(){
			_objHead.parent().hide();
			if($('.windowOver',window.parent.document)[0]) $('.windowOver',window.parent.document).remove();    //判断拖动层的背景存在的时候，关闭时候隐藏
		    if($('#pageOverlays',window.parent.document)[0]) $('#pageOverlays',window.parent.document).remove();    //判断拖动层的背景存在的时候，关闭时候隐藏
		};
		
		//弹出框隐藏和背景遮罩层的隐藏或删除
		function _remove2(){
			_objHead.parent().hide();
			if($('.windowOver',window.parent.document)[0]) $('.windowOver',window.parent.document).remove();    //判断拖动层的背景存在的时候，关闭时候隐藏
		};
		
		});
	};
	
})(jQuery);

