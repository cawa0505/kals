<?php
/**
 * Api
 *
 * 以REST形式，回傳資料的方法
 *
 * @package		KALS
 * @category		Controllers
 * @author		Pulipuli Chen <pulipuli.chen@gmail.com>
 * @copyright		Copyright (c) 2013, Pulipuli Chen
 * @license		http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link		https://github.com/pulipulichen/kals
 * @version		1.0 2013/12/26 上午 11:16:40
 */

class Api extends Controller {

    // ------------------
    // 設定區
    // ------------------
    
    var $dir = 'web_apps/';
    function  __construct()
    {
        parent::Controller();
        $this->load->helper('url');
        $this->load->helper('web_apps');
        $this->load->config('kals');

        create_context();
    }
    
    private function _display_data($data) {
        $this->load->view($this->dir.'display', array('data'=>$data));
    }
    
    // ------------------
    // 實作區：Webpage
    // ------------------
    
    /**
     * 取得目前KALS當中所有的閱讀標註網頁資訊
     * 
     * @param type $webpage_id 指定查詢網頁ID。省略則會顯示所有網頁
     */
    public function webpage($webpage_id = NULL) {
        
        $message;
        
        if (is_null($webpage_id)) {
            $message = $this->_get_webpages();
        }
        else {
            // 如果
            $message = $this->_get_webpage_topics($webpage_id);
        }
        
        $this->_display_data($message);
    }
    
    /**
     * 回傳所有webpage的資料
     * @return array
     */
    private function _get_webpages() {
        $list = array();
        
        // ---------------
        // 模擬資料
        // ---------------
        $mock = array(
            "webpage" => array(
                array(
                    "webpage_id" => 1,
                    "url" => "http://dlll.nccu.edu.tw/index.php"
                ),
                array(
                    "webpage_id" => 2,
                    "url" => "http://demo-kals.dlll.nccu.edu.tw/test.php"
                )
            )
        );
        $list = $mock;  //如果要開始實作的話，請註解這一行
        
        // ---------------
        // 實作開始
        // ---------------
        
        return $list;
    }
    
    /**
     * 取得指定$webpaged_id底下的所有標註
     * @param int $webpage_id Webpage的ID
     */
    private function _get_webpage_topics($webpage_id) {
        $list = array();
        
        // ---------------
        // 模擬資料
        // ---------------
        $mock = array(
            "topic_annotation" => array(
                
                // 按照時間由新到舊排序
                array(
                    "anchor_text" => "取而代之 的是如",
                    "annotation_id" => 15530,
                    "note" => "<p>\n\ttwtwe<\/p>",
                    "user" => array(
                        "id" => 2002,
                        "name" => "pudding"
                    ),
                    "type" => 1,
                    "scope" => array(
                        "1573" => array(array(802,891))
                    ),
                    "respond_to_coll" => array(),
                    "is_like" => false,
                    "timestamp" => "1382978858",
                    "url" => "http://localhost/kals/help/config_annotation_scope.html#view=15530"   // 由webpage + annotation_id組成
                ),
                array(
                    "anchor_text" => "取而代之 的是如",
                    "annotation_id" => 15530,
                    "note" => "<p>\n\ttwtwe<\/p>",
                    "user" => array(
                        "id" => 2002,
                        "name" => "pudding"
                    ),
                    "type" => 1,
                    "scope" => array(
                        "1573" => array(array(802,891))
                    ),
                    "respond_to_coll" => array(),
                    "is_like" => false,
                    "timestamp" => "1382978858",
                    "url" => "http://localhost/kals/help/config_annotation_scope.html#view=15530"   // 由webpage + annotation_id組成
                )
            ) 
        );
        $list = $mock;  //如果要開始實作的話，請註解這一行
        
        // ---------------
        // 實作開始
        // ---------------
        
        return $list;
    }
    
    // ------------------
    // 實作區：Topic Annotation
    // ------------------
    
    /**
     * 取得指定Topic以及底下的標註資訊
     * 
     * @param type $topic_id 指定查詢的標題標註ID
     */
    public function topic_annotation($topic_id) {
        
        $message = $this->_get_topic_annotations($topic_id);
        
        $this->_display_data($message);
    }
        
    /**
     * 取得指定$topic_id所有標註
     * @param int $topic_id 指定查詢的標題標註ID
     */
    private function _get_topic_annotations($topic_id) {
        $list = array();
        
        // ---------------
        // 模擬資料
        // ---------------
        $mock = array(
            "annotation" => array(
                
                // 按照時間由舊到新排序
                
                // 這是topic annotation
                array(
                    "anchor_text" => "取而代之 的是如",
                    "annotation_id" => 15531,
                    "note" => null,
                    "user" => array(
                        "id" => 2002,
                        "name" => "pudding"
                    ),
                    "type" => 1,
                    "scope" => array(
                        "1573" => array(array(802,891))
                    ),
                    "is_like" => false,
                    "timestamp" => "1382978735",
                    "like_count" => 0,
                    "url" => "http://localhost/kals/help/config_annotation_scope.html#view=15531"   // 由webpage + topic_id組成
                ),
                
                // 底下是response annotations
                array(
                    "anchor_text" => "取而代之 的是如",
                    "annotation_id" => 15532,
                    "note" => "<p>\n\ttest<\/p>",
                    "user" => array(
                        "id" => 1701,
                        "name" => "demo"
                    ),
                    "type" => 1,
                    "scope" => array(
                        "1573" => array(array(802,891))
                    ),
                    "respond_to_coll" => array(),
                    "is_like" => false,
                    "timestamp" => "1382978859",
                    "topic" => array(
                        "annotation_id" => 15531,
                        "user" => array(
                            "id" => 2002,
                            "name" => "pudding"
                        ),
                    ),
                    "url" => "http://localhost/kals/help/config_annotation_scope.html#view=15531"   // 由webpage + topic_id組成
                ),
                array(
                    "anchor_text" => "取而代之 的是如",
                    "annotation_id" => 15595,
                    "note" => "<p>\n\terwere<\/p>",
                    "user" => array(
                        "id" => 2002,
                        "name" => "pudding"
                    ),
                    "type" => 1,
                    "scope" => array(
                        "1573" => array(array(802,891))
                    ),
                    "respond_to_coll" => array(
                        array(
                            "annotation_id" => 15532,
                            "user" => array(
                                "id" => 1701,
                                "name" => "demo"
                            )
                        )
                    ),
                    "is_like" => false,
                    "timestamp" => "1386941507",
                    "topic" => array(
                        "annotation_id" => 15531,
                        "user" => array(
                            "id" => 2002,
                            "name" => "pudding"
                        ),
                    ),
                    "url" => "http://localhost/kals/help/config_annotation_scope.html#view=15531"   // 由webpage + topic_id組成
                )
            ) 
        );
        $list = $mock;  //如果要開始實作的話，請註解這一行
        
        // ---------------
        // 實作開始
        // ---------------
        
        return $list;
    }
}

/* End of file api.php */
/* Location: ./system/application/controllers/api.php */