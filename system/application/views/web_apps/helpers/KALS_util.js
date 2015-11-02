/**
 * KALS_util
 *
 * KALS程式使用到的工具箱，KALS_util
 *
 * @package    KALS
 * @category   JavaScript Libraries
 * @author     Pudding Chen <puddingchen.35@gmail.com>
 * @copyright  Copyright (c) 2010, Pudding Chen
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link       http://sites.google.com/site/puddingkals/
 * @version    1.0 2010/7/20 下午 10:17:42
 */
KALS_util = {};

/**
 *  改寫jQuery的$.getJSON方法
 *
 * @param _config = {
 *   url: String (without base_url),
 *   data: JSON,
 *   callback: function (_data),
 *   exception_handle: function (_data), //可省略，省略則自動使用KALS_util.show_exception來處理
 *   retry: 3, //可省略，預設嘗試次數
 *   retry_wait: 60 * 1000, //預設嘗試等待時間，單位是毫秒
 *   cross_origin: false, //是否是同源網址
 *   fixed_callback: "fixed_callback"   //預設省略，固定callback的參數
 * };
 */
KALS_util.ajax_get = function (_config) {
    var _url = $.get_parameter(_config, 'url');
    var _data = $.get_parameter(_config, 'data');
    var _callback = $.get_parameter(_config, 'callback', function() {});
    var _exception_handle = $.get_parameter(_config, 'exception_handle', function (_exception) {
        KALS_util.show_exception(_exception, _url);
    });
    var _cross_origin = $.get_parameter(_config, 'cross_origin', false);
    
    var _retry = $.get_parameter(_config, 'retry', 3);
    var _retry_wait = $.get_parameter(_config, 'retry_wait', 60 * 1000);
    var _retry_counter = 0;
    
    /**
     * @version 20140902 Pulipuli Chen
     * 考量到是以http作為開頭的場合
     */
    if (_cross_origin === false && $.starts_with(_url, "http") === false) {
        _url = $.appends_with(_url, '/');
    }
    
    var _callback_parameter = $.get_parameter(_config, "fixed_callback", "?");
    if (_callback_parameter === true) {
        _callback_parameter = "_";
    }
    else if ($.is_number(_callback_parameter)) {
        _callback_parameter = "_" + _callback_parameter;
    }
    
    var _full_callback_parameter = _callback_parameter;
    if ($.is_string(_callback_parameter) && _callback_parameter !== "?") {
        _full_callback_parameter = "KALS_util.c." + _callback_parameter;
    }
    
    if (_cross_origin === false) {
        if (_data !== null) {
            if ($.is_object(_data)) {
                _data = $.json_encode(_data);
                _data = encodeURIComponent(_data);
                _data = escape(_data);
            }
            else if ($.is_string(_data)) {
                _data = encodeURIComponent(_data);
                _data = escape(_data);
            }

            _url = _url + _data + '/callback=' + _full_callback_parameter;
        }
        else {
            _url = _url + 'callback=' + _full_callback_parameter;
        }
        
        if (_url.indexOf('http') === 0 
                || _url.indexOf('%22') === 0) {
            $.test_msg('ajax get exception', 'KALS_util.ajax_get try to load exception url: ' + _url);
            //throw ;
            return this;
        }
        
        if (typeof(KALS_context) !== 'undefined') {
            //while ($.starts_with(_url, '/'))
            //    _url = _url.substring(1, _url.length);
            //_url = KALS_context.get_base_url() + _url;

            //$.test_msg('KALS_util.ajax_get()'
            //    , [_url, KALS_context.get_base_url(), KALS_context.base_url, KALS_context.get_base_url(_url)]);

            _url = KALS_context.get_base_url(_url);
        }
    }
    else {
        _url = _url + "?callback=?";
    }
    var _this = this;
    
    //檢查網址是否超過最大長度
    if (_url.length > 2000) {
        if ($.is_function(_exception_handle)) {
            _exception_handle();
        }
        else {
			
            $.test_msg('KALS_util.ajax_get()'+'超過最大長度囉', _url.length);
			
            this.show_exception({
                heading: KALS_context.lang.line(new KALS_language_param(
                    'Data error.',
                    'exception.url_too_large.heading'
                )),
                message: KALS_context.lang.line(new KALS_language_param(
                    'Request-URL too large.',
                    'exception.url_too_large.message'
                )),
                request_uri: _url
            });
        }
        return this;
    }
    
    if (KALS_CONFIG.debug.ajax_get_message) {
        $.test_msg('ajax_get', _url);
    }
    
    var _retry_timer;
    //var _retry_exception = function () {
    //    $.test_msg('retry exception', [_url, KALS_context.get_base_url()]);
    //    var _exception = new KALS_exception('exception.retry_exception');
    //    _this.show_exception(_exception, _url);
    //};
    //var _retry_exception = this.re
    
    
    var _get_callback = function (_data) {
    //$.getJSON(_url, function (_data) {

        if (KALS_context !== undefined
                && KALS_context.completed === true) {
            if (KALS_CONFIG.debug.ajax_get_message) {			
                //$.test_msg('ajax_get from ' + _url + ' \n return data', _data);
            }
        }

        if (typeof(_retry_timer) === 'undefined' 
                || _retry_timer === null) {
            return this;
        }
        else if ($.isset(_retry_timer)) {
            clearInterval(_retry_timer);
            _retry_timer = null;
            delete _retry_timer;
        }

        if (typeof(_data.exception) !== 'undefined') {            
            if ($.is_function(_exception_handle)) {
                _exception_handle(_data.exception);
            }
            else {
                _this.show_exception(_data.exception);
            }
        }
        else {
            _callback(_data);
        }
    };
    
    if (_callback_parameter !== "?") {
        this.c[_callback_parameter] = function (_data) {
        //window[_callback_parameter] = function (_data) {
            _get_callback(_data);
        };
    }
    
    var _get_json = function() {
        
        //if (_retry_counter == 999)
        //    return;
        
        if (_callback_parameter === "?") {
            //$.getJSON(_url, _get_callback); 
            $.ajax({
                dataType: "json",
                url: _url,
                success: _get_callback,
                error: _exception_handle
//                error: function (_data) {
//                    alert("error!!!");
//                    $.test_msg("error", _data);
//                }
              });
        }
        else {
            //$.getJSON(_url);
            $.getScript(_url);
        }
    };
    
    try {
        _get_json();
        
        if (_retry !== null && _retry > 0) {
            
            if (_callback_parameter !== "?") {
                //$.test_msg("$.ajax_get start to load", _url);
                //$.test_msg("開始計時", _retry_wait);
            }
            _retry_timer = setInterval(function () {
                //$.test_msg("時間到了");
                if (_retry_counter === _retry || _retry_counter > _retry
                    || typeof(_retry_timer) === 'undefined') {
                    if (typeof(_retry_timer) !== 'undefined') {
                        clearInterval(_retry_timer);
                        _retry_timer = null;
                        delete _retry_timer;
                    }
                    _this._retry_exception(_url);
                    return this;
                }
                
                _get_json();
                
                _retry_counter++;
                
            }, _retry_wait);    
        }
    }
    catch (e) {
        if ($.isset(_retry_timer)) {
            clearInterval(_retry_timer);
            _retry_timer = null;
            delete _retry_timer;
        }
        
        if ($.is_function(_exception_handle)) {
            _exception_handle(e, _url);
        }
        else {
            _this.show_exception(e, _url);
        }
    }
    
    return this;
};

