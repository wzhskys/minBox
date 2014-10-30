/**
 * jQuery minBox v0.8.6
 * Copyright (c) 2014-08-26 10:50 Jensen
 * 说明：遮罩层-不带滚动条效果
 * 需要增加的功能    type: ['dialog', 'page', 'iframe', 'loading', 'tips']
 * 
 * 0.8.6更新说明：
 *    1，优化层上层的功能并且实现弹出层基类的new方法，2个层之间相互不影响
 *    2，修复了动态添加层右上角关闭功能
 *    3，修复$.ui.minTips的层级6000
 */

(function($){
    
    var ie  = $.browser.msie;
    var ie6 = $.browser.msie && $.browser.version < 7;
    var ie7 = $.browser.msie && $.browser.version < 8;
    var win = $(window);
    var doc = $(document);
    var hml = $('html');
    
    if(ie6)  document.execCommand("BackgroundImageCache", false, true); 
    
    $.ui = $.ui || {};
    $.ui.version = '0.8.6';
    
    //皮肤颜色开发中...
    //var colors = ['#4084b6'];  //蓝色
    //var colors = ['#B6D805'];  //绿色
    //var colors = ['#cc0001'];  //红色

    $.fn.extend({
        minBox: function(options){    //基础弹出框方法
            return this.each(function(){
                //alert(options.drag);
                minBoxer(this,options);
            });
        },
        minLoadBox: function(options){    //往指定盒子添加动态加载图标
            return this.each(function(){
                //防止重复锁定窗口
                if(!$(this).is('.msgBox'))
                    $.ui.minLoadBox(this,options);
            });
        },
        minDrag: function(options){    //拖动窗口函数
            return this.each(function(){
                $.ui.minDrag.init(this,options);
            });
        },
        minTips: function(options){    //Tips信息提示
            return this.each(function(){
                $.ui.minTips(this,options);
            });
        },
        slideShow: function(options){    //Tips信息提示
            return this.each(function(){
                $.ui.slideShow(this,options);
            });
        }
    });
    
    /**
     * 遮罩层效果--指定页面ID弹出框的调用
     * 调用方法: $("#bb").minBox({opacity: 70,background: '#666'});  //参数：键值对
     *         $('#waitBox').minBox('nobg');  //参数：字符
     *         $('#waitBox').minBox();  //参数：空
     */
    
//    $.ui.closeBox = function(){
//    	$.ui.minBox.close();
//    };

    function minBoxer(container,options){
        //alert(options.drag);
        var defaults = {
            layClick    : false,    //控制遮罩层背景点击是否关闭层
            opacity     : 30,       //遮罩层背景透明度 -可缺省
            background  : "#333",   //遮罩层背景颜色 -可缺省
            zIndex      : 5000,     //遮罩层层级 -可缺省
            showOverlays: true,     //遮罩层是否显示 -可缺省
            drag        : false,    //判断是否可以拖动
            direc       : 'mm',     //判断窗口定位位置
            bodyScroll  : false,    //判断是否有滚动条
            dirOnly     : false     //专门判断是否定位右下角而select不隐藏
        };
        var minBox = {
            r: {},
            //初始化参数和设置
            init: function(container,options){
                options = options || {};
                var s = this;
                //if(!container) return false;
                s.r.box = $(container);
                //判断传参是否字符串
                if(typeof options == 'string'){
                    if(options == 'nolay')    //传参nobg字符，取消遮罩层
                         options={showOverlays: false};
                }
                //接收参数
                s.o = $.extend({},defaults,options);
                //alert(defaults.drag);
                //窗口定位
                s.boxSize();
                //创造遮罩层
                s.creates();
                //兼容IE
                s.fixIE();
                //显示遮罩层和弹出框
                s.open();
                //绑定事件
                s.bindEvents();
                //关闭按钮关闭
                s.r.box.find('.box-closes').click(function(){
                    s.close();
                })
                //页面大小变化时弹框位置和背景大小改变
                win.resize(function(){
                    s.update();
                });
            },
            //计算设置定位
            boxSize: function(){
                var s = this;
                winW     = win.width();
                winH     = win.height();
                docH     = doc.height();
                winW     = winW +17;
                boxWidth = s.r.box.outerWidth();
                boxheig  = s.r.box.outerHeight();
                leftWid  = parseInt((winW - boxWidth)/2 + 8);    //8(弹出框定位修复)
                topHeig  = parseInt((winH - boxheig)/2);
                if(s.o.bodyScroll && !ie7)  winW = win.width();
                //弹出框的页面各种定位
                switch(s.o.direc){
                    case 'lt':  //左上
                        leftWid = 0; topHeig = 0;
                        break;
                    case 'mt':  //中上
                        topHeig = 2;  //2为弹出提示框的宽度
                        break;
                    case 'rt':  //右上
                        leftWid = parseInt(winW - boxWidth); topHeig = 0;
                        break;
                    case 'lm':  //左中
                        leftWid = 0;
                        break;
                    case 'rm':  //右中
                        leftWid = parseInt(winW - boxWidth);
                        break;
                    case 'lb':  //左下
                        leftWid = 0; topHeig=parseInt(winH - boxheig);
                        break;
                    case 'mb':  //中下
                        topHeig = parseInt(winH - boxheig - 2);  //2为弹出提示框的宽度
                        break;
                    case 'rb':  //右下
                        leftWid = parseInt(winW - boxWidth); topHeig=parseInt(winH - boxheig);
                        break;
                    default:    //中中 - 正居中
                }
            },
            //创造添加box到body
            creates: function(){
                var s = this;
                winW = ie6 ? winW : '100%';
                s.r.box.css({position:'fixed','z-index':s.o.zIndex+10,left:leftWid,top:topHeig});
                s.o.bodyScroll ? hml.css({overflow:'auto'}) : hml.css({overflow:'hidden'});
                 //遮罩层设置
                if(s.o.showOverlays){
                    var layHtml =
                        '<div id="pageOverlays-'+s.o.zIndex+'" class="pageOverlays" style="position:absolute;display:none;top:0;left:0;background-color:'+ s.o.background+';' +
                        'z-index:'+s.o.zIndex+';width:'+winW+';height:'+docH+'px;' +
                        'filter:alpha(opacity='+s.o.opacity+');opacity:'+s.o.opacity/100+';overflow:hidden;"></div>';
                    $('body').append(layHtml);
                    var lay = '#pageOverlays-' + s.o.zIndex;
                    s.r.overlay = $(lay);
                }
            },
            //兼容ie
            fixIE: function(){
                var s = this;
                 if(ie6){
                    topHeig += doc.scrollTop();    //+滚动条滚动的高度
                    s.r.box.css({position:'absolute',top:topHeig});
                    $('html').css({'overflow-x':'hidden'});
                    win.scroll(function(){
                        s.r.box.css({top:topHeig + doc.scrollTop()});
                    });
                }
                //select和视频的处理
                if(ie && !s.o.dirOnly){
                    $('embed').attr('wmode','opaque');
                    $('embed, object, select').css({'visibility':'hidden'});
                    s.r.box.find('embed, object, select').css({'visibility':'visible'});
                    $('iframe').css({'visibility':'hidden'});
                }
            },
            bindEvents: function(){
                var s = this;
                s.r.minClose = s.r.box.find('.minClose');
                //关闭按钮绑定关闭事件
                s.r.minClose.bind('click.minBox',function(){
                    s.close();
                });
                //判断遮罩层是否可以点击关闭
                if(s.o.layClick && s.r.overlay){
                    s.r.overlay.bind('click.minBox',function(){
                        s.close();
                    });
                }
            },
            unbindEvents: function(){
                var s = this;
                s.r.minClose.unbind('click.minBox');
                s.r.overlay && s.r.overlay.unbind('click.minBox');
            },
            //窗口改变大小时候重新计算定位
            update: function(){
                var s = this;
                s.boxSize();
                if(ie6)  topHeig += doc.scrollTop();
                s.r.overlay && s.r.overlay.css({width:winW,height:docH});
                leftWid -= 17;
                s.r.box.css({left:leftWid,top:topHeig});
            },
            //打开遮罩层和弹出框
            open: function(){
                var s = this;
                s.r.overlay && s.r.overlay.show();
                s.o.drag ? s.r.box.show().minDrag() : s.r.box.show();  //弹出层设置是否可以拖动
            },
            //关闭取消遮罩层和弹出框
            close: function(){
                var s = this;
                s.r.overlay && s.r.overlay.remove();
                !$('.pageOverlays')[0] && scrollFun();  //判断是否多个遮罩层，待最后一个遮罩层清除的时候显示滚动条
                s.r.box.hide();
                s.unbindEvents();
            },
            //单独去掉遮罩层
            closeOverlay: function(){
                var s = this;
                if(ie){
                    $('embed, object, select').css({'visibility':'visible'});
                }
                s.r.overlay && s.r.overlay.remove();
                scrollFun();
            }
        };
        return minBox.init(container,options);
    }

    //实现层上层的第二层的覆盖
    $.fn.minBox1 = function(options){
        return this.each(function(){
            options = options || {};
            $(this).minBox({
                zIndex: 5100,
                showOverlays: options.showOverlays || true,
                drag: options.drag || false
            });
        });
    }

    //显示滚动条
    scrollFun = function(){
    	$('body').css({height:'auto',overflow:'auto'});
        $('html').css({overflow:'auto'});
        if(ie6){    //ie6bug修复
            $('body').css({width:'100%'});
        }
        if(ie){
		 	$('embed, object, select').css({'visibility':'visible'});
		 	$('iframe').css({'visibility':'visible'});
		}
    };
    
    /**
     * 遮罩层效果--往指定BOX里面添加加载中弹出框
     * 调用方法: $('.test1').minLoadBox(); //锁定指定窗口
     *         minLoadClose();           //解锁加载弹出框 
     */
    $.ui.minLoadBox = function(container,options){
        options   = options || {};
        var $this = $(container);
        var _this = this;
        $this.addClass('msgBox');
        var opts = $.extend({
            opacity     : options.opacity      || 10,                   //遮罩层背景透明度 -可缺省
            background  : options.background   || "#ccc",               //遮罩层背景颜色 -可缺省
            zIndex      : options.zIndex       || 5000,                 //遮罩层层级 -可缺省
            showOverlays: options.showOverlays || true                  //遮罩层是否显示 -可缺省
        },options);
        waitOverWidth   = $this.width(); 
        waitOverHeig    = $this.height();
        var waitBoxHtml = '<div id="waitMinBox" class="waitBox2"><img src="images/loading.gif"></div>';
        $this.html('').append(waitBoxHtml);
        var $waitBox  = $this.find('.waitBox2');
        var _waitLeft = (waitOverWidth - $waitBox.width())/2;
        var _waitTop  = (waitOverHeig - $waitBox.height())/2; 
        $waitBox.css({'position':'absolute','z-index':'5110','left':_waitLeft,'top':_waitTop});
        $this.css({'position':'relative'});
        //给弹出框定位显示
        $this.find('.waitBox').show();
    };
    
    //类似加载框的关闭
    minLoadClose = function(){
        $('#waitMinBox').remove();
    };
    
    
     /**
     * minMsgBox调用函数，提取公用
     * @param obj 对象
     * @param String 方位
     */
    timeHander = function(container,pos){
        var _pos = pos;
        var _hideHeig = 0;
        var _this = container;
        _this.minBox({
            'direc': _pos,
            'showOverlays': false,
            'bodyScroll': true
        });
        if(pos == "mb") _hideHeig = $(window).height();
        if(pos == "mt") _hideHeig = -_this.height();
        setTimeout(function(){
            _this.animate({'top':_hideHeig},300,function(){
                _this.remove();
                $("#pageOverlays-5000").remove();
                scrollFun();
            });
        },3000);
    };

    /**
     * 加载中弹出框 - 类似加载中-有无图片或只有问题mini框 -body 全局
     * @param msg {String} 文字说明
     * @param img {String} 图片类型名称 -可缺省  'sure','error','le','ku'
     * @param overlay {String} 是否有遮罩层 -可缺省 'nobg'
     * @param pos {String}  位置定位
     * 调用方法  minMsgBox('大家好！我来了...','sure','nobg')
     *           minMsgBox('大家好！我来了...','sure')
     *           minMsgBox('大家好！我来了...')
     */

    minMsgBox = function(msg,img,overlay,pos){
        var _msg = msg;
        var imgHtml = img != undefined ? '<s class=wait-'+img+'></s>' : '';
        var speed = 1000;
        var loadBoolean =  msg == undefined && img == undefined && overlay == undefined;
        //参数为空时候，默认为加载中样式
        if(loadBoolean){
            imgHtml = '<img src=images/loading.gif>';
            _msg = '正在加载中，请稍后...';
        }
        var waitBoxHtml =
            '<div id="waitBox" class="waitBox">' +
                '<div class="waitBox-main">'+imgHtml+'<span>'+_msg+'</span></div>' +
                '<div class="waitBox-bg"></div>' +
            '</div>';
        $('body').append(waitBoxHtml);
        var $waitBox = $('#waitBox');
        if(img === undefined){
            $waitBox.find('span').css({'text-align':'center','float':'none','padding-left':'0'});
        }
        var _overlay = overlay != undefined ? overlay : '' ; 
        //给弹出框定位显示
        switch(pos){
            case 'mb':
                timeHander($waitBox,'mb');
                break;
            case 'mt':
                timeHander($waitBox,'mt');
                break;
            default:
                $waitBox.minBox(_overlay);
        }
        //播放控制
        var _scrollObj = function(){
            setTimeout(function(){
                //minMsgClose();
                //minMsgBox('天气好，心情就好...','le','nobg');
            },speed);
        };
        //判断非加载框，自动关闭
        if(!loadBoolean && pos == undefined){     
            _scrollObj();
        }
    };
    
    //类似加载框的关闭
    minMsgClose = function () {
        $('#waitBox,#pageOverlays-5000').remove();
        scrollFun();
    };
    
    /**
     * 遮罩层效果 --动态插入弹出框
     * 提示：通用弹出框的传参调用
     * 调用方法：
     * mixBox({
     *    boxStyle: 'confirm',  //msg: "感叹号"提醒图片;error: "叉"提醒图片;success: "勾"提醒图片
     *    msgHead: '提示信息',       
     *    msgInfo: '图标后标题',     
     *    msgConts: '图标下提示文字' 
     * });
     */
    funcNone = function(){};
    mixBox = function(options){
        options = options || {};
        var opts = $.extend({
            boxStyle: options.boxStyle || 'defaults',       //弹出框类型
            msgHead : options.msgHead  || '提示信息',         //弹出框名称
            msgInfo : options.msgInfo  || '操作成功',         //弹出框大图标后的提示文字
            msgConts: options.msgConts || '恭喜您，操作成功！', //大图标下面的文字
            overFunc: options.overFunc || 'funcNone',       //点击确定按钮后的回调函数
            drag    : options.drag     || false,            //判断是否可以拖动
            msgClass: 'remind'
        },options);
        if(opts.boxStyle == 'error') opts.msgClass = 'fail';
        if(opts.boxStyle == 'success' || opts.boxStyle == 'defaults' ) opts.msgClass = 'ok';
        var mixHtml =
            '<div class="box-pop" id="box-pop" style="display:none">' +
                '<ul class="boxHeader">' +
                    '<li class="fl">'+opts.msgHead+'</li>' +
                    '<li class="fr"><a class="closeBox" onclick="closemixBox()"> </a></li>' +
                '</ul>' +
                '<div class="c2">' +
                    '<table style="margin:0 auto;text-align:center"><tr><td><span class='+opts.msgClass+'> </span></td><td>'+opts.msgInfo+'</td></tr></table>' +
                '</div>' +
                '<p>'+opts.msgConts+'</p>' +
                '<div class="box-pop-but clearfloat"><a class="queding" onclick="javascript:closemixBox();'+opts.overFunc+'()"></a></div>' +
            '</div>';
        $('body').append(mixHtml);
        $('#box-pop').minBox(options);
    };

    closemixBox = function(){
        $("#pageOverlays-5000,#box-pop").remove();
        scrollFun();
    };

    //简写-操作成功
    mixOk = function(){
        mixBox();
    };
    //简写-操作失败
    mixError = function(m,n){
        mixBox({
            boxStyle: 'error',
            msgInfo: n || '操作失败',
            msgConts: m ||  '对不起，操作失败！'
         });
    };
    //简写-操作出现问题
    mixQue = function(m,n){
        mixBox({
            boxStyle: 'msg',
            msgInfo: n || '操作有误',
            msgConts: m ||  '对不起，操作有误，请检查！'
        });
    };
    
    /**
     * 窗口拖动
     * 调用方法: $("#bb").minDrag();  
     */
    
    $.ui.destroyDrag = function(){
    	$.ui.minDrag.destroy();
    };

    $.ui.minDrag = {
    	r: {},
    	init: function(container,options){
    		options = options || {};
    		//var s = this;
    		var f = $.ui.minDrag;
	        f.r.obj = $(container);
	        f.r.head = f.r.obj.find('.boxHeader');
	        f.r.head.bind('mousedown.minDrag',f.start);
	        doc.bind('mouseup.minDrag', f.end);
    	},
    	//头部点击开始拖动
    	start: function(e){
    		e = e || window.event;
    		//var t = this;   //这里的this为 s.r.head的头部的HTML对象;
    		var f = $.ui.minDrag;
    		f.r._x = 0;
	        f.r._y = 0;
    		f.r.head.css('cursor','move');
			f.r._x = e.pageX - f.r.obj.offset().left;
            f.r._y = e.pageY - f.r.obj.offset().top + doc.scrollTop();
            f.r.oWidth = parseInt(win.width() - f.r.obj.outerWidth());
            f.r.oHeight = parseInt(win.height() - f.r.obj.outerHeight());
    		f.removeBlue();
    		doc.bind('mousemove.minDrag',f.move);
    	},
    	//头部点击拖动显示
    	move: function(e){
    		e = e || window.event;
    		//var t = this;
    		var f = $.ui.minDrag;
    		//var oWidth = 0;
	        //var oHeight = 0;
			var now_x = e.pageX - f.r._x;
            var now_y = e.pageY - f.r._y;
            //控制拖动在浏览器可见范围内
            if(now_x <= 0) now_x = 0;
            if(now_y <= 0) now_y = 0;
            if (now_x >= f.r.oWidth)  now_x = f.r.oWidth; 
            if (now_y >= f.r.oHeight) now_y = f.r.oHeight; 
            //拖动实时定位
            f.r.obj.css({left:now_x,top:now_y});
    	},
    	//拖动鼠标按钮抬起停止拖动
    	end: function(){
    		var f = $.ui.minDrag;
    		doc.unbind('mousemove.minDrag');
    		f.showBlue();
    	},
    	//去掉文字选中背景蓝色
    	removeBlue: function(){
    		if(typeof userSelect === "string"){
                 return document.documentElement.style[userSelect] = "none";
            }
            document.unselectable  = "on";
            document.onselectstart = function(){
               return false;
            };
    	},
    	//文字选中背景蓝色
    	showBlue: function(){
    		//可以选中背景蓝色
            if(typeof userSelect === "string"){
                return document.documentElement.style[userSelect] = "text";
            }
            document.unselectable  = "off";
            document.onselectstart = null;
    	},
    	//销毁所有的绑定事件
    	destroy: function(){
    		var f = $.ui.minDrag;
    		doc.unbind('mousemove.minDrag');
	        doc.unbind('mouseup.minDrag');
    		f.r.head.unbind('mousedown.minDrag');
    		f.showBlue();
    	}
    };

    /**
     * Tips信息提示
     * 提示：通用弹出框的传参调用
     * 调用方法：
     * $('#btnBox11').minTips({
     *	  tipStyle: 't',
     *	  tipWidth: 120,
     *	  tipHeight: 54,
     *	  tipConts: '这里显示的内容很精彩,内容很精彩的内容很精彩！',
     *	  events : 'click'
     * });
     */
    $.ui.tipdefault = {
        tipStyle :  't',    //弹出框类型
        tipConts :  '',     //大图标下面的文字
        tipWidth :  'auto',
        tipHeight:  'auto',
        events   :  'hover',//判断是否可以拖动
        bgColor  :  ''      //yellow, red, blue, green
    };

    $.ui.minTips = function(container,options){
        var tipHtml, classNames, _sets, $tips, bgcolor;
        options = options || {};
        var s = $(container);
        if($("#tips")[0]) return false;
        //接收参数
        var opts = $.extend({},$.ui.tipdefault,options);
        switch(opts.bgColor){
            case 'red':
                bgcolor = '#cc0001';
                classNames = opts.tipStyle + '1';
                break;
            case 'blue':
                bgcolor = '#0090ff';
                classNames = opts.tipStyle + '2';
                break;
            case 'green':
                bgcolor = '#a4c302';
                classNames = opts.tipStyle + '3';
                break;
            default:
                bgcolor = '#ff9900';
                classNames = opts.tipStyle;
        }
        //Tips显示框模板
        var tipHtml =
            '<div class="tips" id="tips" style=background-color:'+bgcolor +'>' +
                '<div class="tips-cont">' +
                    '<p>'+opts.tipConts+'</p>' +
                    '<s class='+classNames+'></s>' +
                 '</div>' +
            '</div>';
        //生成设置提示信息框
        function tipCreate(){
            if($("#tips")[0]) return false;
            $('body').append(tipHtml);
            $tips = $("#tips");
            var lf = s.offset().left;
            var tp = s.offset().top;
            var _posx = 0;
            var _posy = 0;
            switch(opts.tipStyle){
                case 't':  //上方显示
                    _posx = lf; _posy = tp - opts.tipHeight - 22;
                    break;
                case 'r':  //右侧显示
                    _posx = lf + s.outerWidth() + 10; _posy = tp;
                    break;
                case 'b':  //下方显示
                    _posx = lf; _posy = tp + s.outerHeight() + 10;
                    break;
                case 'l':  //左侧显示
                    _posx = lf - $tips.outerWidth() - 10; _posy = tp;
                    break;
            }
            if(opts.tipWidth != 'auto' && opts.tipStyle == 'l'){
                _posx = lf - opts.tipWidth - 30;
            }
            $tips.css({'width':opts.tipWidth,'height':opts.tipHeight,'position':'absolute','left':_posx,'top':_posy,'z-index':'6000'}).show();
        }
        //定时器开启
        var timeControl = function(){
            _sets = setTimeout(function(){
                $("#tips").remove();
            },3000);
        };
        //定时器关闭
        var clears = function(){
            clearInterval(_sets);
        };
        if(opts.events == 'click'){    //点击事件
            s.click(function(){
                tipCreate();
                timeControl();
            });
        }else{
            s.hover(function(){    //滑动事件
                tipCreate();
            },function(){
                closeMinTips();
            });
        }
        //关闭
        var closeMinTips = function () {
            $("#tips").remove();
        };
    };

    /**
     * 字体节点滑过下拉显示效果
     * 调用方法：
     * $('#dd').slideShow({
     *    showNode: '#htbxBox1'
     * });
     */
    $.ui.slideShow = function(container,options){
        options = options || {};
        var _left,_top;
        var opts = $.extend({
            showNode: options.showNode,           //显示BOX
            events  : options.events  || 'hover'  //触发的事件
        },options);
        var f = $(container);      //指向的节点
        var n = $(opts.showNode);  //显示的节点
        var fh = f.outerHeight();
        var fw = f.outerWidth();
        var nh = n.outerHeight();
        var nw = n.outerWidth();
        //显示提示框
        var creatBox = function(){
            if(f.css('display') == 'inline'){  //判断滑上去的非块状box
                var _fontH = parseInt(f.css('fontSize').replace('px',''));
                _left = f.offset().left + parseInt(f.css('padding-left').replace('px',''));
                _top  = f.offset().top + _fontH + 5;    //加上字的行高
            }else{  //块block
                _left = f.offset().left;
                _top  = f.offset().top + fh + 5;
            }
            //修复底部多出时候
            if(doc.scrollTop() != 0){  //判断滚动条未往下滚动在顶部时候
                 var bomSize = win.height() - (f.offset().top - doc.scrollTop()) - fh;
                _top = bomSize < nh ? f.offset().top - nh - 5 : _top ;
            }
            //修复右侧多出时候
            var rigSize = win.width() - f.offset().left;
            _left = rigSize < nw ? f.offset().left - nw + fw : _left ;
            n.css({'position':'absolute','left':_left,'top':_top}).show();
        };
        //判断触发事件
        if(opts.events == 'click'){
            f.click(function(){
                creatBox();
            });
            //右上角关闭
            n.find('.msgs-close').click(function(){
                n.hide();
            });
        }else if(opts.events == 'hover'){
            f.hover(function(){
                creatBox();
            },function(){
                n.hide();
            });
        }else{
            creatBox();
        }
    };
    //简单调用方法
    slideShow = function(m,n,k){
        $(m).slideShow({
            showNode: n,
            events: k
        });
    };
    
})(jQuery);
