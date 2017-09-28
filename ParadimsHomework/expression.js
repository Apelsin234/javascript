"use strict";

var msArg = {"x": 0, "y": 1, "z": 2};

for (var value in msArg) {
    global[value] = variable(value);
}


var multFunction = function (h) {
    return function () {
        var psevdoArgs = [].slice.call(arguments, 0);
        return function () {
            var args = arguments;
            return h.apply(null, psevdoArgs.map(function (fun) {
                return fun.apply(fun, args);
            }))

        }
    }
};

var cnst = function (x) {
    return function () {
        return x;
    }
};

var pi = cnst(Math.PI);

var e = cnst(Math.E);

function variable(arg) {
    return function () {
        return arguments[msArg[arg]];
    }
}

/*var x = variable('x');

 var y = variable('y');

 var z = variable('z');*/

var min3 = multFunction(function () {
    return Math.min.apply(null, arguments);
});

var max5 = multFunction(function () {
    return Math.max.apply(null, arguments);
});

var add = multFunction(function (x, y) {
    return x + y;
});

var subtract = multFunction(function (x, y) {
    return x - y;
});

var multiply = multFunction(function (x, y) {
    return x * y;
});

var divide = multFunction(function (x, y) {
    return x / y;
});

var negate = multFunction(function (x) {
    return -x;

});

var ops = {};
ops['min3'] = {Op: min3, Args: 3};
ops['max5'] = {Op: max5, Args: 5};

ops['+'] = {Op: add, Args: 2};
ops['-'] = {Op: subtract, Args: 2};
ops['*'] = {Op: multiply, Args: 2};
ops['/'] = {Op: divide, Args: 2};

ops['negate'] = {Op: negate, Args: 1};

var parse = function (expr) {
    var regex = /\S+/g;
    var token = [];
    var s;
    while (s = regex.exec(expr)) {
        token.push(s[0]);
        //println(s);
    }

    /*var expression = function () {
     var arg = token.pop();
     if (!isNaN(arg)) {
     return cnst(+arg);
     }
     if (msArg.indexOf(arg) >= 0) {
     return variable(arg);
     }
     switch (arg) {
     case '+':
     case '-':
     case '*':
     case '/':
     var right = expression();
     var left = expression();
     switch (arg) {
     case '+':
     return add(left, right);
     case '-':
     return subtract(left, right);
     case '*':
     return multiply(left, right);
     case '/':
     return divide(left, right);
     default:
     return undefined;
     }
     case "max5":
     return max5(expression(), expression(), expression(), expression(), expression());
     case "min3":
     return min3(expression(), expression(), expression());
     case "negate":
     return negate(expression());
     case "pi":
     return pi;
     case "e":
     return e;

     }

     };*/
    var expression = function () {
        var arg = token.pop();
        if (!isNaN(arg)) {
            return cnst(+arg);
        }
        if (msArg[arg] >= 0) {
            return variable(arg);
        }
        switch (arg) {
            case 'pi':
                return pi;
            case 'e':
                return e;
        }
        var obj = [];
        for (var i = 0; i < ops[arg].Args; i++) {
            obj.push(expression());
        }
        obj.reverse();
        return ops[arg].Op.apply(this, obj);

    };
    return expression();
};