/**
 * 改寫jQuery的$.get方法
 * 用於存取與伺服器本地端的資料
 * 目前主要是用於內嵌登入時可以指定網址用
 *
 * @param _config = {
 *   url: String (without base_url),
 *   data: JSON,
 *   callback: function (_data),
 *   exception_handle: function (_data), //可省略，省略則自動使用KALS_util.show_exception來處理
 *   retry: 3, //可省略，預設嘗試次數
 *   retry_wait: 60 * 1000, //預設嘗試等待時間，單位是毫秒
 *   fixed_callback: "fixed_callback"   //預設省略，固定callback的參數
 * };
 */
KALS_util.ajax_local_get = function (_config) {
    var _url = $.get_parameter(_config, 'url');
    var _data = $.get_parameter(_config, 'data');
    var _callback = $.get_parameter(_config, 'callback', function() {});
    var _exception_handle = $.get_parameter(_config, 'exception_handle');
    
    var _retry = $.get_parameter(_config, 'retry', 3);
    var _retry_wait = $.get_parameter(_config, 'retry_wait', 60 * 1000);
    var _retry_counter = 0;
    
    var _data_type = $.get_parameter(_config, 'data_type', "json");
    
    //_url = $.appends_with(_url, '/');
    
    var _callback_parameter = $.get_parameter(_config, "fixed_callback", "?");
    if (_callback_parameter === true) {
        _callback_parameter = "_";
    }
    else if ($.is_number(_callback_parameter)) {
        _callback_parameter = "_" + _callback_parameter;
    }
    
    var _full_callback_parameter = _callback_parameter;
    if ($.is_string(_callback_parameter) && _callback_parameter !== "?") {
        _full_callback_parameter = "KALS_util.c." + _callback_parameter;
    }
    
    //$.test_msg("ajax_local_get", _url);
    
    if (_data !== null) {
        if ($.is_object(_data)) {
            _data = $.json_encode(_data);
            _data = encodeURIComponent(_data);
            _data = escape(_data);
        }
        else if ($.is_string(_data)) {
            _data = encodeURIComponent(_data);
            _data = escape(_data);
        }
		
        //_url = _url + _data + '/callback=' + _full_callback_parameter;
    }
    else {
        //_url = _url + 'callback=' + _full_callback_parameter;
    }
    
	if (_url.indexOf('http') === 0 
                || _url.indexOf('%22') === 0) {
            $.test_msg('ajax_local_get exception', 'KALS_util.ajax_get try to load exception url: ' + _url);
            //throw ;
            return this;
	}

    var _this = this;
    
    //檢查網址是否超過最大長度
    if (_url.length > 2000) {
        if ($.is_function(_exception_handle)) {
            _exception_handle();
        }
        else {
			
            $.test_msg('KALS_util.ajax_local_get()'+'超過最大長度囉', _url.length);
			
            this.show_exception({
                heading: KALS_context.lang.line(new KALS_language_param(
                    'Data error.',
                    'exception.url_too_large.heading'
                )),
                message: KALS_context.lang.line(new KALS_language_param(
                    'Request-URL too large.',
                    'exception.url_too_large.message'
                )),
                request_uri: _url
            });
        }
        return this;
    }
    
    if (KALS_CONFIG.debug.ajax_get_message) {
        $.test_msg('ajax_local_get', _url);
    }
    
    var _retry_timer;
    //var _retry_exception = function () {
    //    $.test_msg('retry exception', [_url, KALS_context.get_base_url()]);
    //    var _exception = new KALS_exception('exception.retry_exception');
    //    _this.show_exception(_exception, _url);
    //};
    //var _retry_exception = this.re
    
    
    var _get_callback = function (_data) {
        //$.getJSON(_url, function (_data) {
        
        if (typeof(_data) !== "undefined" 
                && typeof(_data.response) !== "undefined") {
            _data = _data.response;
        }
        
        //$.test_msg("ajax_local_get get_callback", _data);
        
        if (KALS_context !== undefined
                && KALS_context.completed === true) {
            if (KALS_CONFIG.debug.ajax_get_message) {			
                $.test_msg('ajax_local_get from ' + _url + ' \n return data', _data);
            }
        }

        if (typeof(_retry_timer) === 'undefined' 
                || _retry_timer === null) {
            return this;
        }
        else if ($.isset(_retry_timer)) {
            clearInterval(_retry_timer);
            _retry_timer = null;
            delete _retry_timer;
        }

        if (typeof(_data) !== 'undefined'
                && typeof(_data.exception) !== 'undefined') {
            if ($.is_function(_exception_handle)) {
                _exception_handle(_data.exception, _url);
            }
            else {
                _this.show_exception(_data.exception, _url);
            }
        }
        else {
            if ($.is_function(_callback)) {
                _callback(_data);
            }
        }
    };
    
    if (_callback_parameter !== "?") {
        this.c[_callback_parameter] = function (_data) {
        //window[_callback_parameter] = function (_data) {
            _get_callback(_data);
        };
    }
    
    var _error_callback = function (e) {
        
        if (e === undefined) {
            e = "undefined_error";
        }
        else if (typeof(e.status) !== "undefined") {
            e = "Page not found!";
        }
        
        _get_callback();
        
        if ($.is_function(_exception_handle)) {
            _exception_handle(e, _url);
        }
        else {
            _this.show_exception(e, _url);
        }
        
    };
    
    var _get_json = function() {
        
        //if (_retry_counter == 999)
        //    return;
        /*
        if (_callback_parameter === "?") {
            $.getJSON(_url, _get_callback); 
        }
        else {
            //$.getJSON(_url);
            $.getScript(_url);
        }
        */
        //$.get(_url, _get_callback);
        $.ajax({
            url: _url,
            dataType: _data_type,
            complete: _get_callback,
            error: _error_callback
        });
    };
    
    try {
        _get_json();
        
        if (_retry !== null && _retry > 0) {
            
            if (_callback_parameter !== "?") {
                //$.test_msg("開始計時", _retry_wait);
            }
            _retry_timer = setInterval(function () {
                //$.test_msg("時間到了");
                if (_retry_counter === _retry || _retry_counter > _retry
                    || typeof(_retry_timer) === 'undefined') {
                    if (typeof(_retry_timer) !== 'undefined') {
                        clearInterval(_retry_timer);
                        _retry_timer = null;
                        delete _retry_timer;
                    }
                    _this._retry_exception(_url);
                    return this;
                }
                
                _get_json();
                
                _retry_counter++;
                
            }, _retry_wait);    
        }
    }
    catch (e) {
        if ($.isset(_retry_timer)) {
            clearInterval(_retry_timer);
            _retry_timer = null;
            delete _retry_timer;
        }
        
        _error_callback(e);
    }
    
    return this;
};

/**
 *  改寫jQuery的$.getJSON方法，變成可以傳遞大量資料的POST寫法
 *
 * @param _config = {
 *   url: String (without base_url),
 *   data: JSON,
 *   callback: function (_data),
 *   exception_handle: function (_data) //可省略，省略則自動使用KALS_util.show_exception來處理
 * };
 */	
KALS_util.ajax_post = function (_config) {
    //如果要檢查資料，請將_debug設為true
    var _debug = KALS_CONFIG.debug.ajax_post;
    //_debug = true;
    
    var _url = $.get_parameter(_config, 'url');
    var _data = $.get_parameter(_config, 'data');
    var _callback = $.get_parameter(_config, 'callback', function() {});
    var _exception_handle = $.get_parameter(_config, 'exception_handle');
    var _data_type = $.get_parameter(_config, 'data_type', "json");
    
    var _action = $.appends_with(_url, '/');
    
    if (typeof(KALS_context) !== 'undefined') {   
        _action = KALS_context.get_base_url(_action);
    }
    //$.test_msg('ajax_post action: ' + '<a href="'+_action+'" target="_blank">' + _action + '</a>', _data);
    
    //取得現在時間作為id
    var _id = $.create_id();
    var _name = 'name_' + _id;
    
    var _layer = $('<div></div>')
        .css('position', 'absolute')
        .css('top', '-1000px')
        .appendTo($('body'));
    
    //建立一個暫存的iframe
    var _iframe = $('<iframe></iframe')
        .css('width', '0')
        .css('height', '0')
        .id(_id)
        .attr('name', _name)
        .appendTo(_layer);
    
    if (_debug === true) {
        _iframe.css('width', '640px')
            .css('height', '480px');
        _layer.css('top', '50px')
            .css('position', 'fixed')
            .css('background-color', 'white');
    }

    //建立一個FORM
    //然後讓form target到該iframe
    var _form = $('<form></form>')
        .attr('target', _name)
        .attr('method', 'post')
        .attr('action', _action)
        .attr('enctype', 'multipart/form-data')
        .appendTo(_layer);
        
    //擺放檔案input並指定成_file_path，
    //建立一個json的input
    var _input;
    if ($.isset(_data)) {
        _data = $.json_encode(_data);
        //_data = encodeURIComponent(_data);
        //_data = escape(_data);
        
        _input = $('<input type="text" name="json" />')
            .attr('value', _data)
            .appendTo(_form);
    }
    
    var _this = this;
    var _post_retry_count = 0;
    var _post_retry_max = 3;
    
    _iframe.load(function () {
        //$.test_msg("KALS_uitl.ajax_post 2", "_iframe.load");
        setTimeout(function () {
            //$.test_msg("KALS_uitl.ajax_post 2.5", "_iframe.load setTimeout");
            _iframe_load_callback();
        }, 500);
    });    //_iframe.load(function () {
    
    var _iframe_load_callback = function () {
        //$.test_msg("KALS_uitl.ajax_post 3", "_iframe_load_callback");
        //以同樣路徑，用ajax_get去取得資料，並回傳給callback
        _this.ajax_get({
            "url": _url, 
            "callback": _ajax_get_callback,
            "exception_handle": _exception_handle,
            "dataType": _data_type
        });
    };
    
    var _ajax_get_callback = function (_data) {
        //$.test_msg("KALS_uitl.ajax_post 4", "_ajax_get_callback");
        // 如果回傳了false，表示要重新讀取一次
        if (_data === false) {
            _post_retry_count++;
            if (_post_retry_count > _post_retry_max) {
                _this._retry_exception(_url);
            }
            else {
                if (_post_retry_count === 1) {
                    _iframe_load_callback();
                }
                else {
                    _form.submit();
                }
            }
            //throw "KALS_util.ajax_post() 發生錯誤 [" + _post_retry_count + "]:" + $.json_encode(_config);
            KALS_util.throw_exception("KALS_util.ajax_post() 發生錯誤", [_post_retry_count, _config]);
            return;
        }

        if (_debug === false) {
            _layer.remove();
        }

        //$.test_msg("KALS_uitl.ajax_post 5", "預備final callback: " +  $.json_encode(_data));
        if ($.is_function(_callback)) {
            _callback(_data);
        }
    };
    
    //準備完畢，遞交
    //$.test_msg("KALS_uitl.ajax_post 1", "準備要遞交了");
    _form.submit();
    
    return this;
};

KALS_util._retry_exception = function (_url) {
    $.test_msg('retry exception', [_url, KALS_context.get_base_url()]);
    var _exception = new KALS_exception('exception.retry_exception');
    this.show_exception(_exception, _url);
};

/**
 * 跨網域檔案上傳的方法
 * 
 * @param {Object} _config = {
 *   url: String (without base_url),
 *   get_link_url: String, //可以省略，省略就用url
 *   userfile: jQuery //<input type="file">的表單
 *   userdata: JSON,
 *   cross_origin: boolean = false, // 跨網域嗎
 *   callback: function (_data),
 *   exception_handle: function (_data) //可省略，省略則自動使用KALS_util.show_exception來處理
 * };
 */
KALS_util.ajax_upload = function (_config) {
    
    var _debug = false;
    
    var _url = $.get_parameter(_config, 'url');
    var _userfile = $.get_parameter(_config, 'userfile');
    var _userdata = $.get_parameter(_config, 'userdata');
    var _callback = $.get_parameter(_config, 'callback');
    var _exception_handle = $.get_parameter(_config, 'exception_handle');
    var _cross_origin = $.get_parameter(_config, 'cross_origin', false);
    
    var _get_link_url = $.get_parameter(_config, 'get_link_url', _url);
    
    var _action = _url;
    //var _cross_origin = false;
    if (_cross_origin === false && typeof(KALS_context) !== 'undefined' 
            && $.starts_with(_action, "http") === false) {
        _url = $.appends_with(_url, '/');
        _action = KALS_context.get_base_url(_action);
    }
    else {
        _cross_origin = true;
    }
    
    if (_debug === true) {
        $.test_msg("KALS_util.ajax_upload action", _action);
    }
    
    //取得現在時間作為id
    var _id = $.create_id();
    var _name = 'name_' + _id;
    
    var _layer = $('<div></div>')
        .appendTo($('body'));

    if (_debug === true) {
        _layer.css("top", "200px")
                .css("position", "fixed")
                .css("border", "1px solid red")
                .css("z-index", "9999999");
    }
    else {
        _layer.css('position', 'absolute')
            .css('top', '-1000px');
    }
    
    //建立一個暫存的iframe
    var _iframe = $('<iframe></iframe>')
        .id(_id)
        .attr('name', _name)
        .appendTo(_layer);
    
    if (_debug === true) {
        _iframe.css('width', '200px')
            .css('height', '200px');
    }
    else {
        _iframe.css('width', '0')
            .css('height', '0');
    }
    
    //建立一個FORM
    //然後讓form target到該iframe
    var _form = $('<form></form>')
        .attr('target', _name)
        .attr('method', 'post')
        .attr('action', _action)
        .attr('enctype', 'multipart/form-data')
        .appendTo(_layer);
    
    if (_debug === true) {
        //_form.attr("target", "_blank");
    }
        
    //擺放檔案input並指定成_file_path，
    //建立一個json的input
    _userfile = $(_userfile);
    if (_userfile.hasAttr("name") === false) {
        var _file = _userfile
            //.clone()
            .attr('name', 'userfile')
            .appendTo(_form);
    }
    else {
        var _file = _userfile
            //.clone()
            .appendTo(_form);
    }
        
    var _check = $('<input name="fileupload" value="true" type="hidden" />')
        .appendTo(_form);
    
    var _input;
    if ($.isset(_userdata)) {
        _userdata = $.json_encode(_userdata);
        _input = $('<input type="text" name="userdata" />')
            .attr('value', _userdata)
            .appendTo(_form);
    }
    
    if (_debug === true) {
        var _submit_btn = $('<button type="button">SUBMIT</button>')
            .appendTo(_form);
    }
    
    var _this = this;
    //當iframe讀取完畢時，等待三秒鐘
    _iframe.load(function () {
        //alert("iframe網頁讀取完畢");
        setTimeout(function () {
    
            //以同樣路徑，用ajax_get去取得資料，並回傳給callback
            var _ajax_get_callback = function (_data) {

                _layer.remove();

                var _exception = {
                    'heading': 'Upload File Failed',
                    'request_uri': _url
                };

                if (typeof(_data) === "object") {
                    if (typeof(_data) === 'undefined'
                            || typeof(_data.completed) === 'undefined') {
                        $.test_msg("show_exception 1");
                        _this.show_exception(_exception, _url);
                    }
                    else if (_data.completed === false) {
                        if (_data.data !== false) {
                            _exception.message = _data.data;
                        }
                        $.test_msg("show_exception 2");
                        _this.show_exception(_exception, _url);
                    }
                }

                if ($.is_function(_callback)) {
                    _callback(_data);
                }
            };
            

            _this.ajax_get({
                url: _get_link_url, 
                callback: _ajax_get_callback,
                cross_origin: _cross_origin,
                exception_handle: _exception_handle,
                retry: 1
            });
        }, 1000);    //setTimeout(function () {
        
    });    //_iframe.load(function () {
    
    //準備完畢，遞交
    _form.submit();
};

