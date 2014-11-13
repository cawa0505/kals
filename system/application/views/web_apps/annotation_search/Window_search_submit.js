/**
 * Window_search_submit -啟動List_collection_search來送出查詢
 *
 * @package    KALS
 * @category   Webpage Application Libraries
 * @author     Pudding Chen <puddingchen.35@gmail.com>
 * @copyright  Copyright (c) 2010, Pudding Chen
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link       http://sites.google.com/site/puddingkals/
 * @version    1.0 2010/10/3 下午 11:04:46
 * @extends {Window_content_submit}
 */
function Window_search_submit() {
    
    Window_content_submit.call(this);
   
    // 送出seatchrange,keyword,order_by
    this._$input_names = ['search_range', 'keyword', 'order_by']; 
}

Window_search_submit.prototype = new Window_content_submit();

//將資料包成json送出的目的路徑-使用annotation_getter
Window_search_submit.prototype.url = 'annotation_getter/search_annotation';
                                                                     
//顯示的文字-查詢
Window_search_submit.prototype.lang = new KALS_language_param(  
    'Send',
    'window.send'
);

/*Window_profile_submit.prototype.complete_notification = new KALS_language_param(
    'Profile updated.',
    'window.profile.submit.complete'
);

Window_profile_submit.prototype.failed_notification = new KALS_language_param(
    'Profile not updated.',
    'window.profile.submit.failed'
);
*/

///**
// * 取得查詢欄位中的資料
// * @param {Object} _data
// * @deprecated Pulipuli 20131119
// */
//Window_search_submit.prototype.complete_handle = function () {
//	
//    // 不做任何事情
//
//    //var _search = KALS_context.search;   //in KALS_context
//    //_search.set_field(_input_data.search_range); //取得欄位中的值→Context_search.js
//    //_search.set_keyword(_input_data.keyword);
//    
//	
//	
//    //complete_handle in window_content_submit.js 
//
//    //var _input_data = this.get_data();
//        
//    
//	//_search.set_order_by(_input_data.order_by); 
//    
//    //return Window_content_submit.prototype.complete_handle.call(this, _data); 
//    //因為complete_handle.call做完後會自動關閉視窗，所以不使用
//    
//    //alert("搜尋完成");
//    this._unlock_submit();
//    KALS_window.toggle_loading(false);
//    return this;
//};

/**
 * 把參數丟給List_collection_search，讓他開始送出做查詢
 * 覆寫Window_content_submit-Window_content_submit.prototype.submit
 * @param {function} _callback
 * @param {boolean} _pass_validate 取消檢查條件
 */
Window_search_submit.prototype.submit = function(_callback, _pass_validate) {
    
//    if (this.is_submit_locked()) {
//        $.trigger_callback(_callback);
//        return this;
//    }
//    
//    this._lock_submit();
//    KALS_window.toggle_loading(true);
//    
//    //alert("開始搜尋");
//
//    //$.test_msg("Window_search_submit submit");
//    if (this.validate() === false && _pass_validate !== true) {
//        //$.test_msg("Window_search_submit validate() false");
//        return this;
//    }
//	
//    var _content = this._content;
//    var _list = _content.list;
//    var _data = this.get_data();
//
//    _list.reset();
//    //_list.get_ui().show();
//
//    //$.test_msg("Window_search_submit.prototype.submit", _data);
//    _list.set_search_range(_data.search_range);
//    _list.set_keyword(_data.keyword);
//    _list.set_order_by(_data.order_by);
//
//    // 我們要叫List_collection_search進行搜尋
//    var _this = this;
//    //$.test_msg("Window_search_submit _list.load_list()", _list.get_name());
//    _list.load_list(function () {
//        //$.test_msg("Window_search_submit.prototype.submit");
//        _this.complete_handle();
//        _content.get_ui().find(".search-result-subpanel").show();
//        
//        $.trigger_callback(_callback);
//    });
//
//    //$.test_msg("Window_search_submit.prototype.submit", "預備callback")
    
    
    var _data = this.get_data();
    this._content.search(_data);
    
    return this;
};

///**
// * 檢查是否允許遞交
// * @type {Boolean} 是否通過 
// */
//Window_search_submit.prototype.validate = function () {
//    
//    var _data = this.get_data();
//
//    var _result = true;
//
//    var _ui = this._get_content_ui();
//    var _keyword_empty_hint = _ui.find(".keyword-empty-hint");
//
//    if (_data.keyword === "") {
//        _result = false;
//        _keyword_empty_hint.show();
//        this.get_first_input("keyword").focus();
//    }
//    else {
//        _keyword_empty_hint.hide();
//    }
//    
//    return _result;
//};

/* End of file Window_profile_submit */
/* Location: ./system/application/views/web_apps/Window_profile_submit.js */