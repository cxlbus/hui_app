function Selfcomment() {
	this.to_xiangqing = function(data) {
		hui.open('./order_info.html', {}, true, {
			order_code: data
		})
	}
	this.to_index = function(data) {
		hui.open('./index.html', {}, true, {
			order_code: data
		})
	}
	this.to_login = function(data) {
		hui.open('../login.html', {}, true, {
			order_code: data
		})
	}
	this.to_add_order = function(data) {
		hui.open('./add_order.html', {}, true, {
			order_code: data
		})
	}
	this.to_modify_pwd = function(data) {
		hui.open('./page/modify_pwd.html', {},true, {
			order_code: data
		})
	}

	/*跳转到拍照页面*/
	this.to_camare = function(data) {
		hui.open('./camare.html', {}, true, {
			order_code: data
		})
	}
	this.to_application = function(data) {
		hui.open('./application.html', {}, true, {
			order_code: data
		})
	}
	this.to_huitouchpwd = function(data) {
		hui.open('./huitouchpwd.html', {}, true, {
			order_code: data
		})
	}
}

class Api {
	constructor() {
//				this.https = 'http://10.168.1.236:3300/app_dealer'
		this.https = 'http://10.168.1.210:3300/app_dealer'
	}
	//加密
	cipher_rc4(password, key) {
		var name_encrypted = CryptoJS.RC4.encrypt(password, key);
		var a = name_encrypted.toString()
		return a
	}
	/*解密*/
	decrypt_rc4(password, key) {
		let name_decrypted = CryptoJS.RC4.decrypt(password, key); //解密
		let name_decrypted_utf8 = CryptoJS.enc.Utf8.stringify(name_decrypted);
		return name_decrypted_utf8
	}
	/*/login_before/account/login 登录*/

	/*	获取第一页*/
	get_order(callback_success, callback_err) {
		hui.get('http://hoa.hcoder.net/index.php?user=hcoder&pwd=hcoder&m=list1&page=1', function(res) {
				callback_success(res)
			},
			function(e) {
				callback_err(e)
			})
	}
	/*	下拉获取更多*/
	get_order_more(page_oc, callback_success) {
		hui.get('http://hoa.hcoder.net/index.php?user=hcoder&pwd=hcoder&m=list1&page=' + page_oc, function(res) {
			callback_success(res)
		})
	}
	/*发起ajax请求检测是否有新版本*/
	get_version(page_oc, callback_success, callback_err) {
		hui.get("http://demo.dcloud.net.cn/test/update/check.php", function(res) {
			callback_success(res)
		}, function() {
			callback_err(e)
		})
	}
	/*下载app*/
	down_version() {
		plus.downloader.createDownload("http://demo.dcloud.net.cn/test/update/H5EF3C469.wgt", {
			filename: "_doc/update/"
		}, function(d, status) {
			if(status == 200) {
				hui.confirm('app最新版本已下载好是否安装？', ['取消', '确定'], function() {
					installWgt(d.filename);
					// 安装更新包
					function installWgt(path) {
						plus.nativeUI.showWaiting("安装wgt文件...");
						plus.runtime.install(path, {}, function() {
							plus.nativeUI.closeWaiting();
							plus.nativeUI.alert("应用资源更新完成！", function() {
								plus.runtime.restart();
							});
						}, function(e) {
							plus.nativeUI.closeWaiting();
							plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
						});
					}
				}, function() {
					plus.nativeUI.alert("暂不安装");
				});
				// 安装wgt包
			} else {
				plus.nativeUI.alert("下载wgt失败！");
			}
			plus.nativeUI.closeWaiting();
		}).start();
	}
	/*上传文件*/
	reset_head_img(path, callback) {
		var task = plus.uploader.createUpload("http://" + this.https + ":3110/app/reset_head_img_self")
		task.addFile(path, {
			key: "test"
		});
		task.addData("string_key", "string_value");
		//task.addEventListener( "statechanged", onStateChanged, false );
		task.start();
		callback()
	}

}
var self_url = new Api()
var self_comment = new Selfcomment()
axios.defaults.baseURL = 'http://10.168.1.210:3300';
//axios.defaults.baseURL = 'http://10.168.1.209:3300';
axios.defaults.headers.common['Authorization'] = 12123244;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.timeout = 6000;
// 添加请求拦截器
axios.interceptors.request.use(function(config) {
	// 在发送请求之前做些什么
	var token = localStorage.getItem('token')
	var pwd = localStorage.getItem('pwd') + ''
	var id = localStorage.getItem('id')
	localStorage.getItem('pwd') ? pwd = pwd : pwd = 'smartMI'
	config.data = {
		data: self_url.cipher_rc4(JSON.stringify(config.data), pwd)
	}
	token ? config.headers.token = token : config.headers.token = "8eea162a4fbe0d4b4a92485d80a47bc4"
//	console.log(config.url + '加密的秘钥：' + pwd)
//	console.log(config.url + '加密的token：' + config.headers.token)
	return config;
}, function(error) {
	// 对请求错误做些什么
	return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
	// 对响应数据做点什么
	var pwd = localStorage.getItem('pwd') + ''
	localStorage.getItem('pwd') ? pwd = pwd : pwd = 'smartMI'
	response.data = JSON.parse(self_url.decrypt_rc4(response.data, pwd))
	var b_string=response.config.baseURL
	var c_string=response.config.url
	var d_string=c_string.replace(b_string,'')
	console.log('响应拦截的数据' + d_string+' : '+JSON.stringify(response.data))
	return response;
}, function(error) {
	// 对响应错误做点什么
	console.log('以后跳转到登录:' + error.response.status)
	return Promise.reject(error);
	
});