/**
 * 
 * @param {JSON} _config = {
 *      url: String 目標網址
 *      get_link_url: String 取得連結的網址
 *      input_name: 檔案上傳的名字,
 *      cross_origin: boolean = false, 預設是否是跨網域
 *      change: function 選擇檔案事件
 *      callback: function  //上傳完成事件
 *      exception_handle: function // 上傳失敗事件
 * }
 * @returns {KALS_util}
 */
KALS_util.ajax_click_upload_file = function (_config) {
    var _url = $.get_parameter(_config, 'url');
    var _get_link_url = $.get_parameter(_config, 'get_link_url', _url);
    var _input_name = $.get_parameter(_config, 'input_name', "userfile");
    var _cross_origin = $.get_parameter(_config, 'cross_origin', false);
    var _change = $.get_parameter(_config, 'change');
    var _callback = $.get_parameter(_config, 'callback');
    var _exception_handle = $.get_parameter(_config, 'exception_handle');
    
    var _file_input = $("#kals_ajax_click_upload_file");
    
    if (_file_input.length === 0) {
        _file_input = $('<input type="file" name="' + _input_name + '" id="kals_ajax_click_upload_file" />')
                .css("display", "none")
                .appendTo("body");
     
       var _config = {
            url: _url,
            get_link_url: _get_link_url,
            userfile: _file_input,
            cross_origin: _cross_origin,
            callback: _callback,
            exception_handle: _exception_handle
        };

        var _upload_action = function () {
            $.trigger_callback(_change);
            KALS_util.ajax_upload(_config);
        };

        _file_input.change(_upload_action);
    }
    _file_input.click();
};

/**
 * 顯示錯誤參數
 * @param {KALS_exception} _exception 這個是來自於伺服器回傳_data中的exception屬性。
 * 在ajax_get()的時候發生錯誤時，會自動將_data.exception送到此方法。
 * 這是處理例外的預設方法，您可以在ajax_get()當中設定exception_handle
 * @param {String} _uri 網址
 */
KALS_util.show_exception = function (_exception, _uri) {
    //var _heading = $.get_parameter(_exception, 'heading');
    //var _message = $.get_parameter(_exception, 'message');
    //var _request_uri = $.get_parameter(_exception, 'request_uri');
    
    if ($.is_class(_exception, 'KALS_exception') === false) {
        _exception = new KALS_exception(_exception);
    }
        
    var _heading = _exception.heading;
    var _message = _exception.message;
    var _request_uri = _exception.request_uri;
    if (_request_uri === null 
            || _request_uri === undefined) {
        _request_uri = _uri;
    }
    if (typeof(_request_uri) === "string"
            && _request_uri.substr(0,4) !== "http" 
            && _request_uri.substr(0,1) !== "/") {
        _request_uri = KALS_context.get_base_url(_request_uri);
    }
    
    $.test_msg('KALS_util.show_exception()'
        , [_heading, _message, '<a href="'+_request_uri+'" target="_blank">' + _request_uri + '</a>']);
    
    var _exception_heading = new KALS_language_param('Sorry! System has got some trouble!', 'exception.alert.heading');
    var _exception_content = $('<dl></dl>').addClass('exception');
    
    //先加入關閉視窗提示吧
    var _dt = $('<dt>Hint: </dt>')
        .addClass("hint")
        .appendTo(_exception_content);
    KALS_context.lang.add_listener(_dt
        , new KALS_language_param('Hint: ', 'exception.hint.heading'));
    
    var _dd = $('<dd></dd>')
        .addClass("hint")
        .appendTo(_exception_content);

    KALS_context.lang.add_listener(_dd
        , new KALS_language_param('You can press "ESC" key to close message.', 'exception.hint.message'));
        
    
    if ($.isset(_heading)) {
        _dt = $('<dt>HEADING: </dt>')    //.html(_lang.create_listener('exception.message_heading.heading'))
            .addClass("heading")
            .appendTo(_exception_content);
        KALS_context.lang.add_listener(_dt
            , new KALS_language_param('HEADING: ', 'exception.message_heading.heading'));
        
        _dd = $('<dd></dd>')
            .addClass("heading")
            .appendTo(_exception_content)
            .html(_heading);
    }   //if ($.isset(_heading)) {
    
    if ($.isset(_message)) {
        _dt = $('<dt>MESSAGE: </dt>')    //.html(_lang.create_listener('exception.message_heading.message'))
            .addClass("message")
            .appendTo(_exception_content);
        KALS_context.lang.add_listener(_dt
            , new KALS_language_param('MESSAGE: ', 'exception.message_heading.message'));
            
        if ($.is_object(_message)) {
            _message = $.json_encode(_message);
        }
           
        _dd = $('<dd></dd>')
            .addClass("message")
            .html(_message)
            .appendTo(_exception_content);
    }
    
    if ($.isset(_request_uri)) {
        _dt = $('<dt>REQUEST URI: </dt>')    //.html(_lang.create_listener('exception.message_heading.request_uri'))
            .addClass("uri")
            .appendTo(_exception_content);
        KALS_context.lang.add_listener(_dt
            , new KALS_language_param('REQUEST URI: ', 'exception.message_heading.request_uri'));
        _dd = $('<dd></dd>')
            .addClass("uri")
            .appendTo(_exception_content)
            .html('<a href="' + _request_uri + '" target="_blank">' + _request_uri + '</a>');
    }
    
    
    //var _this = this;
    setTimeout(function () {
        var _alert = KALS_util.alert(_exception_heading, _exception_content);
        _alert.get_ui().addClass('exception');
    }, 1000);
	
    throw _message;
    //$.test_msg('KALS_util.show_exception() end');
    
    //return _alert;
};

