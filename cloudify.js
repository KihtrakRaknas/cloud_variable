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
                if(window[prop] == null)
                    window[prop] = obj[prop];
            }
        });  
        socket.on('newVal', (newObj)=>{
            //console.log("new val: "+newObj)
            let prop = Object.keys(newObj)[0];
            window[prop] = newObj[prop];
            oldGlobal[prop] = JSON.parse(JSON.stringify(newObj[prop]));
        });
        let oldGlobal = {}
        let clean=(variable)=>{
            //console.log(variable)
            if(typeof variable == "number" || typeof variable == "string")
                return variable
            if(typeof variable == "object")
                return JSON.stringify(variable)
            if(typeof variable == "function")
                return variable.toString()
            return variable
        }
        setInterval(()=>{
            for (let prop in window) { //global[prop]
                if (prop.indexOf("cloud_") == 0){
                        //console.log(clean(oldGlobal[prop]) +" !== "+clean(window[prop]))
                        if(clean(oldGlobal[prop]) !== clean(window[prop])){
                            //console.log(prop + " has changed from "+oldGlobal[prop]+" to "+window[prop])
                            oldGlobal[prop] = (typeof window[prop] == "object")?JSON.parse(JSON.stringify(window[prop])):window[prop];                                
                            //console.log({[prop]: window[prop]})
                            socket.emit('varChanged', {[prop]: (typeof window[prop] == "function")?window[prop].toString():window[prop]});
                        }
                }
            }
        },500)
 }
 document.head.appendChild(socketScript);