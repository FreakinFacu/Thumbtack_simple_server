/*
* Simple Database Solution by Facundo Ramos
* 06/19/2014
*
* Prerequisites: Node.js command line
* Run: node db.js
* To use input file: node db.js < input1
*/

var process = require('process');

var database = (function(){
    var data = [{}];
    var numEqualToCounter = {};

    function set(name,value){
        var topTransaction = data.length - 1,
            oldvalue = _get(name);
        data[topTransaction][name] = value;

        if(value == "NULL"){
            if(numEqualToCounter[value] !== undefined && numEqualToCounter[value] !== 0){
                numEqualToCounter[value]--;
            }
        }else{
            if(numEqualToCounter[value] !== undefined){
                numEqualToCounter[value]++;
            }else{
                numEqualToCounter[value] = 1;
            }

            if(oldvalue !== 'NULL'){
                numEqualToCounter[oldvalue]--;
            }
        }
    }

    function _get(name){
        var val = 'NULL', i;

        for(i = data.length - 1; i >= 0; i--){
            if(data[i][name] !== undefined){
                val = data[i][name];
                break;
            }
        }

        return val;
    }

    function get(name){
        var val = _get(name);

        process.stdout.write(val+"\n");
    }

    function numEqualTo(val){
        var count;

        if(numEqualToCounter[val] !== undefined){
            count = numEqualToCounter[val];
        }else{
            count = 0;
        }

        process.stdout.write(count+"\n");
    }

    function begin(){
        data.push({});
    }

    function rollback(){
        if(data.length == 1){
            process.stdout.write("NO TRANSACTION\n");
            return;
        }

        data.pop();
    }

    function commit(){
        var i,temp;
        if(data.length == 1){
            process.stdout.write("NO TRANSACTION\n");
            return;
        }

        for(i = 1; i<data.length;i++){
            for(temp in data[i]){
                if(data[i][temp] !== "NULL"){
                    data[0][temp] = data[i][temp];
                }
            }
        }

        while(data.length > 1){
            data.pop();
        }
    }

    function processLine(line){
        var args = line.trim().split(" ");

        if(args.length == 0) return;

        switch(args[0].toUpperCase()){
            case "SET":
                set(args[1],args[2]);
                break;

            case "GET":
                get(args[1]);
                break;

            case "UNSET":
                set(args[1],'NULL');
                break;

            case "NUMEQUALTO":
                numEqualTo(args[1]);
                break;

            case "BEGIN":
                begin();
                break;

            case "ROLLBACK":
                rollback();
                break;

            case "COMMIT":
                commit();
                break;

            case "END":
                process.exit(0);
                break;

            default:
                process.stdout.write('Unknown Command: ' + line + "\n");
        }

        //Uncomment to debug data
//        process.stdout.write("Current data: " + JSON.stringify(data) + "\n");
//        process.stdout.write("Current Counter: " + JSON.stringify(numEqualToCounter) + "\n");
    }

    return {
        processLine: processLine
    }
})();

process.stdin.setEncoding('utf8');

//Hook up reading from standard in to our database
process.stdin.on('readable', function() {
    var read = process.stdin.read(),
        lines;

    if(read !== null){
        //Split by new line in case we're reading a full file at once.
        lines = read.split("\n");

        for(var i = 0; i < lines.length; i++){
            if(lines[i].trim().length > 0){
                database.processLine(lines[i]);
            }
        }
    }

});
