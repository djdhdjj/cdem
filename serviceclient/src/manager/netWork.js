// import { Promise } from "q";
import deepcopy from 'deepcopy'


// 注意post一定要加'/'
class NetWork {
    constructor() {
        this.fetch_url = 'http://183.129.253.170:6051/'
        // 'http://192.168.3.2:8000/'

        // this.get('testGet').then(res => console.log(res))
        // this.post('testPost/', {test: 'test'}).then(res => console.log(res))
    }
    get(url, par = undefined) {
        url = this.fetch_url + url
        if (par) {
            url += '?'
            for (let key in par) {
                let elm = par[key]
                if (Array.isArray(elm))
                    elm = elm.join(',')
                url += key + '=' + elm + '&'
            }
            url = url.slice(0, -1)
        }

        console.log('get', url)
        // 已经加个获得过url的data可以直接存着
        return fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json;charset=UTF-8'},
            cache: 'default'
        })
        .then(res => {
            if(res.status!==200){
                console.error(url,"存在一个问题，状态码为："+res.status);
                return;
            }
            let data = res.json()
            return data
        })
    }

    post(url, data = {}, callback){
        url = this.fetch_url + url
        

        // let headers = new Headers();

        // headers.append('Content-Type', 'application/json');
        // headers.append('Accept', 'application/json');
        // headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
        // headers.append('Access-Control-Allow-Credentials', 'true');
        // headers.append('GET', 'POST', 'OPTIONS');

        console.log('post', url, data)
        // 已经加个获得过url的data可以直接存着
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=UTF-8'},
            // headers,
            // {'Content-Type': 'application/json;charset=UTF-8'},
            cache: 'default',
            body: JSON.stringify(data),
        })
        .then(res => {
            if(res.status!==200){
                console.error(url,"存在一个问题，状态码为："+ res.status);
                return;
            }
            let data = res.json()
            if(callback!=undefined){
                callback(res)
            }
            return data
        })
    }
}

var net_work = new NetWork()
export default net_work
