//Generate minified code: uglifyjs --compress --mangle --output cloudify.min.js --toplevel --warn -- cloudify.js
let socketScript = document.createElement('script')
socketScript.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js"
socketScript.onload = () => {
        //console.log("script added!")
        let socket = io("https://cloud-variable.herokuapp.com/");//http://cloudify.kihtrak.com
        socket.on('init', (obj)=>{
            //console.log(obj)
            for(let prop in obj){
                oldGlobal[prop] = obj[prop];
                window[prop] = obj[prop];
            }
        });  
        socket.on('newVal', (newObj)=>{
            //console.log("new val: "+newObj)
            let prop = Object.keys(newObj)[0];
            oldGlobal[prop] = newObj[prop];
            window[prop] = newObj[prop];
        });
        let oldGlobal = {}
        let clean=(variable)=>{
            if(typeof variable == "number" || typeof variable == "string")
                return variable
            if(typeof variable == "object")
                return JSON.stringify(variable)
            if(typeof variable == "function")
                return variable.toString()
        }
        setInterval(()=>{
            for (let prop in window) { //global[prop]
                if (prop.indexOf("cloud_") == 0){
                        if(clean(oldGlobal[prop]) !== clean(window[prop])){
                            //console.log(prop + " has changed from "+oldGlobal[prop]+" to "+window[prop])
                            oldGlobal[prop] = (typeof window[prop] == "object")?JSON.parse(JSON.stringify(window[prop])):window[prop];                                
                            console.log({[prop]: window[prop]})
                            socket.emit('varChanged', {[prop]: (typeof window[prop] == "function")?window[prop].toString():window[prop]});
                        }
                }
            }
        },500)
 }
 document.head.appendChild(socketScript);