/**
 * 記錄偵錯用的參數
 * 
 * @param {KALS_exception|String} _exception 這個是來自於伺服器回傳_data中的exception屬性。
 * 在ajax_get()的時候發生錯誤時，會自動將_data.exception送到此方法。
 * 這是處理例外的預設方法，您可以在ajax_get()當中設定exception_handle
 * @return {KALS_util}
 */
KALS_util.throw_exception = function (_exception, _data) {
    //var _heading = $.get_parameter(_exception, 'heading');
    //var _message = $.get_parameter(_exception, 'message');
    //var _request_uri = $.get_parameter(_exception, 'request_uri');
    
    if ($.is_class(_exception, 'KALS_exception') === false) {
        _exception = new KALS_exception(_exception);
    }
    
    var _message = _exception.message;
    
    if (_data !== undefined) {
        var _data_string = $.json_encode(_data);
        _message = "[" + _message + "] " + _data_string;
    }
    
    $.test_msg('KALS_util.throw_exception()', _message);
	
    throw _message;
    
    return this;
};

/**
 * @type {Dialog_modal}
 * @memberOf {KALS_util}
 * @property
 */
KALS_util._alert_modal = null;

/**
 * @type {Dialog_modal}
 * @memberOf {KALS_util}
 * @property
 */
KALS_util._confirm_modal = null;

/**
 * @method [_get_alert_modal]
 * @memberOf {KALS_util}
 * @type {Dialog_modal}
 */
KALS_util._get_alert_modal = function () {
    if ($.is_null(this._alert_modal)) {
        var _modal = new Dialog_modal();
        
        /**
         * @author Pulipuli Chen 20141112
         * 強迫背景遮罩
         */
        _modal._$exposable = true;
        
        var _close_option = new Dialog_close_option();
        _modal.set_options(_close_option);
        _modal.get_ui().addClass('alert');
        
        this._alert_modal = _modal;
    }
    
    //this._alert_modal.set_modal_name('Alert_' + $.create_id());
    var _id = 'Alert_' + $.create_id();
    this._alert_modal.set_modal_name(_id);
    this._alert_modal.get_ui().attr('id', _id);
    
    return this._alert_modal;
};

/**
 * KALS專案使用的Alter用法
 * @param {KALS_language_param|string} _heading
 * @param {KALS_language_param|string|jQuery} _content
 * @param {function} _callback
 * @memberOf {KALS_util}
 * @method [alert]
 */
KALS_util.alert = function (_heading, _content, _callback) {
    var _modal = this._get_alert_modal();
    _modal.set_heading(_heading);
    _modal.set_content(_content);
    
    if ($.is_function(_callback)) {
        _modal.set_onclose(_callback);
    }
    else {
        _modal.set_onclose(false);
    }
    _modal.open();
    
    return _modal;
};

/**
 * @method [_get_alert_modal]
 * @memberOf {KALS_util}
 * @type {Dialog_modal}
 */
KALS_util._get_confirm_modal = function () {
    if ($.is_null(this._confirm_modal)) {
        
        var _modal = new Confirm_dialog_modal();
        
//        // 加入遮罩
//        _modal._$exposable = true;
//        
//        /**
//         * 用來擺放回呼函數使用
//         * @type {function}
//         */
//        _modal.confirm_callback = null;
//        
//        var _yes_lang = new KALS_language_param('YES', 'dialog.option.yes');
//        var _no_lang = new KALS_language_param('NO', 'dialog.option.no');
//        
//        var _yes_option = new Dialog_close_option(_yes_lang, function () {
//            if (typeof(_modal.confirm_callback) === 'function') {
//                _modal.confirm_callback(true);
//            }
//        });
//        
//        var _no_option = new Dialog_close_option(_no_lang, function () {
//            if (typeof(_modal.confirm_callback) === 'function') {
//                _modal.confirm_callback(true);
//            }
//        });
//        
//        _modal.set_options([_yes_option, _no_option]);
//        _modal.get_ui().addClass('confirm');
//        
        this._confirm_modal = _modal;
    }
    
    var _id = 'Confirm_' + $.create_id();
    this._confirm_modal.set_modal_name(_id);
    this._confirm_modal.get_ui().attr('id', _id);
    
    return this._confirm_modal;
};

/**
 * KALS專案使用的confirm用法
 * @param {KALS_language_param|string} _heading
 * @param {KALS_language_param|string|jQuery} _content
 * @param {function} _callback = function (_boolean_value, _overlay_close_action)
 * @memberOf {KALS_util}
 * @method [confirm]
 */
KALS_util.confirm = function (_heading, _content, _callback) {   
    var _modal = this._get_confirm_modal();
    _modal.set_heading(_heading);
    _modal.set_content(_content);
    
    if ($.is_function(_callback)) {
        _modal.confirm_callback = _callback;
    }
    else {
        _modal.confirm_callback = null;
    }
        
    _modal.open();
    
    return _modal;
};

/**
 * 通知功能的Modal
 * @type {Notify_modal}
 * @memberOf {KALS_util}
 * @property
 */
KALS_util._notify_modal = null;

KALS_util._get_notify_modal = function () {
    if (this._notify_modal === null) {
        this._notify_modal = new Notify_modal();
        
        //$.test_msg('KALS_util._get_notify_modal() 有建立Modal嗎？', this._notify_modal);
    }
    return this._notify_modal;
};

/**
 * KALS專案使用的通知功能
 * @param {KALS_language_param|String} _message
 */
KALS_util.notify = function (_message, _wait) {
    var _notify_modal = this._get_notify_modal();
    
	if (_wait === undefined) {
            _wait = 10000;
	}
	
	// @20130610 Pudding Chen
	// 修正不知道為什麼不會自動關閉的問題
	//_notify_modal.set_message(_message, 10000);
	_notify_modal.set_message(_message, _wait);
    
    //$.test_msg('KALS_util.notify()', _message);
    
    return _notify_modal;
};

/**
 * 選單的對話視窗
 * 
 * 選項可省略_content:
 * @param {Object} _config = {
 *     heading: 'KALS_language_param|String|jQuery',
 *     content: 'KALS_language_param|String|jQuery',
 *     options: 'Array|Dialog_close_option',
 *     onclose: 'function',
 *     heading_close: true
 * };
 * @type {Dialog_modal}
 */
KALS_util.select_menu = function (_config) {
    
    var _heading = $.get_parameter(_config, 'heading');
    var _content = $.get_parameter(_config, 'content');
    var _options = $.get_parameter(_config, 'options');
    var _onclose = $.get_parameter(_config, 'onclose');
    var _heading_close = $.get_parameter(_config, 'heading_close', true);
    
    var _menu = new Dialog_modal();
    _menu.set_heading(_heading);
    _menu.set_content(_content);
    _menu.set_options(_options, false);
    _menu.set_onclose(_onclose);
    
    if (_heading_close === true) {
        // 關閉按鈕
        var _close_option = new Dialog_close_icon();
        _menu.set_forward_option(_close_option);    
    }
    
    _menu.add_class('select-menu');
    _menu.open(false);
    
    return _menu;
};

/**
 * 顯示說明視窗
 * @param {String} _url 未含base_url，未含help的網址
 * @type {Object} Window物件
 * @memberOf {KALS_util}
 */
KALS_util.help = function (_url) {
    
    if ($.is_null(_url)) {
        _url = '';
    }
    
    if (_url.substr(0, 1) === '/') {
        _url = _url.substr(1, _url.length);
    }
    
    var _base_url = KALS_CONFIG.modules.Navigation_help.help_base_url;
    var _needle = 'http';
    var _help_url = KALS_context.get_base_url([_base_url, _url]);
    if (_base_url.substr(0, _needle.length) === _needle) {
        if (_base_url.substr(_base_url.length - 1, _base_url.length) !== '/') {
			_base_url = _base_url + '/';
		}
        _help_url = _base_url + _url;
    }
    
    var _help_win = window.open(_help_url, '_blank', 'width=480,height=640,scrollbars=1');
    
    return _help_win;
};

/**
 * 改良原本的decodeURIComponent
 * @deprecated 20130222 不採用，請用jQuery.decodeURIComponent()
 * @param  {String} _str 要轉換的字串
 * @return {String}      轉換完成的字串
 */
KALS_util.decodeURIComponent = function (_str) {
    var _result;
    /*
    try {
        _result = decodeURIComponent(_str);
    }
    catch (_e) {
        _str = $.str_replace("%", "%25", _str);
        _result = decodeURIComponent(_str);
    }
    */
    _str = $.str_replace("%", "%25", _str);
    _result = decodeURIComponent(_str);
    return _result;
};

/**
 * 將log傳到伺服器
 * 
 * @author Pulipuli Chen <pulipuli.chen@gmail.com>
 * 20131225 將傳遞資料改成用Post傳遞
 * @param number _action 動作的ID。關於動作的編號，請查看[KALS]/applications/controllers/web_apps/log.php
 * @param JSON _note 任意要儲存的資料
 * @param function _callback 回呼函數 
 */
KALS_util.log = function (_action, _note, _callback) {
    
    if (_note === undefined) {
        _note = null;
    }
    
    //_note = null;
    var _data = {
        "action": _action,
        "note": _note
    };

    //$.test_msg("KALS_util.log", _data);

    var _config = {
        "url": "log/create",
        "data": _data,
        "data_type": "json",
        "callback": _callback,
        "exception_handle": function () {
            // 不做任何事情
        }
    };
    //KALS_util.ajax_get(_config);
    
    //$.test_msg("KALS_util.log" , _config);
    KALS_util.ajax_post(_config);
};

KALS_util.c = {};

/* End of file KALS_unit */
/* Location: ./libraries/helpers/kals_unit.js */