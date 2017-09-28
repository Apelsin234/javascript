/**
 * Created by Александр on 19.04.2017.
 */

var msArg = {"x": 0, "y": 1, "z": 2};

function operation(h, opString, dif) {
    function Cons() {
        this.ops = Array.prototype.slice.call(arguments);
    }

    Cons.prototype.toString = function () {
        return this.ops.join(" ") + " " + opString;
    };
    Cons.prototype.evaluate = function () {
        var args = arguments;
        return h.apply(null, this.ops.map(function (fun) {
            return fun.evaluate.apply(fun, args);
        }));
    };
    Cons.prototype.prefix = function () {
        return "(" + opString + " " + this.ops.map(function (fun) {
                return fun.prefix();
            }).join(" ") + ")";
    };
    Cons.prototype.diff = function (arg) {
        return dif.call(this, arg);
    };


    return Cons;
}

function Const(arg) {
    this.cnst = arg;
}

Const.prototype.toString = function () {
    return this.cnst.toString();
};
Const.prototype.prefix = function () {
    return this.cnst.toString();
};
Const.prototype.evaluate = function () {
    return this.cnst;
};
Const.prototype.diff = function () {
    return new Const(0);

};

function Variable(arg) {
    this.v = arg;
}

Variable.prototype.toString = function () {
    return this.v;
};
Variable.prototype.prefix = function () {
    return this.v;
};
Variable.prototype.evaluate = function () {
    return arguments[msArg[this.v]];
};
Variable.prototype.diff = function (arg) {
    return new Const(arg === this.v ? 1 : 0);
};


function diffAdd(arg) {
    return new Add(this.ops[0].diff(arg), this.ops[1].diff(arg));
}
function diffSubtract(arg) {
    return new Subtract(this.ops[0].diff(arg), this.ops[1].diff(arg));

}
function diffMultiply(arg) {
    return new Add(new Multiply(this.ops[0], this.ops[1].diff(arg)), new Multiply(this.ops[0].diff(arg), this.ops[1]));

}
function diffDivide(arg) {
    return new Divide(new Subtract(new Multiply(this.ops[0].diff(arg),
        this.ops[1]), new Multiply(this.ops[0], this.ops[1].diff(arg))),
        new Multiply(this.ops[1], this.ops[1]));
}

function diffNegate(arg) {
    return new Negate(this.ops[0].diff(arg));
}
function diffCos(arg) {
    return new Negate(new Multiply(this.ops[0].diff(arg), new Sin(this.ops[0])));
}
function diffSin(arg) {
    return new Multiply(this.ops[0].diff(arg), new Cos(this.ops[0]));
}
function diffSquare(arg) {
    return new Multiply(this.ops[0].diff(arg), new Multiply(this.ops[0],new Const(2)));
}
function diffSqrt(arg) {
    return new Divide(new Multiply(this.ops[0].diff(arg), this.ops[0]),
        new Multiply(new Const(2), new Sqrt(new Multiply(new Square(this.ops[0]), this.ops[0]))));

}

var Add = operation(function (x, y) {
    return x + y
}, "+", diffAdd);
var Subtract = operation(function (x, y) {
    return x - y
}, "-", diffSubtract);
var Multiply = operation(function (x, y) {
    return x * y
}, "*", diffMultiply);
var Divide = operation(function (x, y) {
    return x / y
}, "/", diffDivide);
var Power = operation(function (x, y) {
    return Math.pow(x, y);

}, "pow");
var Log = operation(function (x, y) {
    return Math.log(Math.abs(y)) / Math.log(Math.abs(x));

}, "log");

var Negate = operation(function (x) {
    return -x;
}, "negate", diffNegate);
var Cosh = operation(function (x) {
    return (Math.exp(x) + Math.exp(-x)) / 2;
}, "cosh");
var Sinh = operation(function (x) {
    return (Math.exp(x) - Math.exp(-x)) / 2;

}, "sinh");
var Cos = operation(Math.cos, "cos", diffCos);
var Sin = operation(Math.sin, "sin", diffSin);
var Square = operation(function (x) {
    return x * x;
}, "square",diffSquare);
var Sqrt = operation(function (x) {
    return Math.sqrt(Math.abs(x))
}, "sqrt",diffSqrt);

function ParsePrefixError(msg) {
    this.message = msg;
    this.name = "ParsePrefixError";
}

ParsePrefixError.prototype = Object.create(Error.prototype);

var ops = {};
ops['+'] = {Op: Add, Args: 2};
ops['-'] = {Op: Subtract, Args: 2};
ops['*'] = {Op: Multiply, Args: 2};
ops['/'] = {Op: Divide, Args: 2};

ops['negate'] = {Op: Negate, Args: 1};
ops['sin'] = {Op: Sin, Args: 1};
ops['cos'] = {Op: Cos, Args: 1};
ops['square'] = {Op: Square, Args: 1};
ops['sqrt'] = {Op: Sqrt, Args: 1};
/////HW10/////
var parse = function (expr) {
    var regex = /\S+/g;
    var token = [];
    var s;
    while (s = regex.exec(expr)) {
        token.push(s[0]);
    }

    function expression() {
        var arg = token.pop();
        if (!isNaN(arg)) {
            return new Const(Number(arg));
        }

        if (msArg[arg] >= 0) {
            return new Variable(arg);
        }

        var args = [];

        for (var i = 0; i < ops[arg].Args; i++) {
            args.push(expression());
        }
        args.reverse();
        var obj = Object.create(ops[arg].Op.prototype);
        ops[arg].Op.apply(obj, args);
        return obj;

    }

    return result = expression();

};
/////HW11/////
var parsePrefix = function (expr) {
    var regex = /\(|\)|[^\s\(\)]+/g;
    var lastArg = null;
    var lastIndex = 0;

    if (expr === "") {
        throw new ParsePrefixError("Empty input");
    }
    var check = expr.match(regex);
    if (check.length === 3) {
        throw new ParsePrefixError("Not arguments");
    }

    function expression(leftBracket) {
        var lIndex = regex.lastIndex + 1;
        var s = regex.exec(expr);

        if (lastArg === null && s[0] !== "(") {
            lastArg = s[0];
            lastIndex = lIndex;
        }

        if (s === null) {
            throw new ParsePrefixError("Unexpected end of string");
        }
        var arg = s[0];
        var checkNumber = arg.match(/\-?\d+\.?\d*/);
        if (checkNumber && checkNumber[0] === arg) {
            return new Const(Number(arg));
        }

        if (msArg[arg] >= 0) {
            return new Variable(arg);
        }

        switch (arg) {
            case "(":
                var result = expression(true);

                s = regex.exec(expr);
                if (s === null || s[0] !== ')') {
                    throw new ParsePrefixError("Too many arguments after " + lastArg + " at " + lastIndex);
                }
                return result;

            case ")":
                throw new ParsePrefixError("Expected operation or argument and the parenthesis was encountered at " + lastIndex);
        }

        if (!ops.hasOwnProperty(arg)) {
            throw new ParsePrefixError("Unknown symbol: " + arg + " at " + lastIndex);
        }

        if (leftBracket) {
            var args = [];

            for (var i = 0; i < ops[arg].Args; i++) {
                args.push(expression(false));
            }

            var obj = Object.create(ops[arg].Op.prototype);
            ops[arg].Op.apply(obj, args);
            return obj;
        } else {
            throw new ParsePrefixError("Expression expected, found " + arg + " at " + lastIndex)
        }
    }

    var result = expression(false);

    if (regex.exec(expr) !== null) {
        throw new ParsePrefixError("Excessive info");
    }

    return result;


};

/////Test/////

/*
 var expr = new Subtract(new Multiply(new Const(3), new Variable("y")), new Variable("x"));

 println(expr.evaluate(87, 77, 0));//144
 println(expr.toString());*/

