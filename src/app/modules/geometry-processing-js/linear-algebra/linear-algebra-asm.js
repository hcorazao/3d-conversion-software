/* tslint:disable */
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module['ENVIRONMENT']) {
  if (Module['ENVIRONMENT'] === 'WEB') {
    ENVIRONMENT_IS_WEB = true;
  } else if (Module['ENVIRONMENT'] === 'WORKER') {
    ENVIRONMENT_IS_WORKER = true;
  } else if (Module['ENVIRONMENT'] === 'NODE') {
    ENVIRONMENT_IS_NODE = true;
  } else if (Module['ENVIRONMENT'] === 'SHELL') {
    ENVIRONMENT_IS_SHELL = true;
  } else {
    throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
  }
} else {
  ENVIRONMENT_IS_WEB = typeof window === 'object';
  ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
  ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
  ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
  if (!Module['print']) Module['print'] = console.log;
  if (!Module['printErr']) Module['printErr'] = console.warn;
  var nodeFS;
  var nodePath;
  Module['read'] = function read(filename, binary) {
    if (!nodeFS) nodeFS = require('fs');
    if (!nodePath) nodePath = require('path');
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    return binary ? ret : ret.toString();
  };
  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  if (!Module['thisProgram']) {
    if (process['argv'].length > 1) {
      Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
    } else {
      Module['thisProgram'] = 'unknown-program';
    }
  }
  Module['arguments'] = process['argv'].slice(2);
  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }
  process['on']('uncaughtException', function (ex) {
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  Module['inspect'] = function () {
    return '[Emscripten Module object]';
  };
} else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr;
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() {
      throw 'no read() available';
    };
  }
  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof quit === 'function') {
    Module['quit'] = function (status, toThrow) {
      quit(status);
    };
  }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
    Module['readBinary'] = function read(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return xhr.response;
    };
  }
  Module['readAsync'] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
        onload(xhr.response);
      } else {
        onerror();
      }
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    if (!Module['print'])
      Module['print'] = function print(x) {
        console.log(x);
      };
    if (!Module['printErr'])
      Module['printErr'] = function printErr(x) {
        console.warn(x);
      };
  } else {
    var TRY_USE_DUMP = false;
    if (!Module['print'])
      Module['print'] =
        TRY_USE_DUMP && typeof dump !== 'undefined'
          ? function (x) {
              dump(x);
            }
          : function (x) {};
  }
  if (ENVIRONMENT_IS_WORKER) {
    Module['load'] = importScripts;
  }
  if (typeof Module['setWindowTitle'] === 'undefined') {
    Module['setWindowTitle'] = function (title) {
      document.title = title;
    };
  }
} else {
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function () {};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}
if (!Module['quit']) {
  Module['quit'] = function (status, toThrow) {
    throw toThrow;
  };
}
Module.print = Module['print'];
Module.printErr = Module['printErr'];
Module['preRun'] = [];
Module['postRun'] = [];
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
moduleOverrides = undefined;
var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
    return value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1':
      case 'i8':
        return 1;
      case 'i16':
        return 2;
      case 'i32':
        return 4;
      case 'i64':
        return 8;
      case 'float':
        return 4;
      case 'double':
        return 8;
      default: {
        if (type[type.length - 1] === '*') {
          return Runtime.QUANTUM_SIZE;
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits / 8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function (ptr, type) {
    if (type === 'double' || type === 'i64') {
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function (type, size, vararg) {
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8);
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 * (1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index - 2) / 2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      if (sig.length === 1) {
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func);
        };
      } else if (sig.length === 2) {
        sigCache[func] = function dynCall_wrapper(arg) {
          return Runtime.dynCall(sig, func, [arg]);
        };
      } else {
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
        };
      }
    }
    return sigCache[func];
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) {
    var ret = STACKTOP;
    STACKTOP = (STACKTOP + size) | 0;
    STACKTOP = (STACKTOP + 15) & -16;
    return ret;
  },
  staticAlloc: function (size) {
    var ret = STATICTOP;
    STATICTOP = (STATICTOP + size) | 0;
    STATICTOP = (STATICTOP + 15) & -16;
    return ret;
  },
  dynamicAlloc: function (size) {
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ((ret + size + 15) | 0) & -16;
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    if (end >= TOTAL_MEMORY) {
      var success = enlargeMemory();
      if (!success) {
        HEAP32[DYNAMICTOP_PTR >> 2] = ret;
        return 0;
      }
    }
    return ret;
  },
  alignMemory: function (size, quantum) {
    var ret = (size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16));
    return ret;
  },
  makeBigInt: function (low, high, unsigned) {
    var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
    return ret;
  },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0,
};
Module['Runtime'] = Runtime;
var ABORT = 0;
var EXITSTATUS = 0;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
function getCFunc(ident) {
  var func = Module['_' + ident];
  if (!func) {
    try {
      func = eval('_' + ident);
    } catch (e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
var cwrap, ccall;
(function () {
  var JSfuncs = {
    stackSave: function () {
      Runtime.stackSave();
    },
    stackRestore: function () {
      Runtime.stackRestore();
    },
    arrayToC: function (arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    stringToC: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        var len = (str.length << 2) + 1;
        ret = Runtime.stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
  };
  var toC = { string: JSfuncs['stringToC'], array: JSfuncs['arrayToC'] };
  ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function () {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  };
  var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return { arguments: parsed[0], body: parsed[1], returnValue: parsed[2] };
  }
  var JSsource = null;
  function ensureJSsource() {
    if (!JSsource) {
      JSsource = {};
      for (var fun in JSfuncs) {
        if (JSfuncs.hasOwnProperty(fun)) {
          JSsource[fun] = parseJSFunc(JSfuncs[fun]);
        }
      }
    }
  }
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    var numericArgs = argTypes.every(function (type) {
      return type === 'number';
    });
    var numericRet = returnType !== 'string';
    if (numericRet && numericArgs) {
      return cfunc;
    }
    var argNames = argTypes.map(function (x, i) {
      return '$' + i;
    });
    var funcstr = '(function(' + argNames.join(',') + ') {';
    var nargs = argTypes.length;
    if (!numericArgs) {
      ensureJSsource();
      funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i],
          type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC'];
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=(' + convertCode.returnValue + ');';
      }
    }
    var cfuncname = parseJSFunc(function () {
      return cfunc;
    }).returnValue;
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) {
      var strgfy = parseJSFunc(function () {
        return Pointer_stringify;
      }).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      ensureJSsource();
      funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module['ccall'] = ccall;
Module['cwrap'] = cwrap;
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length - 1) === '*') type = 'i32';
  switch (type) {
    case 'i1':
      HEAP8[ptr >> 0] = value;
      break;
    case 'i8':
      HEAP8[ptr >> 0] = value;
      break;
    case 'i16':
      HEAP16[ptr >> 1] = value;
      break;
    case 'i32':
      HEAP32[ptr >> 2] = value;
      break;
    case 'i64':
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        +Math_abs(tempDouble) >= +1
          ? tempDouble > +0
            ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0
            : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case 'float':
      HEAPF32[ptr >> 2] = value;
      break;
    case 'double':
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort('invalid type for setValue: ' + type);
  }
}
Module['setValue'] = setValue;
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length - 1) === '*') type = 'i32';
  switch (type) {
    case 'i1':
      return HEAP8[ptr >> 0];
    case 'i8':
      return HEAP8[ptr >> 0];
    case 'i16':
      return HEAP16[ptr >> 1];
    case 'i32':
      return HEAP32[ptr >> 2];
    case 'i64':
      return HEAP32[ptr >> 2];
    case 'float':
      return HEAPF32[ptr >> 2];
    case 'double':
      return HEAPF64[ptr >> 3];
    default:
      abort('invalid type for setValue: ' + type);
  }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [typeof _malloc === 'function' ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][
      allocator === undefined ? ALLOC_STATIC : allocator
    ](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret,
      stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[ptr >> 2] = 0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[ptr++ >> 0] = 0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0,
    type,
    typeSize,
    previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32';
    setValue(ret + i, curr, type);
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function getMemory(size) {
  if (!staticSealed) return Runtime.staticAlloc(size);
  if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module['getMemory'] = getMemory;
function Pointer_stringify(ptr, length) {
  if (length === 0 || !ptr) return '';
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(ptr + i) >> 0];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (hasUtf < 128) {
    var MAX_CHUNK = 1024;
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module['UTF8ToString'](ptr);
}
Module['Pointer_stringify'] = Pointer_stringify;
function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[ptr++ >> 0];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}
Module['AsciiToString'] = AsciiToString;
function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module['stringToAscii'] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(u8Array, idx) {
  var endPtr = idx;
  while (u8Array[endPtr]) ++endPtr;
  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var u0, u1, u2, u3, u4, u5;
    var str = '';
    while (1) {
      u0 = u8Array[idx++];
      if (!u0) return str;
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 248) == 240) {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 252) == 248) {
            u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
          }
        }
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
  }
}
Module['UTF8ArrayToString'] = UTF8ArrayToString;
function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8, ptr);
}
Module['UTF8ToString'] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 192 | (u >> 6);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 224 | (u >> 12);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else if (u <= 2097151) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 240 | (u >> 18);
      outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else if (u <= 67108863) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 248 | (u >> 24);
      outU8Array[outIdx++] = 128 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 252 | (u >> 30);
      outU8Array[outIdx++] = 128 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    }
  }
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module['stringToUTF8Array'] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module['stringToUTF8'] = stringToUTF8;
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) {
      ++len;
    } else if (u <= 2047) {
      len += 2;
    } else if (u <= 65535) {
      len += 3;
    } else if (u <= 2097151) {
      len += 4;
    } else if (u <= 67108863) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module['lengthBytesUTF8'] = lengthBytesUTF8;
var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function demangle(func) {
  var __cxa_demangle_func = Module['___cxa_demangle'] || Module['__cxa_demangle'];
  if (__cxa_demangle_func) {
    try {
      var s = func.substr(1);
      var len = lengthBytesUTF8(s) + 1;
      var buf = _malloc(len);
      stringToUTF8(s, buf, len);
      var status = _malloc(4);
      var ret = __cxa_demangle_func(buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
    } catch (e) {
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
    return func;
  }
  Runtime.warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  return func;
}
function demangleAll(text) {
  var regex = /__Z[\w\d_]+/g;
  return text.replace(regex, function (x) {
    var y = demangle(x);
    return x === y ? x : x + ' [' + y + ']';
  });
}
function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    try {
      throw new Error(0);
    } catch (e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}
function stackTrace() {
  var js = jsStackTrace();
  if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
  return demangleAll(js);
}
Module['stackTrace'] = stackTrace;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
var MIN_TOTAL_MEMORY = 16777216;
function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}
var HEAP;
var buffer;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBuffer(buf) {
  Module['buffer'] = buffer = buf;
}
function updateGlobalBufferViews() {
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function abortOnCannotGrowMemory() {
  abort(
    'Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' +
      TOTAL_MEMORY +
      ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 '
  );
}
if (!Module['reallocBuffer'])
  Module['reallocBuffer'] = function (size) {
    var ret;
    try {
      if (ArrayBuffer.transfer) {
        ret = ArrayBuffer.transfer(buffer, size);
      } else {
        var oldHEAP8 = HEAP8;
        ret = new ArrayBuffer(size);
        var temp = new Int8Array(ret);
        temp.set(oldHEAP8);
      }
    } catch (e) {
      return false;
    }
    var success = _emscripten_replace_memory(ret);
    if (!success) return false;
    return ret;
  };
function enlargeMemory() {
  var PAGE_MULTIPLE = Module['usingWasm'] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE;
  var LIMIT = 2147483648 - PAGE_MULTIPLE;
  if (HEAP32[DYNAMICTOP_PTR >> 2] > LIMIT) {
    return false;
  }
  TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY);
  while (TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2]) {
    if (TOTAL_MEMORY <= 536870912) {
      TOTAL_MEMORY = alignUp(2 * TOTAL_MEMORY, PAGE_MULTIPLE);
    } else {
      TOTAL_MEMORY = Math.min(alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
    }
  }
  var replacement = Module['reallocBuffer'](TOTAL_MEMORY);
  if (!replacement || replacement.byteLength != TOTAL_MEMORY) {
    return false;
  }
  updateGlobalBuffer(replacement);
  updateGlobalBufferViews();
  return true;
}
var byteLength;
try {
  byteLength = Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get);
  byteLength(new ArrayBuffer(4));
} catch (e) {
  byteLength = function (buffer) {
    return buffer.byteLength;
  };
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK)
  Module.printErr('TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');
if (Module['buffer']) {
  buffer = Module['buffer'];
} else {
  {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
}
updateGlobalBufferViews();
function getTotalMemory() {
  return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw 'Runtime error: expected the system to be little-endian!';
Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}
function postRun() {
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 255) {
      chr &= 255;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
  Runtime.warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');
  var lastChar, end;
  if (dontAddNull) {
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar;
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
if (!Math['imul'] || Math['imul'](4294967295, 5) !== -5)
  Math['imul'] = function imul(a, b) {
    var ah = a >>> 16;
    var al = a & 65535;
    var bh = b >>> 16;
    var bl = b & 65535;
    return (al * bl + ((ah * bl + al * bh) << 16)) | 0;
  };
Math.imul = Math['imul'];
if (!Math['clz32'])
  Math['clz32'] = function (x) {
    x = x >>> 0;
    for (var i = 0; i < 32; i++) {
      if (x & (1 << (31 - i))) return i;
    }
    return 32;
  };
Math.clz32 = Math['clz32'];
if (!Math['trunc'])
  Math['trunc'] = function (x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };
Math.trunc = Math['trunc'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
  return id;
}
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module['preloadedImages'] = {};
Module['preloadedAudios'] = {};
var ASM_CONSTS = [];
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 35600;
__ATINIT__.push(
  {
    func: function () {
      __GLOBAL__sub_I_embind_cpp();
    },
  },
  {
    func: function () {
      __GLOBAL__sub_I_bind_cpp();
    },
  }
);
allocate(
  [
    208,
    40,
    0,
    0,
    76,
    46,
    0,
    0,
    80,
    41,
    0,
    0,
    93,
    46,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    111,
    46,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    168,
    61,
    0,
    0,
    80,
    41,
    0,
    0,
    180,
    61,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    193,
    61,
    0,
    0,
    1,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    207,
    61,
    0,
    0,
    80,
    41,
    0,
    0,
    225,
    61,
    0,
    0,
    0,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    244,
    61,
    0,
    0,
    1,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    85,
    66,
    0,
    0,
    80,
    41,
    0,
    0,
    71,
    66,
    0,
    0,
    0,
    0,
    0,
    0,
    128,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    106,
    66,
    0,
    0,
    80,
    41,
    0,
    0,
    98,
    66,
    0,
    0,
    0,
    0,
    0,
    0,
    152,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    121,
    66,
    0,
    0,
    80,
    41,
    0,
    0,
    113,
    66,
    0,
    0,
    0,
    0,
    0,
    0,
    176,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    133,
    67,
    0,
    0,
    1,
    0,
    0,
    0,
    128,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    117,
    72,
    0,
    0,
    1,
    0,
    0,
    0,
    152,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    3,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    200,
    255,
    255,
    255,
    200,
    255,
    255,
    255,
    48,
    3,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    230,
    77,
    0,
    0,
    48,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    44,
    78,
    0,
    0,
    40,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    80,
    41,
    0,
    0,
    173,
    78,
    0,
    0,
    1,
    0,
    0,
    0,
    176,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    118,
    82,
    0,
    0,
    80,
    41,
    0,
    0,
    138,
    82,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    159,
    82,
    0,
    0,
    1,
    0,
    0,
    0,
    64,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    186,
    82,
    0,
    0,
    80,
    41,
    0,
    0,
    221,
    82,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    1,
    83,
    0,
    0,
    1,
    0,
    0,
    0,
    104,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    51,
    83,
    0,
    0,
    80,
    41,
    0,
    0,
    81,
    83,
    0,
    0,
    0,
    0,
    0,
    0,
    144,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    112,
    83,
    0,
    0,
    1,
    0,
    0,
    0,
    144,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    144,
    83,
    0,
    0,
    80,
    41,
    0,
    0,
    180,
    83,
    0,
    0,
    0,
    0,
    0,
    0,
    184,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    217,
    83,
    0,
    0,
    1,
    0,
    0,
    0,
    184,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    31,
    84,
    0,
    0,
    80,
    41,
    0,
    0,
    255,
    83,
    0,
    0,
    0,
    0,
    0,
    0,
    224,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    88,
    84,
    0,
    0,
    80,
    41,
    0,
    0,
    62,
    84,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    1,
    0,
    0,
    208,
    40,
    0,
    0,
    139,
    84,
    0,
    0,
    80,
    41,
    0,
    0,
    113,
    84,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    2,
    0,
    0,
    80,
    41,
    0,
    0,
    164,
    84,
    0,
    0,
    1,
    0,
    0,
    0,
    224,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    197,
    84,
    0,
    0,
    1,
    0,
    0,
    0,
    248,
    1,
    0,
    0,
    80,
    41,
    0,
    0,
    224,
    84,
    0,
    0,
    1,
    0,
    0,
    0,
    16,
    2,
    0,
    0,
    108,
    41,
    0,
    0,
    200,
    89,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    137,
    89,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    36,
    89,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    8,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    17,
    89,
    0,
    0,
    208,
    40,
    0,
    0,
    242,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    211,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    180,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    149,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    118,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    87,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    56,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    25,
    88,
    0,
    0,
    208,
    40,
    0,
    0,
    250,
    87,
    0,
    0,
    208,
    40,
    0,
    0,
    219,
    87,
    0,
    0,
    208,
    40,
    0,
    0,
    188,
    87,
    0,
    0,
    208,
    40,
    0,
    0,
    157,
    87,
    0,
    0,
    208,
    40,
    0,
    0,
    99,
    89,
    0,
    0,
    248,
    40,
    0,
    0,
    19,
    101,
    0,
    0,
    32,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    1,
    101,
    0,
    0,
    208,
    40,
    0,
    0,
    61,
    101,
    0,
    0,
    108,
    41,
    0,
    0,
    110,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    16,
    3,
    0,
    0,
    3,
    244,
    255,
    255,
    248,
    40,
    0,
    0,
    157,
    101,
    0,
    0,
    88,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    177,
    101,
    0,
    0,
    168,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    199,
    101,
    0,
    0,
    88,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    1,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    152,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    69,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    176,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    91,
    102,
    0,
    0,
    108,
    41,
    0,
    0,
    116,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    216,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    184,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    176,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    220,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    16,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    32,
    103,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    40,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    54,
    103,
    0,
    0,
    108,
    41,
    0,
    0,
    79,
    103,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    80,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    147,
    103,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    40,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    233,
    104,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    144,
    4,
    0,
    0,
    2,
    0,
    0,
    0,
    152,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    208,
    40,
    0,
    0,
    80,
    105,
    0,
    0,
    208,
    40,
    0,
    0,
    46,
    105,
    0,
    0,
    108,
    41,
    0,
    0,
    99,
    105,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    144,
    4,
    0,
    0,
    2,
    0,
    0,
    0,
    200,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    208,
    40,
    0,
    0,
    168,
    105,
    0,
    0,
    108,
    41,
    0,
    0,
    202,
    105,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    240,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    208,
    40,
    0,
    0,
    15,
    106,
    0,
    0,
    108,
    41,
    0,
    0,
    36,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    240,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    108,
    41,
    0,
    0,
    105,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    56,
    5,
    0,
    0,
    2,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    133,
    106,
    0,
    0,
    108,
    41,
    0,
    0,
    154,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    56,
    5,
    0,
    0,
    2,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    182,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    56,
    5,
    0,
    0,
    2,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    210,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    56,
    5,
    0,
    0,
    2,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    253,
    106,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    192,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    67,
    107,
    0,
    0,
    108,
    41,
    0,
    0,
    103,
    107,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    232,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    173,
    107,
    0,
    0,
    108,
    41,
    0,
    0,
    204,
    107,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    16,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    18,
    108,
    0,
    0,
    108,
    41,
    0,
    0,
    43,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    56,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    113,
    108,
    0,
    0,
    108,
    41,
    0,
    0,
    138,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    96,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    159,
    108,
    0,
    0,
    108,
    41,
    0,
    0,
    54,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    96,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    183,
    108,
    0,
    0,
    152,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    218,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    184,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    253,
    108,
    0,
    0,
    248,
    40,
    0,
    0,
    20,
    109,
    0,
    0,
    152,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    75,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    184,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    109,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    184,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    143,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    184,
    6,
    0,
    0,
    2,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    178,
    109,
    0,
    0,
    88,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    41,
    0,
    0,
    200,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    96,
    7,
    0,
    0,
    2,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    218,
    109,
    0,
    0,
    108,
    41,
    0,
    0,
    239,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    2,
    0,
    0,
    0,
    96,
    7,
    0,
    0,
    2,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    1,
    110,
    0,
    0,
    88,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    22,
    110,
    0,
    0,
    88,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    166,
    110,
    0,
    0,
    208,
    40,
    0,
    0,
    170,
    112,
    0,
    0,
    248,
    40,
    0,
    0,
    10,
    113,
    0,
    0,
    200,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    183,
    112,
    0,
    0,
    216,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    40,
    0,
    0,
    216,
    112,
    0,
    0,
    248,
    40,
    0,
    0,
    229,
    112,
    0,
    0,
    184,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    251,
    113,
    0,
    0,
    176,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    44,
    114,
    0,
    0,
    200,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    8,
    114,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    40,
    0,
    0,
    78,
    114,
    0,
    0,
    200,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    52,
    41,
    0,
    0,
    118,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    120,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    123,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    125,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    127,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    129,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    131,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    133,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    135,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    137,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    223,
    119,
    0,
    0,
    52,
    41,
    0,
    0,
    139,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    141,
    114,
    0,
    0,
    52,
    41,
    0,
    0,
    143,
    114,
    0,
    0,
    248,
    40,
    0,
    0,
    145,
    114,
    0,
    0,
    184,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    16,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    8,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    8,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    32,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    32,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    32,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    16,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    16,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    8,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    32,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    16,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    56,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    56,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    96,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    96,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    88,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    112,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    8,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    136,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    160,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    184,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    48,
    8,
    0,
    0,
    96,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    96,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    152,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    136,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    136,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    160,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    1,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    200,
    255,
    255,
    255,
    200,
    255,
    255,
    255,
    16,
    1,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    244,
    10,
    0,
    0,
    244,
    0,
    0,
    0,
    8,
    1,
    0,
    0,
    8,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    32,
    1,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    160,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    184,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    184,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    72,
    1,
    0,
    0,
    152,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    64,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    104,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    64,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    128,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    128,
    1,
    0,
    0,
    152,
    8,
    0,
    0,
    128,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    152,
    8,
    0,
    0,
    128,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    128,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    128,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    112,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    48,
    8,
    0,
    0,
    112,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    128,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    112,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    64,
    1,
    0,
    0,
    152,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    48,
    8,
    0,
    0,
    152,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    64,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    192,
    1,
    0,
    0,
    152,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    184,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    208,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    208,
    1,
    0,
    0,
    152,
    8,
    0,
    0,
    208,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    208,
    1,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    112,
    8,
    0,
    0,
    104,
    1,
    0,
    0,
    208,
    1,
    0,
    0,
    232,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    192,
    1,
    0,
    0,
    24,
    2,
    0,
    0,
    192,
    1,
    0,
    0,
    48,
    8,
    0,
    0,
    192,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    48,
    8,
    0,
    0,
    192,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    64,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    192,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    232,
    1,
    0,
    0,
    184,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    232,
    1,
    0,
    0,
    112,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    184,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    112,
    1,
    0,
    0,
    24,
    2,
    0,
    0,
    184,
    1,
    0,
    0,
    104,
    1,
    0,
    0,
    24,
    2,
    0,
    0,
    112,
    1,
    0,
    0,
    144,
    13,
    0,
    0,
    20,
    0,
    0,
    0,
    67,
    46,
    85,
    84,
    70,
    45,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    222,
    18,
    4,
    149,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    116,
    13,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    192,
    3,
    0,
    0,
    192,
    4,
    0,
    0,
    192,
    5,
    0,
    0,
    192,
    6,
    0,
    0,
    192,
    7,
    0,
    0,
    192,
    8,
    0,
    0,
    192,
    9,
    0,
    0,
    192,
    10,
    0,
    0,
    192,
    11,
    0,
    0,
    192,
    12,
    0,
    0,
    192,
    13,
    0,
    0,
    192,
    14,
    0,
    0,
    192,
    15,
    0,
    0,
    192,
    16,
    0,
    0,
    192,
    17,
    0,
    0,
    192,
    18,
    0,
    0,
    192,
    19,
    0,
    0,
    192,
    20,
    0,
    0,
    192,
    21,
    0,
    0,
    192,
    22,
    0,
    0,
    192,
    23,
    0,
    0,
    192,
    24,
    0,
    0,
    192,
    25,
    0,
    0,
    192,
    26,
    0,
    0,
    192,
    27,
    0,
    0,
    192,
    28,
    0,
    0,
    192,
    29,
    0,
    0,
    192,
    30,
    0,
    0,
    192,
    31,
    0,
    0,
    192,
    0,
    0,
    0,
    179,
    1,
    0,
    0,
    195,
    2,
    0,
    0,
    195,
    3,
    0,
    0,
    195,
    4,
    0,
    0,
    195,
    5,
    0,
    0,
    195,
    6,
    0,
    0,
    195,
    7,
    0,
    0,
    195,
    8,
    0,
    0,
    195,
    9,
    0,
    0,
    195,
    10,
    0,
    0,
    195,
    11,
    0,
    0,
    195,
    12,
    0,
    0,
    195,
    13,
    0,
    0,
    211,
    14,
    0,
    0,
    195,
    15,
    0,
    0,
    195,
    0,
    0,
    12,
    187,
    1,
    0,
    12,
    195,
    2,
    0,
    12,
    195,
    3,
    0,
    12,
    195,
    4,
    0,
    12,
    211,
    140,
    14,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    252,
    134,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    28,
    125,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    4,
    135,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    252,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    140,
    42,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    40,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    42,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    52,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    54,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    59,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    61,
    0,
    0,
    0,
    62,
    0,
    0,
    0,
    63,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    106,
    0,
    0,
    0,
    107,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    113,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    118,
    0,
    0,
    0,
    119,
    0,
    0,
    0,
    120,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    122,
    0,
    0,
    0,
    91,
    0,
    0,
    0,
    92,
    0,
    0,
    0,
    93,
    0,
    0,
    0,
    94,
    0,
    0,
    0,
    95,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    106,
    0,
    0,
    0,
    107,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    113,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    118,
    0,
    0,
    0,
    119,
    0,
    0,
    0,
    120,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    122,
    0,
    0,
    0,
    123,
    0,
    0,
    0,
    124,
    0,
    0,
    0,
    125,
    0,
    0,
    0,
    126,
    0,
    0,
    0,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    25,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    40,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    42,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    52,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    54,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    59,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    61,
    0,
    0,
    0,
    62,
    0,
    0,
    0,
    63,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    66,
    0,
    0,
    0,
    67,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    69,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    71,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    73,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    75,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    78,
    0,
    0,
    0,
    79,
    0,
    0,
    0,
    80,
    0,
    0,
    0,
    81,
    0,
    0,
    0,
    82,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    85,
    0,
    0,
    0,
    86,
    0,
    0,
    0,
    87,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    89,
    0,
    0,
    0,
    90,
    0,
    0,
    0,
    91,
    0,
    0,
    0,
    92,
    0,
    0,
    0,
    93,
    0,
    0,
    0,
    94,
    0,
    0,
    0,
    95,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    66,
    0,
    0,
    0,
    67,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    69,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    71,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    73,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    75,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    78,
    0,
    0,
    0,
    79,
    0,
    0,
    0,
    80,
    0,
    0,
    0,
    81,
    0,
    0,
    0,
    82,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    85,
    0,
    0,
    0,
    86,
    0,
    0,
    0,
    87,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    89,
    0,
    0,
    0,
    90,
    0,
    0,
    0,
    123,
    0,
    0,
    0,
    124,
    0,
    0,
    0,
    125,
    0,
    0,
    0,
    126,
    0,
    0,
    0,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    232,
    3,
    0,
    0,
    16,
    39,
    0,
    0,
    160,
    134,
    1,
    0,
    64,
    66,
    15,
    0,
    128,
    150,
    152,
    0,
    0,
    225,
    245,
    5,
    95,
    112,
    137,
    0,
    255,
    9,
    47,
    15,
    0,
    0,
    0,
    0,
    32,
    3,
    0,
    0,
    11,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    40,
    3,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    3,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    252,
    255,
    255,
    255,
    252,
    255,
    255,
    255,
    48,
    3,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    136,
    29,
    0,
    0,
    156,
    29,
    0,
    0,
    0,
    0,
    0,
    0,
    72,
    3,
    0,
    0,
    15,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    3,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    120,
    3,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    184,
    3,
    0,
    0,
    22,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    3,
    0,
    0,
    24,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    4,
    0,
    0,
    26,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    4,
    0,
    0,
    28,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    248,
    255,
    255,
    255,
    104,
    4,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    160,
    4,
    0,
    0,
    30,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    248,
    255,
    255,
    255,
    160,
    4,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    73,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    89,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    80,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    79,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    78,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    118,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    74,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    79,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    78,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    118,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    87,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    87,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    89,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    73,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    4,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    4,
    0,
    0,
    34,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    5,
    0,
    0,
    36,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    5,
    0,
    0,
    38,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    5,
    0,
    0,
    40,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    128,
    5,
    0,
    0,
    42,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    160,
    5,
    0,
    0,
    44,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    200,
    5,
    0,
    0,
    46,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    5,
    0,
    0,
    48,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    6,
    0,
    0,
    50,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    6,
    0,
    0,
    52,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    6,
    0,
    0,
    54,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    192,
    6,
    0,
    0,
    56,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    136,
    6,
    0,
    0,
    56,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    6,
    0,
    0,
    59,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    40,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    7,
    0,
    0,
    61,
    0,
    0,
    0,
    62,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    7,
    0,
    0,
    63,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    136,
    7,
    0,
    0,
    65,
    0,
    0,
    0,
    66,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    42,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    152,
    7,
    0,
    0,
    67,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    88,
    3,
    0,
    0,
    56,
    0,
    0,
    0,
    69,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    7,
    0,
    0,
    56,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    6,
    0,
    0,
    56,
    0,
    0,
    0,
    71,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    17,
  ],
  'i8',
  ALLOC_NONE,
  Runtime.GLOBAL_BASE
);
allocate(
  [
    45,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    7,
    0,
    0,
    56,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    152,
    6,
    0,
    0,
    56,
    0,
    0,
    0,
    73,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    152,
    4,
    0,
    0,
    8,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    200,
    4,
    0,
    0,
    16,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    161,
    112,
    0,
    0,
    0,
    0,
    0,
    0,
    184,
    7,
    0,
    0,
    74,
    0,
    0,
    0,
    75,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    224,
    7,
    0,
    0,
    74,
    0,
    0,
    0,
    78,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    7,
    0,
    0,
    79,
    0,
    0,
    0,
    80,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    32,
    8,
    0,
    0,
    74,
    0,
    0,
    0,
    81,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    8,
    0,
    0,
    74,
    0,
    0,
    0,
    82,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    160,
    8,
    0,
    0,
    74,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    77,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    3,
    32,
    2,
    32,
    2,
    32,
    2,
    32,
    2,
    32,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    2,
    0,
    1,
    96,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    8,
    216,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    8,
    213,
    8,
    213,
    8,
    213,
    8,
    213,
    8,
    213,
    8,
    213,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    8,
    197,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    8,
    214,
    8,
    214,
    8,
    214,
    8,
    214,
    8,
    214,
    8,
    214,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    8,
    198,
    4,
    192,
    4,
    192,
    4,
    192,
    4,
    192,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    0,
    105,
    100,
    101,
    110,
    116,
    105,
    116,
    121,
    0,
    111,
    110,
    101,
    115,
    0,
    99,
    111,
    110,
    115,
    116,
    97,
    110,
    116,
    0,
    114,
    97,
    110,
    100,
    111,
    109,
    0,
    116,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    101,
    0,
    110,
    82,
    111,
    119,
    115,
    0,
    110,
    67,
    111,
    108,
    115,
    0,
    110,
    111,
    114,
    109,
    0,
    114,
    97,
    110,
    107,
    0,
    115,
    117,
    109,
    0,
    115,
    117,
    98,
    77,
    97,
    116,
    114,
    105,
    120,
    0,
    115,
    99,
    97,
    108,
    101,
    66,
    121,
    0,
    105,
    110,
    99,
    114,
    101,
    109,
    101,
    110,
    116,
    66,
    121,
    0,
    100,
    101,
    99,
    114,
    101,
    109,
    101,
    110,
    116,
    66,
    121,
    0,
    116,
    105,
    109,
    101,
    115,
    82,
    101,
    97,
    108,
    0,
    116,
    105,
    109,
    101,
    115,
    68,
    101,
    110,
    115,
    101,
    0,
    112,
    108,
    117,
    115,
    0,
    109,
    105,
    110,
    117,
    115,
    0,
    110,
    101,
    103,
    97,
    116,
    101,
    100,
    0,
    103,
    101,
    116,
    0,
    115,
    101,
    116,
    0,
    104,
    99,
    97,
    116,
    0,
    118,
    99,
    97,
    116,
    0,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    0,
    97,
    100,
    100,
    69,
    110,
    116,
    114,
    121,
    0,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    0,
    100,
    105,
    97,
    103,
    0,
    110,
    110,
    122,
    0,
    102,
    114,
    111,
    98,
    101,
    110,
    105,
    117,
    115,
    78,
    111,
    114,
    109,
    0,
    116,
    111,
    68,
    101,
    110,
    115,
    101,
    0,
    99,
    104,
    111,
    108,
    0,
    108,
    117,
    0,
    113,
    114,
    0,
    116,
    105,
    109,
    101,
    115,
    83,
    112,
    97,
    114,
    115,
    101,
    0,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    0,
    115,
    111,
    108,
    118,
    101,
    80,
    111,
    115,
    105,
    116,
    105,
    118,
    101,
    68,
    101,
    102,
    105,
    110,
    105,
    116,
    101,
    0,
    76,
    85,
    0,
    115,
    111,
    108,
    118,
    101,
    83,
    113,
    117,
    97,
    114,
    101,
    0,
    81,
    82,
    0,
    115,
    111,
    108,
    118,
    101,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    0,
    114,
    101,
    97,
    108,
    0,
    105,
    109,
    97,
    103,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    0,
    99,
    111,
    110,
    106,
    117,
    103,
    97,
    116,
    101,
    0,
    116,
    105,
    109,
    101,
    115,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    76,
    85,
    0,
    67,
    111,
    109,
    112,
    108,
    101,
    120,
    81,
    82,
    0,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    80,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    80,
    75,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    105,
    105,
    0,
    118,
    0,
    118,
    105,
    0,
    105,
    105,
    105,
    105,
    0,
    114,
    111,
    119,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    40,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    124,
    124,
    32,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    114,
    111,
    119,
    115,
    41,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    40,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    124,
    124,
    32,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    99,
    111,
    108,
    115,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    67,
    119,
    105,
    115,
    101,
    78,
    117,
    108,
    108,
    97,
    114,
    121,
    79,
    112,
    46,
    104,
    0,
    67,
    119,
    105,
    115,
    101,
    78,
    117,
    108,
    108,
    97,
    114,
    121,
    79,
    112,
    0,
    100,
    115,
    116,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    100,
    115,
    116,
    82,
    111,
    119,
    115,
    32,
    38,
    38,
    32,
    100,
    115,
    116,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    100,
    115,
    116,
    67,
    111,
    108,
    115,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    65,
    115,
    115,
    105,
    103,
    110,
    69,
    118,
    97,
    108,
    117,
    97,
    116,
    111,
    114,
    46,
    104,
    0,
    114,
    101,
    115,
    105,
    122,
    101,
    95,
    105,
    102,
    95,
    97,
    108,
    108,
    111,
    119,
    101,
    100,
    0,
    40,
    33,
    40,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    33,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    41,
    32,
    124,
    124,
    32,
    40,
    114,
    111,
    119,
    115,
    61,
    61,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    41,
    32,
    38,
    38,
    32,
    40,
    33,
    40,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    33,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    41,
    32,
    124,
    124,
    32,
    40,
    99,
    111,
    108,
    115,
    61,
    61,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    41,
    32,
    38,
    38,
    32,
    40,
    33,
    40,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    61,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    38,
    38,
    32,
    77,
    97,
    120,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    33,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    41,
    32,
    124,
    124,
    32,
    40,
    114,
    111,
    119,
    115,
    60,
    61,
    77,
    97,
    120,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    41,
    32,
    38,
    38,
    32,
    40,
    33,
    40,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    61,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    38,
    38,
    32,
    77,
    97,
    120,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    33,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    41,
    32,
    124,
    124,
    32,
    40,
    99,
    111,
    108,
    115,
    60,
    61,
    77,
    97,
    120,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    41,
    32,
    38,
    38,
    32,
    114,
    111,
    119,
    115,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    115,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    34,
    73,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    115,
    105,
    122,
    101,
    115,
    32,
    119,
    104,
    101,
    110,
    32,
    114,
    101,
    115,
    105,
    122,
    105,
    110,
    103,
    32,
    97,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    111,
    114,
    32,
    97,
    114,
    114,
    97,
    121,
    46,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    80,
    108,
    97,
    105,
    110,
    79,
    98,
    106,
    101,
    99,
    116,
    66,
    97,
    115,
    101,
    46,
    104,
    0,
    114,
    101,
    115,
    105,
    122,
    101,
    0,
    105,
    105,
    105,
    0,
    105,
    105,
    105,
    105,
    100,
    0,
    40,
    33,
    99,
    104,
    101,
    99,
    107,
    95,
    116,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    101,
    95,
    97,
    108,
    105,
    97,
    115,
    105,
    110,
    103,
    95,
    114,
    117,
    110,
    95,
    116,
    105,
    109,
    101,
    95,
    115,
    101,
    108,
    101,
    99,
    116,
    111,
    114,
    32,
    60,
    116,
    121,
    112,
    101,
    110,
    97,
    109,
    101,
    32,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    58,
    58,
    83,
    99,
    97,
    108,
    97,
    114,
    44,
    98,
    108,
    97,
    115,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    62,
    58,
    58,
    73,
    115,
    84,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    101,
    100,
    44,
    79,
    116,
    104,
    101,
    114,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    62,
    32,
    58,
    58,
    114,
    117,
    110,
    40,
    101,
    120,
    116,
    114,
    97,
    99,
    116,
    95,
    100,
    97,
    116,
    97,
    40,
    100,
    115,
    116,
    41,
    44,
    32,
    111,
    116,
    104,
    101,
    114,
    41,
    41,
    32,
    38,
    38,
    32,
    34,
    97,
    108,
    105,
    97,
    115,
    105,
    110,
    103,
    32,
    100,
    101,
    116,
    101,
    99,
    116,
    101,
    100,
    32,
    100,
    117,
    114,
    105,
    110,
    103,
    32,
    116,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    105,
    116,
    105,
    111,
    110,
    44,
    32,
    117,
    115,
    101,
    32,
    116,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    101,
    73,
    110,
    80,
    108,
    97,
    99,
    101,
    40,
    41,
    32,
    34,
    32,
    34,
    111,
    114,
    32,
    101,
    118,
    97,
    108,
    117,
    97,
    116,
    101,
    32,
    116,
    104,
    101,
    32,
    114,
    104,
    115,
    32,
    105,
    110,
    116,
    111,
    32,
    97,
    32,
    116,
    101,
    109,
    112,
    111,
    114,
    97,
    114,
    121,
    32,
    117,
    115,
    105,
    110,
    103,
    32,
    46,
    101,
    118,
    97,
    108,
    40,
    41,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    84,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    101,
    46,
    104,
    0,
    114,
    117,
    110,
    0,
    116,
    104,
    105,
    115,
    45,
    62,
    114,
    111,
    119,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    116,
    104,
    105,
    115,
    45,
    62,
    99,
    111,
    108,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    34,
    121,
    111,
    117,
    32,
    97,
    114,
    101,
    32,
    117,
    115,
    105,
    110,
    103,
    32,
    97,
    110,
    32,
    101,
    109,
    112,
    116,
    121,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    82,
    101,
    100,
    117,
    120,
    46,
    104,
    0,
    114,
    101,
    100,
    117,
    120,
    0,
    109,
    97,
    116,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    109,
    97,
    116,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    34,
    121,
    111,
    117,
    32,
    97,
    114,
    101,
    32,
    117,
    115,
    105,
    110,
    103,
    32,
    97,
    110,
    32,
    101,
    109,
    112,
    116,
    121,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    34,
    0,
    100,
    105,
    105,
    105,
    0,
    40,
    40,
    83,
    105,
    122,
    101,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    38,
    38,
    32,
    40,
    77,
    97,
    120,
    83,
    105,
    122,
    101,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    61,
    61,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    124,
    124,
    32,
    115,
    105,
    122,
    101,
    60,
    61,
    77,
    97,
    120,
    83,
    105,
    122,
    101,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    41,
    32,
    124,
    124,
    32,
    83,
    105,
    122,
    101,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    115,
    105,
    122,
    101,
    41,
    32,
    38,
    38,
    32,
    115,
    105,
    122,
    101,
    62,
    61,
    48,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    81,
    82,
    47,
    67,
    111,
    108,
    80,
    105,
    118,
    72,
    111,
    117,
    115,
    101,
    104,
    111,
    108,
    100,
    101,
    114,
    81,
    82,
    46,
    104,
    0,
    40,
    105,
    62,
    61,
    48,
    41,
    32,
    38,
    38,
    32,
    40,
    32,
    40,
    40,
    66,
    108,
    111,
    99,
    107,
    82,
    111,
    119,
    115,
    61,
    61,
    49,
    41,
    32,
    38,
    38,
    32,
    40,
    66,
    108,
    111,
    99,
    107,
    67,
    111,
    108,
    115,
    61,
    61,
    88,
    112,
    114,
    84,
    121,
    112,
    101,
    58,
    58,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    32,
    38,
    38,
    32,
    105,
    60,
    120,
    112,
    114,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    41,
    32,
    124,
    124,
    40,
    40,
    66,
    108,
    111,
    99,
    107,
    82,
    111,
    119,
    115,
    61,
    61,
    88,
    112,
    114,
    84,
    121,
    112,
    101,
    58,
    58,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    41,
    32,
    38,
    38,
    32,
    40,
    66,
    108,
    111,
    99,
    107,
    67,
    111,
    108,
    115,
    61,
    61,
    49,
    41,
    32,
    38,
    38,
    32,
    105,
    60,
    120,
    112,
    114,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    41,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    66,
    108,
    111,
    99,
    107,
    46,
    104,
    0,
    66,
    108,
    111,
    99,
    107,
    0,
    40,
    100,
    97,
    116,
    97,
    80,
    116,
    114,
    32,
    61,
    61,
    32,
    48,
    41,
    32,
    124,
    124,
    32,
    40,
    32,
    114,
    111,
    119,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    40,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    124,
    124,
    32,
    82,
    111,
    119,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    114,
    111,
    119,
    115,
    41,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    40,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    68,
    121,
    110,
    97,
    109,
    105,
    99,
    32,
    124,
    124,
    32,
    67,
    111,
    108,
    115,
    65,
    116,
    67,
    111,
    109,
    112,
    105,
    108,
    101,
    84,
    105,
    109,
    101,
    32,
    61,
    61,
    32,
    99,
    111,
    108,
    115,
    41,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    77,
    97,
    112,
    66,
    97,
    115,
    101,
    46,
    104,
    0,
    77,
    97,
    112,
    66,
    97,
    115,
    101,
    0,
    118,
    32,
    61,
    61,
    32,
    84,
    40,
    86,
    97,
    108,
    117,
    101,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    117,
    116,
    105,
    108,
    47,
    88,
    112,
    114,
    72,
    101,
    108,
    112,
    101,
    114,
    46,
    104,
    0,
    118,
    97,
    114,
    105,
    97,
    98,
    108,
    101,
    95,
    105,
    102,
    95,
    100,
    121,
    110,
    97,
    109,
    105,
    99,
    0,
    115,
    116,
    97,
    114,
    116,
    82,
    111,
    119,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    98,
    108,
    111,
    99,
    107,
    82,
    111,
    119,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    115,
    116,
    97,
    114,
    116,
    82,
    111,
    119,
    32,
    60,
    61,
    32,
    120,
    112,
    114,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    45,
    32,
    98,
    108,
    111,
    99,
    107,
    82,
    111,
    119,
    115,
    32,
    38,
    38,
    32,
    115,
    116,
    97,
    114,
    116,
    67,
    111,
    108,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    98,
    108,
    111,
    99,
    107,
    67,
    111,
    108,
    115,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    115,
    116,
    97,
    114,
    116,
    67,
    111,
    108,
    32,
    60,
    61,
    32,
    120,
    112,
    114,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    45,
    32,
    98,
    108,
    111,
    99,
    107,
    67,
    111,
    108,
    115,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    68,
    101,
    110,
    115,
    101,
    66,
    97,
    115,
    101,
    46,
    104,
    0,
    100,
    115,
    116,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    115,
    114,
    99,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    100,
    115,
    116,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    115,
    114,
    99,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    114,
    111,
    119,
    115,
    32,
    61,
    61,
    32,
    116,
    104,
    105,
    115,
    45,
    62,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    115,
    32,
    61,
    61,
    32,
    116,
    104,
    105,
    115,
    45,
    62,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    68,
    101,
    110,
    115,
    101,
    66,
    97,
    115,
    101,
    58,
    58,
    114,
    101,
    115,
    105,
    122,
    101,
    40,
    41,
    32,
    100,
    111,
    101,
    115,
    32,
    110,
    111,
    116,
    32,
    97,
    99,
    116,
    117,
    97,
    108,
    108,
    121,
    32,
    97,
    108,
    108,
    111,
    119,
    32,
    116,
    111,
    32,
    114,
    101,
    115,
    105,
    122,
    101,
    46,
    34,
    0,
    97,
    76,
    104,
    115,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    97,
    82,
    104,
    115,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    97,
    76,
    104,
    115,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    97,
    82,
    104,
    115,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    67,
    119,
    105,
    115,
    101,
    66,
    105,
    110,
    97,
    114,
    121,
    79,
    112,
    46,
    104,
    0,
    67,
    119,
    105,
    115,
    101,
    66,
    105,
    110,
    97,
    114,
    121,
    79,
    112,
    0,
    118,
    101,
    99,
    83,
    105,
    122,
    101,
    32,
    62,
    61,
    32,
    48,
    0,
    108,
    104,
    115,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    114,
    104,
    115,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    105,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    112,
    114,
    111,
    100,
    117,
    99,
    116,
    34,
    32,
    38,
    38,
    32,
    34,
    105,
    102,
    32,
    121,
    111,
    117,
    32,
    119,
    97,
    110,
    116,
    101,
    100,
    32,
    97,
    32,
    99,
    111,
    101,
    102,
    102,
    45,
    119,
    105,
    115,
    101,
    32,
    111,
    114,
    32,
    97,
    32,
    100,
    111,
    116,
    32,
    112,
    114,
    111,
    100,
    117,
    99,
    116,
    32,
    117,
    115,
    101,
    32,
    116,
    104,
    101,
    32,
    114,
    101,
    115,
    112,
    101,
    99,
    116,
    105,
    118,
    101,
    32,
    101,
    120,
    112,
    108,
    105,
    99,
    105,
    116,
    32,
    102,
    117,
    110,
    99,
    116,
    105,
    111,
    110,
    115,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    80,
    114,
    111,
    100,
    117,
    99,
    116,
    46,
    104,
    0,
    80,
    114,
    111,
    100,
    117,
    99,
    116,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    80,
    114,
    111,
    100,
    117,
    99,
    116,
    69,
    118,
    97,
    108,
    117,
    97,
    116,
    111,
    114,
    115,
    46,
    104,
    0,
    105,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    106,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    105,
    60,
    115,
    105,
    122,
    101,
    40,
    41,
    32,
    38,
    38,
    32,
    106,
    60,
    115,
    105,
    122,
    101,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    80,
    101,
    114,
    109,
    117,
    116,
    97,
    116,
    105,
    111,
    110,
    77,
    97,
    116,
    114,
    105,
    120,
    46,
    104,
    0,
    97,
    112,
    112,
    108,
    121,
    84,
    114,
    97,
    110,
    115,
    112,
    111,
    115,
    105,
    116,
    105,
    111,
    110,
    79,
    110,
    84,
    104,
    101,
    82,
    105,
    103,
    104,
    116,
    0,
    109,
    95,
    105,
    115,
    73,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    38,
    38,
    32,
    34,
    67,
    111,
    108,
    80,
    105,
    118,
    72,
    111,
    117,
    115,
    101,
    104,
    111,
    108,
    100,
    101,
    114,
    81,
    82,
    32,
    105,
    115,
    32,
    110,
    111,
    116,
    32,
    105,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    46,
    34,
    0,
    109,
    95,
    105,
    115,
    73,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    124,
    124,
    32,
    109,
    95,
    117,
    115,
    101,
    80,
    114,
    101,
    115,
    99,
    114,
    105,
    98,
    101,
    100,
    84,
    104,
    114,
    101,
    115,
    104,
    111,
    108,
    100,
    0,
    116,
    104,
    114,
    101,
    115,
    104,
    111,
    108,
    100,
    0,
    100,
    105,
    105,
    0,
    105,
    105,
    105,
    105,
    105,
    105,
    105,
    0,
    118,
    105,
    105,
    100,
    0,
    118,
    105,
    105,
    105,
    0,
    105,
    105,
    105,
    100,
    0,
    100,
    115,
    116,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    97,
    95,
    108,
    104,
    115,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    100,
    115,
    116,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    61,
    61,
    97,
    95,
    114,
    104,
    115,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    112,
    114,
    111,
    100,
    117,
    99,
    116,
    115,
    47,
    71,
    101,
    110,
    101,
    114,
    97,
    108,
    77,
    97,
    116,
    114,
    105,
    120,
    77,
    97,
    116,
    114,
    105,
    120,
    46,
    104,
    0,
    115,
    99,
    97,
    108,
    101,
    65,
    110,
    100,
    65,
    100,
    100,
    84,
    111,
    0,
    40,
    40,
    33,
    80,
    97,
    110,
    101,
    108,
    77,
    111,
    100,
    101,
    41,
    32,
    38,
    38,
    32,
    115,
    116,
    114,
    105,
    100,
    101,
    61,
    61,
    48,
    32,
    38,
    38,
    32,
    111,
    102,
    102,
    115,
    101,
    116,
    61,
    61,
    48,
    41,
    32,
    124,
    124,
    32,
    40,
    80,
    97,
    110,
    101,
    108,
    77,
    111,
    100,
    101,
    32,
    38,
    38,
    32,
    115,
    116,
    114,
    105,
    100,
    101,
    62,
    61,
    100,
    101,
    112,
    116,
    104,
    32,
    38,
    38,
    32,
    111,
    102,
    102,
    115,
    101,
    116,
    60,
    61,
    115,
    116,
    114,
    105,
    100,
    101,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    112,
    114,
    111,
    100,
    117,
    99,
    116,
    115,
    47,
    71,
    101,
    110,
    101,
    114,
    97,
    108,
    66,
    108,
    111,
    99,
    107,
    80,
    97,
    110,
    101,
    108,
    75,
    101,
    114,
    110,
    101,
    108,
    46,
    104,
    0,
    114,
    111,
    119,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    114,
    111,
    119,
    32,
    60,
    32,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    32,
    60,
    32,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    68,
    101,
    110,
    115,
    101,
    67,
    111,
    101,
    102,
    102,
    115,
    66,
    97,
    115,
    101,
    46,
    104,
    0,
    100,
    105,
    105,
    105,
    105,
    0,
    118,
    105,
    105,
    105,
    105,
    100,
    0,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    100,
    69,
    0,
    80,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    100,
    69,
    0,
    80,
    75,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    100,
    69,
    0,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    80,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    80,
    75,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    100,
    69,
    0,
    105,
    115,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    84,
    104,
    105,
    115,
    32,
    102,
    117,
    110,
    99,
    116,
    105,
    111,
    110,
    32,
    100,
    111,
    101,
    115,
    32,
    110,
    111,
    116,
    32,
    109,
    97,
    107,
    101,
    32,
    115,
    101,
    110,
    115,
    101,
    32,
    105,
    110,
    32,
    110,
    111,
    110,
    32,
    99,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    32,
    109,
    111,
    100,
    101,
    46,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    46,
    104,
    0,
    114,
    101,
    115,
    101,
    114,
    118,
    101,
    0,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    93,
    61,
    61,
    73,
    110,
    100,
    101,
    120,
    40,
    109,
    95,
    100,
    97,
    116,
    97,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    41,
    32,
    38,
    38,
    32,
    34,
    89,
    111,
    117,
    32,
    109,
    117,
    115,
    116,
    32,
    99,
    97,
    108,
    108,
    32,
    115,
    116,
    97,
    114,
    116,
    86,
    101,
    99,
    32,
    102,
    111,
    114,
    32,
    101,
    97,
    99,
    104,
    32,
    105,
    110,
    110,
    101,
    114,
    32,
    118,
    101,
    99,
    116,
    111,
    114,
    32,
    115,
    101,
    113,
    117,
    101,
    110,
    116,
    105,
    97,
    108,
    108,
    121,
    34,
    0,
    115,
    116,
    97,
    114,
    116,
    86,
    101,
    99,
    0,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    43,
    49,
    93,
    61,
    61,
    48,
    32,
    38,
    38,
    32,
    34,
    89,
    111,
    117,
    32,
    109,
    117,
    115,
    116,
    32,
    99,
    97,
    108,
    108,
    32,
    115,
    116,
    97,
    114,
    116,
    86,
    101,
    99,
    32,
    102,
    111,
    114,
    32,
    101,
    97,
    99,
    104,
    32,
    105,
    110,
    110,
    101,
    114,
    32,
    118,
    101,
    99,
    116,
    111,
    114,
    32,
    115,
    101,
    113,
    117,
    101,
    110,
    116,
    105,
    97,
    108,
    108,
    121,
    34,
    0,
    73,
    110,
    100,
    101,
    120,
    40,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    43,
    49,
    93,
    41,
    32,
    61,
    61,
    32,
    109,
    95,
    100,
    97,
    116,
    97,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    73,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    111,
    114,
    100,
    101,
    114,
    101,
    100,
    32,
    105,
    110,
    115,
    101,
    114,
    116,
    105,
    111,
    110,
    32,
    40,
    105,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    111,
    117,
    116,
    101,
    114,
    32,
    105,
    110,
    100,
    101,
    120,
    41,
    34,
    0,
    105,
    110,
    115,
    101,
    114,
    116,
    66,
    97,
    99,
    107,
    66,
    121,
    79,
    117,
    116,
    101,
    114,
    73,
    110,
    110,
    101,
    114,
    0,
    40,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    43,
    49,
    93,
    45,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    93,
    61,
    61,
    48,
    32,
    124,
    124,
    32,
    109,
    95,
    100,
    97,
    116,
    97,
    46,
    105,
    110,
    100,
    101,
    120,
    40,
    109,
    95,
    100,
    97,
    116,
    97,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    45,
    49,
    41,
    60,
    105,
    110,
    110,
    101,
    114,
    41,
    32,
    38,
    38,
    32,
    34,
    73,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    111,
    114,
    100,
    101,
    114,
    101,
    100,
    32,
    105,
    110,
    115,
    101,
    114,
    116,
    105,
    111,
    110,
    32,
    40,
    105,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    105,
    110,
    110,
    101,
    114,
    32,
    105,
    110,
    100,
    101,
    120,
    41,
    34,
    0,
    105,
    116,
    45,
    62,
    114,
    111,
    119,
    40,
    41,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    105,
    116,
    45,
    62,
    114,
    111,
    119,
    40,
    41,
    60,
    109,
    97,
    116,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    105,
    116,
    45,
    62,
    99,
    111,
    108,
    40,
    41,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    105,
    116,
    45,
    62,
    99,
    111,
    108,
    40,
    41,
    60,
    109,
    97,
    116,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    115,
    101,
    116,
    95,
    102,
    114,
    111,
    109,
    95,
    116,
    114,
    105,
    112,
    108,
    101,
    116,
    115,
    0,
    105,
    110,
    100,
    101,
    120,
    32,
    62,
    61,
    32,
    48,
    32,
    38,
    38,
    32,
    105,
    110,
    100,
    101,
    120,
    32,
    60,
    32,
    115,
    105,
    122,
    101,
    40,
    41,
    0,
    33,
    105,
    115,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    0,
    105,
    110,
    115,
    101,
    114,
    116,
    66,
    97,
    99,
    107,
    85,
    110,
    99,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    0,
    109,
    95,
    105,
    110,
    110,
    101,
    114,
    78,
    111,
    110,
    90,
    101,
    114,
    111,
    115,
    91,
    111,
    117,
    116,
    101,
    114,
    93,
    60,
    61,
    40,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    43,
    49,
    93,
    32,
    45,
    32,
    109,
    95,
    111,
    117,
    116,
    101,
    114,
    73,
    110,
    100,
    101,
    120,
    91,
    111,
    117,
    116,
    101,
    114,
    93,
    41,
    0,
    99,
    111,
    108,
    108,
    97,
    112,
    115,
    101,
    68,
    117,
    112,
    108,
    105,
    99,
    97,
    116,
    101,
    115,
    0,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    79,
    78,
    76,
    89,
    32,
    70,
    79,
    82,
    32,
    83,
    81,
    85,
    65,
    82,
    69,
    68,
    32,
    77,
    65,
    84,
    82,
    73,
    67,
    69,
    83,
    34,
    0,
    115,
    101,
    116,
    73,
    100,
    101,
    110,
    116,
    105,
    116,
    121,
    0,
    114,
    111,
    119,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    115,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    34,
    121,
    111,
    117,
    32,
    97,
    114,
    101,
    32,
    117,
    115,
    105,
    110,
    103,
    32,
    97,
    32,
    110,
    111,
    110,
    32,
    105,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    82,
    101,
    100,
    117,
    120,
    46,
    104,
    0,
    80,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    100,
    69,
    0,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    100,
    69,
    0,
    80,
    50,
    76,
    85,
    73,
    100,
    69,
    0,
    50,
    76,
    85,
    73,
    100,
    69,
    0,
    80,
    50,
    81,
    82,
    73,
    100,
    69,
    0,
    50,
    81,
    82,
    73,
    100,
    69,
    0,
    108,
    104,
    115,
    46,
    111,
    117,
    116,
    101,
    114,
    83,
    105,
    122,
    101,
    40,
    41,
    32,
    61,
    61,
    32,
    114,
    104,
    115,
    46,
    105,
    110,
    110,
    101,
    114,
    83,
    105,
    122,
    101,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    67,
    111,
    110,
    115,
    101,
    114,
    118,
    97,
    116,
    105,
    118,
    101,
    83,
    112,
    97,
    114,
    115,
    101,
    83,
    112,
    97,
    114,
    115,
    101,
    80,
    114,
    111,
    100,
    117,
    99,
    116,
    46,
    104,
    0,
    99,
    111,
    110,
    115,
    101,
    114,
    118,
    97,
    116,
    105,
    118,
    101,
    95,
    115,
    112,
    97,
    114,
    115,
    101,
    95,
    115,
    112,
    97,
    114,
    115,
    101,
    95,
    112,
    114,
    111,
    100,
    117,
    99,
    116,
    95,
    105,
    109,
    112,
    108,
    0,
    120,
    62,
    61,
    48,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    77,
    97,
    116,
    104,
    70,
    117,
    110,
    99,
    116,
    105,
    111,
    110,
    115,
    46,
    104,
    0,
    108,
    111,
    103,
    50,
    0,
    80,
    75,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    100,
    69,
    0,
    97,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    97,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    47,
    83,
    105,
    109,
    112,
    108,
    105,
    99,
    105,
    97,
    108,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    46,
    104,
    0,
    97,
    110,
    97,
    108,
    121,
    122,
    101,
    80,
    97,
    116,
    116,
    101,
    114,
    110,
    0,
    111,
    114,
    100,
    101,
    114,
    105,
    110,
    103,
    0,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    83,
    101,
    108,
    102,
    65,
    100,
    106,
    111,
    105,
    110,
    116,
    86,
    105,
    101,
    119,
    32,
    105,
    115,
    32,
    111,
    110,
    108,
    121,
    32,
    102,
    111,
    114,
    32,
    115,
    113,
    117,
    97,
    114,
    101,
    100,
    32,
    109,
    97,
    116,
    114,
    105,
    99,
    101,
    115,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    83,
    101,
    108,
    102,
    65,
    100,
    106,
    111,
    105,
    110,
    116,
    86,
    105,
    101,
    119,
    46,
    104,
    0,
    83,
    112,
    97,
    114,
    115,
    101,
    83,
    101,
    108,
    102,
    65,
    100,
    106,
    111,
    105,
    110,
    116,
    86,
    105,
    101,
    119,
    0,
    109,
    95,
    105,
    115,
    73,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    38,
    38,
    32,
    34,
    68,
    101,
    99,
    111,
    109,
    112,
    111,
    115,
    105,
    116,
    105,
    111,
    110,
    32,
    105,
    115,
    32,
    110,
    111,
    116,
    32,
    105,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    46,
    34,
    0,
    105,
    110,
    102,
    111,
    0,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    101,
    0,
    109,
    95,
    97,
    110,
    97,
    108,
    121,
    115,
    105,
    115,
    73,
    115,
    79,
    107,
    32,
    38,
    38,
    32,
    34,
    89,
    111,
    117,
    32,
    109,
    117,
    115,
    116,
    32,
    102,
    105,
    114,
    115,
    116,
    32,
    99,
    97,
    108,
    108,
    32,
    97,
    110,
    97,
    108,
    121,
    122,
    101,
    80,
    97,
    116,
    116,
    101,
    114,
    110,
    40,
    41,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    47,
    83,
    105,
    109,
    112,
    108,
    105,
    99,
    105,
    97,
    108,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    95,
    105,
    109,
    112,
    108,
    46,
    104,
    0,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    101,
    95,
    112,
    114,
    101,
    111,
    114,
    100,
    101,
    114,
    101,
    100,
    0,
    97,
    112,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    97,
    112,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    109,
    95,
    112,
    97,
    114,
    101,
    110,
    116,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    61,
    61,
    97,
    112,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    0,
    109,
    95,
    110,
    111,
    110,
    90,
    101,
    114,
    111,
    115,
    80,
    101,
    114,
    67,
    111,
    108,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    61,
    61,
    97,
    112,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    0,
    109,
    95,
    105,
    115,
    73,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    38,
    38,
    32,
    34,
    83,
    111,
    108,
    118,
    101,
    114,
    32,
    105,
    115,
    32,
    110,
    111,
    116,
    32,
    105,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    46,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    83,
    111,
    108,
    118,
    101,
    114,
    66,
    97,
    115,
    101,
    46,
    104,
    0,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    98,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    115,
    111,
    108,
    118,
    101,
    40,
    41,
    58,
    32,
    105,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    110,
    117,
    109,
    98,
    101,
    114,
    32,
    111,
    102,
    32,
    114,
    111,
    119,
    115,
    32,
    111,
    102,
    32,
    116,
    104,
    101,
    32,
    114,
    105,
    103,
    104,
    116,
    32,
    104,
    97,
    110,
    100,
    32,
    115,
    105,
    100,
    101,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    98,
    34,
    0,
    66,
    97,
    115,
    101,
    58,
    58,
    109,
    95,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    97,
    116,
    105,
    111,
    110,
    73,
    115,
    79,
    107,
    32,
    38,
    38,
    32,
    34,
    84,
    104,
    101,
    32,
    100,
    101,
    99,
    111,
    109,
    112,
    111,
    115,
    105,
    116,
    105,
    111,
    110,
    32,
    105,
    115,
    32,
    110,
    111,
    116,
    32,
    105,
    110,
    32,
    97,
    32,
    118,
    97,
    108,
    105,
    100,
    32,
    115,
    116,
    97,
    116,
    101,
    32,
    102,
    111,
    114,
    32,
    115,
    111,
    108,
    118,
    105,
    110,
    103,
    44,
    32,
    121,
    111,
    117,
    32,
    109,
    117,
    115,
    116,
    32,
    102,
    105,
    114,
    115,
    116,
    32,
    99,
    97,
    108,
    108,
    32,
    101,
    105,
    116,
    104,
    101,
    114,
    32,
    99,
    111,
    109,
    112,
    117,
    116,
    101,
    40,
    41,
    32,
    111,
    114,
    32,
    115,
    121,
    109,
    98,
    111,
    108,
    105,
    99,
    40,
    41,
    47,
    110,
    117,
    109,
    101,
    114,
    105,
    99,
    40,
    41,
    34,
    0,
    95,
    115,
    111,
    108,
    118,
    101,
    95,
    105,
    109,
    112,
    108,
    0,
    66,
    97,
    115,
    101,
    58,
    58,
    109,
    95,
    109,
    97,
    116,
    114,
    105,
    120,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    61,
    61,
    98,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    0,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    111,
    116,
    104,
    101,
    114,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    84,
    114,
    105,
    97,
    110,
    103,
    117,
    108,
    97,
    114,
    83,
    111,
    108,
    118,
    101,
    114,
    46,
    104,
    0,
    115,
    111,
    108,
    118,
    101,
    73,
    110,
    80,
    108,
    97,
    99,
    101,
    0,
    105,
    116,
    32,
    38,
    38,
    32,
    105,
    116,
    46,
    105,
    110,
    100,
    101,
    120,
    40,
    41,
    61,
    61,
    105,
    0,
    80,
    75,
    50,
    76,
    85,
    73,
    100,
    69,
    0,
    109,
    97,
    116,
    46,
    105,
    115,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    67,
    79,
    76,
    65,
    77,
    68,
    79,
    114,
    100,
    101,
    114,
    105,
    110,
    103,
    32,
    114,
    101,
    113,
    117,
    105,
    114,
    101,
    115,
    32,
    97,
    32,
    115,
    112,
    97,
    114,
    115,
    101,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    105,
    110,
    32,
    99,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    32,
    109,
    111,
    100,
    101,
    46,
    32,
    67,
    97,
    108,
    108,
    32,
    46,
    109,
    97,
    107,
    101,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    32,
    98,
    101,
    102,
    111,
    114,
    101,
    32,
    112,
    97,
    115,
    115,
    105,
    110,
    103,
    32,
    105,
    116,
    32,
    116,
    111,
    32,
    67,
    79,
    76,
    65,
    77,
    68,
    79,
    114,
    100,
    101,
    114,
    105,
    110,
    103,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    79,
    114,
    100,
    101,
    114,
    105,
    110,
    103,
    77,
    101,
    116,
    104,
    111,
    100,
    115,
    47,
    79,
    114,
    100,
    101,
    114,
    105,
    110,
    103,
    46,
    104,
    0,
    105,
    110,
    102,
    111,
    32,
    38,
    38,
    32,
    34,
    67,
    79,
    76,
    65,
    77,
    68,
    32,
    102,
    97,
    105,
    108,
    101,
    100,
    32,
    34,
    0,
    108,
    104,
    115,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    114,
    104,
    115,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    0,
    97,
    115,
    115,
    105,
    103,
    110,
    80,
    114,
    111,
    100,
    117,
    99,
    116,
    0,
    109,
    95,
    97,
    110,
    97,
    108,
    121,
    115,
    105,
    115,
    73,
    115,
    79,
    107,
    32,
    38,
    38,
    32,
    34,
    97,
    110,
    97,
    108,
    121,
    122,
    101,
    80,
    97,
    116,
    116,
    101,
    114,
    110,
    40,
    41,
    32,
    115,
    104,
    111,
    117,
    108,
    100,
    32,
    98,
    101,
    32,
    99,
    97,
    108,
    108,
    101,
    100,
    32,
    102,
    105,
    114,
    115,
    116,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    76,
    85,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    76,
    85,
    46,
    104,
    0,
    40,
    109,
    97,
    116,
    114,
    105,
    120,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    41,
    32,
    38,
    38,
    32,
    34,
    79,
    110,
    108,
    121,
    32,
    102,
    111,
    114,
    32,
    115,
    113,
    117,
    97,
    114,
    101,
    100,
    32,
    109,
    97,
    116,
    114,
    105,
    99,
    101,
    115,
    34,
    0,
    85,
    78,
    65,
    66,
    76,
    69,
    32,
    84,
    79,
    32,
    65,
    76,
    76,
    79,
    67,
    65,
    84,
    69,
    32,
    87,
    79,
    82,
    75,
    73,
    78,
    71,
    32,
    77,
    69,
    77,
    79,
    82,
    89,
    10,
    10,
    0,
    85,
    78,
    65,
    66,
    76,
    69,
    32,
    84,
    79,
    32,
    69,
    88,
    80,
    65,
    78,
    68,
    32,
    77,
    69,
    77,
    79,
    82,
    89,
    32,
    73,
    78,
    32,
    67,
    79,
    76,
    85,
    77,
    78,
    95,
    68,
    70,
    83,
    40,
    41,
    32,
    0,
    85,
    78,
    65,
    66,
    76,
    69,
    32,
    84,
    79,
    32,
    69,
    88,
    80,
    65,
    78,
    68,
    32,
    77,
    69,
    77,
    79,
    82,
    89,
    32,
    73,
    78,
    32,
    67,
    79,
    76,
    85,
    77,
    78,
    95,
    66,
    77,
    79,
    68,
    40,
    41,
    32,
    0,
    85,
    78,
    65,
    66,
    76,
    69,
    32,
    84,
    79,
    32,
    69,
    88,
    80,
    65,
    78,
    68,
    32,
    77,
    69,
    77,
    79,
    82,
    89,
    32,
    73,
    78,
    32,
    67,
    79,
    80,
    89,
    95,
    84,
    79,
    95,
    85,
    67,
    79,
    76,
    40,
    41,
    32,
    0,
    84,
    72,
    69,
    32,
    77,
    65,
    84,
    82,
    73,
    88,
    32,
    73,
    83,
    32,
    83,
    84,
    82,
    85,
    67,
    84,
    85,
    82,
    65,
    76,
    76,
    89,
    32,
    83,
    73,
    78,
    71,
    85,
    76,
    65,
    82,
    32,
    46,
    46,
    46,
    32,
    90,
    69,
    82,
    79,
    32,
    67,
    79,
    76,
    85,
    77,
    78,
    32,
    65,
    84,
    32,
    0,
    105,
    110,
    110,
    101,
    114,
    83,
    116,
    114,
    105,
    100,
    101,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    111,
    117,
    116,
    101,
    114,
    83,
    116,
    114,
    105,
    100,
    101,
    62,
    61,
    48,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    83,
    116,
    114,
    105,
    100,
    101,
    46,
    104,
    0,
    83,
    116,
    114,
    105,
    100,
    101,
    0,
    116,
    101,
    109,
    112,
    118,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    62,
    119,
    42,
    108,
    100,
    117,
    32,
    43,
    32,
    110,
    114,
    111,
    119,
    42,
    119,
    32,
    43,
    32,
    49,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    76,
    85,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    76,
    85,
    95,
    112,
    97,
    110,
    101,
    108,
    95,
    98,
    109,
    111,
    100,
    46,
    104,
    0,
    112,
    97,
    110,
    101,
    108,
    95,
    98,
    109,
    111,
    100,
    0,
    40,
    32,
    40,
    40,
    105,
    110,
    116,
    101,
    114,
    110,
    97,
    108,
    58,
    58,
    85,
    73,
    110,
    116,
    80,
    116,
    114,
    40,
    109,
    95,
    100,
    97,
    116,
    97,
    41,
    32,
    37,
    32,
    105,
    110,
    116,
    101,
    114,
    110,
    97,
    108,
    58,
    58,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    62,
    58,
    58,
    65,
    108,
    105,
    103,
    110,
    109,
    101,
    110,
    116,
    41,
    32,
    61,
    61,
    32,
    48,
    41,
    32,
    124,
    124,
    32,
    40,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    42,
    32,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    42,
    32,
    105,
    110,
    110,
    101,
    114,
    83,
    116,
    114,
    105,
    100,
    101,
    40,
    41,
    32,
    42,
    32,
    115,
    105,
    122,
    101,
    111,
    102,
    40,
    83,
    99,
    97,
    108,
    97,
    114,
    41,
    41,
    32,
    60,
    32,
    105,
    110,
    116,
    101,
    114,
    110,
    97,
    108,
    58,
    58,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    68,
    101,
    114,
    105,
    118,
    101,
    100,
    62,
    58,
    58,
    65,
    108,
    105,
    103,
    110,
    109,
    101,
    110,
    116,
    32,
    41,
    32,
    38,
    38,
    32,
    34,
    100,
    97,
    116,
    97,
    32,
    105,
    115,
    32,
    110,
    111,
    116,
    32,
    97,
    108,
    105,
    103,
    110,
    101,
    100,
    34,
    0,
    99,
    104,
    101,
    99,
    107,
    83,
    97,
    110,
    105,
    116,
    121,
    0,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    40,
    40,
    83,
    105,
    100,
    101,
    61,
    61,
    79,
    110,
    84,
    104,
    101,
    76,
    101,
    102,
    116,
    32,
    38,
    38,
    32,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    111,
    116,
    104,
    101,
    114,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    41,
    32,
    124,
    124,
    32,
    40,
    83,
    105,
    100,
    101,
    61,
    61,
    79,
    110,
    84,
    104,
    101,
    82,
    105,
    103,
    104,
    116,
    32,
    38,
    38,
    32,
    100,
    101,
    114,
    105,
    118,
    101,
    100,
    40,
    41,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    111,
    116,
    104,
    101,
    114,
    46,
    99,
    111,
    108,
    115,
    40,
    41,
    41,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    67,
    111,
    114,
    101,
    47,
    83,
    111,
    108,
    118,
    101,
    84,
    114,
    105,
    97,
    110,
    103,
    117,
    108,
    97,
    114,
    46,
    104,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    57,
    98,
    97,
    115,
    105,
    99,
    95,
    111,
    115,
    116,
    114,
    105,
    110,
    103,
    115,
    116,
    114,
    101,
    97,
    109,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    78,
    83,
    95,
    57,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    53,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    98,
    117,
    102,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    78,
    83,
    95,
    57,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    109,
    95,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    97,
    116,
    105,
    111,
    110,
    73,
    115,
    79,
    107,
    32,
    38,
    38,
    32,
    34,
    84,
    104,
    101,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    115,
    104,
    111,
    117,
    108,
    100,
    32,
    98,
    101,
    32,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    101,
    100,
    32,
    102,
    105,
    114,
    115,
    116,
    34,
    0,
    80,
    75,
    50,
    81,
    82,
    73,
    100,
    69,
    0,
    109,
    97,
    116,
    46,
    105,
    115,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    83,
    112,
    97,
    114,
    115,
    101,
    81,
    82,
    32,
    114,
    101,
    113,
    117,
    105,
    114,
    101,
    115,
    32,
    97,
    32,
    115,
    112,
    97,
    114,
    115,
    101,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    32,
    105,
    110,
    32,
    99,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    32,
    109,
    111,
    100,
    101,
    46,
    32,
    67,
    97,
    108,
    108,
    32,
    46,
    109,
    97,
    107,
    101,
    67,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    40,
    41,
    32,
    98,
    101,
    102,
    111,
    114,
    101,
    32,
    112,
    97,
    115,
    115,
    105,
    110,
    103,
    32,
    105,
    116,
    32,
    116,
    111,
    32,
    83,
    112,
    97,
    114,
    115,
    101,
    81,
    82,
    34,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    81,
    82,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    81,
    82,
    46,
    104,
    0,
    109,
    95,
    97,
    110,
    97,
    108,
    121,
    115,
    105,
    115,
    73,
    115,
    111,
    107,
    32,
    38,
    38,
    32,
    34,
    97,
    110,
    97,
    108,
    121,
    122,
    101,
    80,
    97,
    116,
    116,
    101,
    114,
    110,
    40,
    41,
    32,
    115,
    104,
    111,
    117,
    108,
    100,
    32,
    98,
    101,
    32,
    99,
    97,
    108,
    108,
    101,
    100,
    32,
    98,
    101,
    102,
    111,
    114,
    101,
    32,
    116,
    104,
    105,
    115,
    32,
    115,
    116,
    101,
    112,
    34,
    0,
    69,
    109,
    112,
    116,
    121,
    32,
    114,
    111,
    119,
    32,
    102,
    111,
    117,
    110,
    100,
    32,
    100,
    117,
    114,
    105,
    110,
    103,
    32,
    110,
    117,
    109,
    101,
    114,
    105,
    99,
    97,
    108,
    32,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    97,
    116,
    105,
    111,
    110,
    0,
    115,
    105,
    122,
    101,
    40,
    41,
    32,
    61,
    61,
    32,
    111,
    116,
    104,
    101,
  ],
  'i8',
  ALLOC_NONE,
  Runtime.GLOBAL_BASE + 10240
);
allocate(
  [
    114,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    0,
    47,
    117,
    115,
    114,
    47,
    108,
    111,
    99,
    97,
    108,
    47,
    67,
    101,
    108,
    108,
    97,
    114,
    47,
    101,
    105,
    103,
    101,
    110,
    47,
    51,
    46,
    51,
    46,
    52,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    101,
    105,
    103,
    101,
    110,
    51,
    47,
    69,
    105,
    103,
    101,
    110,
    47,
    115,
    114,
    99,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    67,
    111,
    114,
    101,
    47,
    83,
    112,
    97,
    114,
    115,
    101,
    68,
    111,
    116,
    46,
    104,
    0,
    100,
    111,
    116,
    0,
    111,
    116,
    104,
    101,
    114,
    46,
    115,
    105,
    122,
    101,
    40,
    41,
    62,
    48,
    32,
    38,
    38,
    32,
    34,
    121,
    111,
    117,
    32,
    97,
    114,
    101,
    32,
    117,
    115,
    105,
    110,
    103,
    32,
    97,
    32,
    110,
    111,
    110,
    32,
    105,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    118,
    101,
    99,
    116,
    111,
    114,
    34,
    0,
    114,
    111,
    119,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    114,
    111,
    119,
    60,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    62,
    61,
    48,
    32,
    38,
    38,
    32,
    99,
    111,
    108,
    60,
    99,
    111,
    108,
    115,
    40,
    41,
    0,
    105,
    110,
    115,
    101,
    114,
    116,
    0,
    105,
    110,
    115,
    101,
    114,
    116,
    85,
    110,
    99,
    111,
    109,
    112,
    114,
    101,
    115,
    115,
    101,
    100,
    0,
    40,
    112,
    60,
    61,
    115,
    116,
    97,
    114,
    116,
    73,
    100,
    32,
    124,
    124,
    32,
    109,
    95,
    100,
    97,
    116,
    97,
    46,
    105,
    110,
    100,
    101,
    120,
    40,
    112,
    45,
    49,
    41,
    33,
    61,
    105,
    110,
    110,
    101,
    114,
    41,
    32,
    38,
    38,
    32,
    34,
    121,
    111,
    117,
    32,
    99,
    97,
    110,
    110,
    111,
    116,
    32,
    105,
    110,
    115,
    101,
    114,
    116,
    32,
    97,
    110,
    32,
    101,
    108,
    101,
    109,
    101,
    110,
    116,
    32,
    116,
    104,
    97,
    116,
    32,
    97,
    108,
    114,
    101,
    97,
    100,
    121,
    32,
    101,
    120,
    105,
    115,
    116,
    115,
    44,
    32,
    121,
    111,
    117,
    32,
    109,
    117,
    115,
    116,
    32,
    99,
    97,
    108,
    108,
    32,
    99,
    111,
    101,
    102,
    102,
    82,
    101,
    102,
    32,
    116,
    111,
    32,
    116,
    104,
    105,
    115,
    32,
    101,
    110,
    100,
    34,
    0,
    109,
    95,
    105,
    115,
    73,
    110,
    105,
    116,
    105,
    97,
    108,
    105,
    122,
    101,
    100,
    32,
    38,
    38,
    32,
    34,
    84,
    104,
    101,
    32,
    102,
    97,
    99,
    116,
    111,
    114,
    105,
    122,
    97,
    116,
    105,
    111,
    110,
    32,
    115,
    104,
    111,
    117,
    108,
    100,
    32,
    98,
    101,
    32,
    99,
    97,
    108,
    108,
    101,
    100,
    32,
    102,
    105,
    114,
    115,
    116,
    44,
    32,
    117,
    115,
    101,
    32,
    99,
    111,
    109,
    112,
    117,
    116,
    101,
    40,
    41,
    34,
    0,
    116,
    104,
    105,
    115,
    45,
    62,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    66,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    83,
    112,
    97,
    114,
    115,
    101,
    81,
    82,
    58,
    58,
    115,
    111,
    108,
    118,
    101,
    40,
    41,
    32,
    58,
    32,
    105,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    110,
    117,
    109,
    98,
    101,
    114,
    32,
    111,
    102,
    32,
    114,
    111,
    119,
    115,
    32,
    105,
    110,
    32,
    116,
    104,
    101,
    32,
    114,
    105,
    103,
    104,
    116,
    32,
    104,
    97,
    110,
    100,
    32,
    115,
    105,
    100,
    101,
    32,
    109,
    97,
    116,
    114,
    105,
    120,
    34,
    0,
    109,
    95,
    113,
    114,
    46,
    109,
    95,
    81,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    61,
    61,
    32,
    109,
    95,
    111,
    116,
    104,
    101,
    114,
    46,
    114,
    111,
    119,
    115,
    40,
    41,
    32,
    38,
    38,
    32,
    34,
    78,
    111,
    110,
    32,
    99,
    111,
    110,
    102,
    111,
    114,
    109,
    105,
    110,
    103,
    32,
    111,
    98,
    106,
    101,
    99,
    116,
    32,
    115,
    105,
    122,
    101,
    115,
    34,
    0,
    101,
    118,
    97,
    108,
    84,
    111,
    0,
    99,
    111,
    108,
    115,
    80,
    101,
    114,
    109,
    117,
    116,
    97,
    116,
    105,
    111,
    110,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    0,
    80,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    0,
    80,
    75,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    0,
    105,
    105,
    100,
    100,
    0,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    49,
    49,
    68,
    101,
    110,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    105,
    105,
    105,
    105,
    105,
    0,
    118,
    105,
    105,
    105,
    105,
    105,
    0,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    55,
    84,
    114,
    105,
    112,
    108,
    101,
    116,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    49,
    50,
    83,
    112,
    97,
    114,
    115,
    101,
    77,
    97,
    116,
    114,
    105,
    120,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    50,
    76,
    85,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    50,
    76,
    85,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    50,
    81,
    82,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    50,
    81,
    82,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    56,
    67,
    104,
    111,
    108,
    101,
    115,
    107,
    121,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    50,
    76,
    85,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    80,
    75,
    50,
    81,
    82,
    73,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    73,
    100,
    69,
    69,
    69,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    60,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    99,
    104,
    97,
    114,
    62,
    0,
    115,
    116,
    100,
    58,
    58,
    119,
    115,
    116,
    114,
    105,
    110,
    103,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    118,
    97,
    108,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    99,
    104,
    97,
    114,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    99,
    104,
    97,
    114,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    99,
    104,
    97,
    114,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    115,
    104,
    111,
    114,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    115,
    104,
    111,
    114,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    105,
    110,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    105,
    110,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    108,
    111,
    110,
    103,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    108,
    111,
    110,
    103,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    105,
    110,
    116,
    56,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    105,
    110,
    116,
    56,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    105,
    110,
    116,
    49,
    54,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    105,
    110,
    116,
    49,
    54,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    105,
    110,
    116,
    51,
    50,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    117,
    105,
    110,
    116,
    51,
    50,
    95,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    102,
    108,
    111,
    97,
    116,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    100,
    111,
    117,
    98,
    108,
    101,
    62,
    0,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    58,
    58,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    60,
    108,
    111,
    110,
    103,
    32,
    100,
    111,
    117,
    98,
    108,
    101,
    62,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    101,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    100,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    102,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    109,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    108,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    106,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    105,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    116,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    115,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    104,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    97,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    49,
    49,
    109,
    101,
    109,
    111,
    114,
    121,
    95,
    118,
    105,
    101,
    119,
    73,
    99,
    69,
    69,
    0,
    78,
    49,
    48,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    51,
    118,
    97,
    108,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    50,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    78,
    83,
    95,
    57,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    73,
    119,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    50,
    49,
    95,
    95,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    95,
    99,
    111,
    109,
    109,
    111,
    110,
    73,
    76,
    98,
    49,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    50,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    73,
    104,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    104,
    69,
    69,
    78,
    83,
    95,
    57,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    73,
    104,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    50,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    78,
    83,
    95,
    57,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    255,
    255,
    255,
    255,
    255,
    255,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    0,
    1,
    2,
    4,
    7,
    3,
    6,
    5,
    0,
    17,
    0,
    10,
    0,
    17,
    17,
    17,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    15,
    10,
    17,
    17,
    17,
    3,
    10,
    7,
    0,
    1,
    19,
    9,
    11,
    11,
    0,
    0,
    9,
    6,
    11,
    0,
    0,
    11,
    0,
    6,
    17,
    0,
    0,
    0,
    17,
    17,
    17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    10,
    10,
    17,
    17,
    17,
    0,
    10,
    0,
    0,
    2,
    0,
    9,
    11,
    0,
    0,
    0,
    9,
    0,
    11,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    9,
    12,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    14,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    4,
    13,
    0,
    0,
    0,
    0,
    9,
    14,
    0,
    0,
    0,
    0,
    0,
    14,
    0,
    0,
    14,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    9,
    16,
    0,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    16,
    0,
    0,
    18,
    0,
    0,
    0,
    18,
    18,
    18,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    18,
    18,
    18,
    0,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    0,
    9,
    11,
    0,
    0,
    0,
    0,
    0,
    11,
    0,
    0,
    11,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    9,
    12,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    12,
    0,
    0,
    45,
    43,
    32,
    32,
    32,
    48,
    88,
    48,
    120,
    0,
    40,
    110,
    117,
    108,
    108,
    41,
    0,
    45,
    48,
    88,
    43,
    48,
    88,
    32,
    48,
    88,
    45,
    48,
    120,
    43,
    48,
    120,
    32,
    48,
    120,
    0,
    105,
    110,
    102,
    0,
    73,
    78,
    70,
    0,
    78,
    65,
    78,
    0,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    65,
    66,
    67,
    68,
    69,
    70,
    84,
    33,
    34,
    25,
    13,
    1,
    2,
    3,
    17,
    75,
    28,
    12,
    16,
    4,
    11,
    29,
    18,
    30,
    39,
    104,
    110,
    111,
    112,
    113,
    98,
    32,
    5,
    6,
    15,
    19,
    20,
    21,
    26,
    8,
    22,
    7,
    40,
    36,
    23,
    24,
    9,
    10,
    14,
    27,
    31,
    37,
    35,
    131,
    130,
    125,
    38,
    42,
    43,
    60,
    61,
    62,
    63,
    67,
    71,
    74,
    77,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    99,
    100,
    101,
    102,
    103,
    105,
    106,
    107,
    108,
    114,
    115,
    116,
    121,
    122,
    123,
    124,
    0,
    73,
    108,
    108,
    101,
    103,
    97,
    108,
    32,
    98,
    121,
    116,
    101,
    32,
    115,
    101,
    113,
    117,
    101,
    110,
    99,
    101,
    0,
    68,
    111,
    109,
    97,
    105,
    110,
    32,
    101,
    114,
    114,
    111,
    114,
    0,
    82,
    101,
    115,
    117,
    108,
    116,
    32,
    110,
    111,
    116,
    32,
    114,
    101,
    112,
    114,
    101,
    115,
    101,
    110,
    116,
    97,
    98,
    108,
    101,
    0,
    78,
    111,
    116,
    32,
    97,
    32,
    116,
    116,
    121,
    0,
    80,
    101,
    114,
    109,
    105,
    115,
    115,
    105,
    111,
    110,
    32,
    100,
    101,
    110,
    105,
    101,
    100,
    0,
    79,
    112,
    101,
    114,
    97,
    116,
    105,
    111,
    110,
    32,
    110,
    111,
    116,
    32,
    112,
    101,
    114,
    109,
    105,
    116,
    116,
    101,
    100,
    0,
    78,
    111,
    32,
    115,
    117,
    99,
    104,
    32,
    102,
    105,
    108,
    101,
    32,
    111,
    114,
    32,
    100,
    105,
    114,
    101,
    99,
    116,
    111,
    114,
    121,
    0,
    78,
    111,
    32,
    115,
    117,
    99,
    104,
    32,
    112,
    114,
    111,
    99,
    101,
    115,
    115,
    0,
    70,
    105,
    108,
    101,
    32,
    101,
    120,
    105,
    115,
    116,
    115,
    0,
    86,
    97,
    108,
    117,
    101,
    32,
    116,
    111,
    111,
    32,
    108,
    97,
    114,
    103,
    101,
    32,
    102,
    111,
    114,
    32,
    100,
    97,
    116,
    97,
    32,
    116,
    121,
    112,
    101,
    0,
    78,
    111,
    32,
    115,
    112,
    97,
    99,
    101,
    32,
    108,
    101,
    102,
    116,
    32,
    111,
    110,
    32,
    100,
    101,
    118,
    105,
    99,
    101,
    0,
    79,
    117,
    116,
    32,
    111,
    102,
    32,
    109,
    101,
    109,
    111,
    114,
    121,
    0,
    82,
    101,
    115,
    111,
    117,
    114,
    99,
    101,
    32,
    98,
    117,
    115,
    121,
    0,
    73,
    110,
    116,
    101,
    114,
    114,
    117,
    112,
    116,
    101,
    100,
    32,
    115,
    121,
    115,
    116,
    101,
    109,
    32,
    99,
    97,
    108,
    108,
    0,
    82,
    101,
    115,
    111,
    117,
    114,
    99,
    101,
    32,
    116,
    101,
    109,
    112,
    111,
    114,
    97,
    114,
    105,
    108,
    121,
    32,
    117,
    110,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    73,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    115,
    101,
    101,
    107,
    0,
    67,
    114,
    111,
    115,
    115,
    45,
    100,
    101,
    118,
    105,
    99,
    101,
    32,
    108,
    105,
    110,
    107,
    0,
    82,
    101,
    97,
    100,
    45,
    111,
    110,
    108,
    121,
    32,
    102,
    105,
    108,
    101,
    32,
    115,
    121,
    115,
    116,
    101,
    109,
    0,
    68,
    105,
    114,
    101,
    99,
    116,
    111,
    114,
    121,
    32,
    110,
    111,
    116,
    32,
    101,
    109,
    112,
    116,
    121,
    0,
    67,
    111,
    110,
    110,
    101,
    99,
    116,
    105,
    111,
    110,
    32,
    114,
    101,
    115,
    101,
    116,
    32,
    98,
    121,
    32,
    112,
    101,
    101,
    114,
    0,
    79,
    112,
    101,
    114,
    97,
    116,
    105,
    111,
    110,
    32,
    116,
    105,
    109,
    101,
    100,
    32,
    111,
    117,
    116,
    0,
    67,
    111,
    110,
    110,
    101,
    99,
    116,
    105,
    111,
    110,
    32,
    114,
    101,
    102,
    117,
    115,
    101,
    100,
    0,
    72,
    111,
    115,
    116,
    32,
    105,
    115,
    32,
    100,
    111,
    119,
    110,
    0,
    72,
    111,
    115,
    116,
    32,
    105,
    115,
    32,
    117,
    110,
    114,
    101,
    97,
    99,
    104,
    97,
    98,
    108,
    101,
    0,
    65,
    100,
    100,
    114,
    101,
    115,
    115,
    32,
    105,
    110,
    32,
    117,
    115,
    101,
    0,
    66,
    114,
    111,
    107,
    101,
    110,
    32,
    112,
    105,
    112,
    101,
    0,
    73,
    47,
    79,
    32,
    101,
    114,
    114,
    111,
    114,
    0,
    78,
    111,
    32,
    115,
    117,
    99,
    104,
    32,
    100,
    101,
    118,
    105,
    99,
    101,
    32,
    111,
    114,
    32,
    97,
    100,
    100,
    114,
    101,
    115,
    115,
    0,
    66,
    108,
    111,
    99,
    107,
    32,
    100,
    101,
    118,
    105,
    99,
    101,
    32,
    114,
    101,
    113,
    117,
    105,
    114,
    101,
    100,
    0,
    78,
    111,
    32,
    115,
    117,
    99,
    104,
    32,
    100,
    101,
    118,
    105,
    99,
    101,
    0,
    78,
    111,
    116,
    32,
    97,
    32,
    100,
    105,
    114,
    101,
    99,
    116,
    111,
    114,
    121,
    0,
    73,
    115,
    32,
    97,
    32,
    100,
    105,
    114,
    101,
    99,
    116,
    111,
    114,
    121,
    0,
    84,
    101,
    120,
    116,
    32,
    102,
    105,
    108,
    101,
    32,
    98,
    117,
    115,
    121,
    0,
    69,
    120,
    101,
    99,
    32,
    102,
    111,
    114,
    109,
    97,
    116,
    32,
    101,
    114,
    114,
    111,
    114,
    0,
    73,
    110,
    118,
    97,
    108,
    105,
    100,
    32,
    97,
    114,
    103,
    117,
    109,
    101,
    110,
    116,
    0,
    65,
    114,
    103,
    117,
    109,
    101,
    110,
    116,
    32,
    108,
    105,
    115,
    116,
    32,
    116,
    111,
    111,
    32,
    108,
    111,
    110,
    103,
    0,
    83,
    121,
    109,
    98,
    111,
    108,
    105,
    99,
    32,
    108,
    105,
    110,
    107,
    32,
    108,
    111,
    111,
    112,
    0,
    70,
    105,
    108,
    101,
    110,
    97,
    109,
    101,
    32,
    116,
    111,
    111,
    32,
    108,
    111,
    110,
    103,
    0,
    84,
    111,
    111,
    32,
    109,
    97,
    110,
    121,
    32,
    111,
    112,
    101,
    110,
    32,
    102,
    105,
    108,
    101,
    115,
    32,
    105,
    110,
    32,
    115,
    121,
    115,
    116,
    101,
    109,
    0,
    78,
    111,
    32,
    102,
    105,
    108,
    101,
    32,
    100,
    101,
    115,
    99,
    114,
    105,
    112,
    116,
    111,
    114,
    115,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    66,
    97,
    100,
    32,
    102,
    105,
    108,
    101,
    32,
    100,
    101,
    115,
    99,
    114,
    105,
    112,
    116,
    111,
    114,
    0,
    78,
    111,
    32,
    99,
    104,
    105,
    108,
    100,
    32,
    112,
    114,
    111,
    99,
    101,
    115,
    115,
    0,
    66,
    97,
    100,
    32,
    97,
    100,
    100,
    114,
    101,
    115,
    115,
    0,
    70,
    105,
    108,
    101,
    32,
    116,
    111,
    111,
    32,
    108,
    97,
    114,
    103,
    101,
    0,
    84,
    111,
    111,
    32,
    109,
    97,
    110,
    121,
    32,
    108,
    105,
    110,
    107,
    115,
    0,
    78,
    111,
    32,
    108,
    111,
    99,
    107,
    115,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    82,
    101,
    115,
    111,
    117,
    114,
    99,
    101,
    32,
    100,
    101,
    97,
    100,
    108,
    111,
    99,
    107,
    32,
    119,
    111,
    117,
    108,
    100,
    32,
    111,
    99,
    99,
    117,
    114,
    0,
    83,
    116,
    97,
    116,
    101,
    32,
    110,
    111,
    116,
    32,
    114,
    101,
    99,
    111,
    118,
    101,
    114,
    97,
    98,
    108,
    101,
    0,
    80,
    114,
    101,
    118,
    105,
    111,
    117,
    115,
    32,
    111,
    119,
    110,
    101,
    114,
    32,
    100,
    105,
    101,
    100,
    0,
    79,
    112,
    101,
    114,
    97,
    116,
    105,
    111,
    110,
    32,
    99,
    97,
    110,
    99,
    101,
    108,
    101,
    100,
    0,
    70,
    117,
    110,
    99,
    116,
    105,
    111,
    110,
    32,
    110,
    111,
    116,
    32,
    105,
    109,
    112,
    108,
    101,
    109,
    101,
    110,
    116,
    101,
    100,
    0,
    78,
    111,
    32,
    109,
    101,
    115,
    115,
    97,
    103,
    101,
    32,
    111,
    102,
    32,
    100,
    101,
    115,
    105,
    114,
    101,
    100,
    32,
    116,
    121,
    112,
    101,
    0,
    73,
    100,
    101,
    110,
    116,
    105,
    102,
    105,
    101,
    114,
    32,
    114,
    101,
    109,
    111,
    118,
    101,
    100,
    0,
    68,
    101,
    118,
    105,
    99,
    101,
    32,
    110,
    111,
    116,
    32,
    97,
    32,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    78,
    111,
    32,
    100,
    97,
    116,
    97,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    68,
    101,
    118,
    105,
    99,
    101,
    32,
    116,
    105,
    109,
    101,
    111,
    117,
    116,
    0,
    79,
    117,
    116,
    32,
    111,
    102,
    32,
    115,
    116,
    114,
    101,
    97,
    109,
    115,
    32,
    114,
    101,
    115,
    111,
    117,
    114,
    99,
    101,
    115,
    0,
    76,
    105,
    110,
    107,
    32,
    104,
    97,
    115,
    32,
    98,
    101,
    101,
    110,
    32,
    115,
    101,
    118,
    101,
    114,
    101,
    100,
    0,
    80,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    32,
    101,
    114,
    114,
    111,
    114,
    0,
    66,
    97,
    100,
    32,
    109,
    101,
    115,
    115,
    97,
    103,
    101,
    0,
    70,
    105,
    108,
    101,
    32,
    100,
    101,
    115,
    99,
    114,
    105,
    112,
    116,
    111,
    114,
    32,
    105,
    110,
    32,
    98,
    97,
    100,
    32,
    115,
    116,
    97,
    116,
    101,
    0,
    78,
    111,
    116,
    32,
    97,
    32,
    115,
    111,
    99,
    107,
    101,
    116,
    0,
    68,
    101,
    115,
    116,
    105,
    110,
    97,
    116,
    105,
    111,
    110,
    32,
    97,
    100,
    100,
    114,
    101,
    115,
    115,
    32,
    114,
    101,
    113,
    117,
    105,
    114,
    101,
    100,
    0,
    77,
    101,
    115,
    115,
    97,
    103,
    101,
    32,
    116,
    111,
    111,
    32,
    108,
    97,
    114,
    103,
    101,
    0,
    80,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    32,
    119,
    114,
    111,
    110,
    103,
    32,
    116,
    121,
    112,
    101,
    32,
    102,
    111,
    114,
    32,
    115,
    111,
    99,
    107,
    101,
    116,
    0,
    80,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    32,
    110,
    111,
    116,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    80,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    32,
    110,
    111,
    116,
    32,
    115,
    117,
    112,
    112,
    111,
    114,
    116,
    101,
    100,
    0,
    83,
    111,
    99,
    107,
    101,
    116,
    32,
    116,
    121,
    112,
    101,
    32,
    110,
    111,
    116,
    32,
    115,
    117,
    112,
    112,
    111,
    114,
    116,
    101,
    100,
    0,
    78,
    111,
    116,
    32,
    115,
    117,
    112,
    112,
    111,
    114,
    116,
    101,
    100,
    0,
    80,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    32,
    102,
    97,
    109,
    105,
    108,
    121,
    32,
    110,
    111,
    116,
    32,
    115,
    117,
    112,
    112,
    111,
    114,
    116,
    101,
    100,
    0,
    65,
    100,
    100,
    114,
    101,
    115,
    115,
    32,
    102,
    97,
    109,
    105,
    108,
    121,
    32,
    110,
    111,
    116,
    32,
    115,
    117,
    112,
    112,
    111,
    114,
    116,
    101,
    100,
    32,
    98,
    121,
    32,
    112,
    114,
    111,
    116,
    111,
    99,
    111,
    108,
    0,
    65,
    100,
    100,
    114,
    101,
    115,
    115,
    32,
    110,
    111,
    116,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    78,
    101,
    116,
    119,
    111,
    114,
    107,
    32,
    105,
    115,
    32,
    100,
    111,
    119,
    110,
    0,
    78,
    101,
    116,
    119,
    111,
    114,
    107,
    32,
    117,
    110,
    114,
    101,
    97,
    99,
    104,
    97,
    98,
    108,
    101,
    0,
    67,
    111,
    110,
    110,
    101,
    99,
    116,
    105,
    111,
    110,
    32,
    114,
    101,
    115,
    101,
    116,
    32,
    98,
    121,
    32,
    110,
    101,
    116,
    119,
    111,
    114,
    107,
    0,
    67,
    111,
    110,
    110,
    101,
    99,
    116,
    105,
    111,
    110,
    32,
    97,
    98,
    111,
    114,
    116,
    101,
    100,
    0,
    78,
    111,
    32,
    98,
    117,
    102,
    102,
    101,
    114,
    32,
    115,
    112,
    97,
    99,
    101,
    32,
    97,
    118,
    97,
    105,
    108,
    97,
    98,
    108,
    101,
    0,
    83,
    111,
    99,
    107,
    101,
    116,
    32,
    105,
    115,
    32,
    99,
    111,
    110,
    110,
    101,
    99,
    116,
    101,
    100,
    0,
    83,
    111,
    99,
    107,
    101,
    116,
    32,
    110,
    111,
    116,
    32,
    99,
    111,
    110,
    110,
    101,
    99,
    116,
    101,
    100,
    0,
    67,
    97,
    110,
    110,
    111,
    116,
    32,
    115,
    101,
    110,
    100,
    32,
    97,
    102,
    116,
    101,
    114,
    32,
    115,
    111,
    99,
    107,
    101,
    116,
    32,
    115,
    104,
    117,
    116,
    100,
    111,
    119,
    110,
    0,
    79,
    112,
    101,
    114,
    97,
    116,
    105,
    111,
    110,
    32,
    97,
    108,
    114,
    101,
    97,
    100,
    121,
    32,
    105,
    110,
    32,
    112,
    114,
    111,
    103,
    114,
    101,
    115,
    115,
    0,
    79,
    112,
    101,
    114,
    97,
    116,
    105,
    111,
    110,
    32,
    105,
    110,
    32,
    112,
    114,
    111,
    103,
    114,
    101,
    115,
    115,
    0,
    83,
    116,
    97,
    108,
    101,
    32,
    102,
    105,
    108,
    101,
    32,
    104,
    97,
    110,
    100,
    108,
    101,
    0,
    82,
    101,
    109,
    111,
    116,
    101,
    32,
    73,
    47,
    79,
    32,
    101,
    114,
    114,
    111,
    114,
    0,
    81,
    117,
    111,
    116,
    97,
    32,
    101,
    120,
    99,
    101,
    101,
    100,
    101,
    100,
    0,
    78,
    111,
    32,
    109,
    101,
    100,
    105,
    117,
    109,
    32,
    102,
    111,
    117,
    110,
    100,
    0,
    87,
    114,
    111,
    110,
    103,
    32,
    109,
    101,
    100,
    105,
    117,
    109,
    32,
    116,
    121,
    112,
    101,
    0,
    78,
    111,
    32,
    101,
    114,
    114,
    111,
    114,
    32,
    105,
    110,
    102,
    111,
    114,
    109,
    97,
    116,
    105,
    111,
    110,
    0,
    0,
    105,
    110,
    102,
    105,
    110,
    105,
    116,
    121,
    0,
    110,
    97,
    110,
    0,
    76,
    67,
    95,
    65,
    76,
    76,
    0,
    76,
    67,
    95,
    67,
    84,
    89,
    80,
    69,
    0,
    0,
    0,
    0,
    76,
    67,
    95,
    78,
    85,
    77,
    69,
    82,
    73,
    67,
    0,
    0,
    76,
    67,
    95,
    84,
    73,
    77,
    69,
    0,
    0,
    0,
    0,
    0,
    76,
    67,
    95,
    67,
    79,
    76,
    76,
    65,
    84,
    69,
    0,
    0,
    76,
    67,
    95,
    77,
    79,
    78,
    69,
    84,
    65,
    82,
    89,
    0,
    76,
    67,
    95,
    77,
    69,
    83,
    83,
    65,
    71,
    69,
    83,
    0,
    76,
    65,
    78,
    71,
    0,
    67,
    46,
    85,
    84,
    70,
    45,
    56,
    0,
    80,
    79,
    83,
    73,
    88,
    0,
    77,
    85,
    83,
    76,
    95,
    76,
    79,
    67,
    80,
    65,
    84,
    72,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    105,
    111,
    115,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    98,
    97,
    115,
    105,
    99,
    95,
    105,
    111,
    115,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    53,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    51,
    98,
    97,
    115,
    105,
    99,
    95,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    108,
    108,
    97,
    116,
    101,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    54,
    108,
    111,
    99,
    97,
    108,
    101,
    53,
    102,
    97,
    99,
    101,
    116,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    108,
    108,
    97,
    116,
    101,
    73,
    119,
    69,
    69,
    0,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    97,
    98,
    99,
    100,
    101,
    102,
    65,
    66,
    67,
    68,
    69,
    70,
    120,
    88,
    43,
    45,
    112,
    80,
    105,
    73,
    110,
    78,
    0,
    37,
    112,
    0,
    67,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    110,
    117,
    109,
    95,
    103,
    101,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    95,
    95,
    110,
    117,
    109,
    95,
    103,
    101,
    116,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    52,
    95,
    95,
    110,
    117,
    109,
    95,
    103,
    101,
    116,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    110,
    117,
    109,
    95,
    103,
    101,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    95,
    95,
    110,
    117,
    109,
    95,
    103,
    101,
    116,
    73,
    119,
    69,
    69,
    0,
    37,
    112,
    0,
    0,
    0,
    0,
    76,
    0,
    37,
    0,
    0,
    0,
    0,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    110,
    117,
    109,
    95,
    112,
    117,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    95,
    95,
    110,
    117,
    109,
    95,
    112,
    117,
    116,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    52,
    95,
    95,
    110,
    117,
    109,
    95,
    112,
    117,
    116,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    110,
    117,
    109,
    95,
    112,
    117,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    95,
    95,
    110,
    117,
    109,
    95,
    112,
    117,
    116,
    73,
    119,
    69,
    69,
    0,
    37,
    72,
    58,
    37,
    77,
    58,
    37,
    83,
    0,
    37,
    109,
    47,
    37,
    100,
    47,
    37,
    121,
    0,
    37,
    73,
    58,
    37,
    77,
    58,
    37,
    83,
    32,
    37,
    112,
    0,
    37,
    97,
    32,
    37,
    98,
    32,
    37,
    100,
    32,
    37,
    72,
    58,
    37,
    77,
    58,
    37,
    83,
    32,
    37,
    89,
    0,
    65,
    77,
    0,
    80,
    77,
    0,
    74,
    97,
    110,
    117,
    97,
    114,
    121,
    0,
    70,
    101,
    98,
    114,
    117,
    97,
    114,
    121,
    0,
    77,
    97,
    114,
    99,
    104,
    0,
    65,
    112,
    114,
    105,
    108,
    0,
    77,
    97,
    121,
    0,
    74,
    117,
    110,
    101,
    0,
    74,
    117,
    108,
    121,
    0,
    65,
    117,
    103,
    117,
    115,
    116,
    0,
    83,
    101,
    112,
    116,
    101,
    109,
    98,
    101,
    114,
    0,
    79,
    99,
    116,
    111,
    98,
    101,
    114,
    0,
    78,
    111,
    118,
    101,
    109,
    98,
    101,
    114,
    0,
    68,
    101,
    99,
    101,
    109,
    98,
    101,
    114,
    0,
    74,
    97,
    110,
    0,
    70,
    101,
    98,
    0,
    77,
    97,
    114,
    0,
    65,
    112,
    114,
    0,
    74,
    117,
    110,
    0,
    74,
    117,
    108,
    0,
    65,
    117,
    103,
    0,
    83,
    101,
    112,
    0,
    79,
    99,
    116,
    0,
    78,
    111,
    118,
    0,
    68,
    101,
    99,
    0,
    83,
    117,
    110,
    100,
    97,
    121,
    0,
    77,
    111,
    110,
    100,
    97,
    121,
    0,
    84,
    117,
    101,
    115,
    100,
    97,
    121,
    0,
    87,
    101,
    100,
    110,
    101,
    115,
    100,
    97,
    121,
    0,
    84,
    104,
    117,
    114,
    115,
    100,
    97,
    121,
    0,
    70,
    114,
    105,
    100,
    97,
    121,
    0,
    83,
    97,
    116,
    117,
    114,
    100,
    97,
    121,
    0,
    83,
    117,
    110,
    0,
    77,
    111,
    110,
    0,
    84,
    117,
    101,
    0,
    87,
    101,
    100,
    0,
    84,
    104,
    117,
    0,
    70,
    114,
    105,
    0,
    83,
    97,
    116,
    0,
    37,
    109,
    47,
    37,
    100,
    47,
    37,
    121,
    37,
    89,
    45,
    37,
    109,
    45,
    37,
    100,
    37,
    73,
    58,
    37,
    77,
    58,
    37,
    83,
    32,
    37,
    112,
    37,
    72,
    58,
    37,
    77,
    37,
    72,
    58,
    37,
    77,
    58,
    37,
    83,
    37,
    72,
    58,
    37,
    77,
    58,
    37,
    83,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    116,
    105,
    109,
    101,
    95,
    103,
    101,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    50,
    48,
    95,
    95,
    116,
    105,
    109,
    101,
    95,
    103,
    101,
    116,
    95,
    99,
    95,
    115,
    116,
    111,
    114,
    97,
    103,
    101,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    116,
    105,
    109,
    101,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    116,
    105,
    109,
    101,
    95,
    103,
    101,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    50,
    48,
    95,
    95,
    116,
    105,
    109,
    101,
    95,
    103,
    101,
    116,
    95,
    99,
    95,
    115,
    116,
    111,
    114,
    97,
    103,
    101,
    73,
    119,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    116,
    105,
    109,
    101,
    95,
    112,
    117,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    95,
    95,
    116,
    105,
    109,
    101,
    95,
    112,
    117,
    116,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    116,
    105,
    109,
    101,
    95,
    112,
    117,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    109,
    111,
    110,
    101,
    121,
    112,
    117,
    110,
    99,
    116,
    73,
    99,
    76,
    98,
    48,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    109,
    111,
    110,
    101,
    121,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    109,
    111,
    110,
    101,
    121,
    112,
    117,
    110,
    99,
    116,
    73,
    99,
    76,
    98,
    49,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    109,
    111,
    110,
    101,
    121,
    112,
    117,
    110,
    99,
    116,
    73,
    119,
    76,
    98,
    48,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    109,
    111,
    110,
    101,
    121,
    112,
    117,
    110,
    99,
    116,
    73,
    119,
    76,
    98,
    49,
    69,
    69,
    69,
    0,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    0,
    37,
    76,
    102,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    109,
    111,
    110,
    101,
    121,
    95,
    103,
    101,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    49,
    95,
    95,
    109,
    111,
    110,
    101,
    121,
    95,
    103,
    101,
    116,
    73,
    99,
    69,
    69,
    0,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    109,
    111,
    110,
    101,
    121,
    95,
    103,
    101,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    49,
    95,
    95,
    109,
    111,
    110,
    101,
    121,
    95,
    103,
    101,
    116,
    73,
    119,
    69,
    69,
    0,
    37,
    46,
    48,
    76,
    102,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    109,
    111,
    110,
    101,
    121,
    95,
    112,
    117,
    116,
    73,
    99,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    99,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    99,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    49,
    95,
    95,
    109,
    111,
    110,
    101,
    121,
    95,
    112,
    117,
    116,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    57,
    109,
    111,
    110,
    101,
    121,
    95,
    112,
    117,
    116,
    73,
    119,
    78,
    83,
    95,
    49,
    57,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    98,
    117,
    102,
    95,
    105,
    116,
    101,
    114,
    97,
    116,
    111,
    114,
    73,
    119,
    78,
    83,
    95,
    49,
    49,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    73,
    119,
    69,
    69,
    69,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    49,
    95,
    95,
    109,
    111,
    110,
    101,
    121,
    95,
    112,
    117,
    116,
    73,
    119,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    109,
    101,
    115,
    115,
    97,
    103,
    101,
    115,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    51,
    109,
    101,
    115,
    115,
    97,
    103,
    101,
    115,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    55,
    95,
    95,
    119,
    105,
    100,
    101,
    110,
    95,
    102,
    114,
    111,
    109,
    95,
    117,
    116,
    102,
    56,
    73,
    76,
    106,
    51,
    50,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    100,
    101,
    99,
    118,
    116,
    73,
    68,
    105,
    99,
    49,
    49,
    95,
    95,
    109,
    98,
    115,
    116,
    97,
    116,
    101,
    95,
    116,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    50,
    99,
    111,
    100,
    101,
    99,
    118,
    116,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    54,
    95,
    95,
    110,
    97,
    114,
    114,
    111,
    119,
    95,
    116,
    111,
    95,
    117,
    116,
    102,
    56,
    73,
    76,
    106,
    51,
    50,
    69,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    109,
    101,
    115,
    115,
    97,
    103,
    101,
    115,
    73,
    119,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    100,
    101,
    99,
    118,
    116,
    73,
    99,
    99,
    49,
    49,
    95,
    95,
    109,
    98,
    115,
    116,
    97,
    116,
    101,
    95,
    116,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    100,
    101,
    99,
    118,
    116,
    73,
    119,
    99,
    49,
    49,
    95,
    95,
    109,
    98,
    115,
    116,
    97,
    116,
    101,
    95,
    116,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    55,
    99,
    111,
    100,
    101,
    99,
    118,
    116,
    73,
    68,
    115,
    99,
    49,
    49,
    95,
    95,
    109,
    98,
    115,
    116,
    97,
    116,
    101,
    95,
    116,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    54,
    108,
    111,
    99,
    97,
    108,
    101,
    53,
    95,
    95,
    105,
    109,
    112,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    53,
    99,
    116,
    121,
    112,
    101,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    48,
    99,
    116,
    121,
    112,
    101,
    95,
    98,
    97,
    115,
    101,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    53,
    99,
    116,
    121,
    112,
    101,
    73,
    119,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    110,
    117,
    109,
    112,
    117,
    110,
    99,
    116,
    73,
    99,
    69,
    69,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    56,
    110,
    117,
    109,
    112,
    117,
    110,
    99,
    116,
    73,
    119,
    69,
    69,
    0,
    33,
    34,
    118,
    101,
    99,
    116,
    111,
    114,
    32,
    108,
    101,
    110,
    103,
    116,
    104,
    95,
    101,
    114,
    114,
    111,
    114,
    34,
    0,
    47,
    85,
    115,
    101,
    114,
    115,
    47,
    114,
    115,
    97,
    119,
    104,
    110,
    101,
    49,
    47,
    68,
    101,
    115,
    107,
    116,
    111,
    112,
    47,
    114,
    101,
    115,
    101,
    97,
    114,
    99,
    104,
    47,
    99,
    111,
    100,
    101,
    47,
    101,
    109,
    115,
    100,
    107,
    45,
    112,
    111,
    114,
    116,
    97,
    98,
    108,
    101,
    47,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    47,
    49,
    46,
    51,
    55,
    46,
    57,
    47,
    115,
    121,
    115,
    116,
    101,
    109,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    108,
    105,
    98,
    99,
    120,
    120,
    47,
    118,
    101,
    99,
    116,
    111,
    114,
    0,
    78,
    83,
    116,
    51,
    95,
    95,
    50,
    49,
    52,
    95,
    95,
    115,
    104,
    97,
    114,
    101,
    100,
    95,
    99,
    111,
    117,
    110,
    116,
    69,
    0,
    33,
    34,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    32,
    108,
    101,
    110,
    103,
    116,
    104,
    95,
    101,
    114,
    114,
    111,
    114,
    34,
    0,
    47,
    85,
    115,
    101,
    114,
    115,
    47,
    114,
    115,
    97,
    119,
    104,
    110,
    101,
    49,
    47,
    68,
    101,
    115,
    107,
    116,
    111,
    112,
    47,
    114,
    101,
    115,
    101,
    97,
    114,
    99,
    104,
    47,
    99,
    111,
    100,
    101,
    47,
    101,
    109,
    115,
    100,
    107,
    45,
    112,
    111,
    114,
    116,
    97,
    98,
    108,
    101,
    47,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    47,
    49,
    46,
    51,
    55,
    46,
    57,
    47,
    115,
    121,
    115,
    116,
    101,
    109,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    108,
    105,
    98,
    99,
    120,
    120,
    47,
    115,
    116,
    114,
    105,
    110,
    103,
    0,
    95,
    95,
    116,
    104,
    114,
    111,
    119,
    95,
    108,
    101,
    110,
    103,
    116,
    104,
    95,
    101,
    114,
    114,
    111,
    114,
    0,
    33,
    34,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    32,
    111,
    117,
    116,
    95,
    111,
    102,
    95,
    114,
    97,
    110,
    103,
    101,
    34,
    0,
    95,
    95,
    116,
    104,
    114,
    111,
    119,
    95,
    111,
    117,
    116,
    95,
    111,
    102,
    95,
    114,
    97,
    110,
    103,
    101,
    0,
    33,
    34,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    60,
    84,
    62,
    58,
    58,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    101,
    58,
    58,
    98,
    97,
    100,
    95,
    97,
    108,
    108,
    111,
    99,
    34,
    0,
    47,
    85,
    115,
    101,
    114,
    115,
    47,
    114,
    115,
    97,
    119,
    104,
    110,
    101,
    49,
    47,
    68,
    101,
    115,
    107,
    116,
    111,
    112,
    47,
    114,
    101,
    115,
    101,
    97,
    114,
    99,
    104,
    47,
    99,
    111,
    100,
    101,
    47,
    101,
    109,
    115,
    100,
    107,
    45,
    112,
    111,
    114,
    116,
    97,
    98,
    108,
    101,
    47,
    101,
    109,
    115,
    99,
    114,
    105,
    112,
    116,
    101,
    110,
    47,
    49,
    46,
    51,
    55,
    46,
    57,
    47,
    115,
    121,
    115,
    116,
    101,
    109,
    47,
    105,
    110,
    99,
    108,
    117,
    100,
    101,
    47,
    108,
    105,
    98,
    99,
    120,
    120,
    47,
    109,
    101,
    109,
    111,
    114,
    121,
    0,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    101,
    0,
    116,
    101,
    114,
    109,
    105,
    110,
    97,
    116,
    105,
    110,
    103,
    32,
    119,
    105,
    116,
    104,
    32,
    37,
    115,
    32,
    101,
    120,
    99,
    101,
    112,
    116,
    105,
    111,
    110,
    32,
    111,
    102,
    32,
    116,
    121,
    112,
    101,
    32,
    37,
    115,
    58,
    32,
    37,
    115,
    0,
    116,
    101,
    114,
    109,
    105,
    110,
    97,
    116,
    105,
    110,
    103,
    32,
    119,
    105,
    116,
    104,
    32,
    37,
    115,
    32,
    101,
    120,
    99,
    101,
    112,
    116,
    105,
    111,
    110,
    32,
    111,
    102,
    32,
    116,
    121,
    112,
    101,
    32,
    37,
    115,
    0,
    116,
    101,
    114,
    109,
    105,
    110,
    97,
    116,
    105,
    110,
    103,
    32,
    119,
    105,
    116,
    104,
    32,
    37,
    115,
    32,
    102,
    111,
    114,
    101,
    105,
    103,
    110,
    32,
    101,
    120,
    99,
    101,
    112,
    116,
    105,
    111,
    110,
    0,
    116,
    101,
    114,
    109,
    105,
    110,
    97,
    116,
    105,
    110,
    103,
    0,
    117,
    110,
    99,
    97,
    117,
    103,
    104,
    116,
    0,
    83,
    116,
    57,
    101,
    120,
    99,
    101,
    112,
    116,
    105,
    111,
    110,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    49,
    54,
    95,
    95,
    115,
    104,
    105,
    109,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    83,
    116,
    57,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    50,
    48,
    95,
    95,
    115,
    105,
    95,
    99,
    108,
    97,
    115,
    115,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    49,
    55,
    95,
    95,
    99,
    108,
    97,
    115,
    115,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    112,
    116,
    104,
    114,
    101,
    97,
    100,
    95,
    111,
    110,
    99,
    101,
    32,
    102,
    97,
    105,
    108,
    117,
    114,
    101,
    32,
    105,
    110,
    32,
    95,
    95,
    99,
    120,
    97,
    95,
    103,
    101,
    116,
    95,
    103,
    108,
    111,
    98,
    97,
    108,
    115,
    95,
    102,
    97,
    115,
    116,
    40,
    41,
    0,
    99,
    97,
    110,
    110,
    111,
    116,
    32,
    99,
    114,
    101,
    97,
    116,
    101,
    32,
    112,
    116,
    104,
    114,
    101,
    97,
    100,
    32,
    107,
    101,
    121,
    32,
    102,
    111,
    114,
    32,
    95,
    95,
    99,
    120,
    97,
    95,
    103,
    101,
    116,
    95,
    103,
    108,
    111,
    98,
    97,
    108,
    115,
    40,
    41,
    0,
    99,
    97,
    110,
    110,
    111,
    116,
    32,
    122,
    101,
    114,
    111,
    32,
    111,
    117,
    116,
    32,
    116,
    104,
    114,
    101,
    97,
    100,
    32,
    118,
    97,
    108,
    117,
    101,
    32,
    102,
    111,
    114,
    32,
    95,
    95,
    99,
    120,
    97,
    95,
    103,
    101,
    116,
    95,
    103,
    108,
    111,
    98,
    97,
    108,
    115,
    40,
    41,
    0,
    116,
    101,
    114,
    109,
    105,
    110,
    97,
    116,
    101,
    95,
    104,
    97,
    110,
    100,
    108,
    101,
    114,
    32,
    117,
    110,
    101,
    120,
    112,
    101,
    99,
    116,
    101,
    100,
    108,
    121,
    32,
    114,
    101,
    116,
    117,
    114,
    110,
    101,
    100,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    100,
    95,
    97,
    108,
    108,
    111,
    99,
    0,
    83,
    116,
    57,
    98,
    97,
    100,
    95,
    97,
    108,
    108,
    111,
    99,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    49,
    57,
    95,
    95,
    112,
    111,
    105,
    110,
    116,
    101,
    114,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    49,
    55,
    95,
    95,
    112,
    98,
    97,
    115,
    101,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    50,
    51,
    95,
    95,
    102,
    117,
    110,
    100,
    97,
    109,
    101,
    110,
    116,
    97,
    108,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    118,
    0,
    68,
    110,
    0,
    98,
    0,
    99,
    0,
    104,
    0,
    97,
    0,
    115,
    0,
    116,
    0,
    105,
    0,
    106,
    0,
    109,
    0,
    102,
    0,
    100,
    0,
    78,
    49,
    48,
    95,
    95,
    99,
    120,
    120,
    97,
    98,
    105,
    118,
    49,
    50,
    49,
    95,
    95,
    118,
    109,
    105,
    95,
    99,
    108,
    97,
    115,
    115,
    95,
    116,
    121,
    112,
    101,
    95,
    105,
    110,
    102,
    111,
    69,
    0,
    32,
    99,
    111,
    110,
    115,
    116,
    0,
    32,
    118,
    111,
    108,
    97,
    116,
    105,
    108,
    101,
    0,
    32,
    114,
    101,
    115,
    116,
    114,
    105,
    99,
    116,
    0,
    32,
    99,
    111,
    109,
    112,
    108,
    101,
    120,
    0,
    32,
    105,
    109,
    97,
    103,
    105,
    110,
    97,
    114,
    121,
    0,
    32,
    91,
    0,
    32,
    40,
    0,
    41,
    0,
    40,
    0,
    38,
    38,
    0,
    111,
    98,
    106,
    99,
    95,
    111,
    98,
    106,
    101,
    99,
    116,
    60,
    0,
    42,
    0,
    38,
    0,
    111,
    98,
    106,
    99,
    112,
    114,
    111,
    116,
    111,
    0,
    32,
    0,
    60,
    0,
    62,
    0,
    32,
    118,
    101,
    99,
    116,
    111,
    114,
    91,
    0,
    93,
    0,
    112,
    105,
    120,
    101,
    108,
    32,
    118,
    101,
    99,
    116,
    111,
    114,
    91,
    0,
    38,
    61,
    0,
    61,
    0,
    44,
    0,
    126,
    0,
    58,
    58,
    0,
    100,
    101,
    108,
    101,
    116,
    101,
    91,
    93,
    32,
    0,
    100,
    101,
    108,
    101,
    116,
    101,
    32,
    0,
    47,
    0,
    47,
    61,
    0,
    94,
    0,
    94,
    61,
    0,
    61,
    61,
    0,
    62,
    61,
    0,
    41,
    91,
    0,
    60,
    61,
    0,
    60,
    60,
    0,
    60,
    60,
    61,
    0,
    45,
    0,
    45,
    61,
    0,
    42,
    61,
    0,
    45,
    45,
    0,
    41,
    45,
    45,
    0,
    33,
    61,
    0,
    33,
    0,
    124,
    124,
    0,
    124,
    0,
    124,
    61,
    0,
    45,
    62,
    42,
    0,
    43,
    0,
    43,
    61,
    0,
    43,
    43,
    0,
    41,
    43,
    43,
    0,
    41,
    32,
    63,
    32,
    40,
    0,
    41,
    32,
    58,
    32,
    40,
    0,
    37,
    0,
    37,
    61,
    0,
    62,
    62,
    0,
    62,
    62,
    61,
    0,
    116,
    104,
    114,
    111,
    119,
    0,
    116,
    104,
    114,
    111,
    119,
    32,
    0,
    116,
    121,
    112,
    101,
    105,
    100,
    40,
    0,
    115,
    105,
    122,
    101,
    111,
    102,
    46,
    46,
    46,
    40,
    0,
    44,
    32,
    0,
    115,
    105,
    122,
    101,
    111,
    102,
    32,
    40,
    0,
    115,
    116,
    97,
    116,
    105,
    99,
    95,
    99,
    97,
    115,
    116,
    60,
    0,
    62,
    40,
    0,
    114,
    101,
    105,
    110,
    116,
    101,
    114,
    112,
    114,
    101,
    116,
    95,
    99,
    97,
    115,
    116,
    60,
    0,
    45,
    62,
    0,
    110,
    111,
    101,
    120,
    99,
    101,
    112,
    116,
    32,
    40,
    0,
    91,
    93,
    32,
    0,
    41,
    32,
    0,
    46,
    0,
    46,
    42,
    0,
    115,
    116,
    100,
    58,
    58,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    38,
    38,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    38,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    38,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    40,
    41,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    44,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    126,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    32,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    32,
    100,
    101,
    108,
    101,
    116,
    101,
    91,
    93,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    42,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    47,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    47,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    94,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    94,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    61,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    62,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    62,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    91,
    93,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    60,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    34,
    34,
    32,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    60,
    60,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    60,
    60,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    60,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    45,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    45,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    42,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    45,
    45,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    32,
    110,
    101,
    119,
    91,
    93,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    33,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    33,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    32,
    110,
    101,
    119,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    124,
    124,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    124,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    124,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    45,
    62,
    42,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    43,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    43,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    43,
    43,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    45,
    62,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    63,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    37,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    37,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    62,
    62,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    62,
    62,
    61,
    0,
    111,
    112,
    101,
    114,
    97,
    116,
    111,
    114,
    32,
    100,
    101,
    108,
    101,
    116,
    101,
    0,
    39,
    117,
    110,
    110,
    97,
    109,
    101,
    100,
    0,
    39,
    108,
    97,
    109,
    98,
    100,
    97,
    39,
    40,
    0,
    115,
    116,
    100,
    58,
    58,
    115,
    116,
    114,
    105,
    110,
    103,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    60,
    99,
    104,
    97,
    114,
    44,
    32,
    115,
    116,
    100,
    58,
    58,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    99,
    104,
    97,
    114,
    62,
    44,
    32,
    115,
    116,
    100,
    58,
    58,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    60,
    99,
    104,
    97,
    114,
    62,
    32,
    62,
    0,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    0,
    115,
    116,
    100,
    58,
    58,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    60,
    99,
    104,
    97,
    114,
    44,
    32,
    115,
    116,
    100,
    58,
    58,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    99,
    104,
    97,
    114,
    62,
    32,
    62,
    0,
    98,
    97,
    115,
    105,
    99,
    95,
    105,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    115,
    116,
    100,
    58,
    58,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    60,
    99,
    104,
    97,
    114,
    44,
    32,
    115,
    116,
    100,
    58,
    58,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    99,
    104,
    97,
    114,
    62,
    32,
    62,
    0,
    98,
    97,
    115,
    105,
    99,
    95,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    115,
    116,
    100,
    58,
    58,
    105,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    105,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    60,
    99,
    104,
    97,
    114,
    44,
    32,
    115,
    116,
    100,
    58,
    58,
    99,
    104,
    97,
    114,
    95,
    116,
    114,
    97,
    105,
    116,
    115,
    60,
    99,
    104,
    97,
    114,
    62,
    32,
    62,
    0,
    98,
    97,
    115,
    105,
    99,
    95,
    105,
    111,
    115,
    116,
    114,
    101,
    97,
    109,
    0,
    100,
    121,
    110,
    97,
    109,
    105,
    99,
    95,
    99,
    97,
    115,
    116,
    60,
    0,
    41,
    40,
    0,
    99,
    111,
    110,
    115,
    116,
    95,
    99,
    97,
    115,
    116,
    60,
    0,
    97,
    108,
    105,
    103,
    110,
    111,
    102,
    32,
    40,
    0,
    102,
    112,
    0,
    119,
    99,
    104,
    97,
    114,
    95,
    116,
    0,
    102,
    97,
    108,
    115,
    101,
    0,
    116,
    114,
    117,
    101,
    0,
    99,
    104,
    97,
    114,
    0,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    99,
    104,
    97,
    114,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    99,
    104,
    97,
    114,
    0,
    115,
    104,
    111,
    114,
    116,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    115,
    104,
    111,
    114,
    116,
    0,
    117,
    0,
    108,
    0,
    117,
    108,
    0,
    108,
    108,
    0,
    117,
    108,
    108,
    0,
    95,
    95,
    105,
    110,
    116,
    49,
    50,
    56,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    95,
    95,
    105,
    110,
    116,
    49,
    50,
    56,
    0,
    37,
    76,
  ],
  'i8',
  ALLOC_NONE,
  Runtime.GLOBAL_BASE + 20480
);
allocate(
  [
    97,
    76,
    0,
    37,
    97,
    0,
    37,
    97,
    102,
    0,
    100,
    101,
    99,
    108,
    116,
    121,
    112,
    101,
    40,
    0,
    115,
    116,
    100,
    58,
    58,
    97,
    108,
    108,
    111,
    99,
    97,
    116,
    111,
    114,
    0,
    115,
    116,
    100,
    58,
    58,
    98,
    97,
    115,
    105,
    99,
    95,
    115,
    116,
    114,
    105,
    110,
    103,
    0,
    58,
    58,
    115,
    116,
    114,
    105,
    110,
    103,
    32,
    108,
    105,
    116,
    101,
    114,
    97,
    108,
    0,
    115,
    116,
    100,
    0,
    95,
    71,
    76,
    79,
    66,
    65,
    76,
    95,
    95,
    78,
    0,
    40,
    97,
    110,
    111,
    110,
    121,
    109,
    111,
    117,
    115,
    32,
    110,
    97,
    109,
    101,
    115,
    112,
    97,
    99,
    101,
    41,
    0,
    32,
    62,
    0,
    84,
    95,
    0,
    105,
    100,
    0,
    58,
    58,
    42,
    0,
    32,
    38,
    0,
    32,
    38,
    38,
    0,
    32,
    91,
    93,
    0,
    118,
    111,
    105,
    100,
    0,
    98,
    111,
    111,
    108,
    0,
    105,
    110,
    116,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    105,
    110,
    116,
    0,
    108,
    111,
    110,
    103,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    108,
    111,
    110,
    103,
    0,
    108,
    111,
    110,
    103,
    32,
    108,
    111,
    110,
    103,
    0,
    102,
    108,
    111,
    97,
    116,
    0,
    108,
    111,
    110,
    103,
    32,
    100,
    111,
    117,
    98,
    108,
    101,
    0,
    95,
    95,
    102,
    108,
    111,
    97,
    116,
    49,
    50,
    56,
    0,
    46,
    46,
    46,
    0,
    100,
    101,
    99,
    105,
    109,
    97,
    108,
    54,
    52,
    0,
    100,
    101,
    99,
    105,
    109,
    97,
    108,
    49,
    50,
    56,
    0,
    100,
    101,
    99,
    105,
    109,
    97,
    108,
    51,
    50,
    0,
    100,
    101,
    99,
    105,
    109,
    97,
    108,
    49,
    54,
    0,
    99,
    104,
    97,
    114,
    51,
    50,
    95,
    116,
    0,
    99,
    104,
    97,
    114,
    49,
    54,
    95,
    116,
    0,
    97,
    117,
    116,
    111,
    0,
    115,
    116,
    100,
    58,
    58,
    110,
    117,
    108,
    108,
    112,
    116,
    114,
    95,
    116,
    0,
    100,
    111,
    117,
    98,
    108,
    101,
    0,
    117,
    110,
    115,
    105,
    103,
    110,
    101,
    100,
    32,
    108,
    111,
    110,
    103,
    32,
    108,
    111,
    110,
    103,
    0,
    95,
    98,
    108,
    111,
    99,
    107,
    95,
    105,
    110,
    118,
    111,
    107,
    101,
    0,
    105,
    110,
    118,
    111,
    99,
    97,
    116,
    105,
    111,
    110,
    32,
    102,
    117,
    110,
    99,
    116,
    105,
    111,
    110,
    32,
    102,
    111,
    114,
    32,
    98,
    108,
    111,
    99,
    107,
    32,
    105,
    110,
    32,
    0,
    118,
    116,
    97,
    98,
    108,
    101,
    32,
    102,
    111,
    114,
    32,
    0,
    86,
    84,
    84,
    32,
    102,
    111,
    114,
    32,
    0,
    116,
    121,
    112,
    101,
    105,
    110,
    102,
    111,
    32,
    102,
    111,
    114,
    32,
    0,
    116,
    121,
    112,
    101,
    105,
    110,
    102,
    111,
    32,
    110,
    97,
    109,
    101,
    32,
    102,
    111,
    114,
    32,
    0,
    99,
    111,
    118,
    97,
    114,
    105,
    97,
    110,
    116,
    32,
    114,
    101,
    116,
    117,
    114,
    110,
    32,
    116,
    104,
    117,
    110,
    107,
    32,
    116,
    111,
    32,
    0,
    99,
    111,
    110,
    115,
    116,
    114,
    117,
    99,
    116,
    105,
    111,
    110,
    32,
    118,
    116,
    97,
    98,
    108,
    101,
    32,
    102,
    111,
    114,
    32,
    0,
    45,
    105,
    110,
    45,
    0,
    118,
    105,
    114,
    116,
    117,
    97,
    108,
    32,
    116,
    104,
    117,
    110,
    107,
    32,
    116,
    111,
    32,
    0,
    110,
    111,
    110,
    45,
    118,
    105,
    114,
    116,
    117,
    97,
    108,
    32,
    116,
    104,
    117,
    110,
    107,
    32,
    116,
    111,
    32,
    0,
    103,
    117,
    97,
    114,
    100,
    32,
    118,
    97,
    114,
    105,
    97,
    98,
    108,
    101,
    32,
    102,
    111,
    114,
    32,
    0,
    114,
    101,
    102,
    101,
    114,
    101,
    110,
    99,
    101,
    32,
    116,
    101,
    109,
    112,
    111,
    114,
    97,
    114,
    121,
    32,
    102,
    111,
    114,
    32,
    0,
  ],
  'i8',
  ALLOC_NONE,
  Runtime.GLOBAL_BASE + 30720
);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
function _atexit(func, arg) {
  __ATEXIT__.unshift({ func: func, arg: arg });
}
function ___cxa_atexit() {
  return _atexit.apply(null, arguments);
}
Module['_i64Subtract'] = _i64Subtract;
function ___assert_fail(condition, filename, line, func) {
  ABORT = true;
  throw (
    'Assertion failed: ' +
    Pointer_stringify(condition) +
    ', at: ' +
    [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] +
    ' at ' +
    stackTrace()
  );
}
function embind_init_charCodes() {
  var codes = new Array(256);
  for (var i = 0; i < 256; ++i) {
    codes[i] = String.fromCharCode(i);
  }
  embind_charCodes = codes;
}
var embind_charCodes = undefined;
function readLatin1String(ptr) {
  var ret = '';
  var c = ptr;
  while (HEAPU8[c]) {
    ret += embind_charCodes[HEAPU8[c++]];
  }
  return ret;
}
var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;
function makeLegalFunctionName(name) {
  if (undefined === name) {
    return '_unknown';
  }
  name = name.replace(/[^a-zA-Z0-9_]/g, '$');
  var f = name.charCodeAt(0);
  if (f >= char_0 && f <= char_9) {
    return '_' + name;
  } else {
    return name;
  }
}
function createNamedFunction(name, body) {
  name = makeLegalFunctionName(name);
  return new Function(
    'body',
    'return function ' + name + '() {\n' + '    "use strict";' + '    return body.apply(this, arguments);\n' + '};\n'
  )(body);
}
function extendError(baseErrorType, errorName) {
  var errorClass = createNamedFunction(errorName, function (message) {
    this.name = errorName;
    this.message = message;
    var stack = new Error(message).stack;
    if (stack !== undefined) {
      this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
    }
  });
  errorClass.prototype = Object.create(baseErrorType.prototype);
  errorClass.prototype.constructor = errorClass;
  errorClass.prototype.toString = function () {
    if (this.message === undefined) {
      return this.name;
    } else {
      return this.name + ': ' + this.message;
    }
  };
  return errorClass;
}
var BindingError = undefined;
function throwBindingError(message) {
  throw new BindingError(message);
}
var InternalError = undefined;
function throwInternalError(message) {
  throw new InternalError(message);
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
  myTypes.forEach(function (type) {
    typeDependencies[type] = dependentTypes;
  });
  function onComplete(typeConverters) {
    var myTypeConverters = getTypeConverters(typeConverters);
    if (myTypeConverters.length !== myTypes.length) {
      throwInternalError('Mismatched type converter count');
    }
    for (var i = 0; i < myTypes.length; ++i) {
      registerType(myTypes[i], myTypeConverters[i]);
    }
  }
  var typeConverters = new Array(dependentTypes.length);
  var unregisteredTypes = [];
  var registered = 0;
  dependentTypes.forEach(function (dt, i) {
    if (registeredTypes.hasOwnProperty(dt)) {
      typeConverters[i] = registeredTypes[dt];
    } else {
      unregisteredTypes.push(dt);
      if (!awaitingDependencies.hasOwnProperty(dt)) {
        awaitingDependencies[dt] = [];
      }
      awaitingDependencies[dt].push(function () {
        typeConverters[i] = registeredTypes[dt];
        ++registered;
        if (registered === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      });
    }
  });
  if (0 === unregisteredTypes.length) {
    onComplete(typeConverters);
  }
}
function registerType(rawType, registeredInstance, options) {
  options = options || {};
  if (!('argPackAdvance' in registeredInstance)) {
    throw new TypeError('registerType registeredInstance requires argPackAdvance');
  }
  var name = registeredInstance.name;
  if (!rawType) {
    throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
  }
  if (registeredTypes.hasOwnProperty(rawType)) {
    if (options.ignoreDuplicateRegistrations) {
      return;
    } else {
      throwBindingError("Cannot register type '" + name + "' twice");
    }
  }
  registeredTypes[rawType] = registeredInstance;
  delete typeDependencies[rawType];
  if (awaitingDependencies.hasOwnProperty(rawType)) {
    var callbacks = awaitingDependencies[rawType];
    delete awaitingDependencies[rawType];
    callbacks.forEach(function (cb) {
      cb();
    });
  }
}
function __embind_register_void(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    isVoid: true,
    name: name,
    argPackAdvance: 0,
    fromWireType: function () {
      return undefined;
    },
    toWireType: function (destructors, o) {
      return undefined;
    },
  });
}
function __ZSt18uncaught_exceptionv() {
  return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
var EXCEPTIONS = {
  last: 0,
  caught: [],
  infos: {},
  deAdjust: function (adjusted) {
    if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
    for (var ptr in EXCEPTIONS.infos) {
      var info = EXCEPTIONS.infos[ptr];
      if (info.adjusted === adjusted) {
        return ptr;
      }
    }
    return adjusted;
  },
  addRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    info.refcount++;
  },
  decRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    assert(info.refcount > 0);
    info.refcount--;
    if (info.refcount === 0 && !info.rethrown) {
      if (info.destructor) {
        Module['dynCall_vi'](info.destructor, ptr);
      }
      delete EXCEPTIONS.infos[ptr];
      ___cxa_free_exception(ptr);
    }
  },
  clearRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    info.refcount = 0;
  },
};
function ___resumeException(ptr) {
  if (!EXCEPTIONS.last) {
    EXCEPTIONS.last = ptr;
  }
  throw (
    ptr +
    ' - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.'
  );
}
function ___cxa_find_matching_catch() {
  var thrown = EXCEPTIONS.last;
  if (!thrown) {
    return (Runtime.setTempRet0(0), 0) | 0;
  }
  var info = EXCEPTIONS.infos[thrown];
  var throwntype = info.type;
  if (!throwntype) {
    return (Runtime.setTempRet0(0), thrown) | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  var pointer = Module['___cxa_is_pointer_type'](throwntype);
  if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
  HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
  thrown = ___cxa_find_matching_catch.buffer;
  for (var i = 0; i < typeArray.length; i++) {
    if (typeArray[i] && Module['___cxa_can_catch'](typeArray[i], throwntype, thrown)) {
      thrown = HEAP32[thrown >> 2];
      info.adjusted = thrown;
      return (Runtime.setTempRet0(typeArray[i]), thrown) | 0;
    }
  }
  thrown = HEAP32[thrown >> 2];
  return (Runtime.setTempRet0(throwntype), thrown) | 0;
}
function ___cxa_throw(ptr, type, destructor) {
  EXCEPTIONS.infos[ptr] = { ptr: ptr, adjusted: ptr, type: type, destructor: destructor, refcount: 0, caught: false, rethrown: false };
  EXCEPTIONS.last = ptr;
  if (!('uncaught_exception' in __ZSt18uncaught_exceptionv)) {
    __ZSt18uncaught_exceptionv.uncaught_exception = 1;
  } else {
    __ZSt18uncaught_exceptionv.uncaught_exception++;
  }
  throw (
    ptr +
    ' - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.'
  );
}
Module['_memset'] = _memset;
function getShiftFromSize(size) {
  switch (size) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError('Unknown type size: ' + size);
  }
}
function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (wt) {
      return !!wt;
    },
    toWireType: function (destructors, o) {
      return o ? trueValue : falseValue;
    },
    argPackAdvance: 8,
    readValueFromPointer: function (pointer) {
      var heap;
      if (size === 1) {
        heap = HEAP8;
      } else if (size === 2) {
        heap = HEAP16;
      } else if (size === 4) {
        heap = HEAP32;
      } else {
        throw new TypeError('Unknown boolean type size: ' + name);
      }
      return this['fromWireType'](heap[pointer >> shift]);
    },
    destructorFunction: null,
  });
}
Module['_pthread_mutex_lock'] = _pthread_mutex_lock;
function __isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
  var sum = 0;
  for (var i = 0; i <= index; sum += array[i++]);
  return sum;
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
  var newDate = new Date(date.getTime());
  while (days > 0) {
    var leap = __isLeapYear(newDate.getFullYear());
    var currentMonth = newDate.getMonth();
    var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
    if (days > daysInCurrentMonth - newDate.getDate()) {
      days -= daysInCurrentMonth - newDate.getDate() + 1;
      newDate.setDate(1);
      if (currentMonth < 11) {
        newDate.setMonth(currentMonth + 1);
      } else {
        newDate.setMonth(0);
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    } else {
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }
  }
  return newDate;
}
function _strftime(s, maxsize, format, tm) {
  var tm_zone = HEAP32[(tm + 40) >> 2];
  var date = {
    tm_sec: HEAP32[tm >> 2],
    tm_min: HEAP32[(tm + 4) >> 2],
    tm_hour: HEAP32[(tm + 8) >> 2],
    tm_mday: HEAP32[(tm + 12) >> 2],
    tm_mon: HEAP32[(tm + 16) >> 2],
    tm_year: HEAP32[(tm + 20) >> 2],
    tm_wday: HEAP32[(tm + 24) >> 2],
    tm_yday: HEAP32[(tm + 28) >> 2],
    tm_isdst: HEAP32[(tm + 32) >> 2],
    tm_gmtoff: HEAP32[(tm + 36) >> 2],
    tm_zone: tm_zone ? Pointer_stringify(tm_zone) : '',
  };
  var pattern = Pointer_stringify(format);
  var EXPANSION_RULES_1 = {
    '%c': '%a %b %d %H:%M:%S %Y',
    '%D': '%m/%d/%y',
    '%F': '%Y-%m-%d',
    '%h': '%b',
    '%r': '%I:%M:%S %p',
    '%R': '%H:%M',
    '%T': '%H:%M:%S',
    '%x': '%m/%d/%y',
    '%X': '%H:%M:%S',
  };
  for (var rule in EXPANSION_RULES_1) {
    pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
  }
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function leadingSomething(value, digits, character) {
    var str = typeof value === 'number' ? value.toString() : value || '';
    while (str.length < digits) {
      str = character[0] + str;
    }
    return str;
  }
  function leadingNulls(value, digits) {
    return leadingSomething(value, digits, '0');
  }
  function compareByDay(date1, date2) {
    function sgn(value) {
      return value < 0 ? -1 : value > 0 ? 1 : 0;
    }
    var compare;
    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
      if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
        compare = sgn(date1.getDate() - date2.getDate());
      }
    }
    return compare;
  }
  function getFirstWeekStartDate(janFourth) {
    switch (janFourth.getDay()) {
      case 0:
        return new Date(janFourth.getFullYear() - 1, 11, 29);
      case 1:
        return janFourth;
      case 2:
        return new Date(janFourth.getFullYear(), 0, 3);
      case 3:
        return new Date(janFourth.getFullYear(), 0, 2);
      case 4:
        return new Date(janFourth.getFullYear(), 0, 1);
      case 5:
        return new Date(janFourth.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(janFourth.getFullYear() - 1, 11, 30);
    }
  }
  function getWeekBasedYear(date) {
    var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
      if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
        return thisDate.getFullYear() + 1;
      } else {
        return thisDate.getFullYear();
      }
    } else {
      return thisDate.getFullYear() - 1;
    }
  }
  var EXPANSION_RULES_2 = {
    '%a': function (date) {
      return WEEKDAYS[date.tm_wday].substring(0, 3);
    },
    '%A': function (date) {
      return WEEKDAYS[date.tm_wday];
    },
    '%b': function (date) {
      return MONTHS[date.tm_mon].substring(0, 3);
    },
    '%B': function (date) {
      return MONTHS[date.tm_mon];
    },
    '%C': function (date) {
      var year = date.tm_year + 1900;
      return leadingNulls((year / 100) | 0, 2);
    },
    '%d': function (date) {
      return leadingNulls(date.tm_mday, 2);
    },
    '%e': function (date) {
      return leadingSomething(date.tm_mday, 2, ' ');
    },
    '%g': function (date) {
      return getWeekBasedYear(date).toString().substring(2);
    },
    '%G': function (date) {
      return getWeekBasedYear(date);
    },
    '%H': function (date) {
      return leadingNulls(date.tm_hour, 2);
    },
    '%I': function (date) {
      var twelveHour = date.tm_hour;
      if (twelveHour == 0) twelveHour = 12;
      else if (twelveHour > 12) twelveHour -= 12;
      return leadingNulls(twelveHour, 2);
    },
    '%j': function (date) {
      return leadingNulls(
        date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1),
        3
      );
    },
    '%m': function (date) {
      return leadingNulls(date.tm_mon + 1, 2);
    },
    '%M': function (date) {
      return leadingNulls(date.tm_min, 2);
    },
    '%n': function () {
      return '\n';
    },
    '%p': function (date) {
      if (date.tm_hour >= 0 && date.tm_hour < 12) {
        return 'AM';
      } else {
        return 'PM';
      }
    },
    '%S': function (date) {
      return leadingNulls(date.tm_sec, 2);
    },
    '%t': function () {
      return '\t';
    },
    '%u': function (date) {
      var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
      return day.getDay() || 7;
    },
    '%U': function (date) {
      var janFirst = new Date(date.tm_year + 1900, 0, 1);
      var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
      if (compareByDay(firstSunday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
        var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
        var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
        return leadingNulls(Math.ceil(days / 7), 2);
      }
      return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00';
    },
    '%V': function (date) {
      var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
      var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
      var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
      var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
      var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
      if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
        return '53';
      }
      if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
        return '01';
      }
      var daysDifference;
      if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
        daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
      } else {
        daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
      }
      return leadingNulls(Math.ceil(daysDifference / 7), 2);
    },
    '%w': function (date) {
      var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
      return day.getDay();
    },
    '%W': function (date) {
      var janFirst = new Date(date.tm_year, 0, 1);
      var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
      if (compareByDay(firstMonday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
        var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
        var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
        return leadingNulls(Math.ceil(days / 7), 2);
      }
      return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00';
    },
    '%y': function (date) {
      return (date.tm_year + 1900).toString().substring(2);
    },
    '%Y': function (date) {
      return date.tm_year + 1900;
    },
    '%z': function (date) {
      var off = date.tm_gmtoff;
      var ahead = off >= 0;
      off = Math.abs(off) / 60;
      off = (off / 60) * 100 + (off % 60);
      return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
    },
    '%Z': function (date) {
      return date.tm_zone;
    },
    '%%': function () {
      return '%';
    },
  };
  for (var rule in EXPANSION_RULES_2) {
    if (pattern.indexOf(rule) >= 0) {
      pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
    }
  }
  var bytes = intArrayFromString(pattern, false);
  if (bytes.length > maxsize) {
    return 0;
  }
  writeArrayToMemory(bytes, s);
  return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
  return _strftime(s, maxsize, format, tm);
}
function _abort() {
  Module['abort']();
}
function _free() {}
Module['_free'] = _free;
function _malloc(bytes) {
  var ptr = Runtime.dynamicAlloc(bytes + 8);
  return (ptr + 8) & 4294967288;
}
Module['_malloc'] = _malloc;
function simpleReadValueFromPointer(pointer) {
  return this['fromWireType'](HEAPU32[pointer >> 2]);
}
function __embind_register_std_string(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      var length = HEAPU32[value >> 2];
      var a = new Array(length);
      for (var i = 0; i < length; ++i) {
        a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
      }
      _free(value);
      return a.join('');
    },
    toWireType: function (destructors, value) {
      if (value instanceof ArrayBuffer) {
        value = new Uint8Array(value);
      }
      function getTAElement(ta, index) {
        return ta[index];
      }
      function getStringElement(string, index) {
        return string.charCodeAt(index);
      }
      var getElement;
      if (value instanceof Uint8Array) {
        getElement = getTAElement;
      } else if (value instanceof Uint8ClampedArray) {
        getElement = getTAElement;
      } else if (value instanceof Int8Array) {
        getElement = getTAElement;
      } else if (typeof value === 'string') {
        getElement = getStringElement;
      } else {
        throwBindingError('Cannot pass non-string to std::string');
      }
      var length = value.length;
      var ptr = _malloc(4 + length);
      HEAPU32[ptr >> 2] = length;
      for (var i = 0; i < length; ++i) {
        var charCode = getElement(value, i);
        if (charCode > 255) {
          _free(ptr);
          throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
        }
        HEAPU8[ptr + 4 + i] = charCode;
      }
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: function (ptr) {
      _free(ptr);
    },
  });
}
function _embind_repr(v) {
  if (v === null) {
    return 'null';
  }
  var t = typeof v;
  if (t === 'object' || t === 'array' || t === 'function') {
    return v.toString();
  } else {
    return '' + v;
  }
}
function integerReadValueFromPointer(name, shift, signed) {
  switch (shift) {
    case 0:
      return signed
        ? function readS8FromPointer(pointer) {
            return HEAP8[pointer];
          }
        : function readU8FromPointer(pointer) {
            return HEAPU8[pointer];
          };
    case 1:
      return signed
        ? function readS16FromPointer(pointer) {
            return HEAP16[pointer >> 1];
          }
        : function readU16FromPointer(pointer) {
            return HEAPU16[pointer >> 1];
          };
    case 2:
      return signed
        ? function readS32FromPointer(pointer) {
            return HEAP32[pointer >> 2];
          }
        : function readU32FromPointer(pointer) {
            return HEAPU32[pointer >> 2];
          };
    default:
      throw new TypeError('Unknown integer type: ' + name);
  }
}
function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
  name = readLatin1String(name);
  if (maxRange === -1) {
    maxRange = 4294967295;
  }
  var shift = getShiftFromSize(size);
  var fromWireType = function (value) {
    return value;
  };
  if (minRange === 0) {
    var bitshift = 32 - 8 * size;
    fromWireType = function (value) {
      return (value << bitshift) >>> bitshift;
    };
  }
  registerType(primitiveType, {
    name: name,
    fromWireType: fromWireType,
    toWireType: function (destructors, value) {
      if (typeof value !== 'number' && typeof value !== 'boolean') {
        throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
      }
      if (value < minRange || value > maxRange) {
        throw new TypeError(
          'Passing a number "' +
            _embind_repr(value) +
            '" from JS side to C/C++ side to an argument of type "' +
            name +
            '", which is outside the valid range [' +
            minRange +
            ', ' +
            maxRange +
            ']!'
        );
      }
      return value | 0;
    },
    argPackAdvance: 8,
    readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
    destructorFunction: null,
  });
}
function _pthread_once(ptr, func) {
  if (!_pthread_once.seen) _pthread_once.seen = {};
  if (ptr in _pthread_once.seen) return;
  Module['dynCall_v'](func);
  _pthread_once.seen[ptr] = 1;
}
function ClassHandle_isAliasOf(other) {
  if (!(this instanceof ClassHandle)) {
    return false;
  }
  if (!(other instanceof ClassHandle)) {
    return false;
  }
  var leftClass = this.$$.ptrType.registeredClass;
  var left = this.$$.ptr;
  var rightClass = other.$$.ptrType.registeredClass;
  var right = other.$$.ptr;
  while (leftClass.baseClass) {
    left = leftClass.upcast(left);
    leftClass = leftClass.baseClass;
  }
  while (rightClass.baseClass) {
    right = rightClass.upcast(right);
    rightClass = rightClass.baseClass;
  }
  return leftClass === rightClass && left === right;
}
function shallowCopyInternalPointer(o) {
  return {
    count: o.count,
    deleteScheduled: o.deleteScheduled,
    preservePointerOnDelete: o.preservePointerOnDelete,
    ptr: o.ptr,
    ptrType: o.ptrType,
    smartPtr: o.smartPtr,
    smartPtrType: o.smartPtrType,
  };
}
function throwInstanceAlreadyDeleted(obj) {
  function getInstanceTypeName(handle) {
    return handle.$$.ptrType.registeredClass.name;
  }
  throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
}
function ClassHandle_clone() {
  if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
  }
  if (this.$$.preservePointerOnDelete) {
    this.$$.count.value += 1;
    return this;
  } else {
    var clone = Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } });
    clone.$$.count.value += 1;
    clone.$$.deleteScheduled = false;
    return clone;
  }
}
function runDestructor(handle) {
  var $$ = handle.$$;
  if ($$.smartPtr) {
    $$.smartPtrType.rawDestructor($$.smartPtr);
  } else {
    $$.ptrType.registeredClass.rawDestructor($$.ptr);
  }
}
function ClassHandle_delete() {
  if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
  }
  if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
    throwBindingError('Object already scheduled for deletion');
  }
  this.$$.count.value -= 1;
  var toDelete = 0 === this.$$.count.value;
  if (toDelete) {
    runDestructor(this);
  }
  if (!this.$$.preservePointerOnDelete) {
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
  }
}
function ClassHandle_isDeleted() {
  return !this.$$.ptr;
}
var delayFunction = undefined;
var deletionQueue = [];
function flushPendingDeletes() {
  while (deletionQueue.length) {
    var obj = deletionQueue.pop();
    obj.$$.deleteScheduled = false;
    obj['delete']();
  }
}
function ClassHandle_deleteLater() {
  if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
  }
  if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
    throwBindingError('Object already scheduled for deletion');
  }
  deletionQueue.push(this);
  if (deletionQueue.length === 1 && delayFunction) {
    delayFunction(flushPendingDeletes);
  }
  this.$$.deleteScheduled = true;
  return this;
}
function init_ClassHandle() {
  ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
  ClassHandle.prototype['clone'] = ClassHandle_clone;
  ClassHandle.prototype['delete'] = ClassHandle_delete;
  ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
  ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
}
function ClassHandle() {}
var registeredPointers = {};
function ensureOverloadTable(proto, methodName, humanName) {
  if (undefined === proto[methodName].overloadTable) {
    var prevFunc = proto[methodName];
    proto[methodName] = function () {
      if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
        throwBindingError(
          "Function '" +
            humanName +
            "' called with an invalid number of arguments (" +
            arguments.length +
            ') - expects one of (' +
            proto[methodName].overloadTable +
            ')!'
        );
      }
      return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
    };
    proto[methodName].overloadTable = [];
    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
  }
}
function exposePublicSymbol(name, value, numArguments) {
  if (Module.hasOwnProperty(name)) {
    if (
      undefined === numArguments ||
      (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
    ) {
      throwBindingError("Cannot register public name '" + name + "' twice");
    }
    ensureOverloadTable(Module, name, name);
    if (Module.hasOwnProperty(numArguments)) {
      throwBindingError('Cannot register multiple overloads of a function with the same number of arguments (' + numArguments + ')!');
    }
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    if (undefined !== numArguments) {
      Module[name].numArguments = numArguments;
    }
  }
}
function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
  this.name = name;
  this.constructor = constructor;
  this.instancePrototype = instancePrototype;
  this.rawDestructor = rawDestructor;
  this.baseClass = baseClass;
  this.getActualType = getActualType;
  this.upcast = upcast;
  this.downcast = downcast;
  this.pureVirtualFunctions = [];
}
function upcastPointer(ptr, ptrClass, desiredClass) {
  while (ptrClass !== desiredClass) {
    if (!ptrClass.upcast) {
      throwBindingError('Expected null or instance of ' + desiredClass.name + ', got an instance of ' + ptrClass.name);
    }
    ptr = ptrClass.upcast(ptr);
    ptrClass = ptrClass.baseClass;
  }
  return ptr;
}
function constNoSmartPtrRawPointerToWireType(destructors, handle) {
  if (handle === null) {
    if (this.isReference) {
      throwBindingError('null is not a valid ' + this.name);
    }
    return 0;
  }
  if (!handle.$$) {
    throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
  }
  if (!handle.$$.ptr) {
    throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
  }
  var handleClass = handle.$$.ptrType.registeredClass;
  var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  return ptr;
}
function genericPointerToWireType(destructors, handle) {
  if (handle === null) {
    if (this.isReference) {
      throwBindingError('null is not a valid ' + this.name);
    }
    if (this.isSmartPointer) {
      var ptr = this.rawConstructor();
      if (destructors !== null) {
        destructors.push(this.rawDestructor, ptr);
      }
      return ptr;
    } else {
      return 0;
    }
  }
  if (!handle.$$) {
    throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
  }
  if (!handle.$$.ptr) {
    throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
  }
  if (!this.isConst && handle.$$.ptrType.isConst) {
    throwBindingError(
      'Cannot convert argument of type ' +
        (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
        ' to parameter type ' +
        this.name
    );
  }
  var handleClass = handle.$$.ptrType.registeredClass;
  var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  if (this.isSmartPointer) {
    if (undefined === handle.$$.smartPtr) {
      throwBindingError('Passing raw pointer to smart pointer is illegal');
    }
    switch (this.sharingPolicy) {
      case 0:
        if (handle.$$.smartPtrType === this) {
          ptr = handle.$$.smartPtr;
        } else {
          throwBindingError(
            'Cannot convert argument of type ' +
              (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
              ' to parameter type ' +
              this.name
          );
        }
        break;
      case 1:
        ptr = handle.$$.smartPtr;
        break;
      case 2:
        if (handle.$$.smartPtrType === this) {
          ptr = handle.$$.smartPtr;
        } else {
          var clonedHandle = handle['clone']();
          ptr = this.rawShare(
            ptr,
            __emval_register(function () {
              clonedHandle['delete']();
            })
          );
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
        }
        break;
      default:
        throwBindingError('Unsupporting sharing policy');
    }
  }
  return ptr;
}
function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
  if (handle === null) {
    if (this.isReference) {
      throwBindingError('null is not a valid ' + this.name);
    }
    return 0;
  }
  if (!handle.$$) {
    throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
  }
  if (!handle.$$.ptr) {
    throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
  }
  if (handle.$$.ptrType.isConst) {
    throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
  }
  var handleClass = handle.$$.ptrType.registeredClass;
  var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  return ptr;
}
function RegisteredPointer_getPointee(ptr) {
  if (this.rawGetPointee) {
    ptr = this.rawGetPointee(ptr);
  }
  return ptr;
}
function RegisteredPointer_destructor(ptr) {
  if (this.rawDestructor) {
    this.rawDestructor(ptr);
  }
}
function RegisteredPointer_deleteObject(handle) {
  if (handle !== null) {
    handle['delete']();
  }
}
function downcastPointer(ptr, ptrClass, desiredClass) {
  if (ptrClass === desiredClass) {
    return ptr;
  }
  if (undefined === desiredClass.baseClass) {
    return null;
  }
  var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
  if (rv === null) {
    return null;
  }
  return desiredClass.downcast(rv);
}
function getInheritedInstanceCount() {
  return Object.keys(registeredInstances).length;
}
function getLiveInheritedInstances() {
  var rv = [];
  for (var k in registeredInstances) {
    if (registeredInstances.hasOwnProperty(k)) {
      rv.push(registeredInstances[k]);
    }
  }
  return rv;
}
function setDelayFunction(fn) {
  delayFunction = fn;
  if (deletionQueue.length && delayFunction) {
    delayFunction(flushPendingDeletes);
  }
}
function init_embind() {
  Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
  Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
  Module['flushPendingDeletes'] = flushPendingDeletes;
  Module['setDelayFunction'] = setDelayFunction;
}
var registeredInstances = {};
function getBasestPointer(class_, ptr) {
  if (ptr === undefined) {
    throwBindingError('ptr should not be undefined');
  }
  while (class_.baseClass) {
    ptr = class_.upcast(ptr);
    class_ = class_.baseClass;
  }
  return ptr;
}
function getInheritedInstance(class_, ptr) {
  ptr = getBasestPointer(class_, ptr);
  return registeredInstances[ptr];
}
function makeClassHandle(prototype, record) {
  if (!record.ptrType || !record.ptr) {
    throwInternalError('makeClassHandle requires ptr and ptrType');
  }
  var hasSmartPtrType = !!record.smartPtrType;
  var hasSmartPtr = !!record.smartPtr;
  if (hasSmartPtrType !== hasSmartPtr) {
    throwInternalError('Both smartPtrType and smartPtr must be specified');
  }
  record.count = { value: 1 };
  return Object.create(prototype, { $$: { value: record } });
}
function RegisteredPointer_fromWireType(ptr) {
  var rawPointer = this.getPointee(ptr);
  if (!rawPointer) {
    this.destructor(ptr);
    return null;
  }
  var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
  if (undefined !== registeredInstance) {
    if (0 === registeredInstance.$$.count.value) {
      registeredInstance.$$.ptr = rawPointer;
      registeredInstance.$$.smartPtr = ptr;
      return registeredInstance['clone']();
    } else {
      var rv = registeredInstance['clone']();
      this.destructor(ptr);
      return rv;
    }
  }
  function makeDefaultHandle() {
    if (this.isSmartPointer) {
      return makeClassHandle(this.registeredClass.instancePrototype, {
        ptrType: this.pointeeType,
        ptr: rawPointer,
        smartPtrType: this,
        smartPtr: ptr,
      });
    } else {
      return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr });
    }
  }
  var actualType = this.registeredClass.getActualType(rawPointer);
  var registeredPointerRecord = registeredPointers[actualType];
  if (!registeredPointerRecord) {
    return makeDefaultHandle.call(this);
  }
  var toType;
  if (this.isConst) {
    toType = registeredPointerRecord.constPointerType;
  } else {
    toType = registeredPointerRecord.pointerType;
  }
  var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
  if (dp === null) {
    return makeDefaultHandle.call(this);
  }
  if (this.isSmartPointer) {
    return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
  } else {
    return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
  }
}
function init_RegisteredPointer() {
  RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
  RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
  RegisteredPointer.prototype['argPackAdvance'] = 8;
  RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
  RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
  RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
}
function RegisteredPointer(
  name,
  registeredClass,
  isReference,
  isConst,
  isSmartPointer,
  pointeeType,
  sharingPolicy,
  rawGetPointee,
  rawConstructor,
  rawShare,
  rawDestructor
) {
  this.name = name;
  this.registeredClass = registeredClass;
  this.isReference = isReference;
  this.isConst = isConst;
  this.isSmartPointer = isSmartPointer;
  this.pointeeType = pointeeType;
  this.sharingPolicy = sharingPolicy;
  this.rawGetPointee = rawGetPointee;
  this.rawConstructor = rawConstructor;
  this.rawShare = rawShare;
  this.rawDestructor = rawDestructor;
  if (!isSmartPointer && registeredClass.baseClass === undefined) {
    if (isConst) {
      this['toWireType'] = constNoSmartPtrRawPointerToWireType;
      this.destructorFunction = null;
    } else {
      this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
      this.destructorFunction = null;
    }
  } else {
    this['toWireType'] = genericPointerToWireType;
  }
}
function replacePublicSymbol(name, value, numArguments) {
  if (!Module.hasOwnProperty(name)) {
    throwInternalError('Replacing nonexistant public symbol');
  }
  if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
    Module[name].overloadTable[numArguments] = value;
  } else {
    Module[name] = value;
    Module[name].argCount = numArguments;
  }
}
function requireFunction(signature, rawFunction) {
  signature = readLatin1String(signature);
  function makeDynCaller(dynCall) {
    var args = [];
    for (var i = 1; i < signature.length; ++i) {
      args.push('a' + i);
    }
    var name = 'dynCall_' + signature + '_' + rawFunction;
    var body = 'return function ' + name + '(' + args.join(', ') + ') {\n';
    body += '    return dynCall(rawFunction' + (args.length ? ', ' : '') + args.join(', ') + ');\n';
    body += '};\n';
    return new Function('dynCall', 'rawFunction', body)(dynCall, rawFunction);
  }
  var fp;
  if (Module['FUNCTION_TABLE_' + signature] !== undefined) {
    fp = Module['FUNCTION_TABLE_' + signature][rawFunction];
  } else if (typeof FUNCTION_TABLE !== 'undefined') {
    fp = FUNCTION_TABLE[rawFunction];
  } else {
    var dc = Module['asm']['dynCall_' + signature];
    if (dc === undefined) {
      dc = Module['asm']['dynCall_' + signature.replace(/f/g, 'd')];
      if (dc === undefined) {
        throwBindingError('No dynCall invoker for signature: ' + signature);
      }
    }
    fp = makeDynCaller(dc);
  }
  if (typeof fp !== 'function') {
    throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction);
  }
  return fp;
}
var UnboundTypeError = undefined;
function getTypeName(type) {
  var ptr = ___getTypeName(type);
  var rv = readLatin1String(ptr);
  _free(ptr);
  return rv;
}
function throwUnboundTypeError(message, types) {
  var unboundTypes = [];
  var seen = {};
  function visit(type) {
    if (seen[type]) {
      return;
    }
    if (registeredTypes[type]) {
      return;
    }
    if (typeDependencies[type]) {
      typeDependencies[type].forEach(visit);
      return;
    }
    unboundTypes.push(type);
    seen[type] = true;
  }
  types.forEach(visit);
  throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}
function __embind_register_class(
  rawType,
  rawPointerType,
  rawConstPointerType,
  baseClassRawType,
  getActualTypeSignature,
  getActualType,
  upcastSignature,
  upcast,
  downcastSignature,
  downcast,
  name,
  destructorSignature,
  rawDestructor
) {
  name = readLatin1String(name);
  getActualType = requireFunction(getActualTypeSignature, getActualType);
  if (upcast) {
    upcast = requireFunction(upcastSignature, upcast);
  }
  if (downcast) {
    downcast = requireFunction(downcastSignature, downcast);
  }
  rawDestructor = requireFunction(destructorSignature, rawDestructor);
  var legalFunctionName = makeLegalFunctionName(name);
  exposePublicSymbol(legalFunctionName, function () {
    throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
  });
  whenDependentTypesAreResolved(
    [rawType, rawPointerType, rawConstPointerType],
    baseClassRawType ? [baseClassRawType] : [],
    function (base) {
      base = base[0];
      var baseClass;
      var basePrototype;
      if (baseClassRawType) {
        baseClass = base.registeredClass;
        basePrototype = baseClass.instancePrototype;
      } else {
        basePrototype = ClassHandle.prototype;
      }
      var constructor = createNamedFunction(legalFunctionName, function () {
        if (Object.getPrototypeOf(this) !== instancePrototype) {
          throw new BindingError("Use 'new' to construct " + name);
        }
        if (undefined === registeredClass.constructor_body) {
          throw new BindingError(name + ' has no accessible constructor');
        }
        var body = registeredClass.constructor_body[arguments.length];
        if (undefined === body) {
          throw new BindingError(
            'Tried to invoke ctor of ' +
              name +
              ' with invalid number of parameters (' +
              arguments.length +
              ') - expected (' +
              Object.keys(registeredClass.constructor_body).toString() +
              ') parameters instead!'
          );
        }
        return body.apply(this, arguments);
      });
      var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
      constructor.prototype = instancePrototype;
      var registeredClass = new RegisteredClass(
        name,
        constructor,
        instancePrototype,
        rawDestructor,
        baseClass,
        getActualType,
        upcast,
        downcast
      );
      var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
      var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false);
      var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false);
      registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
      replacePublicSymbol(legalFunctionName, constructor);
      return [referenceConverter, pointerConverter, constPointerConverter];
    }
  );
}
function ___lock() {}
function ___unlock() {}
var PTHREAD_SPECIFIC = {};
function _pthread_getspecific(key) {
  return PTHREAD_SPECIFIC[key] || 0;
}
Module['_i64Add'] = _i64Add;
var PTHREAD_SPECIFIC_NEXT_KEY = 1;
var ERRNO_CODES = {
  EPERM: 1,
  ENOENT: 2,
  ESRCH: 3,
  EINTR: 4,
  EIO: 5,
  ENXIO: 6,
  E2BIG: 7,
  ENOEXEC: 8,
  EBADF: 9,
  ECHILD: 10,
  EAGAIN: 11,
  EWOULDBLOCK: 11,
  ENOMEM: 12,
  EACCES: 13,
  EFAULT: 14,
  ENOTBLK: 15,
  EBUSY: 16,
  EEXIST: 17,
  EXDEV: 18,
  ENODEV: 19,
  ENOTDIR: 20,
  EISDIR: 21,
  EINVAL: 22,
  ENFILE: 23,
  EMFILE: 24,
  ENOTTY: 25,
  ETXTBSY: 26,
  EFBIG: 27,
  ENOSPC: 28,
  ESPIPE: 29,
  EROFS: 30,
  EMLINK: 31,
  EPIPE: 32,
  EDOM: 33,
  ERANGE: 34,
  ENOMSG: 42,
  EIDRM: 43,
  ECHRNG: 44,
  EL2NSYNC: 45,
  EL3HLT: 46,
  EL3RST: 47,
  ELNRNG: 48,
  EUNATCH: 49,
  ENOCSI: 50,
  EL2HLT: 51,
  EDEADLK: 35,
  ENOLCK: 37,
  EBADE: 52,
  EBADR: 53,
  EXFULL: 54,
  ENOANO: 55,
  EBADRQC: 56,
  EBADSLT: 57,
  EDEADLOCK: 35,
  EBFONT: 59,
  ENOSTR: 60,
  ENODATA: 61,
  ETIME: 62,
  ENOSR: 63,
  ENONET: 64,
  ENOPKG: 65,
  EREMOTE: 66,
  ENOLINK: 67,
  EADV: 68,
  ESRMNT: 69,
  ECOMM: 70,
  EPROTO: 71,
  EMULTIHOP: 72,
  EDOTDOT: 73,
  EBADMSG: 74,
  ENOTUNIQ: 76,
  EBADFD: 77,
  EREMCHG: 78,
  ELIBACC: 79,
  ELIBBAD: 80,
  ELIBSCN: 81,
  ELIBMAX: 82,
  ELIBEXEC: 83,
  ENOSYS: 38,
  ENOTEMPTY: 39,
  ENAMETOOLONG: 36,
  ELOOP: 40,
  EOPNOTSUPP: 95,
  EPFNOSUPPORT: 96,
  ECONNRESET: 104,
  ENOBUFS: 105,
  EAFNOSUPPORT: 97,
  EPROTOTYPE: 91,
  ENOTSOCK: 88,
  ENOPROTOOPT: 92,
  ESHUTDOWN: 108,
  ECONNREFUSED: 111,
  EADDRINUSE: 98,
  ECONNABORTED: 103,
  ENETUNREACH: 101,
  ENETDOWN: 100,
  ETIMEDOUT: 110,
  EHOSTDOWN: 112,
  EHOSTUNREACH: 113,
  EINPROGRESS: 115,
  EALREADY: 114,
  EDESTADDRREQ: 89,
  EMSGSIZE: 90,
  EPROTONOSUPPORT: 93,
  ESOCKTNOSUPPORT: 94,
  EADDRNOTAVAIL: 99,
  ENETRESET: 102,
  EISCONN: 106,
  ENOTCONN: 107,
  ETOOMANYREFS: 109,
  EUSERS: 87,
  EDQUOT: 122,
  ESTALE: 116,
  ENOTSUP: 95,
  ENOMEDIUM: 123,
  EILSEQ: 84,
  EOVERFLOW: 75,
  ECANCELED: 125,
  ENOTRECOVERABLE: 131,
  EOWNERDEAD: 130,
  ESTRPIPE: 86,
};
function _pthread_key_create(key, destructor) {
  if (key == 0) {
    return ERRNO_CODES.EINVAL;
  }
  HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
  PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
  PTHREAD_SPECIFIC_NEXT_KEY++;
  return 0;
}
var emval_free_list = [];
var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
function __emval_decref(handle) {
  if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
    emval_handle_array[handle] = undefined;
    emval_free_list.push(handle);
  }
}
function count_emval_handles() {
  var count = 0;
  for (var i = 5; i < emval_handle_array.length; ++i) {
    if (emval_handle_array[i] !== undefined) {
      ++count;
    }
  }
  return count;
}
function get_first_emval() {
  for (var i = 5; i < emval_handle_array.length; ++i) {
    if (emval_handle_array[i] !== undefined) {
      return emval_handle_array[i];
    }
  }
  return null;
}
function init_emval() {
  Module['count_emval_handles'] = count_emval_handles;
  Module['get_first_emval'] = get_first_emval;
}
function __emval_register(value) {
  switch (value) {
    case undefined: {
      return 1;
    }
    case null: {
      return 2;
    }
    case true: {
      return 3;
    }
    case false: {
      return 4;
    }
    default: {
      var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
      emval_handle_array[handle] = { refcount: 1, value: value };
      return handle;
    }
  }
}
function __embind_register_emval(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (handle) {
      var rv = emval_handle_array[handle].value;
      __emval_decref(handle);
      return rv;
    },
    toWireType: function (destructors, value) {
      return __emval_register(value);
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: null,
  });
}
function _pthread_setspecific(key, value) {
  if (!(key in PTHREAD_SPECIFIC)) {
    return ERRNO_CODES.EINVAL;
  }
  PTHREAD_SPECIFIC[key] = value;
  return 0;
}
var ERRNO_MESSAGES = {
  0: 'Success',
  1: 'Not super-user',
  2: 'No such file or directory',
  3: 'No such process',
  4: 'Interrupted system call',
  5: 'I/O error',
  6: 'No such device or address',
  7: 'Arg list too long',
  8: 'Exec format error',
  9: 'Bad file number',
  10: 'No children',
  11: 'No more processes',
  12: 'Not enough core',
  13: 'Permission denied',
  14: 'Bad address',
  15: 'Block device required',
  16: 'Mount device busy',
  17: 'File exists',
  18: 'Cross-device link',
  19: 'No such device',
  20: 'Not a directory',
  21: 'Is a directory',
  22: 'Invalid argument',
  23: 'Too many open files in system',
  24: 'Too many open files',
  25: 'Not a typewriter',
  26: 'Text file busy',
  27: 'File too large',
  28: 'No space left on device',
  29: 'Illegal seek',
  30: 'Read only file system',
  31: 'Too many links',
  32: 'Broken pipe',
  33: 'Math arg out of domain of func',
  34: 'Math result not representable',
  35: 'File locking deadlock error',
  36: 'File or path name too long',
  37: 'No record locks available',
  38: 'Function not implemented',
  39: 'Directory not empty',
  40: 'Too many symbolic links',
  42: 'No message of desired type',
  43: 'Identifier removed',
  44: 'Channel number out of range',
  45: 'Level 2 not synchronized',
  46: 'Level 3 halted',
  47: 'Level 3 reset',
  48: 'Link number out of range',
  49: 'Protocol driver not attached',
  50: 'No CSI structure available',
  51: 'Level 2 halted',
  52: 'Invalid exchange',
  53: 'Invalid request descriptor',
  54: 'Exchange full',
  55: 'No anode',
  56: 'Invalid request code',
  57: 'Invalid slot',
  59: 'Bad font file fmt',
  60: 'Device not a stream',
  61: 'No data (for no delay io)',
  62: 'Timer expired',
  63: 'Out of streams resources',
  64: 'Machine is not on the network',
  65: 'Package not installed',
  66: 'The object is remote',
  67: 'The link has been severed',
  68: 'Advertise error',
  69: 'Srmount error',
  70: 'Communication error on send',
  71: 'Protocol error',
  72: 'Multihop attempted',
  73: 'Cross mount point (not really error)',
  74: 'Trying to read unreadable message',
  75: 'Value too large for defined data type',
  76: 'Given log. name not unique',
  77: 'f.d. invalid for this operation',
  78: 'Remote address changed',
  79: 'Can   access a needed shared lib',
  80: 'Accessing a corrupted shared lib',
  81: '.lib section in a.out corrupted',
  82: 'Attempting to link in too many libs',
  83: 'Attempting to exec a shared library',
  84: 'Illegal byte sequence',
  86: 'Streams pipe error',
  87: 'Too many users',
  88: 'Socket operation on non-socket',
  89: 'Destination address required',
  90: 'Message too long',
  91: 'Protocol wrong type for socket',
  92: 'Protocol not available',
  93: 'Unknown protocol',
  94: 'Socket type not supported',
  95: 'Not supported',
  96: 'Protocol family not supported',
  97: 'Address family not supported by protocol family',
  98: 'Address already in use',
  99: 'Address not available',
  100: 'Network interface is not configured',
  101: 'Network is unreachable',
  102: 'Connection reset by network',
  103: 'Connection aborted',
  104: 'Connection reset by peer',
  105: 'No buffer space available',
  106: 'Socket is already connected',
  107: 'Socket is not connected',
  108: "Can't send after socket shutdown",
  109: 'Too many references',
  110: 'Connection timed out',
  111: 'Connection refused',
  112: 'Host is down',
  113: 'Host is unreachable',
  114: 'Socket already connected',
  115: 'Connection already in progress',
  116: 'Stale file handle',
  122: 'Quota exceeded',
  123: 'No medium (in tape drive)',
  125: 'Operation canceled',
  130: 'Previous owner died',
  131: 'State not recoverable',
};
function ___setErrNo(value) {
  if (Module['___errno_location']) HEAP32[Module['___errno_location']() >> 2] = value;
  return value;
}
var PATH = {
  splitPath: function (filename) {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: function (parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }
    return parts;
  },
  normalize: function (path) {
    var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.substr(-1) === '/';
    path = PATH.normalizeArray(
      path.split('/').filter(function (p) {
        return !!p;
      }),
      !isAbsolute
    ).join('/');
    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolute ? '/' : '') + path;
  },
  dirname: function (path) {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: function (path) {
    if (path === '/') return '/';
    var lastSlash = path.lastIndexOf('/');
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  extname: function (path) {
    return PATH.splitPath(path)[3];
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join('/'));
  },
  join2: function (l, r) {
    return PATH.normalize(l + '/' + r);
  },
  resolve: function () {
    var resolvedPath = '',
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        return '';
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split('/').filter(function (p) {
        return !!p;
      }),
      !resolvedAbsolute
    ).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },
  relative: function (from, to) {
    from = PATH.resolve(from).substr(1);
    to = PATH.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  },
};
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
      }
      for (var i = 0; i < length; i++) {
        try {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        }
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          var BUFSIZE = 256;
          var buf = new Buffer(BUFSIZE);
          var bytesRead = 0;
          var isPosixPlatform = process.platform != 'win32';
          var fd = process.stdin.fd;
          if (isPosixPlatform) {
            var usingDevice = false;
            try {
              fd = fs.openSync('/dev/stdin', 'r');
              usingDevice = true;
            } catch (e) {}
          }
          try {
            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
          } catch (e) {
            if (e.toString().indexOf('EOF') != -1) bytesRead = 0;
            else throw e;
          }
          if (usingDevice) {
            fs.closeSync(fd);
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString('utf-8');
          } else {
            result = null;
          }
        } else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
          result = window.prompt('Input: ');
          if (result !== null) {
            result += '\n';
          }
        } else if (typeof readline == 'function') {
          result = readline();
          if (result !== null) {
            result += '\n';
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        Module['print'](UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        Module['print'](UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        Module['printErr'](UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        Module['printErr'](UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, '/', 16384 | 511, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} },
        chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now();
    if (parent) {
      parent.contents[name] = node;
    }
    return node;
  },
  getFileDataAsRegularArray: function (node) {
    if (node.contents && node.contents.subarray) {
      var arr = [];
      for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
      return arr;
    }
    return node.contents;
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array();
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
      node.contents = MEMFS.getFileDataAsRegularArray(node);
      node.usedBytes = node.contents.length;
    }
    if (!node.contents || node.contents.subarray) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) | 0);
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
      return;
    }
    if (!node.contents && newCapacity > 0) node.contents = [];
    while (node.contents.length < newCapacity) node.contents.push(0);
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      node.usedBytes = 0;
      return;
    }
    if (!node.contents || node.contents.subarray) {
      var oldContents = node.contents;
      node.contents = new Uint8Array(new ArrayBuffer(newSize));
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
      }
      node.usedBytes = newSize;
      return;
    }
    if (!node.contents) node.contents = [];
    if (node.contents.length > newSize) node.contents.length = newSize;
    else while (node.contents.length < newSize) node.contents.push(0);
    node.usedBytes = newSize;
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[ERRNO_CODES.ENOENT];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
      }
      delete parent.contents[name];
    },
    readdir: function (node) {
      var entries = ['.', '..'];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      assert(size >= 0);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position);
      else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < stream.node.usedBytes) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = _malloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
        }
        buffer.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    },
  },
};
var IDBFS = {
  dbs: {},
  indexedDB: function () {
    if (typeof indexedDB !== 'undefined') return indexedDB;
    var ret = null;
    if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    assert(ret, 'IDBFS used, but indexedDB not supported');
    return ret;
  },
  DB_VERSION: 21,
  DB_STORE_NAME: 'FILE_DATA',
  mount: function (mount) {
    return MEMFS.mount.apply(null, arguments);
  },
  syncfs: function (mount, populate, callback) {
    IDBFS.getLocalSet(mount, function (err, local) {
      if (err) return callback(err);
      IDBFS.getRemoteSet(mount, function (err, remote) {
        if (err) return callback(err);
        var src = populate ? remote : local;
        var dst = populate ? local : remote;
        IDBFS.reconcile(src, dst, callback);
      });
    });
  },
  getDB: function (name, callback) {
    var db = IDBFS.dbs[name];
    if (db) {
      return callback(null, db);
    }
    var req;
    try {
      req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
    } catch (e) {
      return callback(e);
    }
    if (!req) {
      return callback('Unable to connect to IndexedDB');
    }
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      var transaction = e.target.transaction;
      var fileStore;
      if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
        fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
      } else {
        fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
      }
      if (!fileStore.indexNames.contains('timestamp')) {
        fileStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = function () {
      db = req.result;
      IDBFS.dbs[name] = db;
      callback(null, db);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  getLocalSet: function (mount, callback) {
    var entries = {};
    function isRealDir(p) {
      return p !== '.' && p !== '..';
    }
    function toAbsolute(root) {
      return function (p) {
        return PATH.join2(root, p);
      };
    }
    var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
    while (check.length) {
      var path = check.pop();
      var stat;
      try {
        stat = FS.stat(path);
      } catch (e) {
        return callback(e);
      }
      if (FS.isDir(stat.mode)) {
        check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
      }
      entries[path] = { timestamp: stat.mtime };
    }
    return callback(null, { type: 'local', entries: entries });
  },
  getRemoteSet: function (mount, callback) {
    var entries = {};
    IDBFS.getDB(mount.mountpoint, function (err, db) {
      if (err) return callback(err);
      var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
      transaction.onerror = function (e) {
        callback(this.error);
        e.preventDefault();
      };
      var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
      var index = store.index('timestamp');
      index.openKeyCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (!cursor) {
          return callback(null, { type: 'remote', db: db, entries: entries });
        }
        entries[cursor.primaryKey] = { timestamp: cursor.key };
        cursor.continue();
      };
    });
  },
  loadLocalEntry: function (path, callback) {
    var stat, node;
    try {
      var lookup = FS.lookupPath(path);
      node = lookup.node;
      stat = FS.stat(path);
    } catch (e) {
      return callback(e);
    }
    if (FS.isDir(stat.mode)) {
      return callback(null, { timestamp: stat.mtime, mode: stat.mode });
    } else if (FS.isFile(stat.mode)) {
      node.contents = MEMFS.getFileDataAsTypedArray(node);
      return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
    } else {
      return callback(new Error('node type not supported'));
    }
  },
  storeLocalEntry: function (path, entry, callback) {
    try {
      if (FS.isDir(entry.mode)) {
        FS.mkdir(path, entry.mode);
      } else if (FS.isFile(entry.mode)) {
        FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
      } else {
        return callback(new Error('node type not supported'));
      }
      FS.chmod(path, entry.mode);
      FS.utime(path, entry.timestamp, entry.timestamp);
    } catch (e) {
      return callback(e);
    }
    callback(null);
  },
  removeLocalEntry: function (path, callback) {
    try {
      var lookup = FS.lookupPath(path);
      var stat = FS.stat(path);
      if (FS.isDir(stat.mode)) {
        FS.rmdir(path);
      } else if (FS.isFile(stat.mode)) {
        FS.unlink(path);
      }
    } catch (e) {
      return callback(e);
    }
    callback(null);
  },
  loadRemoteEntry: function (store, path, callback) {
    var req = store.get(path);
    req.onsuccess = function (event) {
      callback(null, event.target.result);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  storeRemoteEntry: function (store, path, entry, callback) {
    var req = store.put(entry, path);
    req.onsuccess = function () {
      callback(null);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  removeRemoteEntry: function (store, path, callback) {
    var req = store.delete(path);
    req.onsuccess = function () {
      callback(null);
    };
    req.onerror = function (e) {
      callback(this.error);
      e.preventDefault();
    };
  },
  reconcile: function (src, dst, callback) {
    var total = 0;
    var create = [];
    Object.keys(src.entries).forEach(function (key) {
      var e = src.entries[key];
      var e2 = dst.entries[key];
      if (!e2 || e.timestamp > e2.timestamp) {
        create.push(key);
        total++;
      }
    });
    var remove = [];
    Object.keys(dst.entries).forEach(function (key) {
      var e = dst.entries[key];
      var e2 = src.entries[key];
      if (!e2) {
        remove.push(key);
        total++;
      }
    });
    if (!total) {
      return callback(null);
    }
    var completed = 0;
    var db = src.type === 'remote' ? src.db : dst.db;
    var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
    function done(err) {
      if (err) {
        if (!done.errored) {
          done.errored = true;
          return callback(err);
        }
        return;
      }
      if (++completed >= total) {
        return callback(null);
      }
    }
    transaction.onerror = function (e) {
      done(this.error);
      e.preventDefault();
    };
    create.sort().forEach(function (path) {
      if (dst.type === 'local') {
        IDBFS.loadRemoteEntry(store, path, function (err, entry) {
          if (err) return done(err);
          IDBFS.storeLocalEntry(path, entry, done);
        });
      } else {
        IDBFS.loadLocalEntry(path, function (err, entry) {
          if (err) return done(err);
          IDBFS.storeRemoteEntry(store, path, entry, done);
        });
      }
    });
    remove
      .sort()
      .reverse()
      .forEach(function (path) {
        if (dst.type === 'local') {
          IDBFS.removeLocalEntry(path, done);
        } else {
          IDBFS.removeRemoteEntry(store, path, done);
        }
      });
  },
};
var NODEFS = {
  isWindows: false,
  staticInit: function () {
    NODEFS.isWindows = !!process.platform.match(/^win/);
  },
  mount: function (mount) {
    assert(ENVIRONMENT_IS_NODE);
    return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var node = FS.createNode(parent, name, mode);
    node.node_ops = NODEFS.node_ops;
    node.stream_ops = NODEFS.stream_ops;
    return node;
  },
  getMode: function (path) {
    var stat;
    try {
      stat = fs.lstatSync(path);
      if (NODEFS.isWindows) {
        stat.mode = stat.mode | ((stat.mode & 146) >> 1);
      }
    } catch (e) {
      if (!e.code) throw e;
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
    }
    return stat.mode;
  },
  realPath: function (node) {
    var parts = [];
    while (node.parent !== node) {
      parts.push(node.name);
      node = node.parent;
    }
    parts.push(node.mount.opts.root);
    parts.reverse();
    return PATH.join.apply(null, parts);
  },
  flagsToPermissionStringMap: {
    0: 'r',
    1: 'r+',
    2: 'r+',
    64: 'r',
    65: 'r+',
    66: 'r+',
    129: 'rx+',
    193: 'rx+',
    514: 'w+',
    577: 'w',
    578: 'w+',
    705: 'wx',
    706: 'wx+',
    1024: 'a',
    1025: 'a',
    1026: 'a+',
    1089: 'a',
    1090: 'a+',
    1153: 'ax',
    1154: 'ax+',
    1217: 'ax',
    1218: 'ax+',
    4096: 'rs',
    4098: 'rs+',
  },
  flagsToPermissionString: function (flags) {
    flags &= ~2097152;
    flags &= ~2048;
    flags &= ~32768;
    flags &= ~524288;
    if (flags in NODEFS.flagsToPermissionStringMap) {
      return NODEFS.flagsToPermissionStringMap[flags];
    } else {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
  },
  node_ops: {
    getattr: function (node) {
      var path = NODEFS.realPath(node);
      var stat;
      try {
        stat = fs.lstatSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      if (NODEFS.isWindows && !stat.blksize) {
        stat.blksize = 4096;
      }
      if (NODEFS.isWindows && !stat.blocks) {
        stat.blocks = ((stat.size + stat.blksize - 1) / stat.blksize) | 0;
      }
      return {
        dev: stat.dev,
        ino: stat.ino,
        mode: stat.mode,
        nlink: stat.nlink,
        uid: stat.uid,
        gid: stat.gid,
        rdev: stat.rdev,
        size: stat.size,
        atime: stat.atime,
        mtime: stat.mtime,
        ctime: stat.ctime,
        blksize: stat.blksize,
        blocks: stat.blocks,
      };
    },
    setattr: function (node, attr) {
      var path = NODEFS.realPath(node);
      try {
        if (attr.mode !== undefined) {
          fs.chmodSync(path, attr.mode);
          node.mode = attr.mode;
        }
        if (attr.timestamp !== undefined) {
          var date = new Date(attr.timestamp);
          fs.utimesSync(path, date, date);
        }
        if (attr.size !== undefined) {
          fs.truncateSync(path, attr.size);
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    lookup: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      var mode = NODEFS.getMode(path);
      return NODEFS.createNode(parent, name, mode);
    },
    mknod: function (parent, name, mode, dev) {
      var node = NODEFS.createNode(parent, name, mode, dev);
      var path = NODEFS.realPath(node);
      try {
        if (FS.isDir(node.mode)) {
          fs.mkdirSync(path, node.mode);
        } else {
          fs.writeFileSync(path, '', { mode: node.mode });
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      return node;
    },
    rename: function (oldNode, newDir, newName) {
      var oldPath = NODEFS.realPath(oldNode);
      var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
      try {
        fs.renameSync(oldPath, newPath);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    unlink: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      try {
        fs.unlinkSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    rmdir: function (parent, name) {
      var path = PATH.join2(NODEFS.realPath(parent), name);
      try {
        fs.rmdirSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    readdir: function (node) {
      var path = NODEFS.realPath(node);
      try {
        return fs.readdirSync(path);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    symlink: function (parent, newName, oldPath) {
      var newPath = PATH.join2(NODEFS.realPath(parent), newName);
      try {
        fs.symlinkSync(oldPath, newPath);
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    readlink: function (node) {
      var path = NODEFS.realPath(node);
      try {
        path = fs.readlinkSync(path);
        path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
        return path;
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
  },
  stream_ops: {
    open: function (stream) {
      var path = NODEFS.realPath(stream.node);
      try {
        if (FS.isFile(stream.node.mode)) {
          stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    close: function (stream) {
      try {
        if (FS.isFile(stream.node.mode) && stream.nfd) {
          fs.closeSync(stream.nfd);
        }
      } catch (e) {
        if (!e.code) throw e;
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
    },
    read: function (stream, buffer, offset, length, position) {
      if (length === 0) return 0;
      var nbuffer = new Buffer(length);
      var res;
      try {
        res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      if (res > 0) {
        for (var i = 0; i < res; i++) {
          buffer[offset + i] = nbuffer[i];
        }
      }
      return res;
    },
    write: function (stream, buffer, offset, length, position) {
      var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
      var res;
      try {
        res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES[e.code]);
      }
      return res;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          try {
            var stat = fs.fstatSync(stream.nfd);
            position += stat.size;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return position;
    },
  },
};
var WORKERFS = {
  DIR_MODE: 16895,
  FILE_MODE: 33279,
  reader: null,
  mount: function (mount) {
    assert(ENVIRONMENT_IS_WORKER);
    if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
    var root = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0);
    var createdParents = {};
    function ensureParent(path) {
      var parts = path.split('/');
      var parent = root;
      for (var i = 0; i < parts.length - 1; i++) {
        var curr = parts.slice(0, i + 1).join('/');
        if (!createdParents[curr]) {
          createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
        }
        parent = createdParents[curr];
      }
      return parent;
    }
    function base(path) {
      var parts = path.split('/');
      return parts[parts.length - 1];
    }
    Array.prototype.forEach.call(mount.opts['files'] || [], function (file) {
      WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
    });
    (mount.opts['blobs'] || []).forEach(function (obj) {
      WORKERFS.createNode(ensureParent(obj['name']), base(obj['name']), WORKERFS.FILE_MODE, 0, obj['data']);
    });
    (mount.opts['packages'] || []).forEach(function (pack) {
      pack['metadata'].files.forEach(function (file) {
        var name = file.filename.substr(1);
        WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack['blob'].slice(file.start, file.end));
      });
    });
    return root;
  },
  createNode: function (parent, name, mode, dev, contents, mtime) {
    var node = FS.createNode(parent, name, mode);
    node.mode = mode;
    node.node_ops = WORKERFS.node_ops;
    node.stream_ops = WORKERFS.stream_ops;
    node.timestamp = (mtime || new Date()).getTime();
    assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
    if (mode === WORKERFS.FILE_MODE) {
      node.size = contents.size;
      node.contents = contents;
    } else {
      node.size = 4096;
      node.contents = {};
    }
    if (parent) {
      parent.contents[name] = node;
    }
    return node;
  },
  node_ops: {
    getattr: function (node) {
      return {
        dev: 1,
        ino: undefined,
        mode: node.mode,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: undefined,
        size: node.size,
        atime: new Date(node.timestamp),
        mtime: new Date(node.timestamp),
        ctime: new Date(node.timestamp),
        blksize: 4096,
        blocks: Math.ceil(node.size / 4096),
      };
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
    },
    lookup: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    },
    mknod: function (parent, name, mode, dev) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    rename: function (oldNode, newDir, newName) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    unlink: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    rmdir: function (parent, name) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    readdir: function (node) {
      var entries = ['.', '..'];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newName, oldPath) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
    readlink: function (node) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      if (position >= stream.node.size) return 0;
      var chunk = stream.node.contents.slice(position, position + length);
      var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
      buffer.set(new Uint8Array(ab), offset);
      return chunk.size;
    },
    write: function (stream, buffer, offset, length, position) {
      throw new FS.ErrnoError(ERRNO_CODES.EIO);
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.size;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
      }
      return position;
    },
  },
};
STATICTOP += 16;
STATICTOP += 16;
STATICTOP += 16;
var FS = {
  root: null,
  mounts: [],
  devices: [null],
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: '/',
  initialized: false,
  ignorePermissions: true,
  trackingDelegate: {},
  tracking: { openFlags: { READ: 1, WRITE: 2 } },
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  handleFSError: function (e) {
    if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
    return ___setErrNo(e.errno);
  },
  lookupPath: function (path, opts) {
    path = PATH.resolve(FS.cwd(), path);
    opts = opts || {};
    if (!path) return { path: '', node: null };
    var defaults = { follow_mount: true, recurse_count: 0 };
    for (var key in defaults) {
      if (opts[key] === undefined) {
        opts[key] = defaults[key];
      }
    }
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
    }
    var parts = PATH.normalizeArray(
      path.split('/').filter(function (p) {
        return !!p;
      }),
      false
    );
    var current = FS.root;
    var current_path = '/';
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        break;
      }
      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH.resolve(PATH.dirname(current_path), link);
          var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
          current = lookup.node;
          if (count++ > 40) {
            throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
          }
        }
      }
    }
    return { path: current_path, node: current };
  },
  getPath: function (node) {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
      }
      path = path ? node.name + '/' + path : node.name;
      node = node.parent;
    }
  },
  hashName: function (parentid, name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: function (parent, name) {
    var err = FS.mayLookup(parent);
    if (err) {
      throw new FS.ErrnoError(err, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    return FS.lookup(parent, name);
  },
  createNode: function (parent, name, mode, rdev) {
    if (!FS.FSNode) {
      FS.FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      };
      FS.FSNode.prototype = {};
      var readMode = 292 | 73;
      var writeMode = 146;
      Object.defineProperties(FS.FSNode.prototype, {
        read: {
          get: function () {
            return (this.mode & readMode) === readMode;
          },
          set: function (val) {
            val ? (this.mode |= readMode) : (this.mode &= ~readMode);
          },
        },
        write: {
          get: function () {
            return (this.mode & writeMode) === writeMode;
          },
          set: function (val) {
            val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
          },
        },
        isFolder: {
          get: function () {
            return FS.isDir(this.mode);
          },
        },
        isDevice: {
          get: function () {
            return FS.isChrdev(this.mode);
          },
        },
      });
    }
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode: function (node) {
    FS.hashRemoveNode(node);
  },
  isRoot: function (node) {
    return node === node.parent;
  },
  isMountpoint: function (node) {
    return !!node.mounted;
  },
  isFile: function (mode) {
    return (mode & 61440) === 32768;
  },
  isDir: function (mode) {
    return (mode & 61440) === 16384;
  },
  isLink: function (mode) {
    return (mode & 61440) === 40960;
  },
  isChrdev: function (mode) {
    return (mode & 61440) === 8192;
  },
  isBlkdev: function (mode) {
    return (mode & 61440) === 24576;
  },
  isFIFO: function (mode) {
    return (mode & 61440) === 4096;
  },
  isSocket: function (mode) {
    return (mode & 49152) === 49152;
  },
  flagModes: {
    r: 0,
    rs: 1052672,
    'r+': 2,
    w: 577,
    wx: 705,
    xw: 705,
    'w+': 578,
    'wx+': 706,
    'xw+': 706,
    a: 1089,
    ax: 1217,
    xa: 1217,
    'a+': 1090,
    'ax+': 1218,
    'xa+': 1218,
  },
  modeStringToFlags: function (str) {
    var flags = FS.flagModes[str];
    if (typeof flags === 'undefined') {
      throw new Error('Unknown file open mode: ' + str);
    }
    return flags;
  },
  flagsToPermissionString: function (flag) {
    var perms = ['r', 'w', 'rw'][flag & 3];
    if (flag & 512) {
      perms += 'w';
    }
    return perms;
  },
  nodePermissions: function (node, perms) {
    if (FS.ignorePermissions) {
      return 0;
    }
    if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
      return ERRNO_CODES.EACCES;
    } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
      return ERRNO_CODES.EACCES;
    } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
      return ERRNO_CODES.EACCES;
    }
    return 0;
  },
  mayLookup: function (dir) {
    var err = FS.nodePermissions(dir, 'x');
    if (err) return err;
    if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
    return 0;
  },
  mayCreate: function (dir, name) {
    try {
      var node = FS.lookupNode(dir, name);
      return ERRNO_CODES.EEXIST;
    } catch (e) {}
    return FS.nodePermissions(dir, 'wx');
  },
  mayDelete: function (dir, name, isdir) {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var err = FS.nodePermissions(dir, 'wx');
    if (err) {
      return err;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return ERRNO_CODES.ENOTDIR;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return ERRNO_CODES.EBUSY;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return ERRNO_CODES.EISDIR;
      }
    }
    return 0;
  },
  mayOpen: function (node, flags) {
    if (!node) {
      return ERRNO_CODES.ENOENT;
    }
    if (FS.isLink(node.mode)) {
      return ERRNO_CODES.ELOOP;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
        return ERRNO_CODES.EISDIR;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: function (fd_start, fd_end) {
    fd_start = fd_start || 0;
    fd_end = fd_end || FS.MAX_OPEN_FDS;
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
  },
  getStream: function (fd) {
    return FS.streams[fd];
  },
  createStream: function (stream, fd_start, fd_end) {
    if (!FS.FSStream) {
      FS.FSStream = function () {};
      FS.FSStream.prototype = {};
      Object.defineProperties(FS.FSStream.prototype, {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
      });
    }
    var newStream = new FS.FSStream();
    for (var p in stream) {
      newStream[p] = stream[p];
    }
    stream = newStream;
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: function (fd) {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: function (stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: function () {
      throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
    },
  },
  major: function (dev) {
    return dev >> 8;
  },
  minor: function (dev) {
    return dev & 255;
  },
  makedev: function (ma, mi) {
    return (ma << 8) | mi;
  },
  registerDevice: function (dev, ops) {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: function (dev) {
    return FS.devices[dev];
  },
  getMounts: function (mount) {
    var mounts = [];
    var check = [mount];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push.apply(check, m.mounts);
    }
    return mounts;
  },
  syncfs: function (populate, callback) {
    if (typeof populate === 'function') {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      console.log('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(err) {
      assert(FS.syncFSRequests > 0);
      FS.syncFSRequests--;
      return callback(err);
    }
    function done(err) {
      if (err) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(err);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    mounts.forEach(function (mount) {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: function (type, opts, mountpoint) {
    var root = mountpoint === '/';
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      mountpoint = lookup.path;
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
      }
    }
    var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      node.mounted = mount;
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount: function (mountpoint) {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach(function (hash) {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.indexOf(current.mount) !== -1) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    node.mounted = null;
    var idx = node.mount.mounts.indexOf(mount);
    assert(idx !== -1);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: function (parent, name) {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: function (path, mode, dev) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === '.' || name === '..') {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var err = FS.mayCreate(parent, name);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: function (path, mode) {
    mode = mode !== undefined ? mode : 438;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: function (path, mode) {
    mode = mode !== undefined ? mode : 511;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: function (path, mode) {
    var dirs = path.split('/');
    var d = '';
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += '/' + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != ERRNO_CODES.EEXIST) throw e;
      }
    }
  },
  mkdev: function (path, mode, dev) {
    if (typeof dev === 'undefined') {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: function (oldpath, newpath) {
    if (!PATH.resolve(oldpath)) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    var newname = PATH.basename(newpath);
    var err = FS.mayCreate(parent, newname);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: function (old_path, new_path) {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    var lookup, old_dir, new_dir;
    try {
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
    } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
    }
    if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
    }
    var old_node = FS.lookupNode(old_dir, old_name);
    var relative = PATH.relative(old_path, new_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    relative = PATH.relative(new_path, old_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
    }
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (old_node === new_node) {
      return;
    }
    var isdir = FS.isDir(old_node.mode);
    var err = FS.mayDelete(old_dir, old_name, isdir);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
    }
    if (new_dir !== old_dir) {
      err = FS.nodePermissions(old_dir, 'w');
      if (err) {
        throw new FS.ErrnoError(err);
      }
    }
    try {
      if (FS.trackingDelegate['willMovePath']) {
        FS.trackingDelegate['willMovePath'](old_path, new_path);
      }
    } catch (e) {
      console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
    }
    FS.hashRemoveNode(old_node);
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      FS.hashAddNode(old_node);
    }
    try {
      if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
    } catch (e) {
      console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
    }
  },
  rmdir: function (path) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var err = FS.mayDelete(parent, name, true);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
    }
    try {
      if (FS.trackingDelegate['willDeletePath']) {
        FS.trackingDelegate['willDeletePath'](path);
      }
    } catch (e) {
      console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
    try {
      if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
    } catch (e) {
      console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
    }
  },
  readdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
    }
    return node.node_ops.readdir(node);
  },
  unlink: function (path) {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var err = FS.mayDelete(parent, name, false);
    if (err) {
      throw new FS.ErrnoError(err);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
    }
    try {
      if (FS.trackingDelegate['willDeletePath']) {
        FS.trackingDelegate['willDeletePath'](path);
      }
    } catch (e) {
      console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
    try {
      if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
    } catch (e) {
      console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
    }
  },
  readlink: function (path) {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
  },
  stat: function (path, dontFollow) {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    return node.node_ops.getattr(node);
  },
  lstat: function (path) {
    return FS.stat(path, true);
  },
  chmod: function (path, mode, dontFollow) {
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now() });
  },
  lchmod: function (path, mode) {
    FS.chmod(path, mode, true);
  },
  fchmod: function (fd, mode) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    FS.chmod(stream.node, mode);
  },
  chown: function (path, uid, gid, dontFollow) {
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    node.node_ops.setattr(node, { timestamp: Date.now() });
  },
  lchown: function (path, uid, gid) {
    FS.chown(path, uid, gid, true);
  },
  fchown: function (fd, uid, gid) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: function (path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var node;
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(ERRNO_CODES.EPERM);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var err = FS.nodePermissions(node, 'w');
    if (err) {
      throw new FS.ErrnoError(err);
    }
    node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
  },
  ftruncate: function (fd, len) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    FS.truncate(stream.node, len);
  },
  utime: function (path, atime, mtime) {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
  },
  open: function (path, flags, mode, fd_start, fd_end) {
    if (path === '') {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode === 'undefined' ? 438 : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path === 'object') {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
        node = lookup.node;
      } catch (e) {}
    }
    var created = false;
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
        }
      } else {
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
    }
    if (!created) {
      var err = FS.mayOpen(node, flags);
      if (err) {
        throw new FS.ErrnoError(err);
      }
    }
    if (flags & 512) {
      FS.truncate(node, 0);
    }
    flags &= ~(128 | 512);
    var stream = FS.createStream(
      {
        node: node,
        path: FS.getPath(node),
        flags: flags,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        ungotten: [],
        error: false,
      },
      fd_start,
      fd_end
    );
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module['logReadFiles'] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
        Module['printErr']('read file: ' + path);
      }
    }
    try {
      if (FS.trackingDelegate['onOpenFile']) {
        var trackingFlags = 0;
        if ((flags & 2097155) !== 1) {
          trackingFlags |= FS.tracking.openFlags.READ;
        }
        if ((flags & 2097155) !== 0) {
          trackingFlags |= FS.tracking.openFlags.WRITE;
        }
        FS.trackingDelegate['onOpenFile'](path, trackingFlags);
      }
    } catch (e) {
      console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
    }
    return stream;
  },
  close: function (stream) {
    if (stream.getdents) stream.getdents = null;
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
  },
  llseek: function (stream, offset, whence) {
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: function (stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var seeking = true;
    if (typeof position === 'undefined') {
      position = stream.position;
      seeking = false;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: function (stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    if (stream.flags & 1024) {
      FS.llseek(stream, 0, 2);
    }
    var seeking = true;
    if (typeof position === 'undefined') {
      position = stream.position;
      seeking = false;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    try {
      if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
    } catch (e) {
      console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message);
    }
    return bytesWritten;
  },
  allocate: function (stream, offset, length) {
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: function (stream, buffer, offset, length, position, prot, flags) {
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(ERRNO_CODES.EACCES);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
    }
    return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
  },
  msync: function (stream, buffer, offset, length, mmapFlags) {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: function (stream) {
    return 0;
  },
  ioctl: function (stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: function (path, opts) {
    opts = opts || {};
    opts.flags = opts.flags || 'r';
    opts.encoding = opts.encoding || 'binary';
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === 'utf8') {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === 'binary') {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: function (path, data, opts) {
    opts = opts || {};
    opts.flags = opts.flags || 'w';
    opts.encoding = opts.encoding || 'utf8';
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var stream = FS.open(path, opts.flags, opts.mode);
    if (opts.encoding === 'utf8') {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
    } else if (opts.encoding === 'binary') {
      FS.write(stream, data, 0, data.length, 0, opts.canOwn);
    }
    FS.close(stream);
  },
  cwd: function () {
    return FS.currentPath;
  },
  chdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
    }
    var err = FS.nodePermissions(lookup.node, 'x');
    if (err) {
      throw new FS.ErrnoError(err);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: function () {
    FS.mkdir('/tmp');
    FS.mkdir('/home');
    FS.mkdir('/home/web_user');
  },
  createDefaultDevices: function () {
    FS.mkdir('/dev');
    FS.registerDevice(FS.makedev(1, 3), {
      read: function () {
        return 0;
      },
      write: function (stream, buffer, offset, length, pos) {
        return length;
      },
    });
    FS.mkdev('/dev/null', FS.makedev(1, 3));
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev('/dev/tty', FS.makedev(5, 0));
    FS.mkdev('/dev/tty1', FS.makedev(6, 0));
    var random_device;
    if (typeof crypto !== 'undefined') {
      var randomBuffer = new Uint8Array(1);
      random_device = function () {
        crypto.getRandomValues(randomBuffer);
        return randomBuffer[0];
      };
    } else if (ENVIRONMENT_IS_NODE) {
      random_device = function () {
        return require('crypto').randomBytes(1)[0];
      };
    } else {
      random_device = function () {
        return (Math.random() * 256) | 0;
      };
    }
    FS.createDevice('/dev', 'random', random_device);
    FS.createDevice('/dev', 'urandom', random_device);
    FS.mkdir('/dev/shm');
    FS.mkdir('/dev/shm/tmp');
  },
  createSpecialDirectories: function () {
    FS.mkdir('/proc');
    FS.mkdir('/proc/self');
    FS.mkdir('/proc/self/fd');
    FS.mount(
      {
        mount: function () {
          var node = FS.createNode('/proc/self', 'fd', 16384 | 511, 73);
          node.node_ops = {
            lookup: function (parent, name) {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
              var ret = {
                parent: null,
                mount: { mountpoint: 'fake' },
                node_ops: {
                  readlink: function () {
                    return stream.path;
                  },
                },
              };
              ret.parent = ret;
              return ret;
            },
          };
          return node;
        },
      },
      {},
      '/proc/self/fd'
    );
  },
  createStandardStreams: function () {
    if (Module['stdin']) {
      FS.createDevice('/dev', 'stdin', Module['stdin']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdin');
    }
    if (Module['stdout']) {
      FS.createDevice('/dev', 'stdout', null, Module['stdout']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdout');
    }
    if (Module['stderr']) {
      FS.createDevice('/dev', 'stderr', null, Module['stderr']);
    } else {
      FS.symlink('/dev/tty1', '/dev/stderr');
    }
    var stdin = FS.open('/dev/stdin', 'r');
    assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
    var stdout = FS.open('/dev/stdout', 'w');
    assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
    var stderr = FS.open('/dev/stderr', 'w');
    assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
  },
  ensureErrnoError: function () {
    if (FS.ErrnoError) return;
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = function (errno) {
        this.errno = errno;
        for (var key in ERRNO_CODES) {
          if (ERRNO_CODES[key] === errno) {
            this.code = key;
            break;
          }
        }
      };
      this.setErrno(errno);
      this.message = ERRNO_MESSAGES[errno];
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    [ERRNO_CODES.ENOENT].forEach(function (code) {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = '<generic error, no stack>';
    });
  },
  staticInit: function () {
    FS.ensureErrnoError();
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, '/');
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = { MEMFS: MEMFS, IDBFS: IDBFS, NODEFS: NODEFS, WORKERFS: WORKERFS };
  },
  init: function (input, output, error) {
    assert(
      !FS.init.initialized,
      'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
    );
    FS.init.initialized = true;
    FS.ensureErrnoError();
    Module['stdin'] = input || Module['stdin'];
    Module['stdout'] = output || Module['stdout'];
    Module['stderr'] = error || Module['stderr'];
    FS.createStandardStreams();
  },
  quit: function () {
    FS.init.initialized = false;
    var fflush = Module['_fflush'];
    if (fflush) fflush(0);
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: function (canRead, canWrite) {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  joinPath: function (parts, forceRelative) {
    var path = PATH.join.apply(null, parts);
    if (forceRelative && path[0] == '/') path = path.substr(1);
    return path;
  },
  absolutePath: function (relative, base) {
    return PATH.resolve(base, relative);
  },
  standardizePath: function (path) {
    return PATH.normalize(path);
  },
  findObject: function (path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      ___setErrNo(ret.error);
      return null;
    }
  },
  analyzePath: function (path, dontResolveLastLink) {
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === '/';
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createFolder: function (parent, name, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(canRead, canWrite);
    return FS.mkdir(path, mode);
  },
  createPath: function (parent, path, canRead, canWrite) {
    parent = typeof parent === 'string' ? parent : FS.getPath(parent);
    var parts = path.split('/').reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {}
      parent = current;
    }
    return current;
  },
  createFile: function (parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
    var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data === 'string') {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
        data = arr;
      }
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 'w');
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: function (parent, name, input, output) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    FS.registerDevice(dev, {
      open: function (stream) {
        stream.seekable = false;
      },
      close: function (stream) {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: function (stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write: function (stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  createLink: function (parent, name, target, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
    return FS.symlink(target, path);
  },
  forceLoadFile: function (obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    var success = true;
    if (typeof XMLHttpRequest !== 'undefined') {
      throw new Error(
        'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
      );
    } else if (Module['read']) {
      try {
        obj.contents = intArrayFromString(Module['read'](obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        success = false;
      }
    } else {
      throw new Error('Cannot load without read() or XMLHttpRequest.');
    }
    if (!success) ___setErrNo(ERRNO_CODES.EIO);
    return success;
  },
  createLazyFile: function (parent, name, url, canRead, canWrite) {
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = [];
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined;
      }
      var chunkOffset = idx % this.chunkSize;
      var chunkNum = (idx / this.chunkSize) | 0;
      return this.getter(chunkNum)[chunkOffset];
    };
    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
      this.getter = getter;
    };
    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, false);
      xhr.send(null);
      if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
        throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
      var datalength = Number(xhr.getResponseHeader('Content-length'));
      var header;
      var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
      var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
      var chunkSize = 1024 * 1024;
      if (!hasByteServing) chunkSize = datalength;
      var doXHR = function (from, to) {
        if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
        if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
        if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
        if (xhr.response !== undefined) {
          return new Uint8Array(xhr.response || []);
        } else {
          return intArrayFromString(xhr.responseText || '', true);
        }
      };
      var lazyArray = this;
      lazyArray.setDataGetter(function (chunkNum) {
        var start = chunkNum * chunkSize;
        var end = (chunkNum + 1) * chunkSize - 1;
        end = Math.min(end, datalength - 1);
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
          lazyArray.chunks[chunkNum] = doXHR(start, end);
        }
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') throw new Error('doXHR failed!');
        return lazyArray.chunks[chunkNum];
      });
      if (usesGzip || !datalength) {
        chunkSize = datalength = 1;
        datalength = this.getter(0).length;
        chunkSize = datalength;
        console.log('LazyFiles on gzip forces download of the whole file when length is accessed');
      }
      this._length = datalength;
      this._chunkSize = chunkSize;
      this.lengthKnown = true;
    };
    if (typeof XMLHttpRequest !== 'undefined') {
      if (!ENVIRONMENT_IS_WORKER)
        throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });
      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length;
        },
      },
    });
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach(function (key) {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        if (!FS.forceLoadFile(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        }
        return fn.apply(null, arguments);
      };
    });
    stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
      if (!FS.forceLoadFile(node)) {
        throw new FS.ErrnoError(ERRNO_CODES.EIO);
      }
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      assert(size >= 0);
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
    Browser.init();
    var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency('cp ' + fullname);
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }
      var handled = false;
      Module['preloadPlugins'].forEach(function (plugin) {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, function () {
            if (onerror) onerror();
            removeRunDependency(dep);
          });
          handled = true;
        }
      });
      if (!handled) finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == 'string') {
      Browser.asyncLoad(
        url,
        function (byteArray) {
          processData(byteArray);
        },
        onerror
      );
    } else {
      processData(url);
    }
  },
  indexedDB: function () {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  },
  DB_NAME: function () {
    return 'EM_FS_' + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: 'FILE_DATA',
  saveFilesToDB: function (paths, onload, onerror) {
    onload = onload || function () {};
    onerror = onerror || function () {};
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
      console.log('creating db');
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach(function (path) {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = function putRequest_onsuccess() {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = function putRequest_onerror() {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: function (paths, onload, onerror) {
    onload = onload || function () {};
    onerror = onerror || function () {};
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror;
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach(function (path) {
        var getRequest = files.get(path);
        getRequest.onsuccess = function getRequest_onsuccess() {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = function getRequest_onerror() {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  mappings: {},
  umask: 511,
  calculateAt: function (dirfd, path) {
    if (path[0] !== '/') {
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = FS.getStream(dirfd);
        if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        dir = dirstream.path;
      }
      path = PATH.join2(dir, path);
    }
    return path;
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
        return -ERRNO_CODES.ENOTDIR;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    HEAP32[(buf + 36) >> 2] = stat.size;
    HEAP32[(buf + 40) >> 2] = 4096;
    HEAP32[(buf + 44) >> 2] = stat.blocks;
    HEAP32[(buf + 48) >> 2] = (stat.atime.getTime() / 1e3) | 0;
    HEAP32[(buf + 52) >> 2] = 0;
    HEAP32[(buf + 56) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = stat.ino;
    return 0;
  },
  doMsync: function (addr, stream, len, flags) {
    var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
    FS.msync(stream, buffer, 0, len, flags);
  },
  doMkdir: function (path, mode) {
    path = PATH.normalize(path);
    if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);
    FS.mkdir(path, mode, 0);
    return 0;
  },
  doMknod: function (path, mode, dev) {
    switch (mode & 61440) {
      case 32768:
      case 8192:
      case 24576:
      case 4096:
      case 49152:
        break;
      default:
        return -ERRNO_CODES.EINVAL;
    }
    FS.mknod(path, mode, dev);
    return 0;
  },
  doReadlink: function (path, buf, bufsize) {
    if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
    var ret = FS.readlink(path);
    var len = Math.min(bufsize, lengthBytesUTF8(ret));
    var endChar = HEAP8[buf + len];
    stringToUTF8(ret, buf, bufsize + 1);
    HEAP8[buf + len] = endChar;
    return len;
  },
  doAccess: function (path, amode) {
    if (amode & ~7) {
      return -ERRNO_CODES.EINVAL;
    }
    var node;
    var lookup = FS.lookupPath(path, { follow: true });
    node = lookup.node;
    var perms = '';
    if (amode & 4) perms += 'r';
    if (amode & 2) perms += 'w';
    if (amode & 1) perms += 'x';
    if (perms && FS.nodePermissions(node, perms)) {
      return -ERRNO_CODES.EACCES;
    }
    return 0;
  },
  doDup: function (path, flags, suggestFD) {
    var suggest = FS.getStream(suggestFD);
    if (suggest) FS.close(suggest);
    return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
  },
  doReadv: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.read(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
      if (curr < len) break;
    }
    return ret;
  },
  doWritev: function (stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      var curr = FS.write(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
    }
    return ret;
  },
  varargs: 0,
  get: function (varargs) {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function () {
    var ret = Pointer_stringify(SYSCALLS.get());
    return ret;
  },
  getStreamFromFD: function () {
    var stream = FS.getStream(SYSCALLS.get());
    if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    return stream;
  },
  getSocketFromFD: function () {
    var socket = SOCKFS.getSocket(SYSCALLS.get());
    if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    return socket;
  },
  getSocketAddress: function (allowNull) {
    var addrp = SYSCALLS.get(),
      addrlen = SYSCALLS.get();
    if (allowNull && addrp === 0) return null;
    var info = __read_sockaddr(addrp, addrlen);
    if (info.errno) throw new FS.ErrnoError(info.errno);
    info.addr = DNS.lookup_addr(info.addr) || info.addr;
    return info;
  },
  get64: function () {
    var low = SYSCALLS.get(),
      high = SYSCALLS.get();
    if (low >= 0) assert(high === 0);
    else assert(high === -1);
    return low;
  },
  getZero: function () {
    assert(SYSCALLS.get() === 0);
  },
};
function ___syscall91(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var addr = SYSCALLS.get(),
      len = SYSCALLS.get();
    var info = SYSCALLS.mappings[addr];
    if (!info) return 0;
    if (len === info.len) {
      var stream = FS.getStream(info.fd);
      SYSCALLS.doMsync(addr, stream, len, info.flags);
      FS.munmap(stream);
      SYSCALLS.mappings[addr] = null;
      if (info.allocated) {
        _free(info.malloc);
      }
    }
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function ___cxa_allocate_exception(size) {
  return _malloc(size);
}
function ___syscall54(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(),
      op = SYSCALLS.get();
    switch (op) {
      case 21505: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      case 21506: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      case 21519: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return -ERRNO_CODES.EINVAL;
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        if (!stream.tty) return -ERRNO_CODES.ENOTTY;
        return 0;
      }
      default:
        abort('bad ioctl syscall ' + op);
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
Module['_bitshift64Lshr'] = _bitshift64Lshr;
function __embind_register_memory_view(rawType, dataTypeIndex, name) {
  var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
  var TA = typeMapping[dataTypeIndex];
  function decodeMemoryView(handle) {
    handle = handle >> 2;
    var heap = HEAPU32;
    var size = heap[handle];
    var data = heap[handle + 1];
    return new TA(heap['buffer'], data, size);
  }
  name = readLatin1String(name);
  registerType(
    rawType,
    { name: name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView },
    { ignoreDuplicateRegistrations: true }
  );
}
function floatReadValueFromPointer(name, shift) {
  switch (shift) {
    case 2:
      return function (pointer) {
        return this['fromWireType'](HEAPF32[pointer >> 2]);
      };
    case 3:
      return function (pointer) {
        return this['fromWireType'](HEAPF64[pointer >> 3]);
      };
    default:
      throw new TypeError('Unknown float type: ' + name);
  }
}
function __embind_register_float(rawType, name, size) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      return value;
    },
    toWireType: function (destructors, value) {
      if (typeof value !== 'number' && typeof value !== 'boolean') {
        throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
      }
      return value;
    },
    argPackAdvance: 8,
    readValueFromPointer: floatReadValueFromPointer(name, shift),
    destructorFunction: null,
  });
}
Module['_pthread_cond_broadcast'] = _pthread_cond_broadcast;
var _environ = STATICTOP;
STATICTOP += 16;
function ___buildEnvironment(env) {
  var MAX_ENV_VALUES = 64;
  var TOTAL_ENV_SIZE = 1024;
  var poolPtr;
  var envPtr;
  if (!___buildEnvironment.called) {
    ___buildEnvironment.called = true;
    ENV['USER'] = ENV['LOGNAME'] = 'web_user';
    ENV['PATH'] = '/';
    ENV['PWD'] = '/';
    ENV['HOME'] = '/home/web_user';
    ENV['LANG'] = 'C';
    ENV['_'] = Module['thisProgram'];
    poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
    envPtr = allocate(MAX_ENV_VALUES * 4, 'i8*', ALLOC_STATIC);
    HEAP32[envPtr >> 2] = poolPtr;
    HEAP32[_environ >> 2] = envPtr;
  } else {
    envPtr = HEAP32[_environ >> 2];
    poolPtr = HEAP32[envPtr >> 2];
  }
  var strings = [];
  var totalSize = 0;
  for (var key in env) {
    if (typeof env[key] === 'string') {
      var line = key + '=' + env[key];
      strings.push(line);
      totalSize += line.length;
    }
  }
  if (totalSize > TOTAL_ENV_SIZE) {
    throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
  }
  var ptrSize = 4;
  for (var i = 0; i < strings.length; i++) {
    var line = strings[i];
    writeAsciiToMemory(line, poolPtr);
    HEAP32[(envPtr + i * ptrSize) >> 2] = poolPtr;
    poolPtr += line.length + 1;
  }
  HEAP32[(envPtr + strings.length * ptrSize) >> 2] = 0;
}
var ENV = {};
function _getenv(name) {
  if (name === 0) return 0;
  name = Pointer_stringify(name);
  if (!ENV.hasOwnProperty(name)) return 0;
  if (_getenv.ret) _free(_getenv.ret);
  _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
  return _getenv.ret;
}
function new_(constructor, argumentList) {
  if (!(constructor instanceof Function)) {
    throw new TypeError('new_ called with constructor type ' + typeof constructor + ' which is not a function');
  }
  var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
  dummy.prototype = constructor.prototype;
  var obj = new dummy();
  var r = constructor.apply(obj, argumentList);
  return r instanceof Object ? r : obj;
}
function runDestructors(destructors) {
  while (destructors.length) {
    var ptr = destructors.pop();
    var del = destructors.pop();
    del(ptr);
  }
}
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
  var argCount = argTypes.length;
  if (argCount < 2) {
    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  var isClassMethodFunc = argTypes[1] !== null && classType !== null;
  var argsList = '';
  var argsListWired = '';
  for (var i = 0; i < argCount - 2; ++i) {
    argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
    argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
  }
  var invokerFnBody =
    'return function ' +
    makeLegalFunctionName(humanName) +
    '(' +
    argsList +
    ') {\n' +
    'if (arguments.length !== ' +
    (argCount - 2) +
    ') {\n' +
    "throwBindingError('function " +
    humanName +
    " called with ' + arguments.length + ' arguments, expected " +
    (argCount - 2) +
    " args!');\n" +
    '}\n';
  var needsDestructorStack = false;
  for (var i = 1; i < argTypes.length; ++i) {
    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
      needsDestructorStack = true;
      break;
    }
  }
  if (needsDestructorStack) {
    invokerFnBody += 'var destructors = [];\n';
  }
  var dtorStack = needsDestructorStack ? 'destructors' : 'null';
  var args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam'];
  var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
  if (isClassMethodFunc) {
    invokerFnBody += 'var thisWired = classParam.toWireType(' + dtorStack + ', this);\n';
  }
  for (var i = 0; i < argCount - 2; ++i) {
    invokerFnBody +=
      'var arg' + i + 'Wired = argType' + i + '.toWireType(' + dtorStack + ', arg' + i + '); // ' + argTypes[i + 2].name + '\n';
    args1.push('argType' + i);
    args2.push(argTypes[i + 2]);
  }
  if (isClassMethodFunc) {
    argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired;
  }
  var returns = argTypes[0].name !== 'void';
  invokerFnBody += (returns ? 'var rv = ' : '') + 'invoker(fn' + (argsListWired.length > 0 ? ', ' : '') + argsListWired + ');\n';
  if (needsDestructorStack) {
    invokerFnBody += 'runDestructors(destructors);\n';
  } else {
    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
      var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
      if (argTypes[i].destructorFunction !== null) {
        invokerFnBody += paramName + '_dtor(' + paramName + '); // ' + argTypes[i].name + '\n';
        args1.push(paramName + '_dtor');
        args2.push(argTypes[i].destructorFunction);
      }
    }
  }
  if (returns) {
    invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n';
  } else {
  }
  invokerFnBody += '}\n';
  args1.push(invokerFnBody);
  var invokerFunction = new_(Function, args1).apply(null, args2);
  return invokerFunction;
}
function heap32VectorToArray(count, firstElement) {
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(HEAP32[(firstElement >> 2) + i]);
  }
  return array;
}
function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
  var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  name = readLatin1String(name);
  rawInvoker = requireFunction(signature, rawInvoker);
  exposePublicSymbol(
    name,
    function () {
      throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    },
    argCount - 1
  );
  whenDependentTypesAreResolved([], argTypes, function (argTypes) {
    var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
    replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
    return [];
  });
}
function ___map_file(pathname, size) {
  ___setErrNo(ERRNO_CODES.EPERM);
  return -1;
}
function __embind_register_class_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, fn) {
  var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  methodName = readLatin1String(methodName);
  rawInvoker = requireFunction(invokerSignature, rawInvoker);
  whenDependentTypesAreResolved([], [rawClassType], function (classType) {
    classType = classType[0];
    var humanName = classType.name + '.' + methodName;
    function unboundTypesHandler() {
      throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
    }
    var proto = classType.registeredClass.constructor;
    if (undefined === proto[methodName]) {
      unboundTypesHandler.argCount = argCount - 1;
      proto[methodName] = unboundTypesHandler;
    } else {
      ensureOverloadTable(proto, methodName, humanName);
      proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler;
    }
    whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
      var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
      var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn);
      if (undefined === proto[methodName].overloadTable) {
        proto[methodName] = func;
      } else {
        proto[methodName].overloadTable[argCount - 1] = func;
      }
      return [];
    });
    return [];
  });
}
function ___cxa_begin_catch(ptr) {
  var info = EXCEPTIONS.infos[ptr];
  if (info && !info.caught) {
    info.caught = true;
    __ZSt18uncaught_exceptionv.uncaught_exception--;
  }
  if (info) info.rethrown = false;
  EXCEPTIONS.caught.push(ptr);
  EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
  return ptr;
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
  return dest;
}
Module['_memcpy'] = _memcpy;
function ___syscall6(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD();
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
var cttz_i8 = allocate(
  [
    8,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    6,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    7,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    6,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
  ],
  'i8',
  ALLOC_STATIC
);
Module['_llvm_cttz_i32'] = _llvm_cttz_i32;
Module['___udivmoddi4'] = ___udivmoddi4;
Module['___udivdi3'] = ___udivdi3;
Module['___muldsi3'] = ___muldsi3;
Module['___muldi3'] = ___muldi3;
Module['_sbrk'] = _sbrk;
Module['_bitshift64Shl'] = _bitshift64Shl;
function __embind_register_std_wstring(rawType, charSize, name) {
  name = readLatin1String(name);
  var getHeap, shift;
  if (charSize === 2) {
    getHeap = function () {
      return HEAPU16;
    };
    shift = 1;
  } else if (charSize === 4) {
    getHeap = function () {
      return HEAPU32;
    };
    shift = 2;
  }
  registerType(rawType, {
    name: name,
    fromWireType: function (value) {
      var HEAP = getHeap();
      var length = HEAPU32[value >> 2];
      var a = new Array(length);
      var start = (value + 4) >> shift;
      for (var i = 0; i < length; ++i) {
        a[i] = String.fromCharCode(HEAP[start + i]);
      }
      _free(value);
      return a.join('');
    },
    toWireType: function (destructors, value) {
      var HEAP = getHeap();
      var length = value.length;
      var ptr = _malloc(4 + length * charSize);
      HEAPU32[ptr >> 2] = length;
      var start = (ptr + 4) >> shift;
      for (var i = 0; i < length; ++i) {
        HEAP[start + i] = value.charCodeAt(i);
      }
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    argPackAdvance: 8,
    readValueFromPointer: simpleReadValueFromPointer,
    destructorFunction: function (ptr) {
      _free(ptr);
    },
  });
}
Module['_memmove'] = _memmove;
function ___gxx_personality_v0() {}
Module['___uremdi3'] = ___uremdi3;
function _pthread_cond_wait() {
  return 0;
}
Module['_pthread_mutex_unlock'] = _pthread_mutex_unlock;
Module['_llvm_bswap_i32'] = _llvm_bswap_i32;
function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
  var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  invoker = requireFunction(invokerSignature, invoker);
  whenDependentTypesAreResolved([], [rawClassType], function (classType) {
    classType = classType[0];
    var humanName = 'constructor ' + classType.name;
    if (undefined === classType.registeredClass.constructor_body) {
      classType.registeredClass.constructor_body = [];
    }
    if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
      throw new BindingError(
        'Cannot register multiple constructors with identical number of parameters (' +
          (argCount - 1) +
          ") for class '" +
          classType.name +
          "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
      );
    }
    classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
      throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
    };
    whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
      classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
        if (arguments.length !== argCount - 1) {
          throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount - 1));
        }
        var destructors = [];
        var args = new Array(argCount);
        args[0] = rawConstructor;
        for (var i = 1; i < argCount; ++i) {
          args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
        }
        var ptr = invoker.apply(null, args);
        runDestructors(destructors);
        return argTypes[0]['fromWireType'](ptr);
      };
      return [];
    });
    return [];
  });
}
function _llvm_trap() {
  abort('trap!');
}
function ___syscall140(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(),
      offset_high = SYSCALLS.get(),
      offset_low = SYSCALLS.get(),
      result = SYSCALLS.get(),
      whence = SYSCALLS.get();
    var offset = offset_low;
    assert(offset_high === 0);
    FS.llseek(stream, offset, whence);
    HEAP32[result >> 2] = stream.position;
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    return 0;
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function ___syscall146(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(),
      iov = SYSCALLS.get(),
      iovcnt = SYSCALLS.get();
    return SYSCALLS.doWritev(stream, iov, iovcnt);
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function __embind_register_class_function(
  rawClassType,
  methodName,
  argCount,
  rawArgTypesAddr,
  invokerSignature,
  rawInvoker,
  context,
  isPureVirtual
) {
  var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
  methodName = readLatin1String(methodName);
  rawInvoker = requireFunction(invokerSignature, rawInvoker);
  whenDependentTypesAreResolved([], [rawClassType], function (classType) {
    classType = classType[0];
    var humanName = classType.name + '.' + methodName;
    if (isPureVirtual) {
      classType.registeredClass.pureVirtualFunctions.push(methodName);
    }
    function unboundTypesHandler() {
      throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
    }
    var proto = classType.registeredClass.instancePrototype;
    var method = proto[methodName];
    if (
      undefined === method ||
      (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)
    ) {
      unboundTypesHandler.argCount = argCount - 2;
      unboundTypesHandler.className = classType.name;
      proto[methodName] = unboundTypesHandler;
    } else {
      ensureOverloadTable(proto, methodName, humanName);
      proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
    }
    whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
      var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
      if (undefined === proto[methodName].overloadTable) {
        memberFunction.argCount = argCount - 2;
        proto[methodName] = memberFunction;
      } else {
        proto[methodName].overloadTable[argCount - 2] = memberFunction;
      }
      return [];
    });
    return [];
  });
}
var ___dso_handle = STATICTOP;
STATICTOP += 16;
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
init_ClassHandle();
init_RegisteredPointer();
init_embind();
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
init_emval();
FS.staticInit();
__ATINIT__.unshift(function () {
  if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
});
__ATMAIN__.push(function () {
  FS.ignorePermissions = false;
});
__ATEXIT__.push(function () {
  FS.quit();
});
Module['FS_createFolder'] = FS.createFolder;
Module['FS_createPath'] = FS.createPath;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createLink'] = FS.createLink;
Module['FS_createDevice'] = FS.createDevice;
Module['FS_unlink'] = FS.unlink;
__ATINIT__.unshift(function () {
  TTY.init();
});
__ATEXIT__.push(function () {
  TTY.shutdown();
});
if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
  var NODEJS_PATH = require('path');
  NODEFS.staticInit();
}
___buildEnvironment(ENV);
DYNAMICTOP_PTR = allocate(1, 'i32', ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  try {
    return Module['dynCall_iiiiiiii'](index, a1, a2, a3, a4, a5, a6, a7);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiiiid(index, a1, a2, a3, a4, a5, a6) {
  try {
    return Module['dynCall_iiiiiid'](index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
  try {
    Module['dynCall_viiiii'](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_vi(index, a1) {
  try {
    Module['dynCall_vi'](index, a1);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_vii(index, a1, a2) {
  try {
    Module['dynCall_vii'](index, a1, a2);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
  try {
    return Module['dynCall_iiiiiii'](index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_ii(index, a1) {
  try {
    return Module['dynCall_ii'](index, a1);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iidd(index, a1, a2, a3) {
  try {
    return Module['dynCall_iidd'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  try {
    return Module['dynCall_iiiii'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiii(index, a1, a2, a3) {
  try {
    return Module['dynCall_iiii'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
  try {
    Module['dynCall_viiiiii'](index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiid(index, a1, a2, a3) {
  try {
    return Module['dynCall_iiid'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_di(index, a1) {
  try {
    return Module['dynCall_di'](index, a1);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viiiid(index, a1, a2, a3, a4, a5) {
  try {
    Module['dynCall_viiiid'](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
  try {
    return Module['dynCall_iiiiiiiii'](index, a1, a2, a3, a4, a5, a6, a7, a8);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iii(index, a1, a2) {
  try {
    return Module['dynCall_iii'](index, a1, a2);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_diii(index, a1, a2, a3) {
  try {
    return Module['dynCall_diii'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_diiii(index, a1, a2, a3, a4) {
  try {
    return Module['dynCall_diiii'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_dii(index, a1, a2) {
  try {
    return Module['dynCall_dii'](index, a1, a2);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiid(index, a1, a2, a3, a4) {
  try {
    return Module['dynCall_iiiid'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
  try {
    return Module['dynCall_iiiiii'](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viii(index, a1, a2, a3) {
  try {
    Module['dynCall_viii'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module['dynCall_v'](index);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viid(index, a1, a2, a3) {
  try {
    Module['dynCall_viid'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
  try {
    return Module['dynCall_iiiiid'](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  try {
    Module['dynCall_viiii'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module['setThrew'](1, 0);
  }
}
Module.asmGlobalArg = {
  Math: Math,
  Int8Array: Int8Array,
  Int16Array: Int16Array,
  Int32Array: Int32Array,
  Uint8Array: Uint8Array,
  Uint16Array: Uint16Array,
  Uint32Array: Uint32Array,
  Float32Array: Float32Array,
  Float64Array: Float64Array,
  NaN: NaN,
  Infinity: Infinity,
  byteLength: byteLength,
};
Module.asmLibraryArg = {
  abort: abort,
  assert: assert,
  enlargeMemory: enlargeMemory,
  getTotalMemory: getTotalMemory,
  abortOnCannotGrowMemory: abortOnCannotGrowMemory,
  invoke_iiiiiiii: invoke_iiiiiiii,
  invoke_iiiiiid: invoke_iiiiiid,
  invoke_viiiii: invoke_viiiii,
  invoke_vi: invoke_vi,
  invoke_vii: invoke_vii,
  invoke_iiiiiii: invoke_iiiiiii,
  invoke_ii: invoke_ii,
  invoke_iidd: invoke_iidd,
  invoke_iiiii: invoke_iiiii,
  invoke_iiii: invoke_iiii,
  invoke_viiiiii: invoke_viiiiii,
  invoke_iiid: invoke_iiid,
  invoke_di: invoke_di,
  invoke_viiiid: invoke_viiiid,
  invoke_iiiiiiiii: invoke_iiiiiiiii,
  invoke_iii: invoke_iii,
  invoke_diii: invoke_diii,
  invoke_diiii: invoke_diiii,
  invoke_dii: invoke_dii,
  invoke_iiiid: invoke_iiiid,
  invoke_iiiiii: invoke_iiiiii,
  invoke_viii: invoke_viii,
  invoke_v: invoke_v,
  invoke_viid: invoke_viid,
  invoke_iiiiid: invoke_iiiiid,
  invoke_viiii: invoke_viiii,
  floatReadValueFromPointer: floatReadValueFromPointer,
  simpleReadValueFromPointer: simpleReadValueFromPointer,
  throwInternalError: throwInternalError,
  get_first_emval: get_first_emval,
  getLiveInheritedInstances: getLiveInheritedInstances,
  ___assert_fail: ___assert_fail,
  __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv,
  ClassHandle: ClassHandle,
  getShiftFromSize: getShiftFromSize,
  __addDays: __addDays,
  ___cxa_begin_catch: ___cxa_begin_catch,
  _emscripten_memcpy_big: _emscripten_memcpy_big,
  runDestructor: runDestructor,
  throwInstanceAlreadyDeleted: throwInstanceAlreadyDeleted,
  __embind_register_std_string: __embind_register_std_string,
  init_RegisteredPointer: init_RegisteredPointer,
  ClassHandle_isAliasOf: ClassHandle_isAliasOf,
  flushPendingDeletes: flushPendingDeletes,
  makeClassHandle: makeClassHandle,
  whenDependentTypesAreResolved: whenDependentTypesAreResolved,
  __embind_register_class_constructor: __embind_register_class_constructor,
  ___cxa_atexit: ___cxa_atexit,
  init_ClassHandle: init_ClassHandle,
  ___syscall140: ___syscall140,
  ClassHandle_clone: ClassHandle_clone,
  ___syscall146: ___syscall146,
  RegisteredClass: RegisteredClass,
  ___cxa_find_matching_catch: ___cxa_find_matching_catch,
  embind_init_charCodes: embind_init_charCodes,
  ___setErrNo: ___setErrNo,
  __embind_register_class_class_function: __embind_register_class_class_function,
  __embind_register_bool: __embind_register_bool,
  ___resumeException: ___resumeException,
  createNamedFunction: createNamedFunction,
  ___syscall91: ___syscall91,
  __emval_decref: __emval_decref,
  _pthread_once: _pthread_once,
  _llvm_trap: _llvm_trap,
  __embind_register_class: __embind_register_class,
  constNoSmartPtrRawPointerToWireType: constNoSmartPtrRawPointerToWireType,
  heap32VectorToArray: heap32VectorToArray,
  ClassHandle_delete: ClassHandle_delete,
  RegisteredPointer_destructor: RegisteredPointer_destructor,
  ___syscall6: ___syscall6,
  ensureOverloadTable: ensureOverloadTable,
  __embind_register_emval: __embind_register_emval,
  new_: new_,
  downcastPointer: downcastPointer,
  replacePublicSymbol: replacePublicSymbol,
  init_embind: init_embind,
  ClassHandle_deleteLater: ClassHandle_deleteLater,
  integerReadValueFromPointer: integerReadValueFromPointer,
  RegisteredPointer_deleteObject: RegisteredPointer_deleteObject,
  ClassHandle_isDeleted: ClassHandle_isDeleted,
  __embind_register_integer: __embind_register_integer,
  ___cxa_allocate_exception: ___cxa_allocate_exception,
  ___buildEnvironment: ___buildEnvironment,
  __isLeapYear: __isLeapYear,
  _embind_repr: _embind_repr,
  _pthread_getspecific: _pthread_getspecific,
  throwUnboundTypeError: throwUnboundTypeError,
  craftInvokerFunction: craftInvokerFunction,
  _getenv: _getenv,
  runDestructors: runDestructors,
  makeLegalFunctionName: makeLegalFunctionName,
  _pthread_key_create: _pthread_key_create,
  upcastPointer: upcastPointer,
  init_emval: init_emval,
  shallowCopyInternalPointer: shallowCopyInternalPointer,
  nonConstNoSmartPtrRawPointerToWireType: nonConstNoSmartPtrRawPointerToWireType,
  _abort: _abort,
  throwBindingError: throwBindingError,
  getTypeName: getTypeName,
  exposePublicSymbol: exposePublicSymbol,
  RegisteredPointer_fromWireType: RegisteredPointer_fromWireType,
  _strftime: _strftime,
  _pthread_cond_wait: _pthread_cond_wait,
  ___lock: ___lock,
  __embind_register_memory_view: __embind_register_memory_view,
  getInheritedInstance: getInheritedInstance,
  setDelayFunction: setDelayFunction,
  ___gxx_personality_v0: ___gxx_personality_v0,
  extendError: extendError,
  __embind_register_void: __embind_register_void,
  __embind_register_function: __embind_register_function,
  _strftime_l: _strftime_l,
  RegisteredPointer_getPointee: RegisteredPointer_getPointee,
  __emval_register: __emval_register,
  __embind_register_std_wstring: __embind_register_std_wstring,
  __embind_register_class_function: __embind_register_class_function,
  RegisteredPointer: RegisteredPointer,
  __arraySum: __arraySum,
  readLatin1String: readLatin1String,
  getBasestPointer: getBasestPointer,
  getInheritedInstanceCount: getInheritedInstanceCount,
  __embind_register_float: __embind_register_float,
  ___syscall54: ___syscall54,
  ___unlock: ___unlock,
  _pthread_setspecific: _pthread_setspecific,
  genericPointerToWireType: genericPointerToWireType,
  registerType: registerType,
  ___cxa_throw: ___cxa_throw,
  count_emval_handles: count_emval_handles,
  requireFunction: requireFunction,
  _atexit: _atexit,
  ___map_file: ___map_file,
  DYNAMICTOP_PTR: DYNAMICTOP_PTR,
  tempDoublePtr: tempDoublePtr,
  ABORT: ABORT,
  STACKTOP: STACKTOP,
  STACK_MAX: STACK_MAX,
  cttz_i8: cttz_i8,
  ___dso_handle: ___dso_handle,
}; // EMSCRIPTEN_START_ASM
var asm = (function (global, env, buffer) {
  'almost asm';
  var a = global.Int8Array;
  var b = global.Int16Array;
  var c = global.Int32Array;
  var d = global.Uint8Array;
  var e = global.Uint16Array;
  var f = global.Uint32Array;
  var g = global.Float32Array;
  var h = global.Float64Array;
  var i = new a(buffer);
  var j = new b(buffer);
  var k = new c(buffer);
  var l = new d(buffer);
  var m = new e(buffer);
  var n = new f(buffer);
  var o = new g(buffer);
  var p = new h(buffer);
  var q = global.byteLength;
  var r = env.DYNAMICTOP_PTR | 0;
  var s = env.tempDoublePtr | 0;
  var t = env.ABORT | 0;
  var u = env.STACKTOP | 0;
  var v = env.STACK_MAX | 0;
  var w = env.cttz_i8 | 0;
  var x = env.___dso_handle | 0;
  var y = 0;
  var z = 0;
  var A = 0;
  var B = 0;
  var C = global.NaN,
    D = global.Infinity;
  var E = 0,
    F = 0,
    G = 0,
    H = 0,
    I = 0.0,
    J = 0,
    K = 0,
    L = 0,
    M = 0.0;
  var N = 0;
  var O = global.Math.floor;
  var P = global.Math.abs;
  var Q = global.Math.sqrt;
  var R = global.Math.pow;
  var S = global.Math.cos;
  var T = global.Math.sin;
  var U = global.Math.tan;
  var V = global.Math.acos;
  var W = global.Math.asin;
  var X = global.Math.atan;
  var Y = global.Math.atan2;
  var Z = global.Math.exp;
  var _ = global.Math.log;
  var $ = global.Math.ceil;
  var aa = global.Math.imul;
  var ba = global.Math.min;
  var ca = global.Math.max;
  var da = global.Math.clz32;
  var ea = env.abort;
  var fa = env.assert;
  var ga = env.enlargeMemory;
  var ha = env.getTotalMemory;
  var ia = env.abortOnCannotGrowMemory;
  var ja = env.invoke_iiiiiiii;
  var ka = env.invoke_iiiiiid;
  var la = env.invoke_viiiii;
  var ma = env.invoke_vi;
  var na = env.invoke_vii;
  var oa = env.invoke_iiiiiii;
  var pa = env.invoke_ii;
  var qa = env.invoke_iidd;
  var ra = env.invoke_iiiii;
  var sa = env.invoke_iiii;
  var ta = env.invoke_viiiiii;
  var ua = env.invoke_iiid;
  var va = env.invoke_di;
  var wa = env.invoke_viiiid;
  var xa = env.invoke_iiiiiiiii;
  var ya = env.invoke_iii;
  var za = env.invoke_diii;
  var Aa = env.invoke_diiii;
  var Ba = env.invoke_dii;
  var Ca = env.invoke_iiiid;
  var Da = env.invoke_iiiiii;
  var Ea = env.invoke_viii;
  var Fa = env.invoke_v;
  var Ga = env.invoke_viid;
  var Ha = env.invoke_iiiiid;
  var Ia = env.invoke_viiii;
  var Ja = env.floatReadValueFromPointer;
  var Ka = env.simpleReadValueFromPointer;
  var La = env.throwInternalError;
  var Ma = env.get_first_emval;
  var Na = env.getLiveInheritedInstances;
  var Oa = env.___assert_fail;
  var Pa = env.__ZSt18uncaught_exceptionv;
  var Qa = env.ClassHandle;
  var Ra = env.getShiftFromSize;
  var Sa = env.__addDays;
  var Ta = env.___cxa_begin_catch;
  var Ua = env._emscripten_memcpy_big;
  var Va = env.runDestructor;
  var Wa = env.throwInstanceAlreadyDeleted;
  var Xa = env.__embind_register_std_string;
  var Ya = env.init_RegisteredPointer;
  var Za = env.ClassHandle_isAliasOf;
  var _a = env.flushPendingDeletes;
  var $a = env.makeClassHandle;
  var ab = env.whenDependentTypesAreResolved;
  var bb = env.__embind_register_class_constructor;
  var cb = env.___cxa_atexit;
  var db = env.init_ClassHandle;
  var eb = env.___syscall140;
  var fb = env.ClassHandle_clone;
  var gb = env.___syscall146;
  var hb = env.RegisteredClass;
  var ib = env.___cxa_find_matching_catch;
  var jb = env.embind_init_charCodes;
  var kb = env.___setErrNo;
  var lb = env.__embind_register_class_class_function;
  var mb = env.__embind_register_bool;
  var nb = env.___resumeException;
  var ob = env.createNamedFunction;
  var pb = env.___syscall91;
  var qb = env.__emval_decref;
  var rb = env._pthread_once;
  var sb = env._llvm_trap;
  var tb = env.__embind_register_class;
  var ub = env.constNoSmartPtrRawPointerToWireType;
  var vb = env.heap32VectorToArray;
  var wb = env.ClassHandle_delete;
  var xb = env.RegisteredPointer_destructor;
  var yb = env.___syscall6;
  var zb = env.ensureOverloadTable;
  var Ab = env.__embind_register_emval;
  var Bb = env.new_;
  var Cb = env.downcastPointer;
  var Db = env.replacePublicSymbol;
  var Eb = env.init_embind;
  var Fb = env.ClassHandle_deleteLater;
  var Gb = env.integerReadValueFromPointer;
  var Hb = env.RegisteredPointer_deleteObject;
  var Ib = env.ClassHandle_isDeleted;
  var Jb = env.__embind_register_integer;
  var Kb = env.___cxa_allocate_exception;
  var Lb = env.___buildEnvironment;
  var Mb = env.__isLeapYear;
  var Nb = env._embind_repr;
  var Ob = env._pthread_getspecific;
  var Pb = env.throwUnboundTypeError;
  var Qb = env.craftInvokerFunction;
  var Rb = env._getenv;
  var Sb = env.runDestructors;
  var Tb = env.makeLegalFunctionName;
  var Ub = env._pthread_key_create;
  var Vb = env.upcastPointer;
  var Wb = env.init_emval;
  var Xb = env.shallowCopyInternalPointer;
  var Yb = env.nonConstNoSmartPtrRawPointerToWireType;
  var Zb = env._abort;
  var _b = env.throwBindingError;
  var $b = env.getTypeName;
  var ac = env.exposePublicSymbol;
  var bc = env.RegisteredPointer_fromWireType;
  var cc = env._strftime;
  var dc = env._pthread_cond_wait;
  var ec = env.___lock;
  var fc = env.__embind_register_memory_view;
  var gc = env.getInheritedInstance;
  var hc = env.setDelayFunction;
  var ic = env.___gxx_personality_v0;
  var jc = env.extendError;
  var kc = env.__embind_register_void;
  var lc = env.__embind_register_function;
  var mc = env._strftime_l;
  var nc = env.RegisteredPointer_getPointee;
  var oc = env.__emval_register;
  var pc = env.__embind_register_std_wstring;
  var qc = env.__embind_register_class_function;
  var rc = env.RegisteredPointer;
  var sc = env.__arraySum;
  var tc = env.readLatin1String;
  var uc = env.getBasestPointer;
  var vc = env.getInheritedInstanceCount;
  var wc = env.__embind_register_float;
  var xc = env.___syscall54;
  var yc = env.___unlock;
  var zc = env._pthread_setspecific;
  var Ac = env.genericPointerToWireType;
  var Bc = env.registerType;
  var Cc = env.___cxa_throw;
  var Dc = env.count_emval_handles;
  var Ec = env.requireFunction;
  var Fc = env._atexit;
  var Gc = env.___map_file;
  var Hc = 0.0;
  function Ic(newBuffer) {
    if (q(newBuffer) & 16777215 || q(newBuffer) <= 16777215 || q(newBuffer) > 2147483648) return false;
    i = new a(newBuffer);
    j = new b(newBuffer);
    k = new c(newBuffer);
    l = new d(newBuffer);
    m = new e(newBuffer);
    n = new f(newBuffer);
    o = new g(newBuffer);
    p = new h(newBuffer);
    buffer = newBuffer;
    return true;
  }
  // EMSCRIPTEN_START_FUNCS
  function hd(a) {
    a = a | 0;
    var b = 0;
    b = u;
    u = (u + a) | 0;
    u = (u + 15) & -16;
    return b | 0;
  }
  function id() {
    return u | 0;
  }
  function jd(a) {
    a = a | 0;
    u = a;
  }
  function kd(a, b) {
    a = a | 0;
    b = b | 0;
    u = a;
    v = b;
  }
  function ld(a, b) {
    a = a | 0;
    b = b | 0;
    if (!y) {
      y = a;
      z = b;
    }
  }
  function md(a) {
    a = a | 0;
    N = a;
  }
  function nd() {
    return N | 0;
  }
  function od(a) {
    a = a | 0;
    tb(8, 16, 32, 0, 11906, 52, 11909, 0, 11909, 0, 11404, 11911, 84);
    bb(8, 3, 2224, 11914, 22, 11);
    bb(8, 2, 2236, 12787, 12, 53);
    lb(8, 11416, 3, 2244, 11914, 23, 1);
    lb(8, 11425, 3, 2244, 11914, 23, 2);
    lb(8, 11430, 4, 2256, 12791, 1, 8);
    lb(8, 11439, 3, 2244, 11914, 23, 3);
    a = CA(8) | 0;
    k[a >> 2] = 34;
    k[(a + 4) >> 2] = 0;
    qc(8, 11446, 2, 2272, 12787, 13, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 54;
    k[(a + 4) >> 2] = 0;
    qc(8, 11456, 2, 2280, 12787, 14, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 55;
    k[(a + 4) >> 2] = 0;
    qc(8, 11462, 2, 2280, 12787, 14, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 1;
    k[(a + 4) >> 2] = 0;
    qc(8, 11468, 3, 2288, 13354, 1, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 1;
    k[(a + 4) >> 2] = 0;
    qc(8, 11473, 2, 2300, 15269, 2, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 2;
    k[(a + 4) >> 2] = 0;
    qc(8, 11478, 2, 2300, 15269, 2, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 8;
    k[(a + 4) >> 2] = 0;
    qc(8, 11482, 6, 2308, 15273, 39, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 35;
    k[(a + 4) >> 2] = 0;
    qc(8, 11492, 3, 2332, 15281, 1, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 36;
    k[(a + 4) >> 2] = 0;
    qc(8, 11500, 3, 2344, 15286, 4, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 37;
    k[(a + 4) >> 2] = 0;
    qc(8, 11512, 3, 2344, 15286, 4, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 5;
    k[(a + 4) >> 2] = 0;
    qc(8, 11524, 3, 2356, 15291, 1, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 6;
    k[(a + 4) >> 2] = 0;
    qc(8, 11534, 3, 2368, 11914, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 7;
    k[(a + 4) >> 2] = 0;
    qc(8, 11545, 3, 2368, 11914, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 8;
    k[(a + 4) >> 2] = 0;
    qc(8, 11550, 3, 2368, 11914, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 38;
    k[(a + 4) >> 2] = 0;
    qc(8, 11556, 2, 2380, 12787, 15, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 2;
    k[(a + 4) >> 2] = 0;
    qc(8, 11564, 4, 2388, 15771, 1, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 9;
    k[(a + 4) >> 2] = 0;
    qc(8, 11568, 5, 2404, 15777, 1, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 9;
    k[(a + 4) >> 2] = 0;
    qc(8, 11572, 3, 2368, 11914, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 10;
    k[(a + 4) >> 2] = 0;
    qc(8, 11577, 3, 2368, 11914, 24, a | 0, 0);
    tb(48, 56, 72, 0, 11906, 56, 11909, 0, 11909, 0, 11582, 11911, 85);
    bb(48, 3, 2424, 11914, 25, 16);
    a = CA(8) | 0;
    k[a >> 2] = 10;
    k[(a + 4) >> 2] = 0;
    qc(48, 11590, 5, 2436, 15777, 2, a | 0, 0);
    tb(88, 96, 112, 0, 11906, 57, 11909, 0, 11909, 0, 11599, 11911, 86);
    bb(88, 3, 2456, 11914, 26, 17);
    bb(88, 2, 2468, 12787, 18, 58);
    lb(88, 11416, 3, 2476, 11914, 27, 11);
    lb(88, 11612, 2, 2488, 12787, 19, 39);
    a = CA(8) | 0;
    k[a >> 2] = 40;
    k[(a + 4) >> 2] = 0;
    qc(88, 11446, 2, 2496, 12787, 20, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 59;
    k[(a + 4) >> 2] = 0;
    qc(88, 11456, 2, 2504, 12787, 21, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 60;
    k[(a + 4) >> 2] = 0;
    qc(88, 11462, 2, 2504, 12787, 21, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 61;
    k[(a + 4) >> 2] = 0;
    qc(88, 11617, 2, 2504, 12787, 21, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 3;
    k[(a + 4) >> 2] = 0;
    qc(88, 11621, 2, 2512, 15269, 3, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 9;
    k[(a + 4) >> 2] = 0;
    qc(88, 11482, 6, 2520, 15273, 40, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 41;
    k[(a + 4) >> 2] = 0;
    qc(88, 11635, 2, 2544, 12787, 22, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 62;
    k[(a + 4) >> 2] = 0;
    qc(88, 11643, 2, 2552, 12787, 23, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 63;
    k[(a + 4) >> 2] = 0;
    qc(88, 11648, 2, 2560, 12787, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 64;
    k[(a + 4) >> 2] = 0;
    qc(88, 11651, 2, 2568, 12787, 25, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 42;
    k[(a + 4) >> 2] = 0;
    qc(88, 11492, 3, 2576, 15281, 2, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 43;
    k[(a + 4) >> 2] = 0;
    qc(88, 11500, 3, 2588, 15286, 12, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 44;
    k[(a + 4) >> 2] = 0;
    qc(88, 11512, 3, 2588, 15286, 12, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 13;
    k[(a + 4) >> 2] = 0;
    qc(88, 11524, 3, 2600, 15291, 2, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 14;
    k[(a + 4) >> 2] = 0;
    qc(88, 11654, 3, 2740, 11914, 28, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 15;
    k[(a + 4) >> 2] = 0;
    qc(88, 11545, 3, 2740, 11914, 28, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 16;
    k[(a + 4) >> 2] = 0;
    qc(88, 11550, 3, 2740, 11914, 28, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 17;
    k[(a + 4) >> 2] = 0;
    qc(88, 11534, 3, 2752, 11914, 29, a | 0, 0);
    tb(128, 136, 200, 0, 11906, 65, 11909, 0, 11909, 0, 11666, 11911, 87);
    bb(128, 2, 2764, 12787, 26, 66);
    a = CA(8) | 0;
    k[a >> 2] = 18;
    k[(a + 4) >> 2] = 0;
    qc(128, 11675, 3, 2772, 11914, 30, a | 0, 0);
    tb(152, 160, 216, 0, 11906, 67, 11909, 0, 11909, 0, 11697, 11911, 88);
    bb(152, 2, 2784, 12787, 27, 68);
    a = CA(8) | 0;
    k[a >> 2] = 19;
    k[(a + 4) >> 2] = 0;
    qc(152, 11700, 3, 2912, 11914, 31, a | 0, 0);
    tb(176, 184, 304, 0, 11906, 69, 11909, 0, 11909, 0, 11712, 11911, 89);
    bb(176, 2, 2924, 12787, 28, 70);
    a = CA(8) | 0;
    k[a >> 2] = 20;
    k[(a + 4) >> 2] = 0;
    qc(176, 11715, 3, 2932, 11914, 32, a | 0, 0);
    tb(320, 328, 344, 0, 11906, 71, 11909, 0, 11909, 0, 11721, 11911, 90);
    bb(320, 3, 2944, 21173, 1, 29);
    lc(11729, 2, 2956, 15269, 4, 4);
    lc(11734, 2, 2956, 15269, 4, 5);
    tb(360, 368, 384, 0, 11906, 72, 11909, 0, 11909, 0, 11739, 11911, 91);
    bb(360, 3, 2964, 11914, 33, 30);
    bb(360, 2, 2976, 12787, 31, 73);
    lb(360, 11416, 3, 2984, 11914, 34, 21);
    lb(360, 11425, 3, 2984, 11914, 34, 22);
    lb(360, 11430, 4, 2996, 21286, 6, 11);
    lb(360, 11439, 3, 2984, 11914, 34, 23);
    a = CA(8) | 0;
    k[a >> 2] = 45;
    k[(a + 4) >> 2] = 0;
    qc(360, 11446, 2, 3012, 12787, 32, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 46;
    k[(a + 4) >> 2] = 0;
    qc(360, 11758, 2, 3012, 12787, 32, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 74;
    k[(a + 4) >> 2] = 0;
    qc(360, 11456, 2, 3020, 12787, 33, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 75;
    k[(a + 4) >> 2] = 0;
    qc(360, 11462, 2, 3020, 12787, 33, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 5;
    k[(a + 4) >> 2] = 0;
    qc(360, 11468, 3, 3028, 13354, 3, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 6;
    k[(a + 4) >> 2] = 0;
    qc(360, 11473, 2, 3040, 15269, 6, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 47;
    k[(a + 4) >> 2] = 0;
    qc(360, 11478, 2, 3048, 12787, 34, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 10;
    k[(a + 4) >> 2] = 0;
    qc(360, 11482, 6, 3056, 15273, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 48;
    k[(a + 4) >> 2] = 0;
    qc(360, 11492, 3, 3080, 15286, 24, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 49;
    k[(a + 4) >> 2] = 0;
    qc(360, 11500, 3, 3092, 15286, 25, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 50;
    k[(a + 4) >> 2] = 0;
    qc(360, 11512, 3, 3092, 15286, 25, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 26;
    k[(a + 4) >> 2] = 0;
    qc(360, 11768, 3, 3104, 11914, 35, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 27;
    k[(a + 4) >> 2] = 0;
    qc(360, 11534, 3, 3116, 11914, 36, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 28;
    k[(a + 4) >> 2] = 0;
    qc(360, 11545, 3, 3116, 11914, 36, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 29;
    k[(a + 4) >> 2] = 0;
    qc(360, 11550, 3, 3116, 11914, 36, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 51;
    k[(a + 4) >> 2] = 0;
    qc(360, 11556, 2, 3128, 12787, 35, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 12;
    k[(a + 4) >> 2] = 0;
    qc(360, 11564, 4, 3136, 21286, 7, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 13;
    k[(a + 4) >> 2] = 0;
    qc(360, 11568, 5, 3152, 21292, 4, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 30;
    k[(a + 4) >> 2] = 0;
    qc(360, 11572, 3, 3116, 11914, 36, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 31;
    k[(a + 4) >> 2] = 0;
    qc(360, 11577, 3, 3116, 11914, 36, a | 0, 0);
    tb(400, 408, 424, 0, 11906, 76, 11909, 0, 11909, 0, 11781, 11911, 92);
    bb(400, 3, 3172, 11914, 37, 36);
    a = CA(8) | 0;
    k[a >> 2] = 14;
    k[(a + 4) >> 2] = 0;
    qc(400, 11590, 5, 3184, 21292, 5, a | 0, 0);
    tb(440, 448, 464, 0, 11906, 77, 11909, 0, 11909, 0, 11796, 11911, 93);
    bb(440, 3, 3204, 11914, 38, 37);
    bb(440, 2, 3216, 12787, 38, 78);
    lb(440, 11416, 3, 3224, 11914, 39, 32);
    lb(440, 11612, 2, 3236, 12787, 39, 52);
    a = CA(8) | 0;
    k[a >> 2] = 53;
    k[(a + 4) >> 2] = 0;
    qc(440, 11446, 2, 3244, 12787, 40, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 54;
    k[(a + 4) >> 2] = 0;
    qc(440, 11758, 2, 3244, 12787, 40, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 79;
    k[(a + 4) >> 2] = 0;
    qc(440, 11456, 2, 3252, 12787, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 80;
    k[(a + 4) >> 2] = 0;
    qc(440, 11462, 2, 3252, 12787, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 81;
    k[(a + 4) >> 2] = 0;
    qc(440, 11617, 2, 3252, 12787, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 7;
    k[(a + 4) >> 2] = 0;
    qc(440, 11621, 2, 3260, 15269, 7, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 11;
    k[(a + 4) >> 2] = 0;
    qc(440, 11482, 6, 3268, 15273, 42, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 55;
    k[(a + 4) >> 2] = 0;
    qc(440, 11635, 2, 3292, 12787, 42, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 82;
    k[(a + 4) >> 2] = 0;
    qc(440, 11643, 2, 3300, 12787, 43, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 83;
    k[(a + 4) >> 2] = 0;
    qc(440, 11648, 2, 3308, 12787, 44, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 84;
    k[(a + 4) >> 2] = 0;
    qc(440, 11651, 2, 3316, 12787, 45, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 56;
    k[(a + 4) >> 2] = 0;
    qc(440, 11492, 3, 3324, 15286, 33, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 57;
    k[(a + 4) >> 2] = 0;
    qc(440, 11500, 3, 3336, 15286, 34, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 58;
    k[(a + 4) >> 2] = 0;
    qc(440, 11512, 3, 3336, 15286, 34, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 35;
    k[(a + 4) >> 2] = 0;
    qc(440, 11768, 3, 3348, 11914, 40, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 36;
    k[(a + 4) >> 2] = 0;
    qc(440, 11654, 3, 3360, 11914, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 37;
    k[(a + 4) >> 2] = 0;
    qc(440, 11545, 3, 3360, 11914, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 38;
    k[(a + 4) >> 2] = 0;
    qc(440, 11550, 3, 3360, 11914, 41, a | 0, 0);
    a = CA(8) | 0;
    k[a >> 2] = 39;
    k[(a + 4) >> 2] = 0;
    qc(440, 11534, 3, 3372, 11914, 42, a | 0, 0);
    tb(480, 488, 552, 0, 11906, 85, 11909, 0, 11909, 0, 11816, 11911, 94);
    bb(480, 2, 3384, 12787, 46, 86);
    a = CA(8) | 0;
    k[a >> 2] = 40;
    k[(a + 4) >> 2] = 0;
    qc(480, 11675, 3, 3392, 11914, 43, a | 0, 0);
    tb(504, 512, 568, 0, 11906, 87, 11909, 0, 11909, 0, 11832, 11911, 95);
    bb(504, 2, 3404, 12787, 47, 88);
    a = CA(8) | 0;
    k[a >> 2] = 41;
    k[(a + 4) >> 2] = 0;
    qc(504, 11700, 3, 3412, 11914, 44, a | 0, 0);
    tb(528, 536, 584, 0, 11906, 89, 11909, 0, 11909, 0, 11842, 11911, 96);
    bb(528, 2, 3424, 12787, 48, 90);
    a = CA(8) | 0;
    k[a >> 2] = 42;
    k[(a + 4) >> 2] = 0;
    qc(528, 11715, 3, 3432, 11914, 45, a | 0, 0);
    return;
  }
  function pd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    qf(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function qd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 16) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    p[(e + 8) >> 3] = 1.0;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    tf(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function rd(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0.0;
    g = u;
    u = (u + 32) | 0;
    e = (g + 16) | 0;
    f = g;
    h = +p[d >> 3];
    k[f >> 2] = b;
    k[(f + 4) >> 2] = c;
    p[(f + 8) >> 3] = h;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    tf(e, f);
    pf(a, e);
    a = k[e >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function sd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    vf(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function td(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0;
    n = u;
    u = (u + 16) | 0;
    l = n;
    k[l >> 2] = 0;
    i = (l + 4) | 0;
    k[i >> 2] = 0;
    j = (l + 8) | 0;
    k[j >> 2] = 0;
    g = (b + 8) | 0;
    c = k[g >> 2] | 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      n = Kb(4) | 0;
      cF(n);
      Cc(n | 0, 2032, 79);
    }
    mf(l, c, d);
    c = k[l >> 2] | 0;
    h = k[b >> 2] | 0;
    if (((c | 0) != 0) & ((h | 0) == (c | 0))) Oa(12797, 13072, 378, 13144);
    f = k[e >> 2] | 0;
    e = k[g >> 2] | 0;
    do
      if (!((k[i >> 2] | 0) == (e | 0) ? (k[j >> 2] | 0) == (f | 0) : 0)) {
        mf(l, e, f);
        if ((k[i >> 2] | 0) == (e | 0) ? (k[j >> 2] | 0) == (f | 0) : 0) {
          m = k[l >> 2] | 0;
          break;
        } else Oa(12160, 12207, 721, 12285);
      } else m = c;
    while (0);
    if (((f | 0) > 0) & ((e | 0) > 0)) {
      c = 0;
      do {
        b = aa(c, e) | 0;
        d = 0;
        do {
          j = (h + (((aa(d, f) | 0) + c) << 3)) | 0;
          p[(m + ((d + b) << 3)) >> 3] = +p[j >> 3];
          d = (d + 1) | 0;
        } while ((d | 0) != (e | 0));
        c = (c + 1) | 0;
      } while ((c | 0) != (f | 0));
    }
    pf(a, l);
    c = k[l >> 2] | 0;
    if (!c) {
      u = n;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = n;
    return;
  }
  function ud(a) {
    a = a | 0;
    return k[(a + 4) >> 2] | 0;
  }
  function vd(a) {
    a = a | 0;
    return k[(a + 8) >> 2] | 0;
  }
  function wd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 16) | 0;
    d = (f + 8) | 0;
    e = f;
    switch (b | 0) {
      case 0: {
        if (!(aa(k[(a + 8) >> 2] | 0, k[(a + 4) >> 2] | 0) | 0)) {
          c = 0.0;
          u = f;
          return +c;
        }
        k[e >> 2] = a;
        c = +yf(e, d);
        u = f;
        return +c;
      }
      case 1: {
        k[e >> 2] = a;
        if (!(aa(k[(a + 8) >> 2] | 0, k[(a + 4) >> 2] | 0) | 0)) c = 0.0;
        else c = +zf(e, d);
        u = f;
        return +c;
      }
      default: {
        k[e >> 2] = a;
        if (!(aa(k[(a + 8) >> 2] | 0, k[(a + 4) >> 2] | 0) | 0)) c = 0.0;
        else c = +Af(e, d);
        c = +Q(+c);
        u = f;
        return +c;
      }
    }
    return 0.0;
  }
  function xd(a) {
    a = a | 0;
    var b = 0.0,
      c = 0,
      d = 0.0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 96) | 0;
    h = j;
    Cf(h, a);
    a = i[(h + 60) >> 0] | 0;
    if (!((a << 24) >> 24)) Oa(15154, 13497, 258, 11473);
    d = +P(+(+p[(h + 72) >> 3]));
    c = i[(h + 61) >> 0] | 0;
    if (!(((c | a) << 24) >> 24)) Oa(15215, 13497, 380, 15259);
    if (!((c << 24) >> 24)) {
      g = k[(h + 4) >> 2] | 0;
      f = k[(h + 8) >> 2] | 0;
      b = +(((f | 0) < (g | 0) ? f : g) | 0) * 2.220446049250313e-16;
    } else b = +p[(h + 64) >> 3];
    b = d * b;
    e = k[(h + 80) >> 2] | 0;
    if ((e | 0) > 0) {
      f = k[h >> 2] | 0;
      g = k[(h + 4) >> 2] | 0;
      a = 0;
      c = 0;
      do {
        l = (f + (((aa(c, g) | 0) + c) << 3)) | 0;
        a = (((+P(+(+p[l >> 3])) > b) & 1) + a) | 0;
        c = (c + 1) | 0;
      } while ((c | 0) != (e | 0));
      b = +(a | 0);
    } else b = 0.0;
    a = k[(h + 52) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 44) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 36) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 28) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 20) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 12) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[h >> 2] | 0;
    if (!a) {
      u = j;
      return +b;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = j;
    return +b;
  }
  function yd(a) {
    a = a | 0;
    var b = 0.0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    f = k[(a + 4) >> 2] | 0;
    g = k[(a + 8) >> 2] | 0;
    if (!(aa(g, f) | 0)) {
      b = 0.0;
      return +b;
    }
    if (!(((f | 0) > 0) & ((g | 0) > 0))) Oa(13148, 13216, 413, 13284);
    e = k[a >> 2] | 0;
    b = +p[e >> 3];
    if ((f | 0) > 1) {
      a = 1;
      do {
        b = b + +p[(e + (a << 3)) >> 3];
        a = (a + 1) | 0;
      } while ((a | 0) != (f | 0));
    }
    if ((g | 0) > 1) d = 1;
    else return +b;
    do {
      c = aa(d, f) | 0;
      a = 0;
      do {
        b = b + +p[(e + ((a + c) << 3)) >> 3];
        a = (a + 1) | 0;
      } while ((a | 0) < (f | 0));
      d = (d + 1) | 0;
    } while ((d | 0) != (g | 0));
    return +b;
  }
  function zd(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 48) | 0;
    h = (j + 28) | 0;
    i = j;
    g = (d - c) | 0;
    f = (f - e) | 0;
    d = k[(b + 4) >> 2] | 0;
    l = ((k[b >> 2] | 0) + (c << 3) + ((aa(d, e) | 0) << 3)) | 0;
    k[i >> 2] = l;
    k[(i + 4) >> 2] = g;
    k[(i + 8) >> 2] = f;
    if (!(((f | g | 0) > -1) | ((l | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[(i + 12) >> 2] = b;
    k[(i + 16) >> 2] = c;
    k[(i + 20) >> 2] = e;
    k[(i + 24) >> 2] = d;
    if ((g | c | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if (!(((f | e | 0) > -1) & (((d - g) | 0) >= (c | 0)))) Oa(14177, 13744, 147, 13812);
    if ((((k[(b + 8) >> 2] | 0) - f) | 0) < (e | 0)) Oa(14177, 13744, 147, 13812);
    Pf(h, i);
    pf(a, h);
    d = k[h >> 2] | 0;
    if (!d) {
      u = j;
      return;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = j;
    return;
  }
  function Ad(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0.0;
    c = k[(a + 4) >> 2] | 0;
    d = k[(a + 8) >> 2] | 0;
    f = +p[b >> 3];
    if ((d | c | 0) <= -1) Oa(11919, 12068, 74, 12145);
    e = k[a >> 2] | 0;
    a = aa(d, c) | 0;
    if ((a | 0) > 0) b = 0;
    else return;
    do {
      d = (e + (b << 3)) | 0;
      p[d >> 3] = f * +p[d >> 3];
      b = (b + 1) | 0;
    } while ((b | 0) != (a | 0));
    return;
  }
  function Bd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    if ((d | 0) != (k[(b + 4) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) != (k[(b + 8) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    c = k[a >> 2] | 0;
    b = aa(e, d) | 0;
    if ((b | 0) > 0) a = 0;
    else return;
    do {
      e = (c + (a << 3)) | 0;
      p[e >> 3] = +p[(f + (a << 3)) >> 3] + +p[e >> 3];
      a = (a + 1) | 0;
    } while ((a | 0) != (b | 0));
    return;
  }
  function Cd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    if ((d | 0) != (k[(b + 4) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) != (k[(b + 8) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    c = k[a >> 2] | 0;
    b = aa(e, d) | 0;
    if ((b | 0) > 0) a = 0;
    else return;
    do {
      e = (c + (a << 3)) | 0;
      p[e >> 3] = +p[e >> 3] - +p[(f + (a << 3)) >> 3];
      a = (a + 1) | 0;
    } while ((a | 0) != (b | 0));
    return;
  }
  function Dd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0.0;
    h = u;
    u = (u + 48) | 0;
    d = (h + 32) | 0;
    e = h;
    f = k[(b + 4) >> 2] | 0;
    g = k[(b + 8) >> 2] | 0;
    if ((g | f | 0) <= -1) Oa(11919, 12068, 74, 12145);
    i = +p[c >> 3];
    k[e >> 2] = b;
    c = (e + 8) | 0;
    k[c >> 2] = f;
    k[(c + 4) >> 2] = g;
    p[(e + 16) >> 3] = i;
    Tf(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = h;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = h;
    return;
  }
  function Ed(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    Vf(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Fd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    eg(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Gd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    fg(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Hd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 48) | 0;
    c = (g + 32) | 0;
    d = g;
    e = k[(b + 4) >> 2] | 0;
    f = k[(b + 8) >> 2] | 0;
    if ((f | e | 0) <= -1) Oa(11919, 12068, 74, 12145);
    k[d >> 2] = b;
    b = (d + 8) | 0;
    k[b >> 2] = e;
    k[(b + 4) >> 2] = f;
    p[(d + 16) >> 3] = -1.0;
    Tf(c, d);
    pf(a, c);
    a = k[c >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function Id(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0;
    if (((b | 0) > -1 ? ((d = k[(a + 4) >> 2] | 0), ((c | 0) > -1) & ((d | 0) > (b | 0))) : 0) ? (k[(a + 8) >> 2] | 0) > (c | 0) : 0) {
      d = ((k[a >> 2] | 0) + (((aa(d, c) | 0) + b) << 3)) | 0;
      return +(+p[d >> 3]);
    }
    Oa(15640, 15693, 118, 29764);
    return +0.0;
  }
  function Jd(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0.0,
      f = 0;
    e = +p[d >> 3];
    if (((b | 0) > -1 ? ((f = k[(a + 4) >> 2] | 0), ((c | 0) > -1) & ((f | 0) > (b | 0))) : 0) ? (k[(a + 8) >> 2] | 0) > (c | 0) : 0) {
      f = ((k[a >> 2] | 0) + (((aa(f, c) | 0) + b) << 3)) | 0;
      p[f >> 3] = e;
      return;
    }
    Oa(15640, 15693, 365, 29764);
  }
  function Kd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0;
    l = (b + 4) | 0;
    s = k[l >> 2] | 0;
    t = (b + 8) | 0;
    u = k[t >> 2] | 0;
    v = (c + 8) | 0;
    w = k[v >> 2] | 0;
    lf(a, s, (w + u) | 0);
    if ((s | 0) <= 0) return;
    n = (a + 4) | 0;
    o = (a + 8) | 0;
    q = (w | 0) > 0;
    r = (c + 4) | 0;
    if ((u | 0) <= 0) {
      d = 0;
      a: while (1) {
        if (q) {
          f = k[r >> 2] | 0;
          g = (f | 0) > (d | 0);
          e = 0;
          do {
            if (!g) {
              d = 24;
              break a;
            }
            if ((k[v >> 2] | 0) <= (e | 0)) {
              d = 24;
              break a;
            }
            h = ((k[c >> 2] | 0) + (((aa(f, e) | 0) + d) << 3)) | 0;
            i = (e + u) | 0;
            j = k[n >> 2] | 0;
            if (!(((i | 0) > -1) & ((j | 0) > (d | 0)))) {
              d = 27;
              break a;
            }
            if ((k[o >> 2] | 0) <= (i | 0)) {
              d = 27;
              break a;
            }
            m = ((k[a >> 2] | 0) + (((aa(j, i) | 0) + d) << 3)) | 0;
            p[m >> 3] = +p[h >> 3];
            e = (e + 1) | 0;
          } while ((e | 0) < (w | 0));
        }
        d = (d + 1) | 0;
        if ((d | 0) >= (s | 0)) {
          d = 29;
          break;
        }
      }
      if ((d | 0) == 24) Oa(15640, 15693, 365, 29764);
      else if ((d | 0) == 27) Oa(15640, 15693, 365, 29764);
      else if ((d | 0) == 29) return;
    }
    i = k[l >> 2] | 0;
    h = 0;
    b: while (1) {
      e = (i | 0) > (h | 0);
      d = 0;
      do {
        if (!e) {
          d = 19;
          break b;
        }
        if ((k[t >> 2] | 0) <= (d | 0)) {
          d = 19;
          break b;
        }
        f = ((k[b >> 2] | 0) + (((aa(i, d) | 0) + h) << 3)) | 0;
        l = k[n >> 2] | 0;
        if ((l | 0) <= (h | 0)) {
          d = 20;
          break b;
        }
        j = k[o >> 2] | 0;
        if ((j | 0) <= (d | 0)) {
          d = 20;
          break b;
        }
        m = k[a >> 2] | 0;
        g = (m + (((aa(l, d) | 0) + h) << 3)) | 0;
        p[g >> 3] = +p[f >> 3];
        d = (d + 1) | 0;
      } while ((d | 0) < (u | 0));
      if (q) {
        e = k[r >> 2] | 0;
        g = (e | 0) > (h | 0);
        d = 0;
        do {
          if (!g) {
            d = 24;
            break b;
          }
          if ((k[v >> 2] | 0) <= (d | 0)) {
            d = 24;
            break b;
          }
          f = (d + u) | 0;
          if (!(((f | 0) > -1) & ((j | 0) > (f | 0)))) {
            d = 27;
            break b;
          }
          x = ((k[c >> 2] | 0) + (((aa(e, d) | 0) + h) << 3)) | 0;
          f = (m + (((aa(l, f) | 0) + h) << 3)) | 0;
          p[f >> 3] = +p[x >> 3];
          d = (d + 1) | 0;
        } while ((d | 0) < (w | 0));
      }
      h = (h + 1) | 0;
      if ((h | 0) >= (s | 0)) {
        d = 29;
        break;
      }
    }
    if ((d | 0) == 19) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 20) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 24) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 27) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 29) return;
  }
  function Ld(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    q = (b + 4) | 0;
    r = k[q >> 2] | 0;
    s = (c + 4) | 0;
    t = k[s >> 2] | 0;
    u = (b + 8) | 0;
    v = k[u >> 2] | 0;
    lf(a, (t + r) | 0, v);
    if ((v | 0) <= 0) return;
    j = (r | 0) > 0;
    l = (a + 4) | 0;
    m = (a + 8) | 0;
    n = (t | 0) > 0;
    o = (c + 8) | 0;
    i = 0;
    a: while (1) {
      if (j) {
        e = k[q >> 2] | 0;
        f = aa(e, i) | 0;
        d = 0;
        do {
          if ((e | 0) <= (d | 0)) {
            d = 18;
            break a;
          }
          if ((k[u >> 2] | 0) <= (i | 0)) {
            d = 18;
            break a;
          }
          g = k[l >> 2] | 0;
          if ((g | 0) <= (d | 0)) {
            d = 19;
            break a;
          }
          if ((k[m >> 2] | 0) <= (i | 0)) {
            d = 19;
            break a;
          }
          h = ((k[a >> 2] | 0) + (((aa(g, i) | 0) + d) << 3)) | 0;
          p[h >> 3] = +p[((k[b >> 2] | 0) + ((f + d) << 3)) >> 3];
          d = (d + 1) | 0;
        } while ((d | 0) < (r | 0));
      }
      if (n) {
        e = k[s >> 2] | 0;
        f = aa(e, i) | 0;
        d = 0;
        do {
          if ((e | 0) <= (d | 0)) {
            d = 21;
            break a;
          }
          if ((k[o >> 2] | 0) <= (i | 0)) {
            d = 21;
            break a;
          }
          g = (d + r) | 0;
          if ((g | 0) <= -1) {
            d = 22;
            break a;
          }
          h = k[l >> 2] | 0;
          if ((h | 0) <= (g | 0)) {
            d = 22;
            break a;
          }
          if ((k[m >> 2] | 0) <= (i | 0)) {
            d = 22;
            break a;
          }
          h = ((k[a >> 2] | 0) + (((aa(h, i) | 0) + g) << 3)) | 0;
          p[h >> 3] = +p[((k[c >> 2] | 0) + ((f + d) << 3)) >> 3];
          d = (d + 1) | 0;
        } while ((d | 0) < (t | 0));
      }
      i = (i + 1) | 0;
      if ((i | 0) >= (v | 0)) {
        d = 23;
        break;
      }
    }
    if ((d | 0) == 18) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 19) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 21) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 22) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 23) return;
  }
  function Md(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 16) | 0;
    h = j;
    i = (a + 4) | 0;
    e = k[i >> 2] | 0;
    f = (a + 20) | 0;
    l = k[f >> 2] | 0;
    g = l << 1;
    if ((((e - (k[a >> 2] | 0)) >> 4) | 0) == (l | 0)) {
      k[f >> 2] = g;
      ng(a, g);
      e = k[i >> 2] | 0;
    }
    k[h >> 2] = b;
    k[(h + 4) >> 2] = c;
    p[(h + 8) >> 3] = +p[d >> 3];
    if (e >>> 0 < (k[(a + 8) >> 2] | 0) >>> 0) {
      k[e >> 2] = k[h >> 2];
      k[(e + 4) >> 2] = k[(h + 4) >> 2];
      k[(e + 8) >> 2] = k[(h + 8) >> 2];
      k[(e + 12) >> 2] = k[(h + 12) >> 2];
      k[i >> 2] = (k[i >> 2] | 0) + 16;
      u = j;
      return;
    } else {
      og(a, h);
      u = j;
      return;
    }
  }
  function Nd(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 48) | 0;
    e = f;
    i[e >> 0] = 0;
    d = (e + 4) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    k[(d + 12) >> 2] = 0;
    k[(d + 16) >> 2] = 0;
    k[(d + 20) >> 2] = 0;
    k[(d + 24) >> 2] = 0;
    k[(d + 28) >> 2] = 0;
    k[(e + 8) >> 2] = b;
    k[(e + 28) >> 2] = 0;
    b = Oq(((c << 2) + 4) | 0) | 0;
    k[(e + 12) >> 2] = b;
    if (!b) {
      f = Kb(4) | 0;
      cF(f);
      Cc(f | 0, 2032, 79);
    }
    k[d >> 2] = c;
    iF(b | 0, 0, ((c << 2) + 4) | 0) | 0;
    Pg(e);
    Qg(a, e);
    Pq(k[(e + 12) >> 2] | 0);
    Pq(k[(e + 16) >> 2] | 0);
    b = k[(e + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(e + 24) >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    FA(b);
    u = f;
    return;
  }
  function Od(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0.0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0;
    w = u;
    u = (u + 48) | 0;
    r = w;
    t = (w + 16) | 0;
    s = (b + 4) | 0;
    c = k[s >> 2] | 0;
    k[t >> 2] = 0;
    v = (t + 4) | 0;
    k[v >> 2] = 0;
    k[(t + 8) >> 2] = 0;
    k[(t + 12) >> 2] = c;
    k[(t + 16) >> 2] = c;
    o = (t + 20) | 0;
    k[o >> 2] = c;
    q = (t + 8) | 0;
    a: do
      if (c | 0) {
        if (c >>> 0 > 268435455) {
          w = Kb(4) | 0;
          cF(w);
          Cc(w | 0, 2032, 79);
        }
        j = CA(c << 4) | 0;
        l = j;
        k[t >> 2] = l;
        k[v >> 2] = l;
        k[q >> 2] = j + (c << 4);
        j = (b + 8) | 0;
        l = (r + 4) | 0;
        m = (r + 8) | 0;
        i = 0;
        while (1) {
          if ((k[j >> 2] | 0) <= 0) {
            c = 7;
            break;
          }
          n = +p[((k[b >> 2] | 0) + (i << 3)) >> 3];
          c = k[v >> 2] | 0;
          f = k[t >> 2] | 0;
          g = (c - f) | 0;
          d = g >> 4;
          e = k[o >> 2] | 0;
          h = e << 1;
          if ((d | 0) == (e | 0) ? ((k[o >> 2] = h), (((k[q >> 2] | 0) - f) >> 4) >>> 0 < h >>> 0) : 0) {
            if (h >>> 0 > 268435455) {
              c = 11;
              break;
            }
            e = CA(g << 1) | 0;
            c = (e + (d << 4)) | 0;
            d = (c + ((0 - d) << 4)) | 0;
            if ((g | 0) > 0) nF(d | 0, f | 0, g | 0) | 0;
            k[t >> 2] = d;
            k[v >> 2] = c;
            k[q >> 2] = e + (h << 4);
            if (f) {
              EA(f);
              c = k[v >> 2] | 0;
            }
          }
          k[r >> 2] = i;
          k[l >> 2] = i;
          p[m >> 3] = n;
          if (c >>> 0 < (k[q >> 2] | 0) >>> 0) {
            k[c >> 2] = k[r >> 2];
            k[(c + 4) >> 2] = k[(r + 4) >> 2];
            k[(c + 8) >> 2] = k[(r + 8) >> 2];
            k[(c + 12) >> 2] = k[(r + 12) >> 2];
            k[v >> 2] = (k[v >> 2] | 0) + 16;
          } else og(t, r);
          i = (i + 1) | 0;
          if ((i | 0) >= (k[s >> 2] | 0)) break a;
        }
        if ((c | 0) == 7) Oa(15640, 15693, 118, 29764);
        else if ((c | 0) == 11) {
          w = Kb(4) | 0;
          cF(w);
          Cc(w | 0, 2032, 79);
        }
      }
    while (0);
    Jg(a, t);
    c = k[t >> 2] | 0;
    if (!c) {
      u = w;
      return;
    }
    d = k[v >> 2] | 0;
    if ((d | 0) != (c | 0)) k[v >> 2] = d + (~(((d + -16 - c) | 0) >>> 4) << 4);
    EA(c);
    u = w;
    return;
  }
  function Pd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    d = u;
    u = (u + 48) | 0;
    c = (d + 8) | 0;
    e = d;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = b + 664;
    i[c >> 0] = 0;
    b = (c + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Vg(c, e) | 0;
    Qg(a, c);
    Pq(k[(c + 12) >> 2] | 0);
    Pq(k[(c + 16) >> 2] | 0);
    a = k[(c + 20) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(c + 24) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    FA(a);
    u = d;
    return;
  }
  function Qd(a) {
    a = a | 0;
    return k[(a + 672) >> 2] | 0;
  }
  function Rd(a) {
    a = a | 0;
    return k[(a + 668) >> 2] | 0;
  }
  function Sd(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0;
    a = (a + 664) | 0;
    d = k[(a + 16) >> 2] | 0;
    if (!d) {
      d = k[(a + 12) >> 2] | 0;
      d = ((k[(d + (k[(a + 4) >> 2] << 2)) >> 2] | 0) - (k[d >> 2] | 0)) | 0;
      return d | 0;
    }
    c = k[(a + 4) >> 2] | 0;
    if (!c) {
      d = 0;
      return d | 0;
    }
    if ((c | 0) <= -1) Oa(14697, 13988, 163, 14058);
    a = k[d >> 2] | 0;
    if ((c | 0) == 1) {
      d = a;
      return d | 0;
    } else b = 1;
    do {
      a = ((k[(d + (b << 2)) >> 2] | 0) + a) | 0;
      b = (b + 1) | 0;
    } while ((b | 0) < (c | 0));
    return a | 0;
  }
  function Td(a) {
    a = a | 0;
    var b = 0.0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0.0;
    a = (a + 664) | 0;
    if ((k[(a + 8) >> 2] | 0) <= 0) Oa(16822, 16887, 19, 11478);
    g = k[(a + 4) >> 2] | 0;
    if ((g | 0) <= 0) Oa(16822, 16887, 19, 11478);
    h = k[(a + 20) >> 2] | 0;
    f = k[(a + 12) >> 2] | 0;
    e = k[(a + 16) >> 2] | 0;
    if (e | 0) {
      d = 0;
      b = 0.0;
      do {
        a = k[(f + (d << 2)) >> 2] | 0;
        i = k[(e + (d << 2)) >> 2] | 0;
        c = (i + a) | 0;
        if ((i | 0) > 0)
          do {
            j = +p[(h + (a << 3)) >> 3];
            b = b + j * j;
            a = (a + 1) | 0;
          } while ((a | 0) < (c | 0));
        d = (d + 1) | 0;
      } while ((d | 0) != (g | 0));
      j = +Q(+b);
      return +j;
    }
    c = 0;
    b = 0.0;
    d = k[f >> 2] | 0;
    do {
      c = (c + 1) | 0;
      a = d;
      d = k[(f + (c << 2)) >> 2] | 0;
      if ((a | 0) < (d | 0))
        do {
          j = +p[(h + (a << 3)) >> 3];
          b = b + j * j;
          a = (a + 1) | 0;
        } while ((a | 0) != (d | 0));
    } while ((c | 0) != (g | 0));
    j = +Q(+b);
    return +j;
  }
  function Ud(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      l = 0;
    l = u;
    u = (u + 64) | 0;
    j = (l + 24) | 0;
    h = l;
    g = (b + 664) | 0;
    d = (d - c) | 0;
    b = (f - e) | 0;
    i[h >> 0] = 0;
    k[(h + 4) >> 2] = g;
    k[(h + 8) >> 2] = c;
    k[(h + 12) >> 2] = e;
    k[(h + 16) >> 2] = d;
    k[(h + 20) >> 2] = b;
    if ((d | c | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if (!((b | e | 0) > -1 ? (((k[(g + 8) >> 2] | 0) - d) | 0) >= (c | 0) : 0)) Oa(14177, 13744, 147, 13812);
    if ((((k[(g + 4) >> 2] | 0) - b) | 0) < (e | 0)) Oa(14177, 13744, 147, 13812);
    i[j >> 0] = 0;
    b = (j + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Zg(j, h);
    Qg(a, j);
    Pq(k[(j + 12) >> 2] | 0);
    Pq(k[(j + 16) >> 2] | 0);
    b = k[(j + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(j + 24) >> 2] | 0;
    if (!b) {
      u = l;
      return;
    }
    FA(b);
    u = l;
    return;
  }
  function Vd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 16) | 0;
    c = (g + 12) | 0;
    d = g;
    e = (b + 664) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    f = k[(b + 672) >> 2] | 0;
    b = k[(b + 668) >> 2] | 0;
    if (!(((f | 0) == 0) | ((b | 0) == 0)) ? ((2147483647 / (b | 0)) | 0 | 0) < (f | 0) : 0) {
      g = Kb(4) | 0;
      cF(g);
      Cc(g | 0, 2032, 79);
    }
    mf(d, f, b);
    $g(d, e, c);
    pf(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = g;
    return;
  }
  function Wd(a) {
    a = a | 0;
    return a | 0;
  }
  function Xd(a) {
    a = a | 0;
    return (a + 128) | 0;
  }
  function Yd(a) {
    a = a | 0;
    return (a + 448) | 0;
  }
  function Zd(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0;
    c = (a + 664) | 0;
    g = k[(c + 4) >> 2] | 0;
    a: do
      if ((g | 0) > 0) {
        h = k[(c + 20) >> 2] | 0;
        j = k[(c + 12) >> 2] | 0;
        e = k[(c + 16) >> 2] | 0;
        if (e | 0) {
          d = 0;
          while (1) {
            c = k[(j + (d << 2)) >> 2] | 0;
            l = k[(e + (d << 2)) >> 2] | 0;
            f = (l + c) | 0;
            if ((l | 0) > 0)
              do {
                l = (h + (c << 3)) | 0;
                p[l >> 3] = +p[b >> 3] * +p[l >> 3];
                c = (c + 1) | 0;
              } while ((c | 0) < (f | 0));
            d = (d + 1) | 0;
            if ((d | 0) == (g | 0)) break a;
          }
        }
        d = 0;
        e = k[j >> 2] | 0;
        do {
          d = (d + 1) | 0;
          c = e;
          e = k[(j + (d << 2)) >> 2] | 0;
          if ((c | 0) < (e | 0))
            do {
              l = (h + (c << 3)) | 0;
              p[l >> 3] = +p[b >> 3] * +p[l >> 3];
              c = (c + 1) | 0;
            } while ((c | 0) != (e | 0));
        } while ((d | 0) != (g | 0));
      }
    while (0);
    i[(a + 121) >> 0] = 0;
    i[(a + 441) >> 0] = 0;
    i[(a + 657) >> 0] = 0;
    return;
  }
  function _d(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    b = (b + 664) | 0;
    c = (a + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = c;
    k[(d + 8) >> 2] = b;
    if ((k[(c + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(c + 4) >> 2] | 0) == (k[(b + 4) >> 2] | 0)) {
      fh(c, d) | 0;
      i[(a + 120) >> 0] = 0;
      i[(a + 121) >> 0] = 0;
      i[(a + 440) >> 0] = 0;
      i[(a + 441) >> 0] = 0;
      i[(a + 656) >> 0] = 0;
      i[(a + 657) >> 0] = 0;
      u = e;
      return;
    } else Oa(14550, 14607, 110, 14683);
  }
  function $d(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    b = (b + 664) | 0;
    c = (a + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = c;
    k[(d + 8) >> 2] = b;
    if ((k[(c + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(c + 4) >> 2] | 0) == (k[(b + 4) >> 2] | 0)) {
      ih(c, d) | 0;
      i[(a + 120) >> 0] = 0;
      i[(a + 121) >> 0] = 0;
      i[(a + 440) >> 0] = 0;
      i[(a + 441) >> 0] = 0;
      i[(a + 656) >> 0] = 0;
      i[(a + 657) >> 0] = 0;
      u = e;
      return;
    } else Oa(14550, 14607, 110, 14683);
  }
  function ae(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0.0;
    h = u;
    u = (u + 80) | 0;
    g = (h + 32) | 0;
    f = h;
    b = (b + 664) | 0;
    d = k[(b + 8) >> 2] | 0;
    e = k[(b + 4) >> 2] | 0;
    if ((e | d | 0) <= -1) Oa(11919, 12068, 74, 12145);
    j = +p[c >> 3];
    i[f >> 0] = 0;
    k[(f + 4) >> 2] = b;
    b = (f + 8) | 0;
    k[b >> 2] = d;
    k[(b + 4) >> 2] = e;
    p[(f + 16) >> 3] = j;
    i[g >> 0] = 0;
    b = (g + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    kh(g, f);
    Qg(a, g);
    Pq(k[(g + 12) >> 2] | 0);
    Pq(k[(g + 16) >> 2] | 0);
    b = k[(g + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(g + 24) >> 2] | 0;
    if (!b) {
      u = h;
      return;
    }
    FA(b);
    u = h;
    return;
  }
  function be(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 48) | 0;
    e = (f + 12) | 0;
    d = f;
    b = (b + 664) | 0;
    c = (c + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = b;
    k[(d + 8) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    i[e >> 0] = 0;
    c = (e + 4) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    k[(c + 28) >> 2] = 0;
    mh(e, d);
    Qg(a, e);
    Pq(k[(e + 12) >> 2] | 0);
    Pq(k[(e + 16) >> 2] | 0);
    a = k[(e + 20) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(e + 24) >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    FA(a);
    u = f;
    return;
  }
  function ce(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 64) | 0;
    f = (g + 16) | 0;
    e = g;
    d = (b + 664) | 0;
    b = (c + 664) | 0;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = d;
    k[(e + 8) >> 2] = b;
    if ((k[(d + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(d + 4) >> 2] | 0) != (k[(b + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    i[f >> 0] = 0;
    b = (f + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    gh(f, e);
    Qg(a, f);
    Pq(k[(f + 12) >> 2] | 0);
    Pq(k[(f + 16) >> 2] | 0);
    b = k[(f + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(f + 24) >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    FA(b);
    u = g;
    return;
  }
  function de(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 64) | 0;
    f = (g + 16) | 0;
    e = g;
    d = (b + 664) | 0;
    b = (c + 664) | 0;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = d;
    k[(e + 8) >> 2] = b;
    if ((k[(d + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(d + 4) >> 2] | 0) != (k[(b + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    i[f >> 0] = 0;
    b = (f + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    jh(f, e);
    Qg(a, f);
    Pq(k[(f + 12) >> 2] | 0);
    Pq(k[(f + 16) >> 2] | 0);
    b = k[(f + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(f + 24) >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    FA(b);
    u = g;
    return;
  }
  function ee(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    b = (b + 664) | 0;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    sh(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function fe(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    zh(b);
    b = (b + 8) | 0;
    if (!(i[b >> 0] | 0)) Oa(17938, 17986, 90, 11715);
    if ((k[(b + 20) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(18071, 17986, 91, 11715);
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    Ph(d, e);
    pf(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = f;
    return;
  }
  function ge(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    $h(b);
    b = (b + 8) | 0;
    if (!(i[b >> 0] | 0)) Oa(17938, 17986, 90, 11715);
    if ((k[(b + 32) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(18071, 17986, 91, 11715);
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    fj(d, e);
    pf(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = f;
    return;
  }
  function he(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 32) | 0;
    d = (g + 8) | 0;
    e = g;
    yj(b);
    f = (b + 8) | 0;
    if (!(i[f >> 0] | 0)) Oa(20840, 20281, 235, 11715);
    if ((k[(b + 36) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(20917, 20281, 236, 11715);
    k[e >> 2] = f;
    k[(e + 4) >> 2] = c;
    Lj(d, e);
    pf(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function ie(a) {
    a = a | 0;
    return +(+p[a >> 3]);
  }
  function je(a) {
    a = a | 0;
    return +(+p[(a + 8) >> 3]);
  }
  function ke(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    ek(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function le(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 48) | 0;
    d = (f + 24) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    p[(e + 8) >> 3] = 1.0;
    p[(e + 16) >> 3] = 0.0;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    hk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function me(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0;
    g = u;
    u = (u + 48) | 0;
    e = (g + 24) | 0;
    f = g;
    k[f >> 2] = b;
    k[(f + 4) >> 2] = c;
    h = (f + 8) | 0;
    k[h >> 2] = k[d >> 2];
    k[(h + 4) >> 2] = k[(d + 4) >> 2];
    k[(h + 8) >> 2] = k[(d + 8) >> 2];
    k[(h + 12) >> 2] = k[(d + 12) >> 2];
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    hk(e, f);
    dk(a, e);
    a = k[e >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function ne(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    jk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function oe(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0;
    n = u;
    u = (u + 16) | 0;
    l = n;
    k[l >> 2] = 0;
    h = (l + 4) | 0;
    k[h >> 2] = 0;
    i = (l + 8) | 0;
    k[i >> 2] = 0;
    f = (b + 8) | 0;
    c = k[f >> 2] | 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      n = Kb(4) | 0;
      cF(n);
      Cc(n | 0, 2032, 79);
    }
    ak(l, c, d);
    c = k[l >> 2] | 0;
    j = k[b >> 2] | 0;
    if (((c | 0) != 0) & ((j | 0) == (c | 0))) Oa(12797, 13072, 378, 13144);
    g = k[e >> 2] | 0;
    f = k[f >> 2] | 0;
    do
      if (!((k[h >> 2] | 0) == (f | 0) ? (k[i >> 2] | 0) == (g | 0) : 0)) {
        ak(l, f, g);
        if ((k[h >> 2] | 0) == (f | 0) ? (k[i >> 2] | 0) == (g | 0) : 0) {
          m = k[l >> 2] | 0;
          break;
        } else Oa(12160, 12207, 721, 12285);
      } else m = c;
    while (0);
    if ((g | 0) > 0) {
      b = (f | 0) > 0;
      c = 0;
      do {
        if (b) {
          e = aa(c, f) | 0;
          d = 0;
          do {
            vF((m + ((d + e) << 4)) | 0, (j + (((aa(d, g) | 0) + c) << 4)) | 0, 16) | 0;
            d = (d + 1) | 0;
          } while ((d | 0) < (f | 0));
        }
        c = (c + 1) | 0;
      } while ((c | 0) < (g | 0));
    }
    dk(a, l);
    c = k[l >> 2] | 0;
    if (!c) {
      u = n;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = n;
    return;
  }
  function pe(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    c = u;
    u = (u + 32) | 0;
    d = (c + 8) | 0;
    e = c;
    k[e >> 2] = b;
    lk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = c;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = c;
    return;
  }
  function qe(a) {
    a = a | 0;
    return k[(a + 4) >> 2] | 0;
  }
  function re(a) {
    a = a | 0;
    return k[(a + 8) >> 2] | 0;
  }
  function se(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0,
      i = 0,
      j = 0.0;
    if (!b) {
      f = k[(a + 4) >> 2] | 0;
      g = k[(a + 8) >> 2] | 0;
      if (!(aa(g, f) | 0)) {
        c = 0.0;
        return +c;
      }
      if (!(((f | 0) > 0) & ((g | 0) > 0))) Oa(13148, 13216, 413, 13284);
      e = k[a >> 2] | 0;
      c = +Qo(+p[e >> 3], +p[(e + 8) >> 3]);
      if ((f | 0) > 1) {
        b = 1;
        do {
          h = +Qo(+p[(e + (b << 4)) >> 3], +p[(e + (b << 4) + 8) >> 3]);
          c = c < h ? h : c;
          b = (b + 1) | 0;
        } while ((b | 0) != (f | 0));
      }
      if ((g | 0) > 1) a = 1;
      else {
        h = c;
        return +h;
      }
      do {
        d = aa(a, f) | 0;
        b = 0;
        do {
          i = (b + d) | 0;
          h = +Qo(+p[(e + (i << 4)) >> 3], +p[(e + (i << 4) + 8) >> 3]);
          c = c < h ? h : c;
          b = (b + 1) | 0;
        } while ((b | 0) < (f | 0));
        a = (a + 1) | 0;
      } while ((a | 0) != (g | 0));
      return +c;
    }
    f = k[(a + 4) >> 2] | 0;
    g = k[(a + 8) >> 2] | 0;
    d = (aa(g, f) | 0) == 0;
    if ((b | 0) != 1) {
      if (!d) {
        if (!(((f | 0) > 0) & ((g | 0) > 0))) Oa(13148, 13216, 413, 13284);
        e = k[a >> 2] | 0;
        h = +p[e >> 3];
        c = +p[(e + 8) >> 3];
        c = h * h + c * c;
        if ((f | 0) > 1) {
          b = 1;
          do {
            j = +p[(e + (b << 4)) >> 3];
            h = +p[(e + (b << 4) + 8) >> 3];
            c = c + (j * j + h * h);
            b = (b + 1) | 0;
          } while ((b | 0) != (f | 0));
        }
        if ((g | 0) > 1) {
          a = 1;
          do {
            d = aa(a, f) | 0;
            b = 0;
            do {
              i = (b + d) | 0;
              h = +p[(e + (i << 4)) >> 3];
              j = +p[(e + (i << 4) + 8) >> 3];
              c = c + (h * h + j * j);
              b = (b + 1) | 0;
            } while ((b | 0) < (f | 0));
            a = (a + 1) | 0;
          } while ((a | 0) != (g | 0));
        }
      } else c = 0.0;
      j = +Q(+c);
      return +j;
    }
    if (d) {
      j = 0.0;
      return +j;
    }
    if (!(((f | 0) > 0) & ((g | 0) > 0))) Oa(13148, 13216, 413, 13284);
    e = k[a >> 2] | 0;
    c = +Qo(+p[e >> 3], +p[(e + 8) >> 3]);
    if ((f | 0) > 1) {
      b = 1;
      do {
        c = c + +Qo(+p[(e + (b << 4)) >> 3], +p[(e + (b << 4) + 8) >> 3]);
        b = (b + 1) | 0;
      } while ((b | 0) != (f | 0));
    }
    if ((g | 0) > 1) a = 1;
    else {
      j = c;
      return +j;
    }
    do {
      d = aa(a, f) | 0;
      b = 0;
      do {
        i = (b + d) | 0;
        c = c + +Qo(+p[(e + (i << 4)) >> 3], +p[(e + (i << 4) + 8) >> 3]);
        b = (b + 1) | 0;
      } while ((b | 0) < (f | 0));
      a = (a + 1) | 0;
    } while ((a | 0) != (g | 0));
    return +c;
  }
  function te(a) {
    a = a | 0;
    var b = 0.0,
      c = 0,
      d = 0.0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 96) | 0;
    h = j;
    ok(h, a);
    a = i[(h + 60) >> 0] | 0;
    if (!((a << 24) >> 24)) Oa(15154, 13497, 258, 11473);
    d = +P(+(+p[(h + 72) >> 3]));
    c = i[(h + 61) >> 0] | 0;
    if (!(((c | a) << 24) >> 24)) Oa(15215, 13497, 380, 15259);
    if (!((c << 24) >> 24)) {
      g = k[(h + 4) >> 2] | 0;
      f = k[(h + 8) >> 2] | 0;
      b = +(((f | 0) < (g | 0) ? f : g) | 0) * 2.220446049250313e-16;
    } else b = +p[(h + 64) >> 3];
    b = d * b;
    e = k[(h + 80) >> 2] | 0;
    if ((e | 0) > 0) {
      f = k[h >> 2] | 0;
      g = k[(h + 4) >> 2] | 0;
      a = 0;
      c = 0;
      do {
        l = ((aa(c, g) | 0) + c) | 0;
        a = (((+Qo(+p[(f + (l << 4)) >> 3], +p[(f + (l << 4) + 8) >> 3]) > b) & 1) + a) | 0;
        c = (c + 1) | 0;
      } while ((c | 0) != (e | 0));
      b = +(a | 0);
    } else b = 0.0;
    a = k[(h + 52) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 44) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 36) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 28) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 20) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(h + 12) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[h >> 2] | 0;
    if (!a) {
      u = j;
      return +b;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = j;
    return +b;
  }
  function ue(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0.0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    i = k[(b + 4) >> 2] | 0;
    j = k[(b + 8) >> 2] | 0;
    if (!(aa(j, i) | 0)) {
      k[a >> 2] = 0;
      k[(a + 4) >> 2] = 0;
      k[(a + 8) >> 2] = 0;
      k[(a + 12) >> 2] = 0;
      return;
    }
    if (!(((i | 0) > 0) & ((j | 0) > 0))) Oa(13148, 13216, 413, 13284);
    g = k[b >> 2] | 0;
    h = (a + 8) | 0;
    k[a >> 2] = k[g >> 2];
    k[(a + 4) >> 2] = k[(g + 4) >> 2];
    k[(a + 8) >> 2] = k[(g + 8) >> 2];
    k[(a + 12) >> 2] = k[(g + 12) >> 2];
    if ((i | 0) > 1) {
      b = 1;
      c = +p[a >> 3];
      d = +p[h >> 3];
      do {
        c = c + +p[(g + (b << 4)) >> 3];
        d = d + +p[(g + (b << 4) + 8) >> 3];
        b = (b + 1) | 0;
      } while ((b | 0) != (i | 0));
      p[a >> 3] = c;
      p[h >> 3] = d;
    }
    if ((j | 0) <= 1) return;
    b = 1;
    c = +p[a >> 3];
    d = +p[h >> 3];
    do {
      f = aa(b, i) | 0;
      e = 0;
      do {
        l = (e + f) | 0;
        c = c + +p[(g + (l << 4)) >> 3];
        d = d + +p[(g + (l << 4) + 8) >> 3];
        e = (e + 1) | 0;
      } while ((e | 0) < (i | 0));
      b = (b + 1) | 0;
    } while ((b | 0) < (j | 0));
    p[a >> 3] = c;
    p[h >> 3] = d;
    return;
  }
  function ve(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 48) | 0;
    h = (j + 28) | 0;
    i = j;
    g = (d - c) | 0;
    f = (f - e) | 0;
    d = k[(b + 4) >> 2] | 0;
    l = ((k[b >> 2] | 0) + (c << 4) + ((aa(d, e) | 0) << 4)) | 0;
    k[i >> 2] = l;
    k[(i + 4) >> 2] = g;
    k[(i + 8) >> 2] = f;
    if (!(((f | g | 0) > -1) | ((l | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[(i + 12) >> 2] = b;
    k[(i + 16) >> 2] = c;
    k[(i + 20) >> 2] = e;
    k[(i + 24) >> 2] = d;
    if ((g | c | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if (!(((f | e | 0) > -1) & (((d - g) | 0) >= (c | 0)))) Oa(14177, 13744, 147, 13812);
    if ((((k[(b + 8) >> 2] | 0) - f) | 0) < (e | 0)) Oa(14177, 13744, 147, 13812);
    Bk(h, i);
    dk(a, h);
    d = k[h >> 2] | 0;
    if (!d) {
      u = j;
      return;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = j;
    return;
  }
  function we(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0.0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0;
    j = u;
    u = (u + 32) | 0;
    h = (j + 16) | 0;
    i = j;
    c = k[(a + 4) >> 2] | 0;
    d = k[(a + 8) >> 2] | 0;
    g = +p[b >> 3];
    f = +p[(b + 8) >> 3];
    if ((d | c | 0) <= -1) Oa(11919, 12068, 74, 12145);
    e = k[a >> 2] | 0;
    a = aa(d, c) | 0;
    if ((a | 0) <= 0) {
      u = j;
      return;
    }
    c = (i + 8) | 0;
    b = 0;
    do {
      d = (e + (b << 4)) | 0;
      p[i >> 3] = g;
      p[c >> 3] = f;
      uk(h, d, i);
      k[d >> 2] = k[h >> 2];
      k[(d + 4) >> 2] = k[(h + 4) >> 2];
      k[(d + 8) >> 2] = k[(h + 8) >> 2];
      k[(d + 12) >> 2] = k[(h + 12) >> 2];
      b = (b + 1) | 0;
    } while ((b | 0) != (a | 0));
    u = j;
    return;
  }
  function xe(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    if ((d | 0) != (k[(b + 4) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) != (k[(b + 8) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    c = k[a >> 2] | 0;
    b = aa(e, d) | 0;
    if ((b | 0) > 0) a = 0;
    else return;
    do {
      e = (c + (a << 4)) | 0;
      p[e >> 3] = +p[(f + (a << 4)) >> 3] + +p[e >> 3];
      e = (c + (a << 4) + 8) | 0;
      p[e >> 3] = +p[(f + (a << 4) + 8) >> 3] + +p[e >> 3];
      a = (a + 1) | 0;
    } while ((a | 0) != (b | 0));
    return;
  }
  function ye(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    if ((d | 0) != (k[(b + 4) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) != (k[(b + 8) >> 2] | 0)) Oa(14392, 12207, 710, 12285);
    c = k[a >> 2] | 0;
    b = aa(e, d) | 0;
    if ((b | 0) > 0) a = 0;
    else return;
    do {
      e = (c + (a << 4)) | 0;
      p[e >> 3] = +p[e >> 3] - +p[(f + (a << 4)) >> 3];
      e = (c + (a << 4) + 8) | 0;
      p[e >> 3] = +p[e >> 3] - +p[(f + (a << 4) + 8) >> 3];
      a = (a + 1) | 0;
    } while ((a | 0) != (b | 0));
    return;
  }
  function ze(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    i = u;
    u = (u + 80) | 0;
    d = (i + 40) | 0;
    e = (i + 56) | 0;
    f = i;
    g = k[(b + 4) >> 2] | 0;
    h = k[(b + 8) >> 2] | 0;
    k[d >> 2] = k[c >> 2];
    k[(d + 4) >> 2] = k[(c + 4) >> 2];
    k[(d + 8) >> 2] = k[(c + 8) >> 2];
    k[(d + 12) >> 2] = k[(c + 12) >> 2];
    if ((h | g | 0) <= -1) Oa(11919, 12068, 74, 12145);
    k[f >> 2] = b;
    c = (f + 8) | 0;
    k[c >> 2] = g;
    k[(c + 4) >> 2] = h;
    h = (f + 16) | 0;
    k[h >> 2] = k[d >> 2];
    k[(h + 4) >> 2] = k[(d + 4) >> 2];
    k[(h + 8) >> 2] = k[(d + 8) >> 2];
    k[(h + 12) >> 2] = k[(d + 12) >> 2];
    Fk(e, f);
    dk(a, e);
    d = k[e >> 2] | 0;
    if (!d) {
      u = i;
      return;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = i;
    return;
  }
  function Ae(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    Hk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Be(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    Sk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Ce(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 12) | 0;
    e = f;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(b + 8) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    Tk(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function De(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 64) | 0;
    c = (g + 40) | 0;
    d = g;
    e = k[(b + 4) >> 2] | 0;
    f = k[(b + 8) >> 2] | 0;
    if ((f | e | 0) <= -1) Oa(11919, 12068, 74, 12145);
    k[d >> 2] = b;
    b = (d + 8) | 0;
    k[b >> 2] = e;
    k[(b + 4) >> 2] = f;
    p[(d + 16) >> 3] = -1.0;
    p[(d + 24) >> 3] = 0.0;
    Fk(c, d);
    dk(a, c);
    a = k[c >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function Ee(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0;
    if (((c | 0) > -1 ? ((e = k[(b + 4) >> 2] | 0), ((d | 0) > -1) & ((e | 0) > (c | 0))) : 0) ? (k[(b + 8) >> 2] | 0) > (d | 0) : 0) {
      e = ((k[b >> 2] | 0) + (((aa(e, d) | 0) + c) << 4)) | 0;
      k[a >> 2] = k[e >> 2];
      k[(a + 4) >> 2] = k[(e + 4) >> 2];
      k[(a + 8) >> 2] = k[(e + 8) >> 2];
      k[(a + 12) >> 2] = k[(e + 12) >> 2];
      return;
    }
    Oa(15640, 15693, 118, 29764);
  }
  function Fe(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0;
    if (((b | 0) > -1 ? ((e = k[(a + 4) >> 2] | 0), ((c | 0) > -1) & ((e | 0) > (b | 0))) : 0) ? (k[(a + 8) >> 2] | 0) > (c | 0) : 0) {
      e = ((k[a >> 2] | 0) + (((aa(e, c) | 0) + b) << 4)) | 0;
      k[e >> 2] = k[d >> 2];
      k[(e + 4) >> 2] = k[(d + 4) >> 2];
      k[(e + 8) >> 2] = k[(d + 8) >> 2];
      k[(e + 12) >> 2] = k[(d + 12) >> 2];
      return;
    }
    Oa(15640, 15693, 365, 29764);
  }
  function Ge(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0;
    o = (b + 4) | 0;
    p = k[o >> 2] | 0;
    q = (b + 8) | 0;
    r = k[q >> 2] | 0;
    s = (c + 8) | 0;
    t = k[s >> 2] | 0;
    $j(a, p, (t + r) | 0);
    if ((p | 0) <= 0) return;
    j = (a + 4) | 0;
    l = (a + 8) | 0;
    m = (t | 0) > 0;
    n = (c + 4) | 0;
    if ((r | 0) <= 0) {
      g = 0;
      a: while (1) {
        if (m) {
          h = 0;
          do {
            d = k[n >> 2] | 0;
            if ((d | 0) <= (g | 0)) {
              d = 22;
              break a;
            }
            if ((k[s >> 2] | 0) <= (h | 0)) {
              d = 22;
              break a;
            }
            d = ((k[c >> 2] | 0) + (((aa(d, h) | 0) + g) << 4)) | 0;
            e = (h + r) | 0;
            f = k[j >> 2] | 0;
            if (!(((e | 0) > -1) & ((f | 0) > (g | 0)))) {
              d = 25;
              break a;
            }
            if ((k[l >> 2] | 0) <= (e | 0)) {
              d = 25;
              break a;
            }
            f = ((k[a >> 2] | 0) + (((aa(f, e) | 0) + g) << 4)) | 0;
            k[f >> 2] = k[d >> 2];
            k[(f + 4) >> 2] = k[(d + 4) >> 2];
            k[(f + 8) >> 2] = k[(d + 8) >> 2];
            k[(f + 12) >> 2] = k[(d + 12) >> 2];
            h = (h + 1) | 0;
          } while ((h | 0) < (t | 0));
        }
        g = (g + 1) | 0;
        if ((g | 0) >= (p | 0)) {
          d = 27;
          break;
        }
      }
      if ((d | 0) == 22) Oa(15640, 15693, 365, 29764);
      else if ((d | 0) == 25) Oa(15640, 15693, 365, 29764);
      else if ((d | 0) == 27) return;
    } else i = 0;
    b: while (1) {
      f = 0;
      do {
        d = k[o >> 2] | 0;
        if ((d | 0) <= (i | 0)) {
          d = 17;
          break b;
        }
        if ((k[q >> 2] | 0) <= (f | 0)) {
          d = 17;
          break b;
        }
        d = ((k[b >> 2] | 0) + (((aa(d, f) | 0) + i) << 4)) | 0;
        e = k[j >> 2] | 0;
        if ((e | 0) <= (i | 0)) {
          d = 18;
          break b;
        }
        if ((k[l >> 2] | 0) <= (f | 0)) {
          d = 18;
          break b;
        }
        h = ((k[a >> 2] | 0) + (((aa(e, f) | 0) + i) << 4)) | 0;
        k[h >> 2] = k[d >> 2];
        k[(h + 4) >> 2] = k[(d + 4) >> 2];
        k[(h + 8) >> 2] = k[(d + 8) >> 2];
        k[(h + 12) >> 2] = k[(d + 12) >> 2];
        f = (f + 1) | 0;
      } while ((f | 0) < (r | 0));
      if (m) {
        g = 0;
        do {
          d = k[n >> 2] | 0;
          if ((d | 0) <= (i | 0)) {
            d = 22;
            break b;
          }
          if ((k[s >> 2] | 0) <= (g | 0)) {
            d = 22;
            break b;
          }
          d = ((k[c >> 2] | 0) + (((aa(d, g) | 0) + i) << 4)) | 0;
          e = (g + r) | 0;
          f = k[j >> 2] | 0;
          if (!(((e | 0) > -1) & ((f | 0) > (i | 0)))) {
            d = 25;
            break b;
          }
          if ((k[l >> 2] | 0) <= (e | 0)) {
            d = 25;
            break b;
          }
          h = ((k[a >> 2] | 0) + (((aa(f, e) | 0) + i) << 4)) | 0;
          k[h >> 2] = k[d >> 2];
          k[(h + 4) >> 2] = k[(d + 4) >> 2];
          k[(h + 8) >> 2] = k[(d + 8) >> 2];
          k[(h + 12) >> 2] = k[(d + 12) >> 2];
          g = (g + 1) | 0;
        } while ((g | 0) < (t | 0));
      }
      i = (i + 1) | 0;
      if ((i | 0) >= (p | 0)) {
        d = 27;
        break;
      }
    }
    if ((d | 0) == 17) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 18) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 22) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 25) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 27) return;
  }
  function He(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0;
    o = (b + 4) | 0;
    p = k[o >> 2] | 0;
    q = (c + 4) | 0;
    r = k[q >> 2] | 0;
    s = (b + 8) | 0;
    t = k[s >> 2] | 0;
    $j(a, (r + p) | 0, t);
    if ((t | 0) <= 0) return;
    i = (p | 0) > 0;
    j = (a + 4) | 0;
    l = (a + 8) | 0;
    m = (r | 0) > 0;
    n = (c + 8) | 0;
    h = 0;
    a: while (1) {
      if (i) {
        f = 0;
        do {
          d = k[o >> 2] | 0;
          if ((d | 0) <= (f | 0)) {
            d = 16;
            break a;
          }
          if ((k[s >> 2] | 0) <= (h | 0)) {
            d = 16;
            break a;
          }
          d = ((k[b >> 2] | 0) + (((aa(d, h) | 0) + f) << 4)) | 0;
          e = k[j >> 2] | 0;
          if ((e | 0) <= (f | 0)) {
            d = 17;
            break a;
          }
          if ((k[l >> 2] | 0) <= (h | 0)) {
            d = 17;
            break a;
          }
          g = ((k[a >> 2] | 0) + (((aa(e, h) | 0) + f) << 4)) | 0;
          k[g >> 2] = k[d >> 2];
          k[(g + 4) >> 2] = k[(d + 4) >> 2];
          k[(g + 8) >> 2] = k[(d + 8) >> 2];
          k[(g + 12) >> 2] = k[(d + 12) >> 2];
          f = (f + 1) | 0;
        } while ((f | 0) < (p | 0));
      }
      if (m) {
        g = 0;
        do {
          d = k[q >> 2] | 0;
          if ((d | 0) <= (g | 0)) {
            d = 19;
            break a;
          }
          if ((k[n >> 2] | 0) <= (h | 0)) {
            d = 19;
            break a;
          }
          d = ((k[c >> 2] | 0) + (((aa(d, h) | 0) + g) << 4)) | 0;
          e = (g + p) | 0;
          if ((e | 0) <= -1) {
            d = 20;
            break a;
          }
          f = k[j >> 2] | 0;
          if ((f | 0) <= (e | 0)) {
            d = 20;
            break a;
          }
          if ((k[l >> 2] | 0) <= (h | 0)) {
            d = 20;
            break a;
          }
          f = ((k[a >> 2] | 0) + (((aa(f, h) | 0) + e) << 4)) | 0;
          k[f >> 2] = k[d >> 2];
          k[(f + 4) >> 2] = k[(d + 4) >> 2];
          k[(f + 8) >> 2] = k[(d + 8) >> 2];
          k[(f + 12) >> 2] = k[(d + 12) >> 2];
          g = (g + 1) | 0;
        } while ((g | 0) < (r | 0));
      }
      h = (h + 1) | 0;
      if ((h | 0) >= (t | 0)) {
        d = 21;
        break;
      }
    }
    if ((d | 0) == 16) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 17) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 19) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 20) Oa(15640, 15693, 365, 29764);
    else if ((d | 0) == 21) return;
  }
  function Ie(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    j = u;
    u = (u + 32) | 0;
    h = j;
    i = (a + 4) | 0;
    e = k[i >> 2] | 0;
    f = (a + 20) | 0;
    l = k[f >> 2] | 0;
    g = l << 1;
    if (((((e - (k[a >> 2] | 0)) | 0) / 24) | 0 | 0) == (l | 0)) {
      k[f >> 2] = g;
      $k(a, g);
      e = k[i >> 2] | 0;
    }
    k[h >> 2] = b;
    k[(h + 4) >> 2] = c;
    l = (h + 8) | 0;
    k[l >> 2] = k[d >> 2];
    k[(l + 4) >> 2] = k[(d + 4) >> 2];
    k[(l + 8) >> 2] = k[(d + 8) >> 2];
    k[(l + 12) >> 2] = k[(d + 12) >> 2];
    if (e >>> 0 < (k[(a + 8) >> 2] | 0) >>> 0) {
      k[e >> 2] = k[h >> 2];
      k[(e + 4) >> 2] = k[(h + 4) >> 2];
      k[(e + 8) >> 2] = k[(h + 8) >> 2];
      k[(e + 12) >> 2] = k[(h + 12) >> 2];
      k[(e + 16) >> 2] = k[(h + 16) >> 2];
      k[(e + 20) >> 2] = k[(h + 20) >> 2];
      k[i >> 2] = (k[i >> 2] | 0) + 24;
      u = j;
      return;
    } else {
      al(a, h);
      u = j;
      return;
    }
  }
  function Je(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 48) | 0;
    e = f;
    i[e >> 0] = 0;
    d = (e + 4) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    k[(d + 12) >> 2] = 0;
    k[(d + 16) >> 2] = 0;
    k[(d + 20) >> 2] = 0;
    k[(d + 24) >> 2] = 0;
    k[(d + 28) >> 2] = 0;
    k[(e + 8) >> 2] = b;
    k[(e + 28) >> 2] = 0;
    b = Oq(((c << 2) + 4) | 0) | 0;
    k[(e + 12) >> 2] = b;
    if (!b) {
      f = Kb(4) | 0;
      cF(f);
      Cc(f | 0, 2032, 79);
    }
    k[d >> 2] = c;
    iF(b | 0, 0, ((c << 2) + 4) | 0) | 0;
    Al(e);
    Bl(a, e);
    Pq(k[(e + 12) >> 2] | 0);
    Pq(k[(e + 16) >> 2] | 0);
    b = k[(e + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(e + 24) >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    FA(b);
    u = f;
    return;
  }
  function Ke(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0;
    v = u;
    u = (u + 64) | 0;
    m = (v + 16) | 0;
    s = (v + 40) | 0;
    q = v;
    r = (b + 4) | 0;
    c = k[r >> 2] | 0;
    k[s >> 2] = 0;
    t = (s + 4) | 0;
    k[t >> 2] = 0;
    k[(s + 8) >> 2] = 0;
    k[(s + 12) >> 2] = c;
    k[(s + 16) >> 2] = c;
    j = (s + 20) | 0;
    k[j >> 2] = c;
    l = (s + 8) | 0;
    a: do
      if (c | 0) {
        if (c >>> 0 > 178956970) {
          v = Kb(4) | 0;
          cF(v);
          Cc(v | 0, 2032, 79);
        }
        n = CA((c * 24) | 0) | 0;
        o = n;
        k[s >> 2] = o;
        k[t >> 2] = o;
        k[l >> 2] = n + ((c * 24) | 0);
        n = (b + 8) | 0;
        o = (m + 4) | 0;
        p = (m + 8) | 0;
        i = 0;
        while (1) {
          if (!(((c | 0) > (i | 0)) & ((k[n >> 2] | 0) > 0))) {
            c = 7;
            break;
          }
          c = ((k[b >> 2] | 0) + (i << 4)) | 0;
          k[q >> 2] = k[c >> 2];
          k[(q + 4) >> 2] = k[(c + 4) >> 2];
          k[(q + 8) >> 2] = k[(c + 8) >> 2];
          k[(q + 12) >> 2] = k[(c + 12) >> 2];
          c = k[t >> 2] | 0;
          f = k[s >> 2] | 0;
          g = (c - f) | 0;
          d = ((g | 0) / 24) | 0;
          e = k[j >> 2] | 0;
          h = e << 1;
          if ((d | 0) == (e | 0) ? ((k[j >> 2] = h), (((((k[l >> 2] | 0) - f) | 0) / 24) | 0) >>> 0 < h >>> 0) : 0) {
            if (h >>> 0 > 178956970) {
              c = 11;
              break;
            }
            e = CA((d * 48) | 0) | 0;
            c = (e + ((d * 24) | 0)) | 0;
            d = (c + (((((g | 0) / -24) | 0) * 24) | 0)) | 0;
            if ((g | 0) > 0) nF(d | 0, f | 0, g | 0) | 0;
            k[s >> 2] = d;
            k[t >> 2] = c;
            k[l >> 2] = e + ((h * 24) | 0);
            if (f) {
              EA(f);
              c = k[t >> 2] | 0;
            }
          }
          k[m >> 2] = i;
          k[o >> 2] = i;
          k[p >> 2] = k[q >> 2];
          k[(p + 4) >> 2] = k[(q + 4) >> 2];
          k[(p + 8) >> 2] = k[(q + 8) >> 2];
          k[(p + 12) >> 2] = k[(q + 12) >> 2];
          if (c >>> 0 < (k[l >> 2] | 0) >>> 0) {
            k[c >> 2] = k[m >> 2];
            k[(c + 4) >> 2] = k[(m + 4) >> 2];
            k[(c + 8) >> 2] = k[(m + 8) >> 2];
            k[(c + 12) >> 2] = k[(m + 12) >> 2];
            k[(c + 16) >> 2] = k[(m + 16) >> 2];
            k[(c + 20) >> 2] = k[(m + 20) >> 2];
            k[t >> 2] = (k[t >> 2] | 0) + 24;
          } else al(s, m);
          i = (i + 1) | 0;
          c = k[r >> 2] | 0;
          if ((i | 0) >= (c | 0)) break a;
        }
        if ((c | 0) == 7) Oa(15640, 15693, 118, 29764);
        else if ((c | 0) == 11) {
          v = Kb(4) | 0;
          cF(v);
          Cc(v | 0, 2032, 79);
        }
      }
    while (0);
    vl(a, s);
    c = k[s >> 2] | 0;
    if (!c) {
      u = v;
      return;
    }
    d = k[t >> 2] | 0;
    if ((d | 0) != (c | 0)) k[t >> 2] = d + ((~(((((d + -24 - c) | 0) >>> 0) / 24) | 0) * 24) | 0);
    EA(c);
    u = v;
    return;
  }
  function Le(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    d = u;
    u = (u + 48) | 0;
    c = (d + 8) | 0;
    e = d;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = b + 664;
    i[c >> 0] = 0;
    b = (c + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Fl(c, e) | 0;
    Bl(a, c);
    Pq(k[(c + 12) >> 2] | 0);
    Pq(k[(c + 16) >> 2] | 0);
    a = k[(c + 20) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(c + 24) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    FA(a);
    u = d;
    return;
  }
  function Me(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    d = u;
    u = (u + 48) | 0;
    c = (d + 12) | 0;
    e = d;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = b + 664;
    i[c >> 0] = 0;
    b = (c + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Hl(c, e);
    Bl(a, c);
    Pq(k[(c + 12) >> 2] | 0);
    Pq(k[(c + 16) >> 2] | 0);
    a = k[(c + 20) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(c + 24) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    FA(a);
    u = d;
    return;
  }
  function Ne(a) {
    a = a | 0;
    return k[(a + 672) >> 2] | 0;
  }
  function Oe(a) {
    a = a | 0;
    return k[(a + 668) >> 2] | 0;
  }
  function Pe(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0;
    a = (a + 664) | 0;
    d = k[(a + 16) >> 2] | 0;
    if (!d) {
      d = k[(a + 12) >> 2] | 0;
      d = ((k[(d + (k[(a + 4) >> 2] << 2)) >> 2] | 0) - (k[d >> 2] | 0)) | 0;
      return d | 0;
    }
    c = k[(a + 4) >> 2] | 0;
    if (!c) {
      d = 0;
      return d | 0;
    }
    if ((c | 0) <= -1) Oa(14697, 13988, 163, 14058);
    a = k[d >> 2] | 0;
    if ((c | 0) == 1) {
      d = a;
      return d | 0;
    } else b = 1;
    do {
      a = ((k[(d + (b << 2)) >> 2] | 0) + a) | 0;
      b = (b + 1) | 0;
    } while ((b | 0) < (c | 0));
    return a | 0;
  }
  function Qe(a) {
    a = a | 0;
    var b = 0.0,
      c = 0,
      d = 0;
    c = u;
    u = (u + 16) | 0;
    d = c;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = a + 664;
    b = +Q(+(+Jl(d)));
    u = c;
    return +b;
  }
  function Re(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      l = 0;
    l = u;
    u = (u + 64) | 0;
    j = (l + 24) | 0;
    h = l;
    g = (b + 664) | 0;
    d = (d - c) | 0;
    b = (f - e) | 0;
    i[h >> 0] = 0;
    k[(h + 4) >> 2] = g;
    k[(h + 8) >> 2] = c;
    k[(h + 12) >> 2] = e;
    k[(h + 16) >> 2] = d;
    k[(h + 20) >> 2] = b;
    if ((d | c | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if (!((b | e | 0) > -1 ? (((k[(g + 8) >> 2] | 0) - d) | 0) >= (c | 0) : 0)) Oa(14177, 13744, 147, 13812);
    if ((((k[(g + 4) >> 2] | 0) - b) | 0) < (e | 0)) Oa(14177, 13744, 147, 13812);
    i[j >> 0] = 0;
    b = (j + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Ll(j, h);
    Bl(a, j);
    Pq(k[(j + 12) >> 2] | 0);
    Pq(k[(j + 16) >> 2] | 0);
    b = k[(j + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(j + 24) >> 2] | 0;
    if (!b) {
      u = l;
      return;
    }
    FA(b);
    u = l;
    return;
  }
  function Se(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 16) | 0;
    c = (g + 12) | 0;
    d = g;
    e = (b + 664) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    f = k[(b + 672) >> 2] | 0;
    b = k[(b + 668) >> 2] | 0;
    if (!(((f | 0) == 0) | ((b | 0) == 0)) ? ((2147483647 / (b | 0)) | 0 | 0) < (f | 0) : 0) {
      g = Kb(4) | 0;
      cF(g);
      Cc(g | 0, 2032, 79);
    }
    ak(d, f, b);
    Nl(d, e, c);
    dk(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = g;
    return;
  }
  function Te(a) {
    a = a | 0;
    return a | 0;
  }
  function Ue(a) {
    a = a | 0;
    return (a + 128) | 0;
  }
  function Ve(a) {
    a = a | 0;
    return (a + 448) | 0;
  }
  function We(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0.0;
    t = u;
    u = (u + 32) | 0;
    n = (t + 16) | 0;
    o = t;
    c = (a + 664) | 0;
    q = (c + 4) | 0;
    d = k[q >> 2] | 0;
    if ((d | 0) <= 0) {
      s = (a + 121) | 0;
      i[s >> 0] = 0;
      s = (a + 441) | 0;
      i[s >> 0] = 0;
      s = (a + 657) | 0;
      i[s >> 0] = 0;
      u = t;
      return;
    }
    r = (c + 20) | 0;
    s = (c + 12) | 0;
    j = (c + 16) | 0;
    l = (b + 8) | 0;
    m = (o + 8) | 0;
    h = 0;
    c = d;
    do {
      g = k[r >> 2] | 0;
      d = k[s >> 2] | 0;
      f = k[(d + (h << 2)) >> 2] | 0;
      e = k[j >> 2] | 0;
      if (!e) d = k[(d + ((h + 1) << 2)) >> 2] | 0;
      else d = ((k[(e + (h << 2)) >> 2] | 0) + f) | 0;
      if ((f | 0) < (d | 0)) {
        c = f;
        do {
          f = (g + (c << 4)) | 0;
          v = +p[l >> 3];
          p[o >> 3] = +p[b >> 3];
          p[m >> 3] = v;
          uk(n, f, o);
          k[f >> 2] = k[n >> 2];
          k[(f + 4) >> 2] = k[(n + 4) >> 2];
          k[(f + 8) >> 2] = k[(n + 8) >> 2];
          k[(f + 12) >> 2] = k[(n + 12) >> 2];
          c = (c + 1) | 0;
        } while ((c | 0) != (d | 0));
        c = k[q >> 2] | 0;
      }
      h = (h + 1) | 0;
    } while ((h | 0) < (c | 0));
    s = (a + 121) | 0;
    i[s >> 0] = 0;
    s = (a + 441) | 0;
    i[s >> 0] = 0;
    s = (a + 657) | 0;
    i[s >> 0] = 0;
    u = t;
    return;
  }
  function Xe(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    b = (b + 664) | 0;
    c = (a + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = c;
    k[(d + 8) >> 2] = b;
    if ((k[(c + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(c + 4) >> 2] | 0) == (k[(b + 4) >> 2] | 0)) {
      Tl(c, d) | 0;
      i[(a + 120) >> 0] = 0;
      i[(a + 121) >> 0] = 0;
      i[(a + 440) >> 0] = 0;
      i[(a + 441) >> 0] = 0;
      i[(a + 656) >> 0] = 0;
      i[(a + 657) >> 0] = 0;
      u = e;
      return;
    } else Oa(14550, 14607, 110, 14683);
  }
  function Ye(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    b = (b + 664) | 0;
    c = (a + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = c;
    k[(d + 8) >> 2] = b;
    if ((k[(c + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(c + 4) >> 2] | 0) == (k[(b + 4) >> 2] | 0)) {
      Wl(c, d) | 0;
      i[(a + 120) >> 0] = 0;
      i[(a + 121) >> 0] = 0;
      i[(a + 440) >> 0] = 0;
      i[(a + 441) >> 0] = 0;
      i[(a + 656) >> 0] = 0;
      i[(a + 657) >> 0] = 0;
      u = e;
      return;
    } else Oa(14550, 14607, 110, 14683);
  }
  function Ze(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    j = u;
    u = (u + 96) | 0;
    f = (j + 40) | 0;
    h = (j + 56) | 0;
    g = j;
    b = (b + 664) | 0;
    d = k[(b + 8) >> 2] | 0;
    e = k[(b + 4) >> 2] | 0;
    k[f >> 2] = k[c >> 2];
    k[(f + 4) >> 2] = k[(c + 4) >> 2];
    k[(f + 8) >> 2] = k[(c + 8) >> 2];
    k[(f + 12) >> 2] = k[(c + 12) >> 2];
    if ((e | d | 0) <= -1) Oa(11919, 12068, 74, 12145);
    i[g >> 0] = 0;
    k[(g + 4) >> 2] = b;
    b = (g + 8) | 0;
    k[b >> 2] = d;
    k[(b + 4) >> 2] = e;
    b = (g + 16) | 0;
    k[b >> 2] = k[f >> 2];
    k[(b + 4) >> 2] = k[(f + 4) >> 2];
    k[(b + 8) >> 2] = k[(f + 8) >> 2];
    k[(b + 12) >> 2] = k[(f + 12) >> 2];
    i[h >> 0] = 0;
    b = (h + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Yl(h, g);
    Bl(a, h);
    Pq(k[(h + 12) >> 2] | 0);
    Pq(k[(h + 16) >> 2] | 0);
    b = k[(h + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(h + 24) >> 2] | 0;
    if (!b) {
      u = j;
      return;
    }
    FA(b);
    u = j;
    return;
  }
  function _e(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 48) | 0;
    e = (f + 12) | 0;
    d = f;
    b = (b + 664) | 0;
    c = (c + 664) | 0;
    i[d >> 0] = 0;
    k[(d + 4) >> 2] = b;
    k[(d + 8) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 8) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    i[e >> 0] = 0;
    c = (e + 4) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    k[(c + 28) >> 2] = 0;
    _l(e, d);
    Bl(a, e);
    Pq(k[(e + 12) >> 2] | 0);
    Pq(k[(e + 16) >> 2] | 0);
    a = k[(e + 20) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(e + 24) >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    FA(a);
    u = f;
    return;
  }
  function $e(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 64) | 0;
    f = (g + 16) | 0;
    e = g;
    d = (b + 664) | 0;
    b = (c + 664) | 0;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = d;
    k[(e + 8) >> 2] = b;
    if ((k[(d + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(d + 4) >> 2] | 0) != (k[(b + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    i[f >> 0] = 0;
    b = (f + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Ul(f, e);
    Bl(a, f);
    Pq(k[(f + 12) >> 2] | 0);
    Pq(k[(f + 16) >> 2] | 0);
    b = k[(f + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(f + 24) >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    FA(b);
    u = g;
    return;
  }
  function af(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 64) | 0;
    f = (g + 16) | 0;
    e = g;
    d = (b + 664) | 0;
    b = (c + 664) | 0;
    i[e >> 0] = 0;
    k[(e + 4) >> 2] = d;
    k[(e + 8) >> 2] = b;
    if ((k[(d + 8) >> 2] | 0) != (k[(b + 8) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    if ((k[(d + 4) >> 2] | 0) != (k[(b + 4) >> 2] | 0)) Oa(14550, 14607, 110, 14683);
    i[f >> 0] = 0;
    b = (f + 4) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    Xl(f, e);
    Bl(a, f);
    Pq(k[(f + 12) >> 2] | 0);
    Pq(k[(f + 16) >> 2] | 0);
    b = k[(f + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(f + 24) >> 2] | 0;
    if (!b) {
      u = g;
      return;
    }
    FA(b);
    u = g;
    return;
  }
  function bf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    b = (b + 664) | 0;
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    if ((k[(b + 4) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    em(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = f;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = f;
    return;
  }
  function cf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    lm(b);
    b = (b + 8) | 0;
    if (!(i[b >> 0] | 0)) Oa(17938, 17986, 90, 11715);
    if ((k[(b + 20) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(18071, 17986, 91, 11715);
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    Am(d, e);
    dk(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = f;
    return;
  }
  function df(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    f = u;
    u = (u + 32) | 0;
    d = (f + 8) | 0;
    e = f;
    Nm(b);
    b = (b + 8) | 0;
    if (!(i[b >> 0] | 0)) Oa(17938, 17986, 90, 11715);
    if ((k[(b + 32) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(18071, 17986, 91, 11715);
    k[e >> 2] = b;
    k[(e + 4) >> 2] = c;
    Cn(d, e);
    dk(a, d);
    b = k[d >> 2] | 0;
    if (!b) {
      u = f;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = f;
    return;
  }
  function ef(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    g = u;
    u = (u + 32) | 0;
    d = (g + 8) | 0;
    e = g;
    Vn(b);
    f = (b + 8) | 0;
    if (!(i[f >> 0] | 0)) Oa(20840, 20281, 235, 11715);
    if ((k[(b + 36) >> 2] | 0) != (k[(c + 4) >> 2] | 0)) Oa(20917, 20281, 236, 11715);
    k[e >> 2] = f;
    k[(e + 4) >> 2] = c;
    ho(d, e);
    dk(a, d);
    a = k[d >> 2] | 0;
    if (!a) {
      u = g;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = g;
    return;
  }
  function ff(a) {
    a = a | 0;
    return 8;
  }
  function gf(a) {
    a = a | 0;
    var b = 0;
    if (!a) return;
    b = k[a >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    EA(a);
    return;
  }
  function hf(a) {
    a = a | 0;
    Ta(a | 0) | 0;
    FB();
  }
  function jf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    c = CA(12) | 0;
    lf(c, k[a >> 2] | 0, k[b >> 2] | 0);
    return c | 0;
  }
  function kf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    d = u;
    u = (u + 16) | 0;
    f = (d + 4) | 0;
    e = d;
    k[f >> 2] = b;
    k[e >> 2] = c;
    c = Yc[a & 63](f, e) | 0;
    u = d;
    return c | 0;
  }
  function lf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    k[a >> 2] = 0;
    d = (a + 4) | 0;
    k[d >> 2] = 0;
    e = (a + 8) | 0;
    k[e >> 2] = 0;
    if ((c | b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    do
      if (c | b) {
        mf(a, b, c);
        if ((k[d >> 2] | 0) != (b | 0)) Oa(12160, 12207, 721, 12285);
        if ((k[e >> 2] | 0) == (c | 0)) {
          f = k[a >> 2] | 0;
          break;
        } else Oa(12160, 12207, 721, 12285);
      } else f = 0;
    while (0);
    a = aa(c, b) | 0;
    if ((a | 0) <= 0) return;
    iF(f | 0, 0, (a << 3) | 0) | 0;
    return;
  }
  function mf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    if ((c | b | 0) <= -1) Oa(12303, 12702, 285, 12780);
    if (!(((b | 0) == 0) | ((c | 0) == 0)) ? ((2147483647 / (c | 0)) | 0 | 0) < (b | 0) : 0) {
      c = Kb(4) | 0;
      cF(c);
      Cc(c | 0, 2032, 79);
    }
    d = aa(c, b) | 0;
    g = (a + 4) | 0;
    h = (a + 8) | 0;
    if ((aa(k[h >> 2] | 0, k[g >> 2] | 0) | 0) == (d | 0)) {
      k[g >> 2] = b;
      k[h >> 2] = c;
      return;
    }
    e = k[a >> 2] | 0;
    if (e | 0) Pq(k[(e + -4) >> 2] | 0);
    do
      if (d) {
        if (d >>> 0 > 536870911) {
          c = Kb(4) | 0;
          cF(c);
          Cc(c | 0, 2032, 79);
        }
        f = d << 3;
        e = Oq((f + 16) | 0) | 0;
        d = (e + 16) & -16;
        if (!e) d = 0;
        else k[(d + -4) >> 2] = e;
        if (((f | 0) != 0) & ((d | 0) == 0)) {
          c = Kb(4) | 0;
          cF(c);
          Cc(c | 0, 2032, 79);
        } else break;
      } else d = 0;
    while (0);
    k[a >> 2] = d;
    k[g >> 2] = b;
    k[h >> 2] = c;
    return;
  }
  function nf(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    d = CA(12) | 0;
    f = k[(a + 4) >> 2] | 0;
    g = k[(a + 8) >> 2] | 0;
    h = aa(g, f) | 0;
    if (!h) {
      k[d >> 2] = 0;
      k[(d + 4) >> 2] = f;
      k[(d + 8) >> 2] = g;
      return d | 0;
    }
    if (h >>> 0 > 536870911) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    e = h << 3;
    c = Oq((e + 16) | 0) | 0;
    b = (c + 16) & -16;
    if (!c) b = 0;
    else k[(b + -4) >> 2] = c;
    if (((e | 0) != 0) & ((b | 0) == 0)) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    k[d >> 2] = b;
    k[(d + 4) >> 2] = f;
    k[(d + 8) >> 2] = g;
    nF(b | 0, k[a >> 2] | 0, (h << 3) | 0) | 0;
    return d | 0;
  }
  function of(a, b) {
    a = a | 0;
    b = b | 0;
    return Pc[a & 127](b) | 0;
  }
  function pf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    f = (b + 4) | 0;
    g = k[f >> 2] | 0;
    h = (b + 8) | 0;
    i = k[h >> 2] | 0;
    c = aa(i, g) | 0;
    if (c) {
      if (c >>> 0 > 536870911) {
        b = Kb(4) | 0;
        cF(b);
        Cc(b | 0, 2032, 79);
      }
      e = c << 3;
      d = Oq((e + 16) | 0) | 0;
      c = (d + 16) & -16;
      if (!d) c = 0;
      else k[(c + -4) >> 2] = d;
      if (((e | 0) != 0) & ((c | 0) == 0)) {
        b = Kb(4) | 0;
        cF(b);
        Cc(b | 0, 2032, 79);
      } else d = c;
    } else d = 0;
    k[a >> 2] = d;
    k[(a + 4) >> 2] = g;
    k[(a + 8) >> 2] = i;
    c = aa(k[h >> 2] | 0, k[f >> 2] | 0) | 0;
    if (!c) return;
    nF(d | 0, k[b >> 2] | 0, (c << 3) | 0) | 0;
    return;
  }
  function qf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    c = k[b >> 2] | 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    mf(a, c, d);
    i = k[b >> 2] | 0;
    f = k[e >> 2] | 0;
    if (!((k[g >> 2] | 0) == (i | 0) ? (k[h >> 2] | 0) == (f | 0) : 0)) {
      mf(a, i, f);
      if ((k[g >> 2] | 0) != (i | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[h >> 2] | 0) != (f | 0)) Oa(12160, 12207, 721, 12285);
    }
    d = k[a >> 2] | 0;
    if (((i | 0) > 0) & ((f | 0) > 0)) b = 0;
    else return;
    do {
      e = aa(b, i) | 0;
      c = 0;
      do {
        p[(d + ((c + e) << 3)) >> 3] = (c | 0) == (b | 0) ? 1.0 : 0.0;
        c = (c + 1) | 0;
      } while ((c | 0) != (i | 0));
      b = (b + 1) | 0;
    } while ((b | 0) != (f | 0));
    return;
  }
  function rf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    d = u;
    u = (u + 16) | 0;
    e = d;
    cd[a & 63](e, b, c);
    a = sf(e) | 0;
    b = k[e >> 2] | 0;
    if (!b) {
      u = d;
      return a | 0;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = d;
    return a | 0;
  }
  function sf(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    d = CA(12) | 0;
    f = k[(a + 4) >> 2] | 0;
    g = k[(a + 8) >> 2] | 0;
    h = aa(g, f) | 0;
    if (!h) {
      k[d >> 2] = 0;
      k[(d + 4) >> 2] = f;
      k[(d + 8) >> 2] = g;
      return d | 0;
    }
    if (h >>> 0 > 536870911) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    e = h << 3;
    c = Oq((e + 16) | 0) | 0;
    b = (c + 16) & -16;
    if (!c) b = 0;
    else k[(b + -4) >> 2] = c;
    if (((e | 0) != 0) & ((b | 0) == 0)) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    k[d >> 2] = b;
    k[(d + 4) >> 2] = f;
    k[(d + 8) >> 2] = g;
    nF(b | 0, k[a >> 2] | 0, (h << 3) | 0) | 0;
    return d | 0;
  }
  function tf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0;
    k[a >> 2] = 0;
    f = (a + 4) | 0;
    k[f >> 2] = 0;
    g = (a + 8) | 0;
    k[g >> 2] = 0;
    c = k[b >> 2] | 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      g = Kb(4) | 0;
      cF(g);
      Cc(g | 0, 2032, 79);
    }
    mf(a, c, d);
    h = +p[(b + 8) >> 3];
    d = k[b >> 2] | 0;
    c = k[e >> 2] | 0;
    if (!((k[f >> 2] | 0) == (d | 0) ? (k[g >> 2] | 0) == (c | 0) : 0)) {
      mf(a, d, c);
      if ((k[f >> 2] | 0) != (d | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[g >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
    }
    b = k[a >> 2] | 0;
    d = aa(c, d) | 0;
    if ((d | 0) > 0) c = 0;
    else return;
    do {
      p[(b + (c << 3)) >> 3] = h;
      c = (c + 1) | 0;
    } while ((c | 0) != (d | 0));
    return;
  }
  function uf(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = +d;
    var e = 0,
      f = 0,
      g = 0;
    e = u;
    u = (u + 32) | 0;
    f = (e + 8) | 0;
    g = e;
    p[g >> 3] = d;
    gd[a & 15](f, b, c, g);
    a = sf(f) | 0;
    b = k[f >> 2] | 0;
    if (!b) {
      u = e;
      return a | 0;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = e;
    return a | 0;
  }
  function vf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0;
    k[a >> 2] = 0;
    f = (a + 4) | 0;
    k[f >> 2] = 0;
    g = (a + 8) | 0;
    k[g >> 2] = 0;
    c = k[b >> 2] | 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      g = Kb(4) | 0;
      cF(g);
      Cc(g | 0, 2032, 79);
    }
    mf(a, c, d);
    c = k[b >> 2] | 0;
    b = k[e >> 2] | 0;
    if (!((k[f >> 2] | 0) == (c | 0) ? (k[g >> 2] | 0) == (b | 0) : 0)) {
      mf(a, c, b);
      if ((k[f >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[g >> 2] | 0) != (b | 0)) Oa(12160, 12207, 721, 12285);
    }
    d = k[a >> 2] | 0;
    c = aa(b, c) | 0;
    if ((c | 0) > 0) b = 0;
    else return;
    do {
      h = (+(Gq() | 0) * 2.0) / 2147483647.0 + -1.0;
      p[(d + (b << 3)) >> 3] = h;
      b = (b + 1) | 0;
    } while ((b | 0) != (c | 0));
    return;
  }
  function wf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    c = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    a = (b + (f >> 1)) | 0;
    if (f & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    Nc[c & 63](d, a);
    a = sf(d) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
      u = e;
      return a | 0;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = e;
    return a | 0;
  }
  function xf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (d & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    return Pc[c & 127](a) | 0;
  }
  function yf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0;
    a = k[a >> 2] | 0;
    if ((k[(a + 4) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    if ((k[(a + 8) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    g = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    if ((f | 0) <= 0) Oa(13290, 13216, 192, 13144);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) <= 0) Oa(13290, 13216, 192, 13144);
    c = +P(+(+p[g >> 3]));
    if ((f | 0) > 1) {
      a = 1;
      do {
        h = +P(+(+p[(g + (a << 3)) >> 3]));
        c = c < h ? h : c;
        a = (a + 1) | 0;
      } while ((a | 0) != (f | 0));
    }
    if ((e | 0) > 1) d = 1;
    else {
      h = c;
      return +h;
    }
    do {
      b = aa(d, f) | 0;
      a = 0;
      do {
        h = +P(+(+p[(g + ((a + b) << 3)) >> 3]));
        c = c < h ? h : c;
        a = (a + 1) | 0;
      } while ((a | 0) < (f | 0));
      d = (d + 1) | 0;
    } while ((d | 0) != (e | 0));
    return +c;
  }
  function zf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0,
      e = 0,
      f = 0,
      g = 0;
    a = k[a >> 2] | 0;
    if ((k[(a + 4) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    if ((k[(a + 8) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    g = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    if ((f | 0) <= 0) Oa(13290, 13216, 192, 13144);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) <= 0) Oa(13290, 13216, 192, 13144);
    c = +P(+(+p[g >> 3]));
    if ((f | 0) > 1) {
      a = 1;
      do {
        c = c + +P(+(+p[(g + (a << 3)) >> 3]));
        a = (a + 1) | 0;
      } while ((a | 0) != (f | 0));
    }
    if ((e | 0) > 1) d = 1;
    else return +c;
    do {
      b = aa(d, f) | 0;
      a = 0;
      do {
        c = c + +P(+(+p[(g + ((a + b) << 3)) >> 3]));
        a = (a + 1) | 0;
      } while ((a | 0) < (f | 0));
      d = (d + 1) | 0;
    } while ((d | 0) != (e | 0));
    return +c;
  }
  function Af(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0.0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0;
    a = k[a >> 2] | 0;
    if ((k[(a + 4) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    if ((k[(a + 8) >> 2] | 0) <= 0) Oa(13148, 13216, 413, 13284);
    g = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    if ((f | 0) <= 0) Oa(13290, 13216, 192, 13144);
    e = k[(a + 8) >> 2] | 0;
    if ((e | 0) <= 0) Oa(13290, 13216, 192, 13144);
    c = +p[g >> 3];
    c = c * c;
    if ((f | 0) > 1) {
      a = 1;
      do {
        h = +p[(g + (a << 3)) >> 3];
        c = c + h * h;
        a = (a + 1) | 0;
      } while ((a | 0) != (f | 0));
    }
    if ((e | 0) > 1) d = 1;
    else {
      h = c;
      return +h;
    }
    do {
      b = aa(d, f) | 0;
      a = 0;
      do {
        h = +p[(g + ((a + b) << 3)) >> 3];
        c = c + h * h;
        a = (a + 1) | 0;
      } while ((a | 0) < (f | 0));
      d = (d + 1) | 0;
    } while ((d | 0) != (e | 0));
    return +c;
  }
  function Bf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    d = k[a >> 2] | 0;
    e = k[(a + 4) >> 2] | 0;
    a = (b + (e >> 1)) | 0;
    if (e & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    return +(+$c[d & 7](a, c));
  }
  function Cf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    g = (b + 4) | 0;
    h = k[g >> 2] | 0;
    c = (b + 8) | 0;
    j = k[c >> 2] | 0;
    k[a >> 2] = 0;
    d = (a + 4) | 0;
    k[d >> 2] = 0;
    e = (a + 8) | 0;
    k[e >> 2] = 0;
    mf(a, h, j);
    j = (a + 12) | 0;
    h = k[g >> 2] | 0;
    f = k[c >> 2] | 0;
    k[j >> 2] = 0;
    k[(a + 16) >> 2] = 0;
    Df(j, (f | 0) < (h | 0) ? f : h);
    h = (a + 20) | 0;
    f = k[c >> 2] | 0;
    k[h >> 2] = 0;
    k[(a + 24) >> 2] = 0;
    Ef(h, f);
    f = (a + 28) | 0;
    h = k[c >> 2] | 0;
    k[f >> 2] = 0;
    k[(a + 32) >> 2] = 0;
    Ff(f, h);
    h = (a + 36) | 0;
    f = k[c >> 2] | 0;
    k[h >> 2] = 0;
    k[(a + 40) >> 2] = 0;
    Gf(h, f);
    f = (a + 44) | 0;
    h = k[c >> 2] | 0;
    k[f >> 2] = 0;
    k[(a + 48) >> 2] = 0;
    Gf(f, h);
    h = (a + 52) | 0;
    f = k[c >> 2] | 0;
    k[h >> 2] = 0;
    k[(a + 56) >> 2] = 0;
    Gf(h, f);
    i[(a + 60) >> 0] = 0;
    i[(a + 61) >> 0] = 0;
    f = k[b >> 2] | 0;
    b = k[g >> 2] | 0;
    c = k[c >> 2] | 0;
    if (!((k[d >> 2] | 0) == (b | 0) ? (k[e >> 2] | 0) == (c | 0) : 0)) {
      mf(a, b, c);
      if ((k[d >> 2] | 0) != (b | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[e >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
    }
    d = k[a >> 2] | 0;
    c = aa(c, b) | 0;
    if ((c | 0) > 0) b = 0;
    else {
      Hf(a);
      return;
    }
    do {
      p[(d + (b << 3)) >> 3] = +p[(f + (b << 3)) >> 3];
      b = (b + 1) | 0;
    } while ((b | 0) != (c | 0));
    Hf(a);
    return;
  }
  function Df(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    if ((b | 0) <= -1) Oa(13359, 12702, 312, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 536870911) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        }
        e = b << 3;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Ef(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    if ((b | 0) <= -1) Oa(13359, 12702, 312, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 1073741823) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        }
        e = b << 2;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Ff(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    if ((b | 0) <= -1) Oa(13359, 12702, 312, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 1073741823) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        }
        e = b << 2;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Gf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    if ((b | 0) <= -1) Oa(13359, 12702, 312, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 536870911) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        }
        e = b << 3;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          f = Kb(4) | 0;
          cF(f);
          Cc(f | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Hf(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0.0,
      o = 0.0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0.0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      ba = 0,
      ca = 0,
      da = 0,
      ea = 0,
      fa = 0,
      ga = 0,
      ha = 0,
      ia = 0,
      ja = 0,
      ka = 0,
      la = 0,
      ma = 0,
      na = 0,
      oa = 0,
      pa = 0,
      qa = 0,
      ra = 0,
      sa = 0,
      ta = 0,
      ua = 0,
      va = 0,
      wa = 0,
      xa = 0;
    xa = u;
    u = (u + 144) | 0;
    ja = (xa + 64) | 0;
    oa = (xa + 56) | 0;
    pa = xa;
    qa = (a + 8) | 0;
    ta = k[qa >> 2] | 0;
    ra = (a + 4) | 0;
    sa = k[ra >> 2] | 0;
    wa = (ta | 0) < (sa | 0) ? ta : sa;
    ka = (a + 12) | 0;
    Df(ka, wa);
    la = (a + 36) | 0;
    Gf(la, ta);
    ua = (a + 28) | 0;
    Ff(ua, k[qa >> 2] | 0);
    ma = (a + 44) | 0;
    Gf(ma, ta);
    na = (a + 52) | 0;
    Gf(na, ta);
    a: do
      if ((ta | 0) > 0) {
        f = k[a >> 2] | 0;
        h = k[ra >> 2] | 0;
        j = (h | 0) == 0;
        l = (h | 0) > 0;
        m = (h | 0) == 1;
        if ((h | 0) <= -1) {
          b = 0;
          while (1) {
            if ((f + ((aa(h, b) | 0) << 3)) | 0) {
              b = 17;
              break;
            }
            if ((k[qa >> 2] | 0) <= (b | 0)) {
              b = 19;
              break;
            }
            if (!l) {
              b = 21;
              break;
            }
            p[((k[na >> 2] | 0) + (b << 3)) >> 3] = 0.0;
            p[((k[ma >> 2] | 0) + (b << 3)) >> 3] = 0.0;
            b = (b + 1) | 0;
            if ((b | 0) >= (ta | 0)) break a;
          }
          if ((b | 0) == 17) Oa(13818, 13988, 175, 14058);
          else if ((b | 0) == 19) Oa(13577, 13744, 122, 13812);
          else if ((b | 0) == 21) Oa(13148, 13216, 413, 13284);
        }
        e = k[qa >> 2] | 0;
        d = 0;
        while (1) {
          c = (f + ((aa(h, d) | 0) << 3)) | 0;
          if ((e | 0) <= (d | 0)) {
            b = 19;
            break;
          }
          if (!j) {
            if (!l) {
              b = 21;
              break;
            }
            g = +p[c >> 3];
            g = g * g;
            if (!m) {
              b = 1;
              do {
                I = +p[(c + (b << 3)) >> 3];
                g = g + I * I;
                b = (b + 1) | 0;
              } while ((b | 0) < (h | 0));
            }
          } else g = 0.0;
          I = +Q(+g);
          p[((k[na >> 2] | 0) + (d << 3)) >> 3] = I;
          p[((k[ma >> 2] | 0) + (d << 3)) >> 3] = I;
          d = (d + 1) | 0;
          if ((d | 0) >= (ta | 0)) break a;
        }
        if ((b | 0) == 19) Oa(13577, 13744, 122, 13812);
        else if ((b | 0) == 21) Oa(13148, 13216, 413, 13284);
      }
    while (0);
    ga = (a + 48) | 0;
    c = k[ga >> 2] | 0;
    if ((c | 0) <= 0) Oa(13148, 13216, 413, 13284);
    d = k[ma >> 2] | 0;
    g = +p[d >> 3];
    if ((c | 0) != 1) {
      b = 1;
      do {
        I = +p[(d + (b << 3)) >> 3];
        g = g < I ? I : g;
        b = (b + 1) | 0;
      } while ((b | 0) < (c | 0));
    }
    I = g * 2.220446049250313e-16;
    I = (I * I) / +(sa | 0);
    J = (a + 80) | 0;
    k[J >> 2] = wa;
    K = (a + 72) | 0;
    p[K >> 3] = 0.0;
    ha = (wa | 0) > 0;
    b: do
      if (ha) {
        L = (pa + 4) | 0;
        G = (pa + 12) | 0;
        H = (pa + 16) | 0;
        D = (pa + 24) | 0;
        x = (pa + 28) | 0;
        z = (pa + 32) | 0;
        B = (pa + 36) | 0;
        M = (pa + 40) | 0;
        N = (pa + 48) | 0;
        O = (ja + 4) | 0;
        R = (ja + 12) | 0;
        S = (ja + 24) | 0;
        T = (ja + 36) | 0;
        U = (ja + 52) | 0;
        V = (ja + 60) | 0;
        W = (ja + 64) | 0;
        X = (ja + 72) | 0;
        Y = (ja + 4) | 0;
        Z = (ja + 8) | 0;
        _ = (ja + 12) | 0;
        $ = (ja + 16) | 0;
        ba = (ja + 20) | 0;
        ca = (ja + 24) | 0;
        da = (pa + 4) | 0;
        E = (pa + 12) | 0;
        F = (pa + 16) | 0;
        C = (pa + 24) | 0;
        w = (pa + 28) | 0;
        y = (pa + 32) | 0;
        A = (pa + 36) | 0;
        ea = (pa + 40) | 0;
        fa = (pa + 48) | 0;
        b = (c - ta) | 0;
        c = (d + (b << 3)) | 0;
        if (((ta | 0) > -1) | ((c | 0) == 0)) {
          t = 0;
          ia = 0;
          q = b;
          v = ta;
          r = c;
          s = d;
        } else Oa(13818, 13988, 175, 14058);
        c: while (1) {
          if ((q | v | 0) < 0) {
            b = 30;
            break;
          }
          n = +p[r >> 3];
          if ((v | 0) > 1) {
            d = 1;
            b = 0;
            g = n;
            o = n;
            while (1) {
              n = +p[(r + (d << 3)) >> 3];
              c = n > o;
              g = c ? n : g;
              b = c ? d : b;
              d = (d + 1) | 0;
              if ((d | 0) == (v | 0)) break;
              else o = c ? n : o;
            }
          } else {
            b = 0;
            g = n;
          }
          j = (b + ia) | 0;
          if ((k[J >> 2] | 0) == (wa | 0) ? g * g < I * +((sa - ia) | 0) : 0) k[J >> 2] = ia;
          k[((k[ua >> 2] | 0) + (ia << 2)) >> 2] = j;
          if (b) {
            b = k[a >> 2] | 0;
            f = k[ra >> 2] | 0;
            h = (b + ((aa(f, ia) | 0) << 3)) | 0;
            c = (f | 0) > -1;
            if (!(c | ((h | 0) == 0))) {
              b = 38;
              break;
            }
            d = k[qa >> 2] | 0;
            if ((d | 0) <= (ia | 0)) {
              b = 40;
              break;
            }
            e = (b + ((aa(f, j) | 0) << 3)) | 0;
            if (!(c | ((e | 0) == 0))) {
              b = 42;
              break;
            }
            if (!(((j | 0) > -1) & ((d | 0) > (j | 0)))) {
              b = 44;
              break;
            }
            if ((f | 0) > 0) {
              b = 0;
              do {
                q = (h + (b << 3)) | 0;
                r = (e + (b << 3)) | 0;
                o = +p[q >> 3];
                p[q >> 3] = +p[r >> 3];
                p[r >> 3] = o;
                b = (b + 1) | 0;
              } while ((b | 0) != (f | 0));
            }
            r = (s + (ia << 3)) | 0;
            s = (s + (j << 3)) | 0;
            o = +p[r >> 3];
            p[r >> 3] = +p[s >> 3];
            p[s >> 3] = o;
            s = k[na >> 2] | 0;
            r = (s + (ia << 3)) | 0;
            s = (s + (j << 3)) | 0;
            o = +p[r >> 3];
            p[r >> 3] = +p[s >> 3];
            p[s >> 3] = o;
            t = (t + 1) | 0;
          }
          c = k[ra >> 2] | 0;
          b = ((k[a >> 2] | 0) + ((aa(c, ia) | 0) << 3)) | 0;
          if (!(((c | 0) > -1) | ((b | 0) == 0))) {
            b = 49;
            break;
          }
          if ((k[qa >> 2] | 0) <= (ia | 0)) {
            b = 51;
            break;
          }
          j = (sa - ia) | 0;
          d = (c - j) | 0;
          e = (b + (d << 3)) | 0;
          k[pa >> 2] = e;
          k[L >> 2] = j;
          if (!(((j | 0) > -1) | ((e | 0) == 0))) {
            b = 53;
            break;
          }
          k[G >> 2] = b;
          k[H >> 2] = c;
          k[D >> 2] = a;
          k[x >> 2] = 0;
          k[z >> 2] = ia;
          k[B >> 2] = c;
          k[M >> 2] = d;
          k[N >> 2] = c;
          if ((d | j | 0) <= -1) {
            b = 55;
            break;
          }
          b = k[ka >> 2] | 0;
          s = (j + -1) | 0;
          k[ja >> 2] = e + 8;
          k[O >> 2] = s;
          if ((j | 0) <= 0) {
            b = 57;
            break;
          }
          r = pa;
          q = k[(r + 4) >> 2] | 0;
          m = R;
          k[m >> 2] = k[r >> 2];
          k[(m + 4) >> 2] = q;
          m = G;
          q = k[(m + 4) >> 2] | 0;
          r = S;
          k[r >> 2] = k[m >> 2];
          k[(r + 4) >> 2] = q;
          k[T >> 2] = k[D >> 2];
          k[(T + 4) >> 2] = k[(D + 4) >> 2];
          k[(T + 8) >> 2] = k[(D + 8) >> 2];
          k[(T + 12) >> 2] = k[(D + 12) >> 2];
          k[U >> 2] = d;
          k[V >> 2] = c;
          k[W >> 2] = 1;
          k[X >> 2] = c;
          Jf(pa, ja, (b + (ia << 3)) | 0, oa);
          r = ((k[a >> 2] | 0) + (((aa(k[ra >> 2] | 0, ia) | 0) + ia) << 3)) | 0;
          p[r >> 3] = +p[oa >> 3];
          g = +P(+(+p[oa >> 3]));
          if (g > +p[K >> 3]) p[K >> 3] = g;
          e = (v + -1) | 0;
          f = k[ra >> 2] | 0;
          b = (f - j) | 0;
          h = k[qa >> 2] | 0;
          c = (h - e) | 0;
          d = k[a >> 2] | 0;
          v = (d + (b << 3) + ((aa(c, f) | 0) << 3)) | 0;
          k[ja >> 2] = v;
          k[Y >> 2] = j;
          k[Z >> 2] = e;
          e = e | j;
          if (!(((e | 0) > -1) | ((v | 0) == 0))) {
            b = 61;
            break;
          }
          k[_ >> 2] = a;
          k[$ >> 2] = b;
          k[ba >> 2] = c;
          k[ca >> 2] = f;
          if ((e | b | c | 0) <= -1) {
            b = 63;
            break;
          }
          b = (d + ((aa(f, ia) | 0) << 3)) | 0;
          if (!(((f | 0) > -1) | ((b | 0) == 0))) {
            b = 65;
            break;
          }
          if ((h | 0) <= (ia | 0)) {
            b = 67;
            break;
          }
          v = (f - s) | 0;
          k[pa >> 2] = b + (v << 3);
          k[da >> 2] = s;
          k[E >> 2] = b;
          k[F >> 2] = f;
          k[C >> 2] = a;
          k[w >> 2] = 0;
          k[y >> 2] = ia;
          k[A >> 2] = f;
          k[ea >> 2] = v;
          k[fa >> 2] = f;
          if ((v | s | 0) <= -1) {
            b = 69;
            break;
          }
          m = ia;
          ia = (ia + 1) | 0;
          If(ja, pa, ((k[ka >> 2] | 0) + (m << 3)) | 0, ((k[la >> 2] | 0) + (ia << 3)) | 0);
          if ((ta | 0) > (ia | 0)) {
            q = k[ma >> 2] | 0;
            r = (s | 0) == 0;
            h = (j | 0) > 1;
            j = (s | 0) == 1;
            f = ia;
            do {
              l = (q + (f << 3)) | 0;
              g = +p[l >> 3];
              if (g != 0.0) {
                b = k[a >> 2] | 0;
                d = k[ra >> 2] | 0;
                c = aa(d, f) | 0;
                n = +P(+(+p[(b + ((c + m) << 3)) >> 3])) / g;
                n = (n + 1.0) * (1.0 - n);
                n = n < 0.0 ? 0.0 : n;
                e = ((k[na >> 2] | 0) + (f << 3)) | 0;
                o = g / +p[e >> 3];
                if (!(o * o * n <= 1.4901161193847656e-8)) g = g * +Q(+n);
                else {
                  b = (b + (c << 3)) | 0;
                  if (!(((d | 0) > -1) | ((b | 0) == 0))) {
                    b = 87;
                    break c;
                  }
                  if ((k[qa >> 2] | 0) <= (f | 0)) {
                    b = 88;
                    break c;
                  }
                  v = (d - s) | 0;
                  c = (b + (v << 3)) | 0;
                  if ((v | s | 0) <= -1) {
                    b = 89;
                    break c;
                  }
                  do
                    if (r) g = 0.0;
                    else {
                      if (!h) {
                        b = 90;
                        break c;
                      }
                      g = +p[c >> 3];
                      g = g * g;
                      if (j) break;
                      else b = 1;
                      do {
                        o = +p[(c + (b << 3)) >> 3];
                        g = g + o * o;
                        b = (b + 1) | 0;
                      } while ((b | 0) < (s | 0));
                    }
                  while (0);
                  g = +Q(+g);
                  p[e >> 3] = g;
                }
                p[l >> 3] = g;
              }
              f = (f + 1) | 0;
            } while ((f | 0) < (ta | 0));
          }
          if ((ia | 0) >= (wa | 0)) {
            va = t;
            break b;
          }
          s = k[ma >> 2] | 0;
          v = (ta - ia) | 0;
          q = ((k[ga >> 2] | 0) - v) | 0;
          r = (s + (q << 3)) | 0;
          if (!(((v | 0) > -1) | ((r | 0) == 0))) {
            b = 28;
            break;
          }
        }
        switch (b | 0) {
          case 28: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 30: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 38: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 40: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 42: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 44: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 49: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 51: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 53: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 55: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 57: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 61: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 63: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 65: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 67: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 69: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 87: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 88: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 89: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 90: {
            Oa(13148, 13216, 413, 13284);
            break;
          }
        }
      } else va = 0;
    while (0);
    f = (a + 20) | 0;
    Ef(f, ta);
    e = (a + 24) | 0;
    d = k[e >> 2] | 0;
    if ((d | 0) > 0) {
      c = k[f >> 2] | 0;
      b = 0;
      do {
        k[(c + (b << 2)) >> 2] = b;
        b = (b + 1) | 0;
      } while ((b | 0) != (d | 0));
    }
    if (!ha) {
      va = va << 1;
      va = va & 2;
      va = va ^ 2;
      va = (va + -1) | 0;
      wa = (a + 84) | 0;
      k[wa >> 2] = va;
      wa = (a + 60) | 0;
      i[wa >> 0] = 1;
      u = xa;
      return;
    }
    c = k[ua >> 2] | 0;
    b = 0;
    while (1) {
      d = k[(c + (b << 2)) >> 2] | 0;
      if ((d | b | 0) <= -1) {
        b = 94;
        break;
      }
      ua = k[e >> 2] | 0;
      if (!(((ua | 0) > (b | 0)) & ((ua | 0) > (d | 0)))) {
        b = 94;
        break;
      }
      ua = k[f >> 2] | 0;
      sa = (ua + (b << 2)) | 0;
      ua = (ua + (d << 2)) | 0;
      ta = k[sa >> 2] | 0;
      k[sa >> 2] = k[ua >> 2];
      k[ua >> 2] = ta;
      b = (b + 1) | 0;
      if ((b | 0) >= (wa | 0)) {
        b = 91;
        break;
      }
    }
    if ((b | 0) == 91) {
      va = va << 1;
      va = va & 2;
      va = va ^ 2;
      va = (va + -1) | 0;
      wa = (a + 84) | 0;
      k[wa >> 2] = va;
      wa = (a + 60) | 0;
      i[wa >> 0] = 1;
      u = xa;
      return;
    } else if ((b | 0) == 94) Oa(15008, 15045, 187, 15125);
  }
  function If(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0;
    M = u;
    u = (u + 288) | 0;
    I = (M + 272) | 0;
    J = (M + 200) | 0;
    K = (M + 104) | 0;
    y = (M + 96) | 0;
    L = (M + 40) | 0;
    f = (M + 252) | 0;
    w = M;
    D = (a + 4) | 0;
    e = k[D >> 2] | 0;
    g = +p[c >> 3];
    if ((e | 0) == 1) {
      g = 1.0 - g;
      h = k[(a + 8) >> 2] | 0;
      if ((h | 0) <= -1) Oa(11919, 12068, 74, 12145);
      i = k[a >> 2] | 0;
      f = k[(a + 24) >> 2] | 0;
      if (!h) {
        u = M;
        return;
      } else e = 0;
      do {
        L = (i + ((aa(e, f) | 0) << 3)) | 0;
        p[L >> 3] = g * +p[L >> 3];
        e = (e + 1) | 0;
      } while ((e | 0) != (h | 0));
      u = M;
      return;
    }
    if (!(g != 0.0)) {
      u = M;
      return;
    }
    x = (a + 8) | 0;
    E = k[x >> 2] | 0;
    F = d;
    if ((E | 0) <= -1) Oa(14697, 13988, 163, 14058);
    n = (e + -1) | 0;
    k[L >> 2] = (k[a >> 2] | 0) + 8;
    G = (L + 4) | 0;
    k[G >> 2] = n;
    H = (L + 8) | 0;
    k[H >> 2] = E;
    if ((E | n | 0) <= -1) Oa(13818, 13988, 175, 14058);
    h = (L + 12) | 0;
    k[h >> 2] = k[a >> 2];
    k[(h + 4) >> 2] = k[(a + 4) >> 2];
    k[(h + 8) >> 2] = k[(a + 8) >> 2];
    k[(h + 12) >> 2] = k[(a + 12) >> 2];
    k[(h + 16) >> 2] = k[(a + 16) >> 2];
    k[(h + 20) >> 2] = k[(a + 20) >> 2];
    k[(h + 24) >> 2] = k[(a + 24) >> 2];
    k[(L + 40) >> 2] = 1;
    k[(L + 44) >> 2] = 0;
    k[(L + 48) >> 2] = k[(L + 36) >> 2];
    if ((e | 0) <= 0) Oa(14177, 13744, 147, 13812);
    q = b;
    o = k[q >> 2] | 0;
    q = k[(q + 4) >> 2] | 0;
    A = (b + 12) | 0;
    s = A;
    r = k[s >> 2] | 0;
    s = k[(s + 4) >> 2] | 0;
    z = (b + 24) | 0;
    B = (b + 40) | 0;
    t = k[B >> 2] | 0;
    C = (b + 48) | 0;
    v = k[C >> 2] | 0;
    j = (f + 4) | 0;
    k[j >> 2] = k[z >> 2];
    k[(j + 4) >> 2] = k[(z + 4) >> 2];
    k[(j + 8) >> 2] = k[(z + 8) >> 2];
    k[(j + 12) >> 2] = k[(z + 12) >> 2];
    m = L;
    l = k[m >> 2] | 0;
    m = k[(m + 4) >> 2] | 0;
    i = w;
    e = h;
    f = (i + 40) | 0;
    do {
      k[i >> 2] = k[e >> 2];
      i = (i + 4) | 0;
      e = (e + 4) | 0;
    } while ((i | 0) < (f | 0));
    if ((q | 0) != (n | 0)) Oa(14710, 14850, 97, 14920);
    if (!E) e = 0;
    else {
      iF(d | 0, 0, (E << 3) | 0) | 0;
      e = E;
    }
    p[y >> 3] = 1.0;
    k[I >> 2] = F;
    k[(I + 8) >> 2] = e;
    i = J;
    k[i >> 2] = l;
    k[(i + 4) >> 2] = m;
    k[(J + 8) >> 2] = E;
    i = (J + 12) | 0;
    e = w;
    f = (i + 40) | 0;
    do {
      k[i >> 2] = k[e >> 2];
      i = (i + 4) | 0;
      e = (e + 4) | 0;
    } while ((i | 0) < (f | 0));
    e = K;
    k[e >> 2] = o;
    k[(e + 4) >> 2] = q;
    e = (K + 12) | 0;
    k[e >> 2] = r;
    k[(e + 4) >> 2] = s;
    e = (K + 24) | 0;
    k[e >> 2] = k[j >> 2];
    k[(e + 4) >> 2] = k[(j + 4) >> 2];
    k[(e + 8) >> 2] = k[(j + 8) >> 2];
    k[(e + 12) >> 2] = k[(j + 12) >> 2];
    k[(K + 40) >> 2] = t;
    k[(K + 48) >> 2] = v;
    Kf(J, K, I, y);
    j = k[a >> 2] | 0;
    e = k[x >> 2] | 0;
    if (!(((j | 0) == 0) | ((e | 0) > -1))) Oa(13818, 13988, 175, 14058);
    h = (a + 24) | 0;
    f = k[h >> 2] | 0;
    if ((k[D >> 2] | 0) <= 0) Oa(13577, 13744, 122, 13812);
    if ((E | 0) != (e | 0)) Oa(14392, 12207, 710, 12285);
    i = (E | 0) > 0;
    if (i) {
      e = 0;
      do {
        a = (d + (e << 3)) | 0;
        y = (j + ((aa(e, f) | 0) << 3)) | 0;
        p[a >> 3] = +p[y >> 3] + +p[a >> 3];
        e = (e + 1) | 0;
      } while ((e | 0) != (E | 0));
    }
    g = +p[c >> 3];
    f = k[h >> 2] | 0;
    if ((k[D >> 2] | 0) <= 0) Oa(13577, 13744, 122, 13812);
    if (i) {
      e = 0;
      do {
        D = (j + ((aa(e, f) | 0) << 3)) | 0;
        p[D >> 3] = +p[D >> 3] - g * +p[(d + (e << 3)) >> 3];
        e = (e + 1) | 0;
      } while ((e | 0) != (E | 0));
    }
    e = k[(b + 4) >> 2] | 0;
    if ((e | 0) <= -1) Oa(11919, 12068, 74, 12145);
    g = +p[c >> 3];
    c = b;
    a = k[c >> 2] | 0;
    c = k[(c + 4) >> 2] | 0;
    D = A;
    A = k[D >> 2] | 0;
    D = k[(D + 4) >> 2] | 0;
    d = k[B >> 2] | 0;
    b = k[C >> 2] | 0;
    k[(K + 8) >> 2] = e;
    p[(K + 16) >> 3] = g;
    e = (K + 24) | 0;
    k[e >> 2] = a;
    k[(e + 4) >> 2] = c;
    e = (K + 36) | 0;
    k[e >> 2] = A;
    k[(e + 4) >> 2] = D;
    e = (K + 48) | 0;
    k[e >> 2] = k[z >> 2];
    k[(e + 4) >> 2] = k[(z + 4) >> 2];
    k[(e + 8) >> 2] = k[(z + 8) >> 2];
    k[(e + 12) >> 2] = k[(z + 12) >> 2];
    k[(K + 64) >> 2] = d;
    k[(K + 72) >> 2] = b;
    e = (K + 80) | 0;
    k[e >> 2] = F;
    k[(K + 88) >> 2] = E;
    if (!((k[G >> 2] | 0) == (c | 0) ? (k[H >> 2] | 0) == (E | 0) : 0)) Oa(14392, 14928, 176, 13144);
    Mf(L, K, e, I, J);
    u = M;
    return;
  }
  function Jf(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0.0,
      f = 0,
      g = 0.0,
      h = 0.0,
      i = 0,
      j = 0,
      l = 0;
    i = k[(a + 4) >> 2] | 0;
    l = (i + -1) | 0;
    f = k[a >> 2] | 0;
    j = (f + 8) | 0;
    if ((i | 0) <= 0) Oa(13818, 13988, 175, 14058);
    if (!(((l | 0) == 0) | ((i | 0) == 1))) {
      e = +p[j >> 3];
      e = e * e;
      if ((l | 0) != 1) {
        a = 1;
        do {
          h = +p[(j + (a << 3)) >> 3];
          e = e + h * h;
          a = (a + 1) | 0;
        } while ((a | 0) < (l | 0));
      }
      h = +p[f >> 3];
      if (!(e <= 2.2250738585072014e-308)) {
        e = +Q(+(e + h * h));
        e = !(h >= 0.0) ? e : -e;
        p[d >> 3] = e;
        g = h - e;
        if ((k[(b + 4) >> 2] | 0) != (l | 0)) Oa(14445, 14320, 257, 12780);
        f = k[b >> 2] | 0;
        if ((i | 0) > 1) {
          a = 0;
          do {
            p[(f + (a << 3)) >> 3] = +p[(j + (a << 3)) >> 3] / g;
            a = (a + 1) | 0;
          } while ((a | 0) != (l | 0));
          e = +p[d >> 3];
        }
        p[c >> 3] = (e - h) / e;
        return;
      } else e = h;
    } else e = +p[f >> 3];
    p[c >> 3] = 0.0;
    p[d >> 3] = e;
    a = k[(b + 4) >> 2] | 0;
    if ((a | 0) <= -1) Oa(11919, 12068, 74, 12145);
    if (!a) return;
    iF(k[b >> 2] | 0, 0, (a << 3) | 0) | 0;
    return;
  }
  function Kf(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0;
    n = u;
    u = (u + 16) | 0;
    l = (n + 8) | 0;
    m = n;
    h = k[a >> 2] | 0;
    i = k[(a + 4) >> 2] | 0;
    j = k[(a + 8) >> 2] | 0;
    f = k[(a + 48) >> 2] | 0;
    e = k[(b + 4) >> 2] | 0;
    g = +p[d >> 3];
    if (e >>> 0 > 536870911) {
      n = Kb(4) | 0;
      cF(n);
      Cc(n | 0, 2032, 79);
    }
    a = k[b >> 2] | 0;
    b = (a | 0) == 0;
    e = e << 3;
    if (b)
      if (e >>> 0 >= 131073) {
        d = Oq((e + 16) | 0) | 0;
        a = (d + 16) & -16;
        if (!d) {
          n = Kb(4) | 0;
          cF(n);
          Cc(n | 0, 2032, 79);
        }
        k[(a + -4) >> 2] = d;
        if (!a) {
          n = Kb(4) | 0;
          cF(n);
          Cc(n | 0, 2032, 79);
        }
      } else {
        a = u;
        u = (u + ((((1 * ((e + 15) | 0)) | 0) + 15) & -16)) | 0;
        a = (a + 15) & -16;
      }
    d = b ? a : 0;
    k[l >> 2] = h;
    k[(l + 4) >> 2] = f;
    k[m >> 2] = a;
    k[(m + 4) >> 2] = 1;
    a = k[c >> 2] | 0;
    if (!((a | 0) == 0 ? 1 : (k[(c + 8) >> 2] | 0) > -1)) Oa(13818, 13988, 175, 14058);
    Lf(j, i, l, m, a, 1, g);
    if (((d | 0) == 0) | ((e >>> 0 > 131072) ^ 1)) {
      u = n;
      return;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = n;
    return;
  }
  function Lf(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = +g;
    var h = 0,
      i = 0.0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0.0,
      q = 0.0,
      r = 0.0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0.0;
    z = (c + 4) | 0;
    y = k[d >> 2] | 0;
    x = ((y & 7) | 0) != 0;
    h = (x << 31) >> 31;
    w = k[c >> 2] | 0;
    A = w;
    if (!(((w & 7) | 0) == 0 ? !(((h | 0) == (a | 0)) | (x | ((b | 0) == 0))) : 0)) h = 0;
    j = (((a | 0) / 4) | 0) << 2;
    a: do
      if ((a | 0) > 3) {
        m = k[z >> 2] | 0;
        if ((b | 0) > 0) l = 0;
        else {
          i = g * 0.0;
          c = 0;
          while (1) {
            y = (e + ((aa(c, f) | 0) << 3)) | 0;
            p[y >> 3] = i + +p[y >> 3];
            y = (e + ((aa(c | 1, f) | 0) << 3)) | 0;
            p[y >> 3] = i + +p[y >> 3];
            y = (e + ((aa(c | 2, f) | 0) << 3)) | 0;
            p[y >> 3] = i + +p[y >> 3];
            y = (e + ((aa(c | 3, f) | 0) << 3)) | 0;
            p[y >> 3] = i + +p[y >> 3];
            c = (c + 4) | 0;
            if ((c | 0) >= (j | 0)) break a;
          }
        }
        do {
          n = (A + ((aa(m, l) | 0) << 3)) | 0;
          s = l | 1;
          t = (A + ((aa(m, s) | 0) << 3)) | 0;
          u = l | 2;
          v = (A + ((aa(m, u) | 0) << 3)) | 0;
          w = l | 3;
          x = (A + ((aa(m, w) | 0) << 3)) | 0;
          c = 0;
          i = 0.0;
          o = 0.0;
          q = 0.0;
          r = 0.0;
          do {
            B = +p[(y + (c << 3)) >> 3];
            r = r + B * +p[(n + (c << 3)) >> 3];
            q = q + B * +p[(t + (c << 3)) >> 3];
            o = o + B * +p[(v + (c << 3)) >> 3];
            i = i + B * +p[(x + (c << 3)) >> 3];
            c = (c + 1) | 0;
          } while ((c | 0) != (b | 0));
          x = (e + ((aa(l, f) | 0) << 3)) | 0;
          p[x >> 3] = r * g + +p[x >> 3];
          x = (e + ((aa(s, f) | 0) << 3)) | 0;
          p[x >> 3] = q * g + +p[x >> 3];
          x = (e + ((aa(u, f) | 0) << 3)) | 0;
          p[x >> 3] = o * g + +p[x >> 3];
          x = (e + ((aa(w, f) | 0) << 3)) | 0;
          p[x >> 3] = i * g + +p[x >> 3];
          l = (l + 4) | 0;
        } while ((l | 0) < (j | 0));
      }
    while (0);
    if ((j | 0) >= (a | 0)) return;
    u = k[z >> 2] | 0;
    s = k[d >> 2] | 0;
    t = (b | 0) > 0;
    if ((h | 0) >= 0) {
      do {
        h = (A + ((aa(u, j) | 0) << 3)) | 0;
        if (t) {
          c = 0;
          i = 0.0;
          do {
            i = i + +p[(h + (c << 3)) >> 3] * +p[(s + (c << 3)) >> 3];
            c = (c + 1) | 0;
          } while ((c | 0) != (b | 0));
        } else i = 0.0;
        d = (e + ((aa(j, f) | 0) << 3)) | 0;
        p[d >> 3] = i * g + +p[d >> 3];
        j = (j + 1) | 0;
      } while ((j | 0) != (a | 0));
      return;
    }
    m = (s + (h << 3)) | 0;
    n = (s + (h << 3)) | 0;
    do {
      l = (A + ((aa(u, j) | 0) << 3)) | 0;
      d = (l + (h << 3)) | 0;
      i = +p[d >> 3] * +p[(((d & 7) | 0) == 0 ? m : n) >> 3] + 0.0;
      if (t) {
        c = 0;
        do {
          i = i + +p[(l + (c << 3)) >> 3] * +p[(s + (c << 3)) >> 3];
          c = (c + 1) | 0;
        } while ((c | 0) != (b | 0));
      }
      d = (e + ((aa(j, f) | 0) << 3)) | 0;
      p[d >> 3] = i * g + +p[d >> 3];
      j = (j + 1) | 0;
    } while ((j | 0) != (a | 0));
    return;
  }
  function Mf(a, b, c, d, e) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0;
    o = u;
    u = (u + 16) | 0;
    m = o;
    n = k[c >> 2] | 0;
    k[m >> 2] = 0;
    h = (m + 4) | 0;
    k[h >> 2] = 0;
    g = +p[(b + 16) >> 3];
    f = k[(b + 24) >> 2] | 0;
    c = k[(b + 28) >> 2] | 0;
    if (c) {
      Nf(m, c, 1);
      if ((k[h >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
      d = k[m >> 2] | 0;
      if ((c | 0) > 0) {
        e = 0;
        do {
          p[(d + (e << 3)) >> 3] = g * +p[(f + (e << 3)) >> 3];
          e = (e + 1) | 0;
        } while ((e | 0) != (c | 0));
      }
    } else d = 0;
    l = k[(a + 8) >> 2] | 0;
    a: do
      if ((l | 0) > 0) {
        i = k[a >> 2] | 0;
        j = k[(a + 48) >> 2] | 0;
        a = k[(a + 4) >> 2] | 0;
        f = k[h >> 2] | 0;
        h = (f | 0) > -1;
        b = k[m >> 2] | 0;
        f = (a | 0) == (f | 0);
        e = (a | 0) > 0;
        if ((a | 0) > -1) {
          if (h) q = 0;
          else Oa(11919, 12068, 74, 12145);
          while (1) {
            c = (i + ((aa(j, q) | 0) << 3)) | 0;
            if ((l | 0) <= (q | 0)) {
              d = 24;
              break;
            }
            g = +p[(n + (q << 3)) >> 3];
            if (!f) {
              d = 26;
              break;
            }
            if (e) {
              d = 0;
              do {
                m = (c + (d << 3)) | 0;
                p[m >> 3] = +p[m >> 3] - g * +p[(b + (d << 3)) >> 3];
                d = (d + 1) | 0;
              } while ((d | 0) != (a | 0));
            }
            q = (q + 1) | 0;
            if ((q | 0) >= (l | 0)) {
              s = b;
              break a;
            }
          }
          if ((d | 0) == 24) Oa(13577, 13744, 122, 13812);
          else if ((d | 0) == 26) Oa(14392, 12207, 710, 12285);
        }
        if (!h)
          if (!i) Oa(11919, 12068, 74, 12145);
          else Oa(13818, 13988, 175, 14058);
        else r = 0;
        while (1) {
          if ((i + ((aa(j, r) | 0) << 3)) | 0) {
            d = 23;
            break;
          }
          if ((l | 0) <= (r | 0)) {
            d = 24;
            break;
          }
          if (!f) {
            d = 26;
            break;
          }
          r = (r + 1) | 0;
          if ((r | 0) >= (l | 0)) {
            s = b;
            break a;
          }
        }
        if ((d | 0) == 23) Oa(13818, 13988, 175, 14058);
        else if ((d | 0) == 24) Oa(13577, 13744, 122, 13812);
        else if ((d | 0) == 26) Oa(14392, 12207, 710, 12285);
      } else s = d;
    while (0);
    if (!s) {
      u = o;
      return;
    }
    Pq(k[(s + -4) >> 2] | 0);
    u = o;
    return;
  }
  function Nf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    if (!(((b | 0) > -1) & ((c | 0) == 1))) Oa(12303, 12702, 285, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 536870911) {
          b = Kb(4) | 0;
          cF(b);
          Cc(b | 0, 2032, 79);
        }
        e = b << 3;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          b = Kb(4) | 0;
          cF(b);
          Cc(b | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Of(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0.0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (!(d & 1)) {
      d = c;
      e = +Vc[d & 7](a);
      return +e;
    } else {
      d = k[((k[a >> 2] | 0) + c) >> 2] | 0;
      e = +Vc[d & 7](a);
      return +e;
    }
    return 0.0;
  }
  function Pf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    k[a >> 2] = 0;
    h = (a + 4) | 0;
    k[h >> 2] = 0;
    i = (a + 8) | 0;
    k[i >> 2] = 0;
    e = (b + 4) | 0;
    c = k[e >> 2] | 0;
    f = (b + 8) | 0;
    d = k[f >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      m = Kb(4) | 0;
      cF(m);
      Cc(m | 0, 2032, 79);
    }
    mf(a, c, d);
    m = k[b >> 2] | 0;
    l = k[(b + 24) >> 2] | 0;
    j = k[e >> 2] | 0;
    g = k[f >> 2] | 0;
    if (!((k[h >> 2] | 0) == (j | 0) ? (k[i >> 2] | 0) == (g | 0) : 0)) {
      mf(a, j, g);
      if ((k[h >> 2] | 0) != (j | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[i >> 2] | 0) != (g | 0)) Oa(12160, 12207, 721, 12285);
    }
    b = k[a >> 2] | 0;
    if (((j | 0) > 0) & ((g | 0) > 0)) c = 0;
    else return;
    do {
      e = aa(c, j) | 0;
      f = aa(c, l) | 0;
      d = 0;
      do {
        p[(b + ((d + e) << 3)) >> 3] = +p[(m + ((d + f) << 3)) >> 3];
        d = (d + 1) | 0;
      } while ((d | 0) != (j | 0));
      c = (c + 1) | 0;
    } while ((c | 0) != (g | 0));
    return;
  }
  function Qf(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0;
    i = u;
    u = (u + 16) | 0;
    h = i;
    g = k[a >> 2] | 0;
    j = k[(a + 4) >> 2] | 0;
    a = (b + (j >> 1)) | 0;
    if (j & 1) g = k[((k[a >> 2] | 0) + g) >> 2] | 0;
    Tc[g & 15](h, a, c, d, e, f);
    a = sf(h) | 0;
    g = k[h >> 2] | 0;
    if (!g) {
      u = i;
      return a | 0;
    }
    Pq(k[(g + -4) >> 2] | 0);
    u = i;
    return a | 0;
  }
  function Rf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = +c;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    f = u;
    u = (u + 16) | 0;
    e = f;
    d = k[a >> 2] | 0;
    g = k[(a + 4) >> 2] | 0;
    a = (b + (g >> 1)) | 0;
    if (g & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    p[e >> 3] = c;
    Nc[d & 63](a, e);
    u = f;
    return;
  }
  function Sf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    d = k[a >> 2] | 0;
    e = k[(a + 4) >> 2] | 0;
    a = (b + (e >> 1)) | 0;
    if (!(e & 1)) {
      e = d;
      Nc[e & 63](a, c);
      return;
    } else {
      e = k[((k[a >> 2] | 0) + d) >> 2] | 0;
      Nc[e & 63](a, c);
      return;
    }
  }
  function Tf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0;
    k[a >> 2] = 0;
    h = (a + 4) | 0;
    k[h >> 2] = 0;
    i = (a + 8) | 0;
    k[i >> 2] = 0;
    e = (b + 8) | 0;
    c = k[e >> 2] | 0;
    f = (b + 12) | 0;
    d = k[f >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      j = Kb(4) | 0;
      cF(j);
      Cc(j | 0, 2032, 79);
    }
    mf(a, c, d);
    j = k[k[b >> 2] >> 2] | 0;
    g = +p[(b + 16) >> 3];
    d = k[e >> 2] | 0;
    c = k[f >> 2] | 0;
    if (!((k[h >> 2] | 0) == (d | 0) ? (k[i >> 2] | 0) == (c | 0) : 0)) {
      mf(a, d, c);
      if ((k[h >> 2] | 0) != (d | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[i >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
    }
    b = k[a >> 2] | 0;
    d = aa(c, d) | 0;
    if ((d | 0) > 0) c = 0;
    else return;
    do {
      p[(b + (c << 3)) >> 3] = g * +p[(j + (c << 3)) >> 3];
      c = (c + 1) | 0;
    } while ((c | 0) != (d | 0));
    return;
  }
  function Uf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = +c;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    g = u;
    u = (u + 32) | 0;
    f = (g + 8) | 0;
    e = g;
    d = k[a >> 2] | 0;
    h = k[(a + 4) >> 2] | 0;
    a = (b + (h >> 1)) | 0;
    if (h & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    p[e >> 3] = c;
    cd[d & 63](f, a, e);
    a = sf(f) | 0;
    d = k[f >> 2] | 0;
    if (!d) {
      u = g;
      return a | 0;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = g;
    return a | 0;
  }
  function Vf(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    d = k[((k[b >> 2] | 0) + 4) >> 2] | 0;
    i = (b + 4) | 0;
    c = k[((k[i >> 2] | 0) + 8) >> 2] | 0;
    if (!(((d | 0) == 0) | ((c | 0) == 0)) ? ((2147483647 / (c | 0)) | 0 | 0) < (d | 0) : 0) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    mf(a, d, c);
    c = k[b >> 2] | 0;
    d = k[(c + 4) >> 2] | 0;
    e = k[i >> 2] | 0;
    f = k[(e + 8) >> 2] | 0;
    if ((k[g >> 2] | 0) == (d | 0) ? (k[h >> 2] | 0) == (f | 0) : 0) {
      h = c;
      i = e;
      Wf(a, h, i);
      return;
    }
    mf(a, d, f);
    h = k[b >> 2] | 0;
    i = k[i >> 2] | 0;
    Wf(a, h, i);
    return;
  }
  function Wf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    i = u;
    u = (u + 16) | 0;
    h = i;
    e = (i + 8) | 0;
    f = k[(c + 4) >> 2] | 0;
    g = k[(a + 4) >> 2] | 0;
    d = k[(a + 8) >> 2] | 0;
    if (((f | 0) > 0) & (((g + f + d) | 0) < 20)) {
      k[h >> 2] = b;
      k[(h + 4) >> 2] = c;
      if ((k[(b + 8) >> 2] | 0) != (f | 0)) Oa(14710, 14850, 97, 14920);
      Yf(a, h, e);
      u = i;
      return;
    }
    if ((d | g | 0) <= -1) Oa(11919, 12068, 74, 12145);
    d = aa(d, g) | 0;
    if ((d | 0) > 0) iF(k[a >> 2] | 0, 0, (d << 3) | 0) | 0;
    p[h >> 3] = 1.0;
    Xf(a, b, c, h);
    u = i;
    return;
  }
  function Xf(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0.0,
      q = 0;
    n = u;
    u = (u + 32) | 0;
    m = n;
    i = (a + 4) | 0;
    j = k[i >> 2] | 0;
    l = (b + 4) | 0;
    if ((j | 0) != (k[l >> 2] | 0)) Oa(15296, 15349, 460, 15440);
    e = k[(a + 8) >> 2] | 0;
    f = (c + 8) | 0;
    if ((e | 0) != (k[f >> 2] | 0)) Oa(15296, 15349, 460, 15440);
    g = (b + 8) | 0;
    h = k[g >> 2] | 0;
    if (((e | 0) == 0) | (((j | 0) == 0) | ((h | 0) == 0))) {
      u = n;
      return;
    }
    o = +p[d >> 3];
    q = m;
    k[q >> 2] = 0;
    k[(q + 4) >> 2] = 0;
    q = (m + 8) | 0;
    k[q >> 2] = j;
    d = (m + 12) | 0;
    k[d >> 2] = e;
    j = (m + 16) | 0;
    k[j >> 2] = h;
    _f(j, q, d, 1);
    j = k[j >> 2] | 0;
    h = aa(j, k[q >> 2] | 0) | 0;
    k[(m + 20) >> 2] = h;
    j = aa(k[d >> 2] | 0, j) | 0;
    k[(m + 24) >> 2] = j;
    l = k[l >> 2] | 0;
    $f(l, k[f >> 2] | 0, k[g >> 2] | 0, k[b >> 2] | 0, l, k[c >> 2] | 0, k[(c + 4) >> 2] | 0, k[a >> 2] | 0, k[i >> 2] | 0, o, m, 0);
    a = k[m >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(m + 4) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    u = n;
    return;
  }
  function Yf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0.0;
    j = u;
    u = (u + 32) | 0;
    i = j;
    g = k[b >> 2] | 0;
    k[i >> 2] = g;
    e = k[(b + 4) >> 2] | 0;
    k[(i + 4) >> 2] = e;
    h = g;
    k[(i + 8) >> 2] = k[g >> 2];
    g = k[(h + 4) >> 2] | 0;
    k[(i + 12) >> 2] = g;
    k[(i + 16) >> 2] = k[e >> 2];
    k[(i + 20) >> 2] = k[(e + 4) >> 2];
    k[(i + 24) >> 2] = k[(h + 8) >> 2];
    e = k[(e + 8) >> 2] | 0;
    h = (a + 4) | 0;
    if ((k[h >> 2] | 0) == (g | 0) ? ((d = (a + 8) | 0), (k[d >> 2] | 0) == (e | 0)) : 0) l = d;
    else {
      mf(a, g, e);
      if ((k[h >> 2] | 0) != (g | 0)) Oa(12160, 12207, 721, 12285);
      c = (a + 8) | 0;
      if ((k[c >> 2] | 0) == (e | 0)) l = c;
      else Oa(12160, 12207, 721, 12285);
    }
    f = k[a >> 2] | 0;
    if ((e | 0) <= 0) {
      u = j;
      return;
    }
    a = 0;
    b = g;
    c = e;
    do {
      if ((b | 0) > 0) {
        d = aa(a, g) | 0;
        c = 0;
        do {
          m = +Zf(i, c, a);
          p[(f + ((c + d) << 3)) >> 3] = m;
          c = (c + 1) | 0;
          b = k[h >> 2] | 0;
        } while ((c | 0) < (b | 0));
        c = k[l >> 2] | 0;
      }
      a = (a + 1) | 0;
    } while ((a | 0) < (c | 0));
    u = j;
    return;
  }
  function Zf(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0.0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    e = k[a >> 2] | 0;
    g = ((k[e >> 2] | 0) + (b << 3)) | 0;
    h = k[(e + 8) >> 2] | 0;
    if (!(((g | 0) == 0) | ((h | 0) > -1))) Oa(13818, 13988, 175, 14058);
    if ((b | 0) <= -1) Oa(13577, 13744, 122, 13812);
    f = k[(e + 4) >> 2] | 0;
    if ((f | 0) <= (b | 0)) Oa(13577, 13744, 122, 13812);
    e = k[(a + 4) >> 2] | 0;
    a = k[(e + 4) >> 2] | 0;
    b = ((k[e >> 2] | 0) + ((aa(a, c) | 0) << 3)) | 0;
    if (!(((a | 0) > -1) | ((b | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((c | 0) <= -1) Oa(13577, 13744, 122, 13812);
    if ((k[(e + 8) >> 2] | 0) <= (c | 0)) Oa(13577, 13744, 122, 13812);
    if ((h | 0) != (a | 0)) Oa(14550, 14607, 110, 14683);
    if (!h) {
      d = 0.0;
      return +d;
    }
    if ((h | 0) <= 0) Oa(13148, 13216, 413, 13284);
    d = +p[g >> 3] * +p[b >> 3];
    if ((h | 0) == 1) return +d;
    else e = 1;
    do {
      c = (g + ((aa(e, f) | 0) << 3)) | 0;
      d = d + +p[c >> 3] * +p[(b + (e << 3)) >> 3];
      e = (e + 1) | 0;
    } while ((e | 0) < (h | 0));
    return +d;
  }
  function _f(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    if ((i[31304] | 0) == 0 ? aF(31304) | 0 : 0) {
      k[7994] = 16384;
      k[7995] = 524288;
      k[7996] = 524288;
    }
    m = k[7994] | 0;
    o = k[7995] | 0;
    n = k[7996] | 0;
    if ((d | 0) > 1) {
      f = (((m + -32) | 0) / 40) | 0;
      f = (f | 0) < 320 ? f : 320;
      e = k[a >> 2] | 0;
      if ((f | 0) < (e | 0)) {
        e = (f - ((f | 0) % 8 | 0)) | 0;
        k[a >> 2] = e;
      }
      e = ((((o - m) | 0) >>> 0) / ((e << 5) >>> 0)) | 0;
      f = k[c >> 2] | 0;
      h = (d + -1) | 0;
      g = (((h + f) | 0) / (d | 0)) | 0;
      if ((e | 0) > (g | 0)) {
        e = (g + 3) | 0;
        e = (e - ((e | 0) % 4 | 0)) | 0;
        e = (e | 0) < (f | 0) ? e : f;
      } else e = (e - ((e | 0) % 4 | 0)) | 0;
      k[c >> 2] = e;
      if ((n | 0) <= (o | 0)) return;
      f = ((((n - o) | 0) >>> 0) / ((aa(d << 3, k[a >> 2] | 0) | 0) >>> 0)) | 0;
      g = k[b >> 2] | 0;
      e = (((h + g) | 0) / (d | 0)) | 0;
      if (((f | 0) > 0) & ((f | 0) < (e | 0))) {
        k[b >> 2] = f;
        return;
      } else {
        k[b >> 2] = (e | 0) < (g | 0) ? e : g;
        return;
      }
    }
    e = k[b >> 2] | 0;
    f = k[c >> 2] | 0;
    j = (e | 0) < (f | 0) ? f : e;
    l = k[a >> 2] | 0;
    if ((((l | 0) < (j | 0) ? j : l) | 0) < 48) return;
    d = (m + -32) | 0;
    j = (((d | 0) / 40) | 0) & -8;
    j = (j | 0) > 1 ? j : 1;
    if ((l | 0) > (j | 0)) {
      e = (l | 0) % (j | 0) | 0;
      if (!e) e = j;
      else e = (j - (((((j + -1 - e) | 0) / ((((((l | 0) / (j | 0)) | 0) << 3) + 8) | 0)) | 0) << 3)) | 0;
      k[a >> 2] = e;
      a = k[b >> 2] | 0;
      g = e;
      h = k[c >> 2] | 0;
    } else {
      a = e;
      g = l;
      h = f;
    }
    d = (d - (aa(a << 3, g) | 0)) | 0;
    e = (d | 0) < ((g << 5) | 0);
    j = (((e ? 4718592 : d) >>> 0) / ((e ? j << 5 : g << 3) >>> 0)) | 0;
    e = (1572864 / ((g << 4) >>> 0)) | 0;
    e = ((j | 0) < (e | 0) ? j : e) & -4;
    if ((h | 0) > (e | 0)) {
      f = (h | 0) % (e | 0) | 0;
      if (f) e = (e - (((((e - f) | 0) / ((((((h | 0) / (e | 0)) | 0) << 2) + 4) | 0)) | 0) << 2)) | 0;
      k[c >> 2] = e;
      return;
    }
    if ((l | 0) != (g | 0)) return;
    e = aa(l << 3, h) | 0;
    if ((e | 0) < 1025) {
      f = a;
      e = m;
    } else {
      e = ((n | 0) != 0) & ((e | 0) < 32769);
      f = e ? ((a | 0) < 576 ? a : 576) : a;
      e = e ? o : 1572864;
    }
    e = ((e >>> 0) / (((l * 24) | 0) >>> 0)) | 0;
    e = (f | 0) < (e | 0) ? f : e;
    if (!e) return;
    f = (a | 0) % (e | 0) | 0;
    if (f) e = (e - ((((e - f) | 0) / (((((a | 0) / (e | 0)) | 0) + 1) | 0)) | 0)) | 0;
    k[b >> 2] = e;
    return;
  }
  function $f(a, b, c, d, e, f, g, h, i, j, l, m) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = +j;
    l = l | 0;
    m = m | 0;
    var n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0;
    N = u;
    u = (u + 16) | 0;
    I = (N + 10) | 0;
    J = (N + 9) | 0;
    K = (N + 8) | 0;
    L = N;
    M = k[(l + 16) >> 2] | 0;
    H = k[(l + 8) >> 2] | 0;
    q = (H | 0) < (a | 0);
    H = q ? H : a;
    r = k[(l + 12) >> 2] | 0;
    G = (r | 0) < (b | 0) ? r : b;
    m = aa(H, M) | 0;
    p = aa(G, M) | 0;
    if (m >>> 0 > 536870911) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    n = k[l >> 2] | 0;
    o = m << 3;
    if (!n)
      do
        if (o >>> 0 >= 131073) {
          m = Oq((o + 16) | 0) | 0;
          n = (m + 16) & -16;
          if (!m) {
            i = Kb(4) | 0;
            cF(i);
            Cc(i | 0, 2032, 79);
          }
          k[(n + -4) >> 2] = m;
          if (!n) {
            i = Kb(4) | 0;
            cF(i);
            Cc(i | 0, 2032, 79);
          } else {
            m = k[l >> 2] | 0;
            break;
          }
        } else {
          n = u;
          u = (u + ((((1 * ((o + 15) | 0)) | 0) + 15) & -16)) | 0;
          n = (n + 15) & -16;
          m = 0;
        }
      while (0);
    else m = n;
    F = (m | 0) == 0 ? n : 0;
    E = o >>> 0 > 131072;
    if (p >>> 0 > 536870911) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    l = (l + 4) | 0;
    o = k[l >> 2] | 0;
    p = p << 3;
    if (!o)
      do
        if (p >>> 0 >= 131073) {
          m = Oq((p + 16) | 0) | 0;
          o = (m + 16) & -16;
          if (!m) {
            i = Kb(4) | 0;
            cF(i);
            Cc(i | 0, 2032, 79);
          }
          k[(o + -4) >> 2] = m;
          if (!o) {
            i = Kb(4) | 0;
            cF(i);
            Cc(i | 0, 2032, 79);
          } else {
            m = k[l >> 2] | 0;
            break;
          }
        } else {
          o = u;
          u = (u + ((((1 * ((p + 15) | 0)) | 0) + 15) & -16)) | 0;
          o = (o + 15) & -16;
          m = 0;
        }
      while (0);
    else m = o;
    D = (m | 0) == 0 ? o : 0;
    z = p >>> 0 > 131072;
    if ((a | 0) > 0) {
      A = (c | 0) > 0;
      B = (L + 4) | 0;
      C = (b | 0) > 0;
      s = (((M | 0) == (c | 0)) & q & ((r | 0) >= (b | 0))) ^ 1;
      v = (L + 4) | 0;
      w = (L + 4) | 0;
      q = 0;
      do {
        r = q;
        q = (q + H) | 0;
        x = (((q | 0) > (a | 0) ? a : q) - r) | 0;
        if (A) {
          y = ((r | 0) == 0) | s;
          p = 0;
          do {
            l = p;
            p = (p + M) | 0;
            t = (((p | 0) > (c | 0) ? c : p) - l) | 0;
            m = (d + (((aa(l, e) | 0) + r) << 3)) | 0;
            k[L >> 2] = m;
            k[B >> 2] = e;
            ag(I, n, L, t, x, 0, 0);
            if (C)
              if (y) {
                m = 0;
                do {
                  P = m;
                  m = (m + G) | 0;
                  O = (((m | 0) > (b | 0) ? b : m) - P) | 0;
                  Q = (f + (((aa(P, g) | 0) + l) << 3)) | 0;
                  k[L >> 2] = Q;
                  k[v >> 2] = g;
                  bg(J, o, L, t, O, 0, 0);
                  P = (h + (((aa(P, i) | 0) + r) << 3)) | 0;
                  k[L >> 2] = P;
                  k[w >> 2] = i;
                  cg(K, L, n, o, x, t, O, j, -1, -1, 0, 0);
                } while ((m | 0) < (b | 0));
              } else {
                m = 0;
                do {
                  Q = m;
                  m = (m + G) | 0;
                  P = (h + (((aa(Q, i) | 0) + r) << 3)) | 0;
                  k[L >> 2] = P;
                  k[w >> 2] = i;
                  cg(K, L, n, o, x, t, (((m | 0) > (b | 0) ? b : m) - Q) | 0, j, -1, -1, 0, 0);
                } while ((m | 0) < (b | 0));
              }
          } while ((p | 0) < (c | 0));
        }
      } while ((q | 0) < (a | 0));
    }
    if (!(((D | 0) == 0) | (z ^ 1))) Pq(k[(D + -4) >> 2] | 0);
    if (((F | 0) == 0) | (E ^ 1)) {
      u = N;
      return;
    }
    Pq(k[(F + -4) >> 2] | 0);
    u = N;
    return;
  }
  function ag(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      i = 0,
      j = 0;
    if (g | f | 0) Oa(15454, 15545, 1705, 29764);
    if ((e | 0) <= 0) return;
    i = k[c >> 2] | 0;
    h = k[(c + 4) >> 2] | 0;
    if ((d | 0) > 0) {
      f = 0;
      g = 0;
    } else return;
    while (1) {
      a = 0;
      c = g;
      while (1) {
        j = (i + (((aa(h, a) | 0) + f) << 3)) | 0;
        p[(b + (c << 3)) >> 3] = +p[j >> 3];
        a = (a + 1) | 0;
        if ((a | 0) == (d | 0)) break;
        else c = (c + 1) | 0;
      }
      f = (f + 1) | 0;
      if ((f | 0) == (e | 0)) break;
      else g = (g + d) | 0;
    }
    return;
  }
  function bg(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0;
    if (g | f | 0) Oa(15454, 15545, 1906, 29764);
    i = (((e | 0) / 4) | 0) << 2;
    if ((e | 0) > 3 ? ((r = k[c >> 2] | 0), (s = k[(c + 4) >> 2] | 0), (d | 0) > 0) : 0) {
      j = d << 2;
      q = (i | 0) > 4 ? i : 4;
      f = 0;
      g = 0;
      while (1) {
        l = (r + ((aa(s, f) | 0) << 3)) | 0;
        m = (r + ((aa(s, f | 1) | 0) << 3)) | 0;
        n = (r + ((aa(s, f | 2) | 0) << 3)) | 0;
        o = (r + ((aa(s, f | 3) | 0) << 3)) | 0;
        a = 0;
        h = g;
        while (1) {
          p[(b + (h << 3)) >> 3] = +p[(l + (a << 3)) >> 3];
          p[(b + ((h | 1) << 3)) >> 3] = +p[(m + (a << 3)) >> 3];
          p[(b + ((h | 2) << 3)) >> 3] = +p[(n + (a << 3)) >> 3];
          p[(b + ((h | 3) << 3)) >> 3] = +p[(o + (a << 3)) >> 3];
          a = (a + 1) | 0;
          if ((a | 0) == (d | 0)) break;
          else h = (h + 4) | 0;
        }
        f = (f + 4) | 0;
        if ((f | 0) >= (i | 0)) break;
        else g = (j + g) | 0;
      }
      a = aa(q, d) | 0;
    } else a = 0;
    if ((i | 0) >= (e | 0)) return;
    l = k[c >> 2] | 0;
    j = k[(c + 4) >> 2] | 0;
    if ((d | 0) <= 0) return;
    while (1) {
      h = (l + ((aa(j, i) | 0) << 3)) | 0;
      f = 0;
      g = a;
      while (1) {
        p[(b + (g << 3)) >> 3] = +p[(h + (f << 3)) >> 3];
        f = (f + 1) | 0;
        if ((f | 0) == (d | 0)) break;
        else g = (g + 1) | 0;
      }
      i = (i + 1) | 0;
      if ((i | 0) == (e | 0)) break;
      else a = (a + d) | 0;
    }
    return;
  }
  function cg(a, b, c, d, e, f, g, h, i, j, l, m) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = +h;
    i = i | 0;
    j = j | 0;
    l = l | 0;
    m = m | 0;
    var n = 0.0,
      o = 0,
      q = 0,
      r = 0.0,
      s = 0.0,
      t = 0.0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0.0,
      P = 0.0,
      Q = 0.0,
      R = 0.0,
      S = 0.0,
      T = 0.0,
      U = 0.0,
      V = 0.0;
    N = (i | 0) == -1 ? f : i;
    C = (j | 0) == -1 ? f : j;
    a = ((g | 0) / 4) | 0;
    D = a << 2;
    E = f & -8;
    if ((e | 0) <= 0) return;
    F = (g | 0) > 3;
    G = (b + 4) | 0;
    H = m << 2;
    I = (E | 0) > 0;
    J = (E | 0) < (f | 0);
    K = (D | 0) < (g | 0);
    A = ((E + -1) | 0) >>> 3;
    M = (d + (((A << 5) + H + 32) << 3)) | 0;
    L = C << 2;
    A = A << 3;
    B = (d + ((((aa(C, a) | 0) << 2) + m + A + 8) << 3)) | 0;
    z = 0;
    A = (c + ((A + l + 8) << 3)) | 0;
    while (1) {
      if (F) {
        x = (c + (((aa(z, N) | 0) + l) << 3)) | 0;
        o = 0;
        y = M;
        while (1) {
          a = k[b >> 2] | 0;
          w = k[G >> 2] | 0;
          q = (a + (((aa(w, o) | 0) + z) << 3)) | 0;
          u = (a + (((aa(w, o | 1) | 0) + z) << 3)) | 0;
          v = (a + (((aa(w, o | 2) | 0) + z) << 3)) | 0;
          w = (a + (((aa(w, o | 3) | 0) + z) << 3)) | 0;
          a = (d + (((aa(o, C) | 0) + H) << 3)) | 0;
          if (I) {
            j = 0;
            i = x;
            t = 0.0;
            r = 0.0;
            n = 0.0;
            s = 0.0;
            while (1) {
              V = +p[i >> 3];
              U = +p[(i + 8) >> 3];
              T = +p[(i + 16) >> 3];
              S = +p[(i + 24) >> 3];
              R = +p[(i + 32) >> 3];
              Q = +p[(i + 40) >> 3];
              P = +p[(i + 48) >> 3];
              O = +p[(i + 56) >> 3];
              s =
                s +
                V * +p[a >> 3] +
                U * +p[(a + 32) >> 3] +
                T * +p[(a + 64) >> 3] +
                S * +p[(a + 96) >> 3] +
                R * +p[(a + 128) >> 3] +
                Q * +p[(a + 160) >> 3] +
                P * +p[(a + 192) >> 3] +
                O * +p[(a + 224) >> 3];
              t =
                t +
                V * +p[(a + 8) >> 3] +
                U * +p[(a + 40) >> 3] +
                T * +p[(a + 72) >> 3] +
                S * +p[(a + 104) >> 3] +
                R * +p[(a + 136) >> 3] +
                Q * +p[(a + 168) >> 3] +
                P * +p[(a + 200) >> 3] +
                O * +p[(a + 232) >> 3];
              r =
                r +
                V * +p[(a + 16) >> 3] +
                U * +p[(a + 48) >> 3] +
                T * +p[(a + 80) >> 3] +
                S * +p[(a + 112) >> 3] +
                R * +p[(a + 144) >> 3] +
                Q * +p[(a + 176) >> 3] +
                P * +p[(a + 208) >> 3] +
                O * +p[(a + 240) >> 3];
              n =
                n +
                V * +p[(a + 24) >> 3] +
                U * +p[(a + 56) >> 3] +
                T * +p[(a + 88) >> 3] +
                S * +p[(a + 120) >> 3] +
                R * +p[(a + 152) >> 3] +
                Q * +p[(a + 184) >> 3] +
                P * +p[(a + 216) >> 3] +
                O * +p[(a + 248) >> 3];
              j = (j + 8) | 0;
              if ((j | 0) >= (E | 0)) {
                a = y;
                i = A;
                break;
              } else {
                a = (a + 256) | 0;
                i = (i + 64) | 0;
              }
            }
          } else {
            s = 0.0;
            i = x;
            t = 0.0;
            r = 0.0;
            n = 0.0;
          }
          if (J) {
            j = E;
            while (1) {
              V = +p[i >> 3];
              s = s + V * +p[a >> 3];
              t = t + V * +p[(a + 8) >> 3];
              r = r + V * +p[(a + 16) >> 3];
              n = n + V * +p[(a + 24) >> 3];
              j = (j + 1) | 0;
              if ((j | 0) == (f | 0)) break;
              else {
                a = (a + 32) | 0;
                i = (i + 8) | 0;
              }
            }
          }
          V = t * h + +p[u >> 3];
          p[q >> 3] = s * h + +p[q >> 3];
          p[u >> 3] = V;
          V = n * h + +p[w >> 3];
          p[v >> 3] = r * h + +p[v >> 3];
          p[w >> 3] = V;
          o = (o + 4) | 0;
          if ((o | 0) >= (D | 0)) break;
          else y = (y + (L << 3)) | 0;
        }
      }
      a: do
        if (K) {
          w = (c + (((aa(z, N) | 0) + l) << 3)) | 0;
          if (I) {
            u = D;
            v = B;
          } else {
            o = D;
            while (1) {
              q = ((k[b >> 2] | 0) + (((aa(k[G >> 2] | 0, o) | 0) + z) << 3)) | 0;
              if (J) {
                a = E;
                i = w;
                n = 0.0;
                j = (d + (((aa(o, C) | 0) + m) << 3)) | 0;
                while (1) {
                  n = n + +p[i >> 3] * +p[j >> 3];
                  a = (a + 1) | 0;
                  if ((a | 0) == (f | 0)) break;
                  else {
                    i = (i + 8) | 0;
                    j = (j + 8) | 0;
                  }
                }
              } else n = 0.0;
              p[q >> 3] = n * h + +p[q >> 3];
              o = (o + 1) | 0;
              if ((o | 0) == (g | 0)) break a;
            }
          }
          while (1) {
            o = k[b >> 2] | 0;
            q = ((aa(k[G >> 2] | 0, u) | 0) + z) | 0;
            a = 0;
            i = (d + (((aa(u, C) | 0) + m) << 3)) | 0;
            j = w;
            n = 0.0;
            while (1) {
              n =
                n +
                +p[j >> 3] * +p[i >> 3] +
                +p[(j + 8) >> 3] * +p[(i + 8) >> 3] +
                +p[(j + 16) >> 3] * +p[(i + 16) >> 3] +
                +p[(j + 24) >> 3] * +p[(i + 24) >> 3] +
                +p[(j + 32) >> 3] * +p[(i + 32) >> 3] +
                +p[(j + 40) >> 3] * +p[(i + 40) >> 3] +
                +p[(j + 48) >> 3] * +p[(i + 48) >> 3] +
                +p[(j + 56) >> 3] * +p[(i + 56) >> 3];
              a = (a + 8) | 0;
              if ((a | 0) >= (E | 0)) break;
              else {
                i = (i + 64) | 0;
                j = (j + 64) | 0;
              }
            }
            o = (o + (q << 3)) | 0;
            if (J) {
              i = E;
              j = A;
              a = v;
              while (1) {
                n = n + +p[j >> 3] * +p[a >> 3];
                i = (i + 1) | 0;
                if ((i | 0) == (f | 0)) break;
                else {
                  j = (j + 8) | 0;
                  a = (a + 8) | 0;
                }
              }
            }
            p[o >> 3] = n * h + +p[o >> 3];
            u = (u + 1) | 0;
            if ((u | 0) == (g | 0)) break;
            else v = (v + (C << 3)) | 0;
          }
        }
      while (0);
      z = (z + 1) | 0;
      if ((z | 0) == (e | 0)) break;
      else A = (A + (N << 3)) | 0;
    }
    return;
  }
  function dg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    f = u;
    u = (u + 16) | 0;
    e = f;
    d = k[a >> 2] | 0;
    g = k[(a + 4) >> 2] | 0;
    a = (b + (g >> 1)) | 0;
    if (g & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    cd[d & 63](e, a, c);
    a = sf(e) | 0;
    d = k[e >> 2] | 0;
    if (!d) {
      u = f;
      return a | 0;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = f;
    return a | 0;
  }
  function eg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    c = k[(d + 4) >> 2] | 0;
    d = k[(d + 8) >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    mf(a, c, d);
    f = k[k[b >> 2] >> 2] | 0;
    c = k[e >> 2] | 0;
    e = k[c >> 2] | 0;
    b = k[(c + 4) >> 2] | 0;
    c = k[(c + 8) >> 2] | 0;
    if (!((k[g >> 2] | 0) == (b | 0) ? (k[h >> 2] | 0) == (c | 0) : 0)) {
      mf(a, b, c);
      if ((k[g >> 2] | 0) != (b | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[h >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
    }
    d = k[a >> 2] | 0;
    c = aa(c, b) | 0;
    if ((c | 0) > 0) b = 0;
    else return;
    do {
      p[(d + (b << 3)) >> 3] = +p[(f + (b << 3)) >> 3] + +p[(e + (b << 3)) >> 3];
      b = (b + 1) | 0;
    } while ((b | 0) != (c | 0));
    return;
  }
  function fg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    e = (b + 4) | 0;
    d = k[e >> 2] | 0;
    c = k[(d + 4) >> 2] | 0;
    d = k[(d + 8) >> 2] | 0;
    if (!(((c | 0) == 0) | ((d | 0) == 0)) ? ((2147483647 / (d | 0)) | 0 | 0) < (c | 0) : 0) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    mf(a, c, d);
    f = k[k[b >> 2] >> 2] | 0;
    c = k[e >> 2] | 0;
    e = k[c >> 2] | 0;
    b = k[(c + 4) >> 2] | 0;
    c = k[(c + 8) >> 2] | 0;
    if (!((k[g >> 2] | 0) == (b | 0) ? (k[h >> 2] | 0) == (c | 0) : 0)) {
      mf(a, b, c);
      if ((k[g >> 2] | 0) != (b | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[h >> 2] | 0) != (c | 0)) Oa(12160, 12207, 721, 12285);
    }
    d = k[a >> 2] | 0;
    c = aa(c, b) | 0;
    if ((c | 0) > 0) b = 0;
    else return;
    do {
      p[(d + (b << 3)) >> 3] = +p[(f + (b << 3)) >> 3] - +p[(e + (b << 3)) >> 3];
      b = (b + 1) | 0;
    } while ((b | 0) != (c | 0));
    return;
  }
  function gg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    c = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    a = (b + (f >> 1)) | 0;
    if (f & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    Nc[c & 63](d, a);
    a = sf(d) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
      u = e;
      return a | 0;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = e;
    return a | 0;
  }
  function hg(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    a = (b + (f >> 1)) | 0;
    if (f & 1) e = k[((k[a >> 2] | 0) + e) >> 2] | 0;
    return +(+Zc[e & 3](a, c, d));
  }
  function ig(a, b, c, d, e) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = +e;
    var f = 0,
      g = 0,
      h = 0,
      i = 0;
    h = u;
    u = (u + 16) | 0;
    g = h;
    f = k[a >> 2] | 0;
    i = k[(a + 4) >> 2] | 0;
    a = (b + (i >> 1)) | 0;
    if (i & 1) f = k[((k[a >> 2] | 0) + f) >> 2] | 0;
    p[g >> 3] = e;
    gd[f & 15](a, c, d, g);
    u = h;
    return;
  }
  function jg(a) {
    a = a | 0;
    return 48;
  }
  function kg(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0;
    if (!a) return;
    b = k[a >> 2] | 0;
    if (b | 0) {
      c = (a + 4) | 0;
      d = k[c >> 2] | 0;
      if ((d | 0) != (b | 0)) k[c >> 2] = d + (~(((d + -16 - b) | 0) >>> 4) << 4);
      EA(b);
    }
    EA(a);
    return;
  }
  function lg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    c = CA(24) | 0;
    a = k[a >> 2] | 0;
    b = k[b >> 2] | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = a;
    k[(c + 16) >> 2] = b;
    k[(c + 20) >> 2] = a;
    ng(c, a);
    return c | 0;
  }
  function mg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    d = u;
    u = (u + 16) | 0;
    f = (d + 4) | 0;
    e = d;
    k[f >> 2] = b;
    k[e >> 2] = c;
    c = Yc[a & 63](f, e) | 0;
    u = d;
    return c | 0;
  }
  function ng(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    f = (a + 8) | 0;
    h = k[a >> 2] | 0;
    if ((((k[f >> 2] | 0) - h) >> 4) >>> 0 >= b >>> 0) return;
    i = (a + 4) | 0;
    if (b >>> 0 > 268435455) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    c = ((k[i >> 2] | 0) - h) | 0;
    g = c >> 4;
    d = CA(b << 4) | 0;
    e = (d + (g << 4)) | 0;
    g = (e + ((0 - g) << 4)) | 0;
    if ((c | 0) > 0) nF(g | 0, h | 0, c | 0) | 0;
    k[a >> 2] = g;
    k[i >> 2] = e;
    k[f >> 2] = d + (b << 4);
    if (!h) return;
    EA(h);
    return;
  }
  function og(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    j = (a + 4) | 0;
    d = k[j >> 2] | 0;
    c = k[a >> 2] | 0;
    e = (((d - c) >> 4) + 1) | 0;
    if (e >>> 0 > 268435455) {
      Sy(a);
      c = k[a >> 2] | 0;
      d = k[j >> 2] | 0;
    }
    i = (a + 8) | 0;
    h = ((k[i >> 2] | 0) - c) | 0;
    g = h >> 3;
    g = (h >> 4) >>> 0 < 134217727 ? (g >>> 0 < e >>> 0 ? e : g) : 268435455;
    e = (d - c) >> 4;
    do
      if (g)
        if (g >>> 0 > 268435455) {
          j = Kb(4) | 0;
          cF(j);
          Cc(j | 0, 2032, 79);
        } else {
          h = CA(g << 4) | 0;
          break;
        }
      else h = 0;
    while (0);
    f = (h + (e << 4)) | 0;
    k[f >> 2] = k[b >> 2];
    k[(f + 4) >> 2] = k[(b + 4) >> 2];
    k[(f + 8) >> 2] = k[(b + 8) >> 2];
    k[(f + 12) >> 2] = k[(b + 12) >> 2];
    d = (d - c) | 0;
    e = (f + ((0 - (d >> 4)) << 4)) | 0;
    if ((d | 0) > 0) nF(e | 0, c | 0, d | 0) | 0;
    k[a >> 2] = e;
    k[j >> 2] = f + 16;
    k[i >> 2] = h + (g << 4);
    if (!c) return;
    EA(c);
    return;
  }
  function pg(a, b, c, d, e) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = +e;
    var f = 0,
      g = 0,
      h = 0,
      i = 0;
    h = u;
    u = (u + 16) | 0;
    g = h;
    f = k[a >> 2] | 0;
    i = k[(a + 4) >> 2] | 0;
    a = (b + (i >> 1)) | 0;
    if (i & 1) f = k[((k[a >> 2] | 0) + f) >> 2] | 0;
    p[g >> 3] = e;
    gd[f & 15](a, c, d, g);
    u = h;
    return;
  }
  function qg(a) {
    a = a | 0;
    return 88;
  }
  function rg(a) {
    a = a | 0;
    var b = 0;
    if (!a) return;
    Pq(k[(a + 676) >> 2] | 0);
    Pq(k[(a + 680) >> 2] | 0);
    b = k[(a + 684) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 688) >> 2] | 0;
    if (b | 0) FA(b);
    sg((a + 456) | 0);
    tg((a + 136) | 0);
    vg((a + 8) | 0);
    EA(a);
    return;
  }
  function sg(a) {
    a = a | 0;
    var b = 0;
    b = k[(a + 184) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 176) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 152) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 144) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 136) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 128) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    Pq(k[(a + 104) >> 2] | 0);
    Pq(k[(a + 108) >> 2] | 0);
    b = k[(a + 112) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 116) >> 2] | 0;
    if (b | 0) FA(b);
    Pq(k[(a + 68) >> 2] | 0);
    Pq(k[(a + 72) >> 2] | 0);
    b = k[(a + 76) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 80) >> 2] | 0;
    if (b | 0) FA(b);
    Pq(k[(a + 32) >> 2] | 0);
    Pq(k[(a + 36) >> 2] | 0);
    b = k[(a + 40) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 44) >> 2] | 0;
    if (!b) {
      a = (a + 8) | 0;
      NA(a);
      return;
    }
    FA(b);
    a = (a + 8) | 0;
    NA(a);
    return;
  }
  function tg(a) {
    a = a | 0;
    var b = 0;
    ug((a + 156) | 0);
    b = k[(a + 148) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 140) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 132) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    Pq(k[(a + 36) >> 2] | 0);
    Pq(k[(a + 40) >> 2] | 0);
    b = k[(a + 44) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 48) >> 2] | 0;
    if (!b) {
      a = (a + 12) | 0;
      NA(a);
      return;
    }
    FA(b);
    a = (a + 12) | 0;
    NA(a);
    return;
  }
  function ug(a) {
    a = a | 0;
    var b = 0;
    b = k[(a + 72) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 64) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 56) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 40) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 32) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 24) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 16) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 8) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[a >> 2] | 0;
    if (!b) return;
    Pq(k[(b + -4) >> 2] | 0);
    return;
  }
  function vg(a) {
    a = a | 0;
    var b = 0;
    b = k[(a + 80) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 72) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 64) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 56) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[(a + 48) >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    Pq(k[(a + 24) >> 2] | 0);
    Pq(k[(a + 28) >> 2] | 0);
    b = k[(a + 32) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(a + 36) >> 2] | 0;
    if (!b) return;
    FA(b);
    return;
  }
  function wg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    c = CA(704) | 0;
    yg(c, k[a >> 2] | 0, k[b >> 2] | 0);
    return c | 0;
  }
  function xg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    d = u;
    u = (u + 16) | 0;
    f = (d + 4) | 0;
    e = d;
    k[f >> 2] = b;
    k[e >> 2] = c;
    c = Yc[a & 63](f, e) | 0;
    u = d;
    return c | 0;
  }
  function yg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    h = u;
    u = (u + 48) | 0;
    f = h;
    zg(a, a);
    d = (a + 664) | 0;
    i[d >> 0] = 0;
    g = (a + 668) | 0;
    k[g >> 2] = -1;
    e = (a + 672) | 0;
    k[e >> 2] = 0;
    k[(e + 4) >> 2] = 0;
    k[(e + 8) >> 2] = 0;
    k[(e + 12) >> 2] = 0;
    k[(e + 16) >> 2] = 0;
    k[(e + 20) >> 2] = 0;
    k[(e + 24) >> 2] = 0;
    Dg(d, 0, 0);
    i[f >> 0] = 0;
    e = (f + 4) | 0;
    k[e >> 2] = 0;
    k[(e + 4) >> 2] = 0;
    k[(e + 8) >> 2] = 0;
    k[(e + 12) >> 2] = 0;
    k[(e + 16) >> 2] = 0;
    k[(e + 20) >> 2] = 0;
    k[(e + 24) >> 2] = 0;
    k[(e + 28) >> 2] = 0;
    k[(f + 8) >> 2] = b;
    k[(f + 28) >> 2] = 0;
    b = Oq(((c << 2) + 4) | 0) | 0;
    k[(f + 12) >> 2] = b;
    if (!b) {
      h = Kb(4) | 0;
      cF(h);
      Cc(h | 0, 2032, 79);
    }
    k[e >> 2] = c;
    iF(b | 0, 0, ((c << 2) + 4) | 0) | 0;
    Ag(d, f) | 0;
    Pq(k[(f + 12) >> 2] | 0);
    Pq(k[(f + 16) >> 2] | 0);
    b = k[(f + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(f + 24) >> 2] | 0;
    if (b | 0) FA(b);
    k[(a + 692) >> 2] = 0;
    iF(k[(a + 676) >> 2] | 0, 0, ((k[g >> 2] << 2) + 4) | 0) | 0;
    b = k[(a + 680) >> 2] | 0;
    if (!b) {
      u = h;
      return;
    }
    iF(b | 0, 0, (k[g >> 2] << 2) | 0) | 0;
    u = h;
    return;
  }
  function zg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    k[a >> 2] = b;
    i[(a + 8) >> 0] = 0;
    k[(a + 12) >> 2] = 0;
    c = (a + 20) | 0;
    i[c >> 0] = 0;
    k[(a + 24) >> 2] = -1;
    d = (a + 28) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    k[(d + 12) >> 2] = 0;
    k[(d + 16) >> 2] = 0;
    k[(d + 20) >> 2] = 0;
    k[(d + 24) >> 2] = 0;
    Dg(c, 0, 0);
    c = (a + 104) | 0;
    d = (a + 56) | 0;
    e = (d + 48) | 0;
    do {
      k[d >> 2] = 0;
      d = (d + 4) | 0;
    } while ((d | 0) < (e | 0));
    p[c >> 3] = 1.0;
    i[(a + 112) >> 0] = 1;
    i[(a + 120) >> 0] = 0;
    i[(a + 121) >> 0] = 0;
    k[(a + 128) >> 2] = b;
    Bg((a + 136) | 0);
    i[(a + 440) >> 0] = 0;
    i[(a + 441) >> 0] = 0;
    k[(a + 448) >> 2] = b;
    Cg((a + 456) | 0);
    i[(a + 656) >> 0] = 0;
    i[(a + 657) >> 0] = 0;
    return;
  }
  function Ag(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0;
    if (i[b >> 0] | 0) {
      c = (a + 12) | 0;
      d = (b + 12) | 0;
      e = k[c >> 2] | 0;
      k[c >> 2] = k[d >> 2];
      k[d >> 2] = e;
      d = (a + 8) | 0;
      e = (b + 8) | 0;
      c = k[d >> 2] | 0;
      k[d >> 2] = k[e >> 2];
      k[e >> 2] = c;
      e = (a + 4) | 0;
      c = (b + 4) | 0;
      d = k[e >> 2] | 0;
      k[e >> 2] = k[c >> 2];
      k[c >> 2] = d;
      c = (a + 16) | 0;
      d = (b + 16) | 0;
      e = k[c >> 2] | 0;
      k[c >> 2] = k[d >> 2];
      k[d >> 2] = e;
      d = (a + 20) | 0;
      e = (b + 20) | 0;
      c = k[d >> 2] | 0;
      k[d >> 2] = k[e >> 2];
      k[e >> 2] = c;
      e = (a + 24) | 0;
      c = (b + 24) | 0;
      d = k[e >> 2] | 0;
      k[e >> 2] = k[c >> 2];
      k[c >> 2] = d;
      c = (a + 28) | 0;
      d = (b + 28) | 0;
      e = k[c >> 2] | 0;
      k[c >> 2] = k[d >> 2];
      k[d >> 2] = e;
      d = (a + 32) | 0;
      b = (b + 32) | 0;
      e = k[d >> 2] | 0;
      k[d >> 2] = k[b >> 2];
      k[b >> 2] = e;
      return a | 0;
    }
    if ((a | 0) == (b | 0)) return a | 0;
    Dg(a, k[(b + 8) >> 2] | 0, k[(b + 4) >> 2] | 0);
    c = (a + 16) | 0;
    d = k[c >> 2] | 0;
    if (d | 0) {
      Pq(d);
      k[c >> 2] = 0;
    }
    if (k[(b + 16) >> 2] | 0) {
      Fg(a, b);
      return a | 0;
    }
    c = k[(b + 12) >> 2] | 0;
    d = (c + (k[(a + 4) >> 2] << 2) + 4 - c) | 0;
    if (d | 0) nF(k[(a + 12) >> 2] | 0, c | 0, d | 0) | 0;
    c = (a + 20) | 0;
    e = (b + 28) | 0;
    Eg(c, k[e >> 2] | 0, 0.0);
    if ((k[e >> 2] | 0) <= 0) return a | 0;
    d = (a + 28) | 0;
    e = k[d >> 2] | 0;
    if (!e) return a | 0;
    nF(k[c >> 2] | 0, k[(b + 20) >> 2] | 0, (e << 3) | 0) | 0;
    c = k[d >> 2] | 0;
    if (!c) return a | 0;
    nF(k[(a + 24) >> 2] | 0, k[(b + 24) >> 2] | 0, (c << 2) | 0) | 0;
    return a | 0;
  }
  function Bg(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0;
    i[a >> 0] = 0;
    b = (a + 12) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    KA(b, 35588, 0);
    b = (a + 24) | 0;
    i[b >> 0] = 0;
    k[(a + 28) >> 2] = -1;
    c = (a + 32) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    Dg(b, 0, 0);
    i[(a + 96) >> 0] = 0;
    b = (a + 212) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    i[(a + 248) >> 0] = 0;
    b = (a + 280) | 0;
    c = (a + 100) | 0;
    d = (c + 104) | 0;
    do {
      k[c >> 2] = 0;
      c = (c + 4) | 0;
    } while ((c | 0) < (d | 0));
    p[b >> 3] = 1.0;
    k[(a + 296) >> 2] = 1;
    k[(a + 252) >> 2] = 16;
    k[(a + 256) >> 2] = 1;
    k[(a + 260) >> 2] = 128;
    k[(a + 264) >> 2] = 16;
    k[(a + 268) >> 2] = 8;
    k[(a + 272) >> 2] = 20;
    return;
  }
  function Cg(a) {
    a = a | 0;
    var b = 0,
      c = 0;
    i[a >> 0] = 0;
    i[(a + 1) >> 0] = 0;
    b = (a + 8) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    KA(b, 35588, 0);
    b = (a + 20) | 0;
    i[b >> 0] = 0;
    k[(a + 24) >> 2] = -1;
    c = (a + 28) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    Dg(b, 0, 0);
    b = (a + 56) | 0;
    i[b >> 0] = 0;
    k[(a + 60) >> 2] = -1;
    c = (a + 64) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    Dg(b, 0, 0);
    b = (a + 92) | 0;
    i[b >> 0] = 0;
    k[(a + 96) >> 2] = -1;
    c = (a + 100) | 0;
    k[c >> 2] = 0;
    k[(c + 4) >> 2] = 0;
    k[(c + 8) >> 2] = 0;
    k[(c + 12) >> 2] = 0;
    k[(c + 16) >> 2] = 0;
    k[(c + 20) >> 2] = 0;
    k[(c + 24) >> 2] = 0;
    Dg(b, 0, 0);
    b = (a + 128) | 0;
    k[b >> 2] = 0;
    k[(b + 4) >> 2] = 0;
    k[(b + 8) >> 2] = 0;
    k[(b + 12) >> 2] = 0;
    k[(b + 16) >> 2] = 0;
    k[(b + 20) >> 2] = 0;
    k[(b + 24) >> 2] = 0;
    k[(b + 28) >> 2] = 0;
    i[(a + 168) >> 0] = 1;
    a = (a + 176) | 0;
    k[a >> 2] = 0;
    k[(a + 4) >> 2] = 0;
    k[(a + 8) >> 2] = 0;
    k[(a + 12) >> 2] = 0;
    j[(a + 16) >> 1] = 0;
    return;
  }
  function Dg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    k[(a + 8) >> 2] = b;
    k[(a + 28) >> 2] = 0;
    e = (a + 4) | 0;
    d = k[e >> 2] | 0;
    do
      if (((d | 0) != (c | 0)) | ((d | 0) == 0)) {
        b = (a + 12) | 0;
        Pq(k[b >> 2] | 0);
        d = Oq(((c << 2) + 4) | 0) | 0;
        k[b >> 2] = d;
        if (!d) {
          c = Kb(4) | 0;
          cF(c);
          Cc(c | 0, 2032, 79);
        } else {
          k[e >> 2] = c;
          break;
        }
      }
    while (0);
    b = (a + 16) | 0;
    d = k[b >> 2] | 0;
    if (!d) {
      a = (a + 12) | 0;
      a = k[a >> 2] | 0;
      c = c << 2;
      c = (c + 4) | 0;
      iF(a | 0, 0, c | 0) | 0;
      return;
    }
    Pq(d);
    k[b >> 2] = 0;
    c = k[e >> 2] | 0;
    a = (a + 12) | 0;
    a = k[a >> 2] | 0;
    c = c << 2;
    c = (c + 4) | 0;
    iF(a | 0, 0, c | 0) | 0;
    return;
  }
  function Eg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = +c;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0;
    n = (a + 12) | 0;
    if ((k[n >> 2] | 0) >= (b | 0)) {
      n = (a + 8) | 0;
      k[n >> 2] = b;
      return;
    }
    l = ~~(+(b | 0) * c);
    m = (l + b) | 0;
    if ((l | 0) < 0) {
      n = Kb(4) | 0;
      cF(n);
      Cc(n | 0, 2032, 79);
    }
    i = DA(m >>> 0 > 536870911 ? -1 : m << 3) | 0;
    j = DA(m >>> 0 > 1073741823 ? -1 : m << 2) | 0;
    l = (a + 8) | 0;
    d = k[l >> 2] | 0;
    d = (d | 0) < (m | 0) ? d : m;
    if ((d | 0) > 0) {
      h = k[a >> 2] | 0;
      nF(i | 0, h | 0, (d << 3) | 0) | 0;
      e = (a + 4) | 0;
      f = k[e >> 2] | 0;
      nF(j | 0, f | 0, (d << 2) | 0) | 0;
      d = e;
      e = f;
      g = h;
    } else {
      h = k[a >> 2] | 0;
      d = (a + 4) | 0;
      f = k[d >> 2] | 0;
      e = f;
      g = h;
    }
    k[a >> 2] = i;
    k[d >> 2] = j;
    k[n >> 2] = m;
    if (e | 0) FA(f);
    if (!g) {
      n = l;
      k[n >> 2] = b;
      return;
    }
    FA(h);
    n = l;
    k[n >> 2] = b;
    return;
  }
  function Fg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0;
    E = u;
    u = (u + 48) | 0;
    C = E;
    e = (b + 4) | 0;
    D = k[e >> 2] | 0;
    if (i[b >> 0] | 0) {
      d = (b + 8) | 0;
      Dg(a, k[d >> 2] | 0, D);
      w = (a + 28) | 0;
      k[w >> 2] = 0;
      x = (a + 12) | 0;
      y = (a + 4) | 0;
      iF(k[x >> 2] | 0, 0, ((k[y >> 2] << 2) + 4) | 0) | 0;
      c = k[(a + 16) >> 2] | 0;
      if (c | 0) iF(c | 0, 0, (k[y >> 2] << 2) | 0) | 0;
      C = k[d >> 2] | 0;
      B = k[e >> 2] | 0;
      Gg(a, ((C | 0) < (B | 0) ? B : C) << 1);
      a: do
        if ((D | 0) > 0) {
          s = (b + 20) | 0;
          t = (b + 24) | 0;
          v = (b + 12) | 0;
          q = (b + 16) | 0;
          r = (a + 20) | 0;
          o = (a + 24) | 0;
          m = 0;
          b: while (1) {
            e = k[x >> 2] | 0;
            f = k[(e + (m << 2)) >> 2] | 0;
            if ((f | 0) != (k[w >> 2] | 0)) {
              c = 15;
              break;
            }
            n = m;
            m = (m + 1) | 0;
            c = (e + (m << 2)) | 0;
            if (k[c >> 2] | 0) {
              c = 17;
              break;
            }
            k[c >> 2] = f;
            j = k[s >> 2] | 0;
            l = k[t >> 2] | 0;
            c = k[v >> 2] | 0;
            b = k[(c + (n << 2)) >> 2] | 0;
            d = k[q >> 2] | 0;
            if (!d) h = k[(c + (m << 2)) >> 2] | 0;
            else h = ((k[(d + (n << 2)) >> 2] | 0) + b) | 0;
            c: do
              if ((b | 0) < (h | 0)) {
                if ((f | 0) != (k[w >> 2] | 0)) {
                  c = 23;
                  break b;
                }
                while (1) {
                  g = +p[(j + (b << 3)) >> 3];
                  c = k[(l + (b << 2)) >> 2] | 0;
                  d = (e + (m << 2)) | 0;
                  if ((f | 0) != (k[(e + (n << 2)) >> 2] | 0) ? (k[((k[o >> 2] | 0) + ((f + -1) << 2)) >> 2] | 0) >= (c | 0) : 0) {
                    c = 26;
                    break b;
                  }
                  k[d >> 2] = f + 1;
                  B = k[w >> 2] | 0;
                  Eg(r, (B + 1) | 0, 1.0);
                  C = k[r >> 2] | 0;
                  p[(C + (B << 3)) >> 3] = 0.0;
                  k[((k[o >> 2] | 0) + (B << 2)) >> 2] = c;
                  p[(C + (f << 3)) >> 3] = g;
                  b = (b + 1) | 0;
                  if ((b | 0) >= (h | 0)) break c;
                  e = k[x >> 2] | 0;
                  f = k[(e + (m << 2)) >> 2] | 0;
                  if ((f | 0) != (k[w >> 2] | 0)) {
                    c = 23;
                    break b;
                  }
                }
              }
            while (0);
            if ((m | 0) >= (D | 0)) break a;
          }
          if ((c | 0) == 15) Oa(16047, 15958, 414, 16152);
          else if ((c | 0) == 17) Oa(16161, 15958, 415, 16152);
          else if ((c | 0) == 23) Oa(16249, 15958, 392, 16348);
          else if ((c | 0) == 26) Oa(16371, 15958, 393, 16348);
        }
      while (0);
      if (k[(a + 16) >> 2] | 0) {
        u = E;
        return;
      }
      f = k[w >> 2] | 0;
      e = k[y >> 2] | 0;
      if ((e | 0) <= -1) {
        u = E;
        return;
      }
      b = k[x >> 2] | 0;
      c = e;
      while (1) {
        if (k[(b + (c << 2)) >> 2] | 0) break;
        d = (c + -1) | 0;
        if ((c | 0) > 0) c = d;
        else {
          c = d;
          break;
        }
      }
      if ((c | 0) >= (e | 0)) {
        u = E;
        return;
      }
      do {
        c = (c + 1) | 0;
        k[(b + (c << 2)) >> 2] = f;
      } while ((c | 0) < (k[y >> 2] | 0));
      u = E;
      return;
    }
    c = (b + 8) | 0;
    w = k[c >> 2] | 0;
    i[C >> 0] = 0;
    B = (C + 4) | 0;
    k[B >> 2] = 0;
    k[(B + 4) >> 2] = 0;
    k[(B + 8) >> 2] = 0;
    k[(B + 12) >> 2] = 0;
    k[(B + 16) >> 2] = 0;
    k[(B + 20) >> 2] = 0;
    k[(B + 24) >> 2] = 0;
    k[(B + 28) >> 2] = 0;
    k[(C + 8) >> 2] = w;
    w = (C + 28) | 0;
    k[w >> 2] = 0;
    d = Oq(((D << 2) + 4) | 0) | 0;
    k[(C + 12) >> 2] = d;
    if (!d) {
      E = Kb(4) | 0;
      cF(E);
      Cc(E | 0, 2032, 79);
    }
    k[B >> 2] = D;
    z = (C + 16) | 0;
    v = k[c >> 2] | 0;
    t = k[e >> 2] | 0;
    x = (C + 12) | 0;
    iF(d | 0, 0, ((D << 2) + 4) | 0) | 0;
    Gg(C, ((v | 0) < (t | 0) ? t : v) << 1);
    d: do
      if ((D | 0) > 0) {
        s = (b + 20) | 0;
        t = (b + 24) | 0;
        v = (b + 12) | 0;
        q = (b + 16) | 0;
        r = (C + 20) | 0;
        o = (C + 24) | 0;
        m = 0;
        e: while (1) {
          e = k[x >> 2] | 0;
          f = k[(e + (m << 2)) >> 2] | 0;
          if ((f | 0) != (k[w >> 2] | 0)) {
            c = 42;
            break;
          }
          n = m;
          m = (m + 1) | 0;
          c = (e + (m << 2)) | 0;
          if (k[c >> 2] | 0) {
            c = 44;
            break;
          }
          k[c >> 2] = f;
          j = k[s >> 2] | 0;
          l = k[t >> 2] | 0;
          c = k[v >> 2] | 0;
          b = k[(c + (n << 2)) >> 2] | 0;
          d = k[q >> 2] | 0;
          if (!d) h = k[(c + (m << 2)) >> 2] | 0;
          else h = ((k[(d + (n << 2)) >> 2] | 0) + b) | 0;
          f: do
            if ((b | 0) < (h | 0)) {
              if ((f | 0) != (k[w >> 2] | 0)) {
                c = 50;
                break e;
              }
              while (1) {
                g = +p[(j + (b << 3)) >> 3];
                c = k[(l + (b << 2)) >> 2] | 0;
                d = (e + (m << 2)) | 0;
                if ((f | 0) != (k[(e + (n << 2)) >> 2] | 0) ? (k[((k[o >> 2] | 0) + ((f + -1) << 2)) >> 2] | 0) >= (c | 0) : 0) {
                  c = 53;
                  break e;
                }
                k[d >> 2] = f + 1;
                d = k[w >> 2] | 0;
                Eg(r, (d + 1) | 0, 1.0);
                e = k[r >> 2] | 0;
                p[(e + (d << 3)) >> 3] = 0.0;
                k[((k[o >> 2] | 0) + (d << 2)) >> 2] = c;
                p[(e + (f << 3)) >> 3] = g;
                b = (b + 1) | 0;
                if ((b | 0) >= (h | 0)) break f;
                e = k[x >> 2] | 0;
                f = k[(e + (m << 2)) >> 2] | 0;
                if ((f | 0) != (k[w >> 2] | 0)) {
                  c = 50;
                  break e;
                }
              }
            }
          while (0);
          if ((m | 0) >= (D | 0)) break d;
        }
        if ((c | 0) == 42) Oa(16047, 15958, 414, 16152);
        else if ((c | 0) == 44) Oa(16161, 15958, 415, 16152);
        else if ((c | 0) == 50) Oa(16249, 15958, 392, 16348);
        else if ((c | 0) == 53) Oa(16371, 15958, 393, 16348);
      }
    while (0);
    if ((k[(C + 16) >> 2] | 0) == 0 ? ((A = k[w >> 2] | 0), (y = k[B >> 2] | 0), (y | 0) > -1) : 0) {
      e = k[x >> 2] | 0;
      c = y;
      while (1) {
        if (k[(e + (c << 2)) >> 2] | 0) break;
        d = (c + -1) | 0;
        if ((c | 0) > 0) c = d;
        else {
          c = d;
          break;
        }
      }
      if ((c | 0) < (y | 0))
        do {
          c = (c + 1) | 0;
          k[(e + (c << 2)) >> 2] = A;
        } while ((c | 0) < (k[B >> 2] | 0));
    }
    i[C >> 0] = 1;
    Ag(a, C) | 0;
    Pq(k[x >> 2] | 0);
    Pq(k[z >> 2] | 0);
    c = k[(C + 20) >> 2] | 0;
    if (c | 0) FA(c);
    c = k[(C + 24) >> 2] | 0;
    if (c | 0) FA(c);
    u = E;
    return;
  }
  function Gg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    if (k[(a + 16) >> 2] | 0) Oa(15880, 15958, 264, 16039);
    j = (a + 20) | 0;
    c = k[(a + 28) >> 2] | 0;
    h = (c + b) | 0;
    i = (a + 32) | 0;
    if ((h | 0) <= (k[i >> 2] | 0)) return;
    f = DA(h >>> 0 > 536870911 ? -1 : h << 3) | 0;
    g = DA(h >>> 0 > 1073741823 ? -1 : h << 2) | 0;
    b = (c | 0) < (h | 0) ? c : h;
    if ((b | 0) > 0) {
      e = k[j >> 2] | 0;
      nF(f | 0, e | 0, (b << 3) | 0) | 0;
      c = (a + 24) | 0;
      a = k[c >> 2] | 0;
      nF(g | 0, a | 0, (b << 2) | 0) | 0;
      b = c;
      c = a;
      d = e;
    } else {
      e = k[j >> 2] | 0;
      b = (a + 24) | 0;
      a = k[b >> 2] | 0;
      c = a;
      d = e;
    }
    k[j >> 2] = f;
    k[b >> 2] = g;
    k[i >> 2] = h;
    if (c | 0) FA(a);
    if (!d) return;
    FA(e);
    return;
  }
  function Hg(a) {
    a = a | 0;
    var b = 0;
    b = CA(704) | 0;
    Jg(b, k[a >> 2] | 0);
    return b | 0;
  }
  function Ig(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = u;
    u = (u + 16) | 0;
    d = c;
    k[d >> 2] = b;
    b = Pc[a & 127](d) | 0;
    u = c;
    return b | 0;
  }
  function Jg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    c = u;
    u = (u + 16) | 0;
    f = (c + 4) | 0;
    e = c;
    zg(a, a);
    d = (a + 664) | 0;
    h = k[(b + 12) >> 2] | 0;
    g = k[(b + 16) >> 2] | 0;
    i[d >> 0] = 0;
    a = (a + 668) | 0;
    k[a >> 2] = 0;
    k[(a + 4) >> 2] = 0;
    k[(a + 8) >> 2] = 0;
    k[(a + 12) >> 2] = 0;
    k[(a + 16) >> 2] = 0;
    k[(a + 20) >> 2] = 0;
    k[(a + 24) >> 2] = 0;
    k[(a + 28) >> 2] = 0;
    Dg(d, h, g);
    k[f >> 2] = k[b >> 2];
    k[e >> 2] = k[(b + 4) >> 2];
    Kg(f, e, d, (c + 8) | 0);
    u = c;
    return;
  }
  function Kg(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0.0;
    t = u;
    u = (u + 48) | 0;
    s = (t + 8) | 0;
    o = t;
    q = (t + 44) | 0;
    j = (c + 8) | 0;
    f = k[j >> 2] | 0;
    l = (c + 4) | 0;
    e = k[l >> 2] | 0;
    i[s >> 0] = 0;
    d = (s + 4) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    k[(d + 12) >> 2] = 0;
    k[(d + 16) >> 2] = 0;
    k[(d + 20) >> 2] = 0;
    k[(d + 24) >> 2] = 0;
    k[(d + 28) >> 2] = 0;
    k[(s + 8) >> 2] = e;
    k[(s + 28) >> 2] = 0;
    e = Oq(((f << 2) + 4) | 0) | 0;
    k[(s + 12) >> 2] = e;
    if (!e) {
      t = Kb(4) | 0;
      cF(t);
      Cc(t | 0, 2032, 79);
    }
    k[d >> 2] = f;
    m = (s + 16) | 0;
    g = k[a >> 2] | 0;
    h = k[b >> 2] | 0;
    n = (s + 12) | 0;
    iF(e | 0, 0, ((f << 2) + 4) | 0) | 0;
    if ((g | 0) != (h | 0)) {
      k[o >> 2] = 0;
      h = (o + 4) | 0;
      k[h >> 2] = 0;
      Ef(o, f);
      d = k[h >> 2] | 0;
      if ((d | 0) <= -1) Oa(11919, 12068, 74, 12145);
      if (d | 0) iF(k[o >> 2] | 0, 0, (d << 2) | 0) | 0;
      d = k[a >> 2] | 0;
      f = k[b >> 2] | 0;
      a: do
        if ((d | 0) != (f | 0)) {
          g = k[o >> 2] | 0;
          while (1) {
            e = k[d >> 2] | 0;
            if (!((e | 0) > -1 ? (e | 0) < (k[j >> 2] | 0) : 0)) {
              d = 13;
              break;
            }
            v = k[(d + 4) >> 2] | 0;
            if (!((v | 0) > -1 ? (v | 0) < (k[l >> 2] | 0) : 0)) {
              d = 13;
              break;
            }
            if ((k[h >> 2] | 0) <= (e | 0)) {
              d = 15;
              break;
            }
            v = (g + (e << 2)) | 0;
            k[v >> 2] = (k[v >> 2] | 0) + 1;
            d = (d + 16) | 0;
            if ((d | 0) == (f | 0)) break a;
          }
          if ((d | 0) == 13) Oa(16510, 15958, 934, 16587);
          else if ((d | 0) == 15) Oa(16605, 15693, 425, 29764);
        }
      while (0);
      Og(s, o);
      d = k[a >> 2] | 0;
      g = k[b >> 2] | 0;
      b: do
        if ((d | 0) != (g | 0)) {
          h = k[(s + 16) >> 2] | 0;
          j = k[n >> 2] | 0;
          l = k[(s + 24) >> 2] | 0;
          a = k[(s + 20) >> 2] | 0;
          if (!h) Oa(16634, 15958, 891, 16650);
          else r = d;
          while (1) {
            v = k[r >> 2] | 0;
            d = (h + (v << 2)) | 0;
            e = k[d >> 2] | 0;
            f = k[(j + (v << 2)) >> 2] | 0;
            if ((e | 0) > (((k[(j + ((v + 1) << 2)) >> 2] | 0) - f) | 0)) break;
            b = k[(r + 4) >> 2] | 0;
            w = +p[(r + 8) >> 3];
            k[d >> 2] = e + 1;
            v = (f + e) | 0;
            k[(l + (v << 2)) >> 2] = b;
            p[(a + (v << 3)) >> 3] = w;
            r = (r + 16) | 0;
            if ((r | 0) == (g | 0)) break b;
          }
          Oa(16673, 15958, 892, 16650);
        }
      while (0);
      Lg(s, q);
      d = k[o >> 2] | 0;
      if (d | 0) Pq(k[(d + -4) >> 2] | 0);
    }
    Mg(c, s) | 0;
    Pq(k[n >> 2] | 0);
    Pq(k[m >> 2] | 0);
    d = k[(s + 20) >> 2] | 0;
    if (d | 0) FA(d);
    d = k[(s + 24) >> 2] | 0;
    if (!d) {
      u = t;
      return;
    }
    FA(d);
    u = t;
    return;
  }
  function Lg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0;
    B = u;
    u = (u + 16) | 0;
    y = B;
    if (!(k[(a + 16) >> 2] | 0)) Oa(16634, 15958, 1019, 16743);
    b = k[(a + 8) >> 2] | 0;
    k[y >> 2] = 0;
    x = (y + 4) | 0;
    k[x >> 2] = 0;
    Ef(y, b);
    b = k[x >> 2] | 0;
    if ((b | 0) <= -1) Oa(11919, 12068, 74, 12145);
    if (b | 0) iF(k[y >> 2] | 0, -1, (b << 2) | 0) | 0;
    r = (a + 4) | 0;
    b = k[r >> 2] | 0;
    s = (a + 16) | 0;
    t = k[s >> 2] | 0;
    v = (a + 12) | 0;
    w = k[v >> 2] | 0;
    a: do
      if ((b | 0) > 0) {
        n = (a + 24) | 0;
        o = k[y >> 2] | 0;
        q = (a + 20) | 0;
        j = 0;
        m = 0;
        b: while (1) {
          l = (w + (m << 2)) | 0;
          b = k[l >> 2] | 0;
          i = k[(t + (m << 2)) >> 2] | 0;
          h = (i + b) | 0;
          if ((i | 0) > 0) {
            i = k[n >> 2] | 0;
            c = j;
            do {
              d = k[(i + (b << 2)) >> 2] | 0;
              if (!((d | 0) > -1 ? (k[x >> 2] | 0) > (d | 0) : 0)) {
                b = 14;
                break b;
              }
              e = (o + (d << 2)) | 0;
              f = k[e >> 2] | 0;
              g = k[q >> 2] | 0;
              if ((f | 0) < (j | 0)) {
                p[(g + (c << 3)) >> 3] = +p[(g + (b << 3)) >> 3];
                k[(i + (c << 2)) >> 2] = d;
                if ((k[x >> 2] | 0) <= (d | 0)) {
                  b = 18;
                  break b;
                }
                k[e >> 2] = c;
                c = (c + 1) | 0;
              } else {
                f = (g + (f << 3)) | 0;
                p[f >> 3] = +p[f >> 3] + +p[(g + (b << 3)) >> 3];
              }
              b = (b + 1) | 0;
            } while ((b | 0) < (h | 0));
          } else c = j;
          k[l >> 2] = j;
          m = (m + 1) | 0;
          b = k[r >> 2] | 0;
          if ((m | 0) >= (b | 0)) {
            z = c;
            A = b;
            break a;
          } else j = c;
        }
        if ((b | 0) == 14) Oa(16605, 15693, 425, 29764);
        else if ((b | 0) == 18) Oa(16605, 15693, 425, 29764);
      } else {
        z = 0;
        A = b;
      }
    while (0);
    k[(w + (A << 2)) >> 2] = z;
    Pq(t);
    k[s >> 2] = 0;
    Eg((a + 20) | 0, k[((k[v >> 2] | 0) + (k[r >> 2] << 2)) >> 2] | 0, 0.0);
    b = k[y >> 2] | 0;
    if (!b) {
      u = B;
      return;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = B;
    return;
  }
  function Mg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0;
    J = u;
    u = (u + 48) | 0;
    H = (J + 8) | 0;
    o = J;
    w = (b + 4) | 0;
    z = k[w >> 2] | 0;
    c = k[(b + 8) >> 2] | 0;
    i[H >> 0] = 0;
    E = (H + 4) | 0;
    k[E >> 2] = 0;
    k[(E + 4) >> 2] = 0;
    k[(E + 8) >> 2] = 0;
    k[(E + 12) >> 2] = 0;
    k[(E + 16) >> 2] = 0;
    k[(E + 20) >> 2] = 0;
    k[(E + 24) >> 2] = 0;
    k[(E + 28) >> 2] = 0;
    F = (H + 8) | 0;
    k[F >> 2] = z;
    z = (H + 28) | 0;
    k[z >> 2] = 0;
    l = Oq(((c << 2) + 4) | 0) | 0;
    k[(H + 12) >> 2] = l;
    if (!l) {
      J = Kb(4) | 0;
      cF(J);
      Cc(J | 0, 2032, 79);
    }
    k[E >> 2] = c;
    G = (H + 16) | 0;
    D = (H + 12) | 0;
    iF(l | 0, 0, ((c << 2) + 4) | 0) | 0;
    if ((c | 0) <= -1) Oa(14697, 13988, 163, 14058);
    if (c | 0) iF(l | 0, 0, (c << 2) | 0) | 0;
    c = k[w >> 2] | 0;
    if ((c | 0) > 0) {
      h = k[(b + 24) >> 2] | 0;
      j = k[(b + 12) >> 2] | 0;
      g = k[(b + 16) >> 2] | 0;
      if (!g) {
        f = 0;
        do {
          d = k[(j + (f << 2)) >> 2] | 0;
          f = (f + 1) | 0;
          e = k[(j + (f << 2)) >> 2] | 0;
          if ((d | 0) < (e | 0)) {
            c = d;
            do {
              v = (l + (k[(h + (c << 2)) >> 2] << 2)) | 0;
              k[v >> 2] = (k[v >> 2] | 0) + 1;
              c = (c + 1) | 0;
            } while ((c | 0) != (e | 0));
            c = k[w >> 2] | 0;
          }
        } while ((f | 0) < (c | 0));
      } else {
        f = 0;
        do {
          d = k[(j + (f << 2)) >> 2] | 0;
          v = k[(g + (f << 2)) >> 2] | 0;
          e = (v + d) | 0;
          if ((v | 0) > 0) {
            c = d;
            do {
              v = (l + (k[(h + (c << 2)) >> 2] << 2)) | 0;
              k[v >> 2] = (k[v >> 2] | 0) + 1;
              c = (c + 1) | 0;
            } while ((c | 0) < (e | 0));
            c = k[w >> 2] | 0;
          }
          f = (f + 1) | 0;
        } while ((f | 0) < (c | 0));
      }
    }
    c = k[E >> 2] | 0;
    k[o >> 2] = 0;
    v = (o + 4) | 0;
    k[v >> 2] = 0;
    Ef(o, c);
    c = k[E >> 2] | 0;
    g = k[D >> 2] | 0;
    a: do
      if ((c | 0) > 0) {
        f = k[o >> 2] | 0;
        e = 0;
        c = 0;
        while (1) {
          t = (g + (e << 2)) | 0;
          d = k[t >> 2] | 0;
          k[t >> 2] = c;
          if ((k[v >> 2] | 0) <= (e | 0)) break;
          k[(f + (e << 2)) >> 2] = c;
          c = (d + c) | 0;
          e = (e + 1) | 0;
          d = k[E >> 2] | 0;
          if ((e | 0) >= (d | 0)) {
            n = c;
            m = d;
            break a;
          }
        }
        Oa(16605, 15693, 408, 29907);
      } else {
        n = 0;
        m = c;
      }
    while (0);
    k[(g + (m << 2)) >> 2] = n;
    t = (H + 20) | 0;
    Eg(t, n, 0.0);
    c = k[w >> 2] | 0;
    do
      if ((c | 0) > 0) {
        r = k[o >> 2] | 0;
        s = (H + 24) | 0;
        n = k[s >> 2] | 0;
        o = k[t >> 2] | 0;
        j = k[(b + 20) >> 2] | 0;
        l = k[(b + 24) >> 2] | 0;
        m = k[(b + 12) >> 2] | 0;
        g = k[(b + 16) >> 2] | 0;
        b = o;
        q = n;
        h = (g | 0) == 0;
        f = 0;
        b: while (1) {
          d = k[(m + (f << 2)) >> 2] | 0;
          if (h) e = k[(m + ((f + 1) << 2)) >> 2] | 0;
          else e = ((k[(g + (f << 2)) >> 2] | 0) + d) | 0;
          if ((d | 0) < (e | 0)) {
            c = d;
            do {
              d = k[(l + (c << 2)) >> 2] | 0;
              if (!((d | 0) > -1 ? (k[v >> 2] | 0) > (d | 0) : 0)) {
                c = 32;
                break b;
              }
              K = (r + (d << 2)) | 0;
              d = k[K >> 2] | 0;
              k[K >> 2] = d + 1;
              k[(n + (d << 2)) >> 2] = f;
              p[(o + (d << 3)) >> 3] = +p[(j + (c << 3)) >> 3];
              c = (c + 1) | 0;
            } while ((c | 0) < (e | 0));
            c = k[w >> 2] | 0;
          }
          f = (f + 1) | 0;
          if ((f | 0) >= (c | 0)) {
            c = 34;
            break;
          }
        }
        if ((c | 0) == 32) Oa(16605, 15693, 408, 29907);
        else if ((c | 0) == 34) {
          I = s;
          x = s;
          y = t;
          A = b;
          B = q;
          C = r;
          break;
        }
      } else {
        B = (H + 24) | 0;
        I = B;
        x = B;
        y = t;
        A = k[t >> 2] | 0;
        B = k[B >> 2] | 0;
        C = k[o >> 2] | 0;
      }
    while (0);
    w = (a + 12) | 0;
    c = k[w >> 2] | 0;
    k[w >> 2] = k[D >> 2];
    k[D >> 2] = c;
    w = (a + 8) | 0;
    K = k[w >> 2] | 0;
    k[w >> 2] = k[F >> 2];
    k[F >> 2] = K;
    F = (a + 4) | 0;
    K = k[F >> 2] | 0;
    k[F >> 2] = k[E >> 2];
    k[E >> 2] = K;
    E = (a + 16) | 0;
    K = k[E >> 2] | 0;
    k[E >> 2] = k[G >> 2];
    k[G >> 2] = K;
    K = (a + 20) | 0;
    E = k[K >> 2] | 0;
    k[K >> 2] = A;
    k[y >> 2] = E;
    E = (a + 24) | 0;
    K = k[E >> 2] | 0;
    k[E >> 2] = B;
    k[x >> 2] = K;
    K = (a + 28) | 0;
    E = k[K >> 2] | 0;
    k[K >> 2] = k[z >> 2];
    k[z >> 2] = E;
    E = (a + 32) | 0;
    K = (H + 32) | 0;
    F = k[E >> 2] | 0;
    k[E >> 2] = k[K >> 2];
    k[K >> 2] = F;
    if (C) {
      Pq(k[(C + -4) >> 2] | 0);
      c = k[D >> 2] | 0;
    }
    Pq(c);
    Pq(k[G >> 2] | 0);
    c = k[(H + 20) >> 2] | 0;
    if (c | 0) FA(c);
    c = k[I >> 2] | 0;
    if (!c) {
      u = J;
      return a | 0;
    }
    FA(c);
    u = J;
    return a | 0;
  }
  function Ng(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    if (!(((b | 0) > -1) & ((c | 0) == 1))) Oa(12303, 12702, 285, 12780);
    f = (a + 4) | 0;
    if ((k[f >> 2] | 0) == (b | 0)) {
      k[f >> 2] = b;
      return;
    }
    c = k[a >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    do
      if (b) {
        if (b >>> 0 > 1073741823) {
          b = Kb(4) | 0;
          cF(b);
          Cc(b | 0, 2032, 79);
        }
        e = b << 2;
        d = Oq((e + 16) | 0) | 0;
        c = (d + 16) & -16;
        if (!d) c = 0;
        else k[(c + -4) >> 2] = d;
        if (((e | 0) != 0) & ((c | 0) == 0)) {
          b = Kb(4) | 0;
          cF(b);
          Cc(b | 0, 2032, 79);
        } else break;
      } else c = 0;
    while (0);
    k[a >> 2] = c;
    k[f >> 2] = b;
    return;
  }
  function Og(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    l = k[(a + 16) >> 2] | 0;
    v = (a + 4) | 0;
    n = k[v >> 2] | 0;
    c = n << 2;
    if (l | 0) {
      s = Oq((c + 4) | 0) | 0;
      t = s;
      if (!s) {
        v = Kb(4) | 0;
        cF(v);
        Cc(v | 0, 2032, 79);
      }
      a: do
        if ((n | 0) > 0) {
          i = k[(a + 12) >> 2] | 0;
          j = k[b >> 2] | 0;
          h = k[(b + 4) >> 2] | 0;
          g = 0;
          c = 0;
          while (1) {
            k[(s + (g << 2)) >> 2] = c;
            d = g;
            g = (g + 1) | 0;
            e = k[(l + (d << 2)) >> 2] | 0;
            f = ((k[(i + (g << 2)) >> 2] | 0) - (k[(i + (d << 2)) >> 2] | 0) - e) | 0;
            if ((h | 0) <= (d | 0)) break;
            b = k[(j + (d << 2)) >> 2] | 0;
            c = (e + c + ((b | 0) < (f | 0) ? f : b)) | 0;
            if ((g | 0) >= (n | 0)) {
              m = c;
              break a;
            }
          }
          Oa(16605, 15693, 162, 29907);
        } else m = 0;
      while (0);
      k[(s + (n << 2)) >> 2] = m;
      r = (a + 20) | 0;
      Eg(r, m, 0.0);
      d = k[v >> 2] | 0;
      q = (a + 12) | 0;
      if ((d | 0) > 0) {
        c = k[q >> 2] | 0;
        o = (a + 16) | 0;
        n = (a + 24) | 0;
        do {
          g = d;
          d = (d + -1) | 0;
          i = (s + (d << 2)) | 0;
          f = k[i >> 2] | 0;
          j = (c + (d << 2)) | 0;
          e = k[j >> 2] | 0;
          if ((f | 0) > (e | 0) ? ((u = k[((k[o >> 2] | 0) + (d << 2)) >> 2] | 0), (u | 0) > 0) : 0) {
            l = k[n >> 2] | 0;
            m = k[r >> 2] | 0;
            h = u;
            do {
              v = h;
              h = (h + -1) | 0;
              k[(l + ((f + h) << 2)) >> 2] = k[(l + ((e + h) << 2)) >> 2];
              e = k[j >> 2] | 0;
              f = k[i >> 2] | 0;
              p[(m + ((f + h) << 3)) >> 3] = +p[(m + ((e + h) << 3)) >> 3];
            } while ((v | 0) > 1);
          }
        } while ((g | 0) > 1);
      } else c = k[q >> 2] | 0;
      k[q >> 2] = t;
      Pq(c);
      return;
    }
    t = Oq(c) | 0;
    m = (a + 16) | 0;
    k[m >> 2] = t;
    if (!t) {
      v = Kb(4) | 0;
      cF(v);
      Cc(v | 0, 2032, 79);
    }
    b: do
      if ((n | 0) > 0) {
        f = (b + 4) | 0;
        g = k[b >> 2] | 0;
        h = (a + 12) | 0;
        d = 0;
        c = 0;
        e = 0;
        while (1) {
          k[(t + (d << 2)) >> 2] = e;
          if ((k[f >> 2] | 0) <= (d | 0)) break;
          u = k[(g + (d << 2)) >> 2] | 0;
          r = k[h >> 2] | 0;
          s = d;
          d = (d + 1) | 0;
          e = (u + e + (k[(r + (d << 2)) >> 2] | 0) - (k[(r + (s << 2)) >> 2] | 0)) | 0;
          c = (u + c) | 0;
          if ((d | 0) >= (k[v >> 2] | 0)) {
            i = c;
            break b;
          }
        }
        Oa(16605, 15693, 162, 29907);
      } else i = 0;
    while (0);
    s = (a + 20) | 0;
    c = k[(a + 28) >> 2] | 0;
    h = (c + i) | 0;
    i = (a + 32) | 0;
    if ((h | 0) > (k[i >> 2] | 0)) {
      j = DA(h >>> 0 > 536870911 ? -1 : h << 3) | 0;
      l = DA(h >>> 0 > 1073741823 ? -1 : h << 2) | 0;
      c = (c | 0) < (h | 0) ? c : h;
      if ((c | 0) > 0) {
        g = k[s >> 2] | 0;
        nF(j | 0, g | 0, (c << 3) | 0) | 0;
        d = (a + 24) | 0;
        e = k[d >> 2] | 0;
        nF(l | 0, e | 0, (c << 2) | 0) | 0;
        c = d;
        d = e;
        f = g;
      } else {
        g = k[s >> 2] | 0;
        c = (a + 24) | 0;
        e = k[c >> 2] | 0;
        d = e;
        f = g;
      }
      k[s >> 2] = j;
      k[c >> 2] = l;
      k[i >> 2] = h;
      if (d | 0) FA(e);
      if (f | 0) FA(g);
    }
    e = k[v >> 2] | 0;
    r = k[(a + 12) >> 2] | 0;
    if ((e | 0) > 0) {
      c = k[m >> 2] | 0;
      q = (a + 24) | 0;
      d = k[(r + (e << 2)) >> 2] | 0;
      do {
        n = e;
        e = (e + -1) | 0;
        o = (r + (e << 2)) | 0;
        g = k[o >> 2] | 0;
        m = (d - g) | 0;
        if ((m | 0) > 0) {
          i = k[q >> 2] | 0;
          j = (t + (e << 2)) | 0;
          l = k[s >> 2] | 0;
          h = m;
          f = k[j >> 2] | 0;
          d = g;
          do {
            a = h;
            h = (h + -1) | 0;
            k[(i + ((f + h) << 2)) >> 2] = k[(i + ((d + h) << 2)) >> 2];
            d = k[o >> 2] | 0;
            f = k[j >> 2] | 0;
            p[(l + ((f + h) << 3)) >> 3] = +p[(l + ((d + h) << 3)) >> 3];
          } while ((a | 0) > 1);
        } else {
          d = g;
          f = k[(t + (e << 2)) >> 2] | 0;
        }
        k[o >> 2] = f;
        k[(c + (e << 2)) >> 2] = m;
      } while ((n | 0) > 1);
      e = k[v >> 2] | 0;
    } else c = k[m >> 2] | 0;
    d = (e + -1) | 0;
    c = ((k[(c + (d << 2)) >> 2] | 0) + (k[(r + (d << 2)) >> 2] | 0)) | 0;
    if ((e | 0) <= 0) Oa(16605, 15693, 162, 29907);
    if ((k[(b + 4) >> 2] | 0) < (e | 0)) Oa(16605, 15693, 162, 29907);
    k[(r + (e << 2)) >> 2] = c + (k[((k[b >> 2] | 0) + (d << 2)) >> 2] | 0);
    Eg(s, k[(r + (k[v >> 2] << 2)) >> 2] | 0, 0.0);
    return;
  }
  function Pg(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    h = u;
    u = (u + 32) | 0;
    e = (h + 8) | 0;
    f = (h + 4) | 0;
    g = h;
    d = (a + 8) | 0;
    b = k[d >> 2] | 0;
    if ((b | 0) != (k[(a + 4) >> 2] | 0)) Oa(16762, 15958, 746, 16810);
    c = (a + 20) | 0;
    Eg(c, b, 0.0);
    b = k[d >> 2] | 0;
    k[e >> 2] = k[(a + 24) >> 2];
    k[(e + 4) >> 2] = b;
    if ((b | 0) <= -1) Oa(14697, 13988, 163, 14058);
    k[f >> 2] = 0;
    k[g >> 2] = b + -1;
    Rg(e, b, f, g) | 0;
    c = k[c >> 2] | 0;
    d = k[d >> 2] | 0;
    if ((d | 0) <= -1) Oa(14697, 13988, 163, 14058);
    if (d | 0) {
      b = 0;
      do {
        p[(c + (b << 3)) >> 3] = 1.0;
        b = (b + 1) | 0;
      } while ((b | 0) != (d | 0));
    }
    b = (d + 1) | 0;
    k[e >> 2] = k[(a + 12) >> 2];
    k[(e + 4) >> 2] = b;
    if ((d | 0) > -2) {
      k[f >> 2] = 0;
      k[g >> 2] = d;
      Rg(e, b, f, g) | 0;
      g = (a + 16) | 0;
      Pq(k[g >> 2] | 0);
      k[g >> 2] = 0;
      u = h;
      return;
    } else Oa(14697, 13988, 163, 14058);
  }
  function Qg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    zg(a, a);
    c = (a + 664) | 0;
    i[c >> 0] = 0;
    a = (a + 668) | 0;
    k[a >> 2] = 0;
    k[(a + 4) >> 2] = 0;
    k[(a + 8) >> 2] = 0;
    k[(a + 12) >> 2] = 0;
    k[(a + 16) >> 2] = 0;
    k[(a + 20) >> 2] = 0;
    k[(a + 24) >> 2] = 0;
    k[(a + 28) >> 2] = 0;
    Ag(c, b) | 0;
    return;
  }
  function Rg(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    i = k[d >> 2] | 0;
    h = (b | 0) == 1 ? i : k[c >> 2] | 0;
    f = (i - h) | 0;
    d = ((f | 0) / (((b | 0) < 2 ? 1 : (b + -1) | 0) | 0)) | 0;
    e = (f | 0) > -1 ? f : (0 - f) | 0;
    c = (e + 1) | 0;
    e = (((((i | 0) >= (h | 0) ? b : (0 - b) | 0) + f) | 0) / (((e | 0) == -1 ? 1 : c) | 0)) | 0;
    if ((b | 0) <= 1)
      if ((b | 0) > -1) g = 0;
      else Oa(11919, 12068, 74, 12145);
    else g = ((c | 0) < (b | 0)) & 1;
    if ((k[(a + 4) >> 2] | 0) != (b | 0)) Oa(14445, 14320, 257, 12780);
    f = k[a >> 2] | 0;
    if ((b | 0) <= 0) return a | 0;
    if (!((g << 24) >> 24)) {
      c = 0;
      do {
        i = ((aa(c, d) | 0) + h) | 0;
        k[(f + (c << 2)) >> 2] = i;
        c = (c + 1) | 0;
      } while ((c | 0) != (b | 0));
      return a | 0;
    } else {
      c = 0;
      do {
        k[(f + (c << 2)) >> 2] = (((c | 0) / (e | 0)) | 0) + h;
        c = (c + 1) | 0;
      } while ((c | 0) != (b | 0));
      return a | 0;
    }
    return 0;
  }
  function Sg(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    e = u;
    u = (u + 704) | 0;
    d = e;
    cd[a & 63](d, b, c);
    b = CA(704) | 0;
    Tg(b, d);
    Pq(k[(d + 676) >> 2] | 0);
    Pq(k[(d + 680) >> 2] | 0);
    a = k[(d + 684) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(d + 688) >> 2] | 0;
    if (a | 0) FA(a);
    sg((d + 456) | 0);
    tg((d + 136) | 0);
    vg((d + 8) | 0);
    u = e;
    return b | 0;
  }
  function Tg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;
    zg(a, a);
    c = (a + 664) | 0;
    i[c >> 0] = 0;
    a = (a + 668) | 0;
    k[a >> 2] = 0;
    k[(a + 4) >> 2] = 0;
    k[(a + 8) >> 2] = 0;
    k[(a + 12) >> 2] = 0;
    k[(a + 16) >> 2] = 0;
    k[(a + 20) >> 2] = 0;
    k[(a + 24) >> 2] = 0;
    k[(a + 28) >> 2] = 0;
    Ag(c, (b + 664) | 0) | 0;
    return;
  }
  function Ug(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    d = u;
    u = (u + 704) | 0;
    c = d;
    Nc[a & 63](c, b);
    b = CA(704) | 0;
    Tg(b, c);
    Pq(k[(c + 676) >> 2] | 0);
    Pq(k[(c + 680) >> 2] | 0);
    a = k[(c + 684) >> 2] | 0;
    if (a | 0) FA(a);
    a = k[(c + 688) >> 2] | 0;
    if (a | 0) FA(a);
    sg((c + 456) | 0);
    tg((c + 136) | 0);
    vg((c + 8) | 0);
    u = d;
    return b | 0;
  }
  function Vg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0;
    E = u;
    u = (u + 48) | 0;
    C = (E + 8) | 0;
    n = E;
    t = k[(b + 4) >> 2] | 0;
    v = (t + 4) | 0;
    x = k[v >> 2] | 0;
    b = k[(t + 8) >> 2] | 0;
    i[C >> 0] = 0;
    z = (C + 4) | 0;
    k[z >> 2] = 0;
    k[(z + 4) >> 2] = 0;
    k[(z + 8) >> 2] = 0;
    k[(z + 12) >> 2] = 0;
    k[(z + 16) >> 2] = 0;
    k[(z + 20) >> 2] = 0;
    k[(z + 24) >> 2] = 0;
    k[(z + 28) >> 2] = 0;
    w = (C + 8) | 0;
    k[w >> 2] = x;
    x = (C + 28) | 0;
    k[x >> 2] = 0;
    j = Oq(((b << 2) + 4) | 0) | 0;
    k[(C + 12) >> 2] = j;
    if (!j) {
      E = Kb(4) | 0;
      cF(E);
      Cc(E | 0, 2032, 79);
    }
    k[z >> 2] = b;
    B = (C + 16) | 0;
    y = (C + 12) | 0;
    iF(j | 0, 0, ((b << 2) + 4) | 0) | 0;
    if ((b | 0) <= -1) Oa(14697, 13988, 163, 14058);
    if (b | 0) iF(j | 0, 0, (b << 2) | 0) | 0;
    b = k[v >> 2] | 0;
    if ((b | 0) > 0) {
      g = k[(t + 24) >> 2] | 0;
      h = k[(t + 12) >> 2] | 0;
      f = k[(t + 16) >> 2] | 0;
      if (!f) {
        e = 0;
        do {
          c = k[(h + (e << 2)) >> 2] | 0;
          e = (e + 1) | 0;
          d = k[(h + (e << 2)) >> 2] | 0;
          if ((c | 0) < (d | 0)) {
            b = c;
            do {
              s = (j + (k[(g + (b << 2)) >> 2] << 2)) | 0;
              k[s >> 2] = (k[s >> 2] | 0) + 1;
              b = (b + 1) | 0;
            } while ((b | 0) != (d | 0));
            b = k[v >> 2] | 0;
          }
        } while ((e | 0) < (b | 0));
      } else {
        e = 0;
        do {
          c = k[(h + (e << 2)) >> 2] | 0;
          s = k[(f + (e << 2)) >> 2] | 0;
          d = (s + c) | 0;
          if ((s | 0) > 0) {
            b = c;
            do {
              s = (j + (k[(g + (b << 2)) >> 2] << 2)) | 0;
              k[s >> 2] = (k[s >> 2] | 0) + 1;
              b = (b + 1) | 0;
            } while ((b | 0) < (d | 0));
            b = k[v >> 2] | 0;
          }
          e = (e + 1) | 0;
        } while ((e | 0) < (b | 0));
      }
    }
    b = k[z >> 2] | 0;
    k[n >> 2] = 0;
    s = (n + 4) | 0;
    k[s >> 2] = 0;
    Ef(n, b);
    b = k[z >> 2] | 0;
    f = k[y >> 2] | 0;
    a: do
      if ((b | 0) > 0) {
        e = k[n >> 2] | 0;
        d = 0;
        b = 0;
        while (1) {
          r = (f + (d << 2)) | 0;
          c = k[r >> 2] | 0;
          k[r >> 2] = b;
          if ((k[s >> 2] | 0) <= (d | 0)) break;
          k[(e + (d << 2)) >> 2] = b;
          b = (c + b) | 0;
          d = (d + 1) | 0;
          c = k[z >> 2] | 0;
          if ((d | 0) >= (c | 0)) {
            m = b;
            l = c;
            break a;
          }
        }
        Oa(16605, 15693, 408, 29907);
      } else {
        m = 0;
        l = b;
      }
    while (0);
    k[(f + (l << 2)) >> 2] = m;
    r = (C + 20) | 0;
    Eg(r, m, 0.0);
    b = k[v >> 2] | 0;
    b: do
      if ((b | 0) > 0) {
        o = k[n >> 2] | 0;
        q = (C + 24) | 0;
        l = k[(t + 20) >> 2] | 0;
        m = k[(t + 24) >> 2] | 0;
        n = k[(t + 12) >> 2] | 0;
        h = k[(t + 16) >> 2] | 0;
        j = (h | 0) == 0;
        g = 0;
        c: while (1) {
          c = k[(n + (g << 2)) >> 2] | 0;
          if (j) f = k[(n + ((g + 1) << 2)) >> 2] | 0;
          else f = ((k[(h + (g << 2)) >> 2] | 0) + c) | 0;
          if ((c | 0) < (f | 0)) {
            e = k[q >> 2] | 0;
            d = k[r >> 2] | 0;
            b = c;
            do {
              c = k[(m + (b << 2)) >> 2] | 0;
              if (!((c | 0) > -1 ? (k[s >> 2] | 0) > (c | 0) : 0)) break c;
              c = (o + (c << 2)) | 0;
              t = k[c >> 2] | 0;
              k[c >> 2] = t + 1;
              k[(e + (t << 2)) >> 2] = g;
              p[(d + (t << 3)) >> 3] = +p[(l + (b << 3)) >> 3];
              b = (b + 1) | 0;
            } while ((b | 0) < (f | 0));
            b = k[v >> 2] | 0;
          }
          g = (g + 1) | 0;
          if ((g | 0) >= (b | 0)) {
            D = q;
            A = o;
            break b;
          }
        }
        Oa(16605, 15693, 408, 29907);
      } else {
        D = (C + 24) | 0;
        A = k[n >> 2] | 0;
      }
    while (0);
    t = (a + 12) | 0;
    b = k[t >> 2] | 0;
    k[t >> 2] = k[y >> 2];
    k[y >> 2] = b;
    t = (a + 8) | 0;
    v = k[t >> 2] | 0;
    k[t >> 2] = k[w >> 2];
    k[w >> 2] = v;
    v = (a + 4) | 0;
    w = k[v >> 2] | 0;
    k[v >> 2] = k[z >> 2];
    k[z >> 2] = w;
    w = (a + 16) | 0;
    z = k[w >> 2] | 0;
    k[w >> 2] = k[B >> 2];
    k[B >> 2] = z;
    z = (a + 20) | 0;
    w = k[z >> 2] | 0;
    k[z >> 2] = k[r >> 2];
    k[r >> 2] = w;
    w = (a + 24) | 0;
    z = k[w >> 2] | 0;
    k[w >> 2] = k[D >> 2];
    k[D >> 2] = z;
    z = (a + 28) | 0;
    w = k[z >> 2] | 0;
    k[z >> 2] = k[x >> 2];
    k[x >> 2] = w;
    w = (a + 32) | 0;
    z = (C + 32) | 0;
    x = k[w >> 2] | 0;
    k[w >> 2] = k[z >> 2];
    k[z >> 2] = x;
    if (A) {
      Pq(k[(A + -4) >> 2] | 0);
      b = k[y >> 2] | 0;
    }
    Pq(b);
    Pq(k[B >> 2] | 0);
    b = k[(C + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[D >> 2] | 0;
    if (!b) {
      u = E;
      return a | 0;
    }
    FA(b);
    u = E;
    return a | 0;
  }
  function Wg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    e = u;
    u = (u + 704) | 0;
    d = e;
    c = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    a = (b + (f >> 1)) | 0;
    if (f & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    Nc[c & 63](d, a);
    a = CA(704) | 0;
    Tg(a, d);
    Pq(k[(d + 676) >> 2] | 0);
    Pq(k[(d + 680) >> 2] | 0);
    c = k[(d + 684) >> 2] | 0;
    if (c | 0) FA(c);
    c = k[(d + 688) >> 2] | 0;
    if (c | 0) FA(c);
    sg((d + 456) | 0);
    tg((d + 136) | 0);
    vg((d + 8) | 0);
    u = e;
    return a | 0;
  }
  function Xg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (d & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    return Pc[c & 127](a) | 0;
  }
  function Yg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0.0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (!(d & 1)) {
      d = c;
      e = +Vc[d & 7](a);
      return +e;
    } else {
      d = k[((k[a >> 2] | 0) + c) >> 2] | 0;
      e = +Vc[d & 7](a);
      return +e;
    }
    return 0.0;
  }
  function Zg(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0;
    I = u;
    u = (u + 48) | 0;
    G = I;
    e = k[(b + 4) >> 2] | 0;
    d = (b + 20) | 0;
    H = k[d >> 2] | 0;
    if (i[b >> 0] | 0) {
      z = (b + 16) | 0;
      Dg(a, k[z >> 2] | 0, H);
      A = (a + 28) | 0;
      k[A >> 2] = 0;
      B = (a + 12) | 0;
      C = (a + 4) | 0;
      iF(k[B >> 2] | 0, 0, ((k[C >> 2] << 2) + 4) | 0) | 0;
      c = k[(a + 16) >> 2] | 0;
      if (c | 0) iF(c | 0, 0, (k[C >> 2] << 2) | 0) | 0;
      G = k[z >> 2] | 0;
      F = k[d >> 2] | 0;
      Gg(a, ((G | 0) < (F | 0) ? F : G) << 1);
      a: do
        if ((H | 0) > 0) {
          y = e;
          t = (b + 12) | 0;
          v = (y + 20) | 0;
          w = (y + 24) | 0;
          x = (y + 12) | 0;
          y = (y + 16) | 0;
          r = (b + 8) | 0;
          s = (a + 20) | 0;
          q = (a + 24) | 0;
          n = 0;
          b: while (1) {
            c = k[B >> 2] | 0;
            d = k[(c + (n << 2)) >> 2] | 0;
            if ((d | 0) != (k[A >> 2] | 0)) {
              c = 15;
              break;
            }
            o = n;
            n = (n + 1) | 0;
            c = (c + (n << 2)) | 0;
            if (k[c >> 2] | 0) {
              c = 17;
              break;
            }
            k[c >> 2] = d;
            d = ((k[t >> 2] | 0) + o) | 0;
            l = k[v >> 2] | 0;
            m = k[w >> 2] | 0;
            e = k[x >> 2] | 0;
            c = k[(e + (d << 2)) >> 2] | 0;
            b = k[y >> 2] | 0;
            if (!b) h = k[(e + ((d + 1) << 2)) >> 2] | 0;
            else h = ((k[(b + (d << 2)) >> 2] | 0) + c) | 0;
            d = k[r >> 2] | 0;
            j = ((k[z >> 2] | 0) + d) | 0;
            c: do
              if ((c | 0) < (h | 0))
                do {
                  if ((k[(m + (c << 2)) >> 2] | 0) >= (d | 0)) break c;
                  c = (c + 1) | 0;
                } while ((c | 0) < (h | 0));
            while (0);
            d: do
              if ((c | 0) < (h | 0))
                do {
                  d = k[(m + (c << 2)) >> 2] | 0;
                  if ((d | 0) >= (j | 0)) break d;
                  g = +p[(l + (c << 3)) >> 3];
                  d = (d - (k[r >> 2] | 0)) | 0;
                  e = k[B >> 2] | 0;
                  b = (e + (n << 2)) | 0;
                  f = k[b >> 2] | 0;
                  if ((f | 0) != (k[A >> 2] | 0)) {
                    c = 27;
                    break b;
                  }
                  if ((f | 0) != (k[(e + (o << 2)) >> 2] | 0) ? (k[((k[q >> 2] | 0) + ((f + -1) << 2)) >> 2] | 0) >= (d | 0) : 0) {
                    c = 30;
                    break b;
                  }
                  k[b >> 2] = f + 1;
                  F = k[A >> 2] | 0;
                  Eg(s, (F + 1) | 0, 1.0);
                  G = k[s >> 2] | 0;
                  p[(G + (F << 3)) >> 3] = 0.0;
                  k[((k[q >> 2] | 0) + (F << 2)) >> 2] = d;
                  p[(G + (f << 3)) >> 3] = g;
                  c = (c + 1) | 0;
                } while ((c | 0) < (h | 0));
            while (0);
            if ((n | 0) >= (H | 0)) break a;
          }
          if ((c | 0) == 15) Oa(16047, 15958, 414, 16152);
          else if ((c | 0) == 17) Oa(16161, 15958, 415, 16152);
          else if ((c | 0) == 27) Oa(16249, 15958, 392, 16348);
          else if ((c | 0) == 30) Oa(16371, 15958, 393, 16348);
        }
      while (0);
      if (k[(a + 16) >> 2] | 0) {
        u = I;
        return;
      }
      f = k[A >> 2] | 0;
      e = k[C >> 2] | 0;
      if ((e | 0) <= -1) {
        u = I;
        return;
      }
      b = k[B >> 2] | 0;
      c = e;
      while (1) {
        if (k[(b + (c << 2)) >> 2] | 0) break;
        d = (c + -1) | 0;
        if ((c | 0) > 0) c = d;
        else {
          c = d;
          break;
        }
      }
      if ((c | 0) >= (e | 0)) {
        u = I;
        return;
      }
      do {
        c = (c + 1) | 0;
        k[(b + (c << 2)) >> 2] = f;
      } while ((c | 0) < (k[C >> 2] | 0));
      u = I;
      return;
    }
    z = (b + 16) | 0;
    A = k[z >> 2] | 0;
    i[G >> 0] = 0;
    D = (G + 4) | 0;
    k[D >> 2] = 0;
    k[(D + 4) >> 2] = 0;
    k[(D + 8) >> 2] = 0;
    k[(D + 12) >> 2] = 0;
    k[(D + 16) >> 2] = 0;
    k[(D + 20) >> 2] = 0;
    k[(D + 24) >> 2] = 0;
    k[(D + 28) >> 2] = 0;
    k[(G + 8) >> 2] = A;
    A = (G + 28) | 0;
    k[A >> 2] = 0;
    c = Oq(((H << 2) + 4) | 0) | 0;
    k[(G + 12) >> 2] = c;
    if (!c) {
      I = Kb(4) | 0;
      cF(I);
      Cc(I | 0, 2032, 79);
    }
    k[D >> 2] = H;
    E = (G + 16) | 0;
    y = k[z >> 2] | 0;
    x = k[d >> 2] | 0;
    B = (G + 12) | 0;
    iF(c | 0, 0, ((H << 2) + 4) | 0) | 0;
    Gg(G, ((y | 0) < (x | 0) ? x : y) << 1);
    e: do
      if ((H | 0) > 0) {
        y = e;
        t = (b + 12) | 0;
        v = (y + 20) | 0;
        w = (y + 24) | 0;
        x = (y + 12) | 0;
        y = (y + 16) | 0;
        r = (b + 8) | 0;
        s = (G + 20) | 0;
        q = (G + 24) | 0;
        n = 0;
        f: while (1) {
          c = k[B >> 2] | 0;
          d = k[(c + (n << 2)) >> 2] | 0;
          if ((d | 0) != (k[A >> 2] | 0)) {
            c = 45;
            break;
          }
          o = n;
          n = (n + 1) | 0;
          c = (c + (n << 2)) | 0;
          if (k[c >> 2] | 0) {
            c = 47;
            break;
          }
          k[c >> 2] = d;
          d = ((k[t >> 2] | 0) + o) | 0;
          l = k[v >> 2] | 0;
          m = k[w >> 2] | 0;
          e = k[x >> 2] | 0;
          c = k[(e + (d << 2)) >> 2] | 0;
          b = k[y >> 2] | 0;
          if (!b) h = k[(e + ((d + 1) << 2)) >> 2] | 0;
          else h = ((k[(b + (d << 2)) >> 2] | 0) + c) | 0;
          d = k[r >> 2] | 0;
          j = ((k[z >> 2] | 0) + d) | 0;
          g: do
            if ((c | 0) < (h | 0))
              do {
                if ((k[(m + (c << 2)) >> 2] | 0) >= (d | 0)) break g;
                c = (c + 1) | 0;
              } while ((c | 0) < (h | 0));
          while (0);
          h: do
            if ((c | 0) < (h | 0))
              do {
                d = k[(m + (c << 2)) >> 2] | 0;
                if ((d | 0) >= (j | 0)) break h;
                g = +p[(l + (c << 3)) >> 3];
                d = (d - (k[r >> 2] | 0)) | 0;
                e = k[B >> 2] | 0;
                b = (e + (n << 2)) | 0;
                f = k[b >> 2] | 0;
                if ((f | 0) != (k[A >> 2] | 0)) {
                  c = 57;
                  break f;
                }
                if ((f | 0) != (k[(e + (o << 2)) >> 2] | 0) ? (k[((k[q >> 2] | 0) + ((f + -1) << 2)) >> 2] | 0) >= (d | 0) : 0) {
                  c = 60;
                  break f;
                }
                k[b >> 2] = f + 1;
                e = k[A >> 2] | 0;
                Eg(s, (e + 1) | 0, 1.0);
                b = k[s >> 2] | 0;
                p[(b + (e << 3)) >> 3] = 0.0;
                k[((k[q >> 2] | 0) + (e << 2)) >> 2] = d;
                p[(b + (f << 3)) >> 3] = g;
                c = (c + 1) | 0;
              } while ((c | 0) < (h | 0));
          while (0);
          if ((n | 0) >= (H | 0)) break e;
        }
        if ((c | 0) == 45) Oa(16047, 15958, 414, 16152);
        else if ((c | 0) == 47) Oa(16161, 15958, 415, 16152);
        else if ((c | 0) == 57) Oa(16249, 15958, 392, 16348);
        else if ((c | 0) == 60) Oa(16371, 15958, 393, 16348);
      }
    while (0);
    if ((k[(G + 16) >> 2] | 0) == 0 ? ((F = k[A >> 2] | 0), (C = k[D >> 2] | 0), (C | 0) > -1) : 0) {
      e = k[B >> 2] | 0;
      c = C;
      while (1) {
        if (k[(e + (c << 2)) >> 2] | 0) break;
        d = (c + -1) | 0;
        if ((c | 0) > 0) c = d;
        else {
          c = d;
          break;
        }
      }
      if ((c | 0) < (C | 0))
        do {
          c = (c + 1) | 0;
          k[(e + (c << 2)) >> 2] = F;
        } while ((c | 0) < (k[D >> 2] | 0));
    }
    i[G >> 0] = 1;
    Ag(a, G) | 0;
    Pq(k[B >> 2] | 0);
    Pq(k[E >> 2] | 0);
    c = k[(G + 20) >> 2] | 0;
    if (c | 0) FA(c);
    c = k[(G + 24) >> 2] | 0;
    if (c | 0) FA(c);
    u = I;
    return;
  }
  function _g(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0;
    i = u;
    u = (u + 704) | 0;
    h = i;
    g = k[a >> 2] | 0;
    j = k[(a + 4) >> 2] | 0;
    a = (b + (j >> 1)) | 0;
    if (j & 1) g = k[((k[a >> 2] | 0) + g) >> 2] | 0;
    Tc[g & 15](h, a, c, d, e, f);
    a = CA(704) | 0;
    Tg(a, h);
    Pq(k[(h + 676) >> 2] | 0);
    Pq(k[(h + 680) >> 2] | 0);
    g = k[(h + 684) >> 2] | 0;
    if (g | 0) FA(g);
    g = k[(h + 688) >> 2] | 0;
    if (g | 0) FA(g);
    sg((h + 456) | 0);
    tg((h + 136) | 0);
    vg((h + 8) | 0);
    u = i;
    return a | 0;
  }
  function $g(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    g = (a + 4) | 0;
    d = k[g >> 2] | 0;
    h = (a + 8) | 0;
    c = k[h >> 2] | 0;
    if ((c | d | 0) <= -1) Oa(11919, 12068, 74, 12145);
    c = aa(c, d) | 0;
    if ((c | 0) > 0) {
      iF(k[a >> 2] | 0, 0, (c << 3) | 0) | 0;
      d = k[g >> 2] | 0;
    }
    c = k[(b + 8) >> 2] | 0;
    f = (b + 4) | 0;
    e = k[f >> 2] | 0;
    if (!((d | 0) == (c | 0) ? (k[h >> 2] | 0) == (e | 0) : 0)) {
      mf(a, c, e);
      if ((k[g >> 2] | 0) == (c | 0) ? (k[h >> 2] | 0) == (e | 0) : 0) m = c;
      else Oa(12160, 12207, 721, 12285);
    } else m = d;
    l = k[a >> 2] | 0;
    h = k[f >> 2] | 0;
    if ((h | 0) <= 0) return;
    a = k[(b + 20) >> 2] | 0;
    i = k[(b + 24) >> 2] | 0;
    j = k[(b + 12) >> 2] | 0;
    e = k[(b + 16) >> 2] | 0;
    if (e | 0) {
      d = 0;
      do {
        c = k[(j + (d << 2)) >> 2] | 0;
        b = k[(e + (d << 2)) >> 2] | 0;
        f = (b + c) | 0;
        if ((b | 0) > 0) {
          g = aa(d, m) | 0;
          do {
            p[(l + (((k[(i + (c << 2)) >> 2] | 0) + g) << 3)) >> 3] = +p[(a + (c << 3)) >> 3];
            c = (c + 1) | 0;
          } while ((c | 0) < (f | 0));
        }
        d = (d + 1) | 0;
      } while ((d | 0) != (h | 0));
      return;
    }
    f = 0;
    g = k[j >> 2] | 0;
    do {
      c = f;
      f = (f + 1) | 0;
      d = g;
      g = k[(j + (f << 2)) >> 2] | 0;
      if ((d | 0) < (g | 0)) {
        e = aa(c, m) | 0;
        c = d;
        do {
          p[(l + (((k[(i + (c << 2)) >> 2] | 0) + e) << 3)) >> 3] = +p[(a + (c << 3)) >> 3];
          c = (c + 1) | 0;
        } while ((c | 0) != (g | 0));
      }
    } while ((f | 0) != (h | 0));
    return;
  }
  function ah(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    e = u;
    u = (u + 16) | 0;
    d = e;
    c = k[a >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    a = (b + (f >> 1)) | 0;
    if (f & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    Nc[c & 63](d, a);
    a = sf(d) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
      u = e;
      return a | 0;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = e;
    return a | 0;
  }
  function bh(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (d & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    return Pc[c & 127](a) | 0;
  }
  function ch(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (d & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    return Pc[c & 127](a) | 0;
  }
  function dh(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    c = k[a >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    a = (b + (d >> 1)) | 0;
    if (d & 1) c = k[((k[a >> 2] | 0) + c) >> 2] | 0;
    return Pc[c & 127](a) | 0;
  }
  function eh(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = +c;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    f = u;
    u = (u + 16) | 0;
    e = f;
    d = k[a >> 2] | 0;
    g = k[(a + 4) >> 2] | 0;
    a = (b + (g >> 1)) | 0;
    if (g & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    p[e >> 3] = c;
    Nc[d & 63](a, e);
    u = f;
    return;
  }
  function fh(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    if (
      i[b >> 0] | 0
        ? ((c = k[(b + 8) >> 2] | 0), Dg(a, k[(c + 8) >> 2] | 0, k[(c + 4) >> 2] | 0), (c = (a + 16) | 0), (d = k[c >> 2] | 0), d | 0)
        : 0
    ) {
      Pq(d);
      k[c >> 2] = 0;
    }
    gh(a, b);
    return a | 0;
  }
  function gh(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0.0,
      Q = 0,
      R = 0.0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0;
    X = u;
    u = (u + 48) | 0;
    U = X;
    d = k[(b + 4) >> 2] | 0;
    c = (b + 8) | 0;
    e = k[c >> 2] | 0;
    W = k[(e + 4) >> 2] | 0;
    if (i[b >> 0] | 0) {
      Dg(a, k[(e + 8) >> 2] | 0, W);
      J = (a + 28) | 0;
      k[J >> 2] = 0;
      K = (a + 12) | 0;
      M = (a + 4) | 0;
      iF(k[K >> 2] | 0, 0, ((k[M >> 2] << 2) + 4) | 0) | 0;
      b = k[(a + 16) >> 2] | 0;
      if (b | 0) iF(b | 0, 0, (k[M >> 2] << 2) | 0) | 0;
      U = k[c >> 2] | 0;
      V = k[(U + 8) >> 2] | 0;
      U = k[(U + 4) >> 2] | 0;
      Gg(a, ((V | 0) < (U | 0) ? U : V) << 1);
      a: do
        if ((W | 0) > 0) {
          F = d;
          C = (F + 20) | 0;
          D = (F + 24) | 0;
          E = (F + 12) | 0;
          F = (F + 16) | 0;
          G = (e + 20) | 0;
          H = (e + 24) | 0;
          I = (e + 12) | 0;
          A = (e + 16) | 0;
          B = (a + 20) | 0;
          z = (a + 24) | 0;
          x = 0;
          b: while (1) {
            b = k[K >> 2] | 0;
            c = k[(b + (x << 2)) >> 2] | 0;
            if ((c | 0) != (k[J >> 2] | 0)) {
              V = 15;
              break;
            }
            y = x;
            x = (x + 1) | 0;
            b = (b + (x << 2)) | 0;
            if (k[b >> 2] | 0) {
              V = 17;
              break;
            }
            k[b >> 2] = c;
            m = k[C >> 2] | 0;
            h = k[D >> 2] | 0;
            b = k[E >> 2] | 0;
            j = k[(b + (y << 2)) >> 2] | 0;
            c = k[F >> 2] | 0;
            if (!c) w = k[(b + (x << 2)) >> 2] | 0;
            else w = ((k[(c + (y << 2)) >> 2] | 0) + j) | 0;
            l = k[G >> 2] | 0;
            f = k[H >> 2] | 0;
            b = k[I >> 2] | 0;
            e = k[(b + (y << 2)) >> 2] | 0;
            c = k[A >> 2] | 0;
            if (!c) v = k[(b + (x << 2)) >> 2] | 0;
            else v = ((k[(c + (y << 2)) >> 2] | 0) + e) | 0;
            d = (j | 0) < (w | 0);
            c: do
              if (d) {
                c = k[(h + (j << 2)) >> 2] | 0;
                do
                  if ((e | 0) < (v | 0)) {
                    b = k[(f + (e << 2)) >> 2] | 0;
                    if ((c | 0) != (b | 0))
                      if ((c | 0) < (b | 0)) break;
                      else {
                        V = 30;
                        break c;
                      }
                    else {
                      N = (j + 1) | 0;
                      O = (e + 1) | 0;
                      P = +p[(m + (j << 3)) >> 3] + +p[(l + (e << 3)) >> 3];
                      L = c;
                      V = 35;
                      break c;
                    }
                  }
                while (0);
                N = (j + 1) | 0;
                O = e;
                P = +p[(m + (j << 3)) >> 3] + 0.0;
                L = c;
                V = 35;
              } else V = 30;
            while (0);
            do
              if ((V | 0) == 30 ? ((V = 0), (e | 0) < (v | 0)) : 0) {
                if (d) {
                  b = k[(f + (e << 2)) >> 2] | 0;
                  if ((k[(h + (j << 2)) >> 2] | 0) <= (b | 0)) break;
                } else b = k[(f + (e << 2)) >> 2] | 0;
                N = j;
                O = (e + 1) | 0;
                P = +p[(l + (e << 3)) >> 3] + 0.0;
                L = b;
                V = 35;
              }
            while (0);
            d: do
              if ((V | 0) == 35 ? (0, (L | 0) > -1) : 0) {
                t = h;
                s = m;
                r = N;
                b = O;
                g = P;
                c = L;
                e: while (1) {
                  n = (r | 0) < (w | 0);
                  o = (t + (r << 2)) | 0;
                  q = b;
                  b = c;
                  while (1) {
                    j = (q | 0) < (v | 0);
                    m = (f + (q << 2)) | 0;
                    c = k[K >> 2] | 0;
                    d = (c + (x << 2)) | 0;
                    e = k[d >> 2] | 0;
                    h = (e | 0) == (k[J >> 2] | 0);
                    if (n) {
                      if (!h) {
                        V = 52;
                        break b;
                      }
                      if ((e | 0) != (k[(c + (y << 2)) >> 2] | 0) ? (k[((k[z >> 2] | 0) + ((e + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                        V = 55;
                        break b;
                      }
                      k[d >> 2] = e + 1;
                      V = k[J >> 2] | 0;
                      Eg(B, (V + 1) | 0, 1.0);
                      c = k[B >> 2] | 0;
                      p[(c + (V << 3)) >> 3] = 0.0;
                      k[((k[z >> 2] | 0) + (V << 2)) >> 2] = b;
                      p[(c + (e << 3)) >> 3] = g;
                      c = k[o >> 2] | 0;
                      if (!j) {
                        V = 59;
                        break;
                      }
                      b = k[m >> 2] | 0;
                      if ((c | 0) == (b | 0)) {
                        V = 57;
                        break;
                      }
                      if ((c | 0) < (b | 0)) {
                        V = 59;
                        break;
                      }
                      if ((c | 0) <= (b | 0)) break d;
                    } else {
                      if (!j) break e;
                      if (!h) {
                        V = 52;
                        break b;
                      }
                      if ((e | 0) != (k[(c + (y << 2)) >> 2] | 0) ? (k[((k[z >> 2] | 0) + ((e + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                        V = 55;
                        break b;
                      }
                      k[d >> 2] = e + 1;
                      U = k[J >> 2] | 0;
                      Eg(B, (U + 1) | 0, 1.0);
                      V = k[B >> 2] | 0;
                      p[(V + (U << 3)) >> 3] = 0.0;
                      k[((k[z >> 2] | 0) + (U << 2)) >> 2] = b;
                      p[(V + (e << 3)) >> 3] = g;
                      b = k[m >> 2] | 0;
                    }
                    g = +p[(l + (q << 3)) >> 3] + 0.0;
                    if ((b | 0) > -1) q = (q + 1) | 0;
                    else break d;
                  }
                  if ((V | 0) == 57) {
                    b = (q + 1) | 0;
                    g = +p[(s + (r << 3)) >> 3] + +p[(l + (q << 3)) >> 3];
                  } else if ((V | 0) == 59) {
                    b = q;
                    g = +p[(s + (r << 3)) >> 3] + 0.0;
                  }
                  if ((c | 0) > -1) r = (r + 1) | 0;
                  else break d;
                }
                if (!h) {
                  V = 52;
                  break b;
                }
                if ((e | 0) != (k[(c + (y << 2)) >> 2] | 0) ? (k[((k[z >> 2] | 0) + ((e + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                  V = 55;
                  break b;
                }
                k[d >> 2] = e + 1;
                U = k[J >> 2] | 0;
                Eg(B, (U + 1) | 0, 1.0);
                V = k[B >> 2] | 0;
                p[(V + (U << 3)) >> 3] = 0.0;
                k[((k[z >> 2] | 0) + (U << 2)) >> 2] = b;
                p[(V + (e << 3)) >> 3] = g;
              }
            while (0);
            if ((x | 0) >= (W | 0)) break a;
          }
          if ((V | 0) == 15) Oa(16047, 15958, 414, 16152);
          else if ((V | 0) == 17) Oa(16161, 15958, 415, 16152);
          else if ((V | 0) == 52) Oa(16249, 15958, 392, 16348);
          else if ((V | 0) == 55) Oa(16371, 15958, 393, 16348);
        }
      while (0);
      if (k[(a + 16) >> 2] | 0) {
        u = X;
        return;
      }
      f = k[J >> 2] | 0;
      d = k[M >> 2] | 0;
      if ((d | 0) <= -1) {
        u = X;
        return;
      }
      e = k[K >> 2] | 0;
      b = d;
      while (1) {
        if (k[(e + (b << 2)) >> 2] | 0) break;
        c = (b + -1) | 0;
        if ((b | 0) > 0) b = c;
        else {
          b = c;
          break;
        }
      }
      if ((b | 0) >= (d | 0)) {
        u = X;
        return;
      }
      do {
        b = (b + 1) | 0;
        k[(e + (b << 2)) >> 2] = f;
      } while ((b | 0) < (k[M >> 2] | 0));
      u = X;
      return;
    }
    I = k[(e + 8) >> 2] | 0;
    i[U >> 0] = 0;
    L = (U + 4) | 0;
    k[L >> 2] = 0;
    k[(L + 4) >> 2] = 0;
    k[(L + 8) >> 2] = 0;
    k[(L + 12) >> 2] = 0;
    k[(L + 16) >> 2] = 0;
    k[(L + 20) >> 2] = 0;
    k[(L + 24) >> 2] = 0;
    k[(L + 28) >> 2] = 0;
    k[(U + 8) >> 2] = I;
    I = (U + 28) | 0;
    k[I >> 2] = 0;
    b = Oq(((W << 2) + 4) | 0) | 0;
    k[(U + 12) >> 2] = b;
    if (!b) {
      X = Kb(4) | 0;
      cF(X);
      Cc(X | 0, 2032, 79);
    }
    k[L >> 2] = W;
    N = (U + 16) | 0;
    O = k[c >> 2] | 0;
    K = (U + 12) | 0;
    iF(b | 0, 0, ((W << 2) + 4) | 0) | 0;
    V = k[(O + 8) >> 2] | 0;
    O = k[(O + 4) >> 2] | 0;
    Gg(U, ((V | 0) < (O | 0) ? O : V) << 1);
    f: do
      if ((W | 0) > 0) {
        E = d;
        B = (E + 20) | 0;
        C = (E + 24) | 0;
        D = (E + 12) | 0;
        E = (E + 16) | 0;
        F = (e + 20) | 0;
        G = (e + 24) | 0;
        H = (e + 12) | 0;
        z = (e + 16) | 0;
        A = (U + 20) | 0;
        y = (U + 24) | 0;
        w = 0;
        g: while (1) {
          b = k[K >> 2] | 0;
          c = k[(b + (w << 2)) >> 2] | 0;
          if ((c | 0) != (k[I >> 2] | 0)) {
            V = 74;
            break;
          }
          x = w;
          w = (w + 1) | 0;
          b = (b + (w << 2)) | 0;
          if (k[b >> 2] | 0) {
            V = 76;
            break;
          }
          k[b >> 2] = c;
          m = k[B >> 2] | 0;
          h = k[C >> 2] | 0;
          b = k[D >> 2] | 0;
          j = k[(b + (x << 2)) >> 2] | 0;
          c = k[E >> 2] | 0;
          if (!c) v = k[(b + (w << 2)) >> 2] | 0;
          else v = ((k[(c + (x << 2)) >> 2] | 0) + j) | 0;
          l = k[F >> 2] | 0;
          f = k[G >> 2] | 0;
          b = k[H >> 2] | 0;
          e = k[(b + (x << 2)) >> 2] | 0;
          c = k[z >> 2] | 0;
          if (!c) t = k[(b + (w << 2)) >> 2] | 0;
          else t = ((k[(c + (x << 2)) >> 2] | 0) + e) | 0;
          d = (j | 0) < (v | 0);
          h: do
            if (d) {
              b = k[(h + (j << 2)) >> 2] | 0;
              do
                if ((e | 0) < (t | 0)) {
                  c = k[(f + (e << 2)) >> 2] | 0;
                  if ((b | 0) != (c | 0))
                    if ((b | 0) < (c | 0)) break;
                    else {
                      V = 89;
                      break h;
                    }
                  else {
                    M = (j + 1) | 0;
                    Q = (e + 1) | 0;
                    R = +p[(m + (j << 3)) >> 3] + +p[(l + (e << 3)) >> 3];
                    J = b;
                    V = 94;
                    break h;
                  }
                }
              while (0);
              M = (j + 1) | 0;
              Q = e;
              R = +p[(m + (j << 3)) >> 3] + 0.0;
              J = b;
              V = 94;
            } else V = 89;
          while (0);
          do
            if ((V | 0) == 89 ? ((V = 0), (e | 0) < (t | 0)) : 0) {
              if (d) {
                b = k[(f + (e << 2)) >> 2] | 0;
                if ((k[(h + (j << 2)) >> 2] | 0) <= (b | 0)) break;
              } else b = k[(f + (e << 2)) >> 2] | 0;
              M = j;
              Q = (e + 1) | 0;
              R = +p[(l + (e << 3)) >> 3] + 0.0;
              J = b;
              V = 94;
            }
          while (0);
          i: do
            if ((V | 0) == 94 ? (0, (J | 0) > -1) : 0) {
              s = l;
              c = M;
              r = Q;
              g = R;
              b = J;
              while (1) {
                n = (r | 0) < (t | 0);
                o = (f + (r << 2)) | 0;
                q = c;
                while (1) {
                  c = (h + (q << 2)) | 0;
                  d = k[K >> 2] | 0;
                  e = (d + (w << 2)) | 0;
                  j = k[e >> 2] | 0;
                  l = (j | 0) == (k[I >> 2] | 0);
                  if ((q | 0) >= (v | 0)) {
                    V = 105;
                    break;
                  }
                  if (!l) {
                    V = 111;
                    break g;
                  }
                  if ((j | 0) != (k[(d + (x << 2)) >> 2] | 0) ? (k[((k[y >> 2] | 0) + ((j + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                    V = 114;
                    break g;
                  }
                  k[e >> 2] = j + 1;
                  O = k[I >> 2] | 0;
                  Eg(A, (O + 1) | 0, 1.0);
                  V = k[A >> 2] | 0;
                  p[(V + (O << 3)) >> 3] = 0.0;
                  k[((k[y >> 2] | 0) + (O << 2)) >> 2] = b;
                  p[(V + (j << 3)) >> 3] = g;
                  b = k[c >> 2] | 0;
                  if (n) {
                    c = k[o >> 2] | 0;
                    if ((b | 0) == (c | 0)) {
                      V = 116;
                      break;
                    }
                    if ((b | 0) >= (c | 0)) {
                      V = 104;
                      break;
                    }
                  }
                  g = +p[(m + (q << 3)) >> 3] + 0.0;
                  if ((b | 0) > -1) q = (q + 1) | 0;
                  else break i;
                }
                if ((V | 0) == 104)
                  if ((b | 0) > (c | 0)) {
                    b = c;
                    V = 119;
                  } else break i;
                else if ((V | 0) == 105) {
                  if (!n) break;
                  if (!l) {
                    V = 111;
                    break g;
                  }
                  if ((j | 0) != (k[(d + (x << 2)) >> 2] | 0) ? (k[((k[y >> 2] | 0) + ((j + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                    V = 114;
                    break g;
                  }
                  k[e >> 2] = j + 1;
                  O = k[I >> 2] | 0;
                  Eg(A, (O + 1) | 0, 1.0);
                  V = k[A >> 2] | 0;
                  p[(V + (O << 3)) >> 3] = 0.0;
                  k[((k[y >> 2] | 0) + (O << 2)) >> 2] = b;
                  p[(V + (j << 3)) >> 3] = g;
                  b = k[o >> 2] | 0;
                  V = 119;
                } else if ((V | 0) == 116) {
                  V = 0;
                  c = (q + 1) | 0;
                  g = +p[(m + (q << 3)) >> 3] + +p[(s + (r << 3)) >> 3];
                }
                if ((V | 0) == 119) {
                  c = q;
                  g = +p[(s + (r << 3)) >> 3] + 0.0;
                }
                if ((b | 0) > -1) r = (r + 1) | 0;
                else break i;
              }
              if (!l) {
                V = 111;
                break g;
              }
              if ((j | 0) != (k[(d + (x << 2)) >> 2] | 0) ? (k[((k[y >> 2] | 0) + ((j + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                V = 114;
                break g;
              }
              k[e >> 2] = j + 1;
              O = k[I >> 2] | 0;
              Eg(A, (O + 1) | 0, 1.0);
              V = k[A >> 2] | 0;
              p[(V + (O << 3)) >> 3] = 0.0;
              k[((k[y >> 2] | 0) + (O << 2)) >> 2] = b;
              p[(V + (j << 3)) >> 3] = g;
            }
          while (0);
          if ((w | 0) >= (W | 0)) break f;
        }
        if ((V | 0) == 74) Oa(16047, 15958, 414, 16152);
        else if ((V | 0) == 76) Oa(16161, 15958, 415, 16152);
        else if ((V | 0) == 111) Oa(16249, 15958, 392, 16348);
        else if ((V | 0) == 114) Oa(16371, 15958, 393, 16348);
      }
    while (0);
    if ((k[(U + 16) >> 2] | 0) == 0 ? ((T = k[I >> 2] | 0), (S = k[L >> 2] | 0), (S | 0) > -1) : 0) {
      d = k[K >> 2] | 0;
      b = S;
      while (1) {
        if (k[(d + (b << 2)) >> 2] | 0) break;
        c = (b + -1) | 0;
        if ((b | 0) > 0) b = c;
        else {
          b = c;
          break;
        }
      }
      if ((b | 0) < (S | 0))
        do {
          b = (b + 1) | 0;
          k[(d + (b << 2)) >> 2] = T;
        } while ((b | 0) < (k[L >> 2] | 0));
    }
    i[U >> 0] = 1;
    Ag(a, U) | 0;
    Pq(k[K >> 2] | 0);
    Pq(k[N >> 2] | 0);
    b = k[(U + 20) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(U + 24) >> 2] | 0;
    if (b | 0) FA(b);
    u = X;
    return;
  }
  function hh(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0;
    d = k[a >> 2] | 0;
    e = k[(a + 4) >> 2] | 0;
    a = (b + (e >> 1)) | 0;
    if (!(e & 1)) {
      e = d;
      Nc[e & 63](a, c);
      return;
    } else {
      e = k[((k[a >> 2] | 0) + d) >> 2] | 0;
      Nc[e & 63](a, c);
      return;
    }
  }
  function ih(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    if (
      i[b >> 0] | 0
        ? ((c = k[(b + 8) >> 2] | 0), Dg(a, k[(c + 8) >> 2] | 0, k[(c + 4) >> 2] | 0), (c = (a + 16) | 0), (d = k[c >> 2] | 0), d | 0)
        : 0
    ) {
      Pq(d);
      k[c >> 2] = 0;
    }
    jh(a, b);
    return a | 0;
  }
  function pi(a, b, c, d, e, f, g, h, i, j, l, m, n, o) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    l = l | 0;
    m = m | 0;
    n = n | 0;
    o = o | 0;
    var p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0;
    J = u;
    u = (u + 48) | 0;
    C = (J + 44) | 0;
    F = (J + 40) | 0;
    w = (J + 24) | 0;
    x = J;
    y = (J + 12) | 0;
    if ((c | 0) <= -1) Oa(16605, 15693, 425, 29764);
    G = (o + 12) | 0;
    q = k[G >> 2] | 0;
    if ((q | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
    z = (o + 8) | 0;
    k[C >> 2] = k[((k[z >> 2] | 0) + (c << 2)) >> 2];
    H = (o + 44) | 0;
    if ((k[H >> 2] | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
    I = (o + 40) | 0;
    k[F >> 2] = k[((k[I >> 2] | 0) + (c << 2)) >> 2];
    r = b << 1;
    A = ((k[l >> 2] | 0) + (r << 2)) | 0;
    if (!(((b | 0) > -1) | ((A | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((r | b | 0) < 0 ? 1 : (((k[(l + 4) >> 2] | 0) - b) | 0) < (r | 0)) Oa(14177, 13744, 147, 13812);
    k[w >> 2] = c;
    k[(w + 4) >> 2] = C;
    k[(w + 8) >> 2] = o;
    k[(w + 12) >> 2] = a;
    do
      if ((b | 0) > 0) {
        q = (g + 4) | 0;
        r = (o + 24) | 0;
        s = (y + 4) | 0;
        l = 0;
        while (1) {
          if ((k[q >> 2] | 0) <= (l | 0)) {
            B = 13;
            break;
          }
          t = ((k[g >> 2] | 0) + (l << 2)) | 0;
          v = k[t >> 2] | 0;
          if ((v | 0) == -1) {
            B = 15;
            break;
          }
          k[t >> 2] = -1;
          if (!(((v | 0) > -1) & ((v | 0) < (b | 0)))) {
            B = 20;
            break;
          }
          if ((k[(A + (v << 2)) >> 2] | 0) != (c | 0)) {
            K = i;
            t = k[(K + 4) >> 2] | 0;
            B = x;
            k[B >> 2] = k[K >> 2];
            k[(B + 4) >> 2] = t;
            k[y >> 2] = A;
            k[s >> 2] = b;
            Pi(a, c, d, f, r, h, x, j, y, m, n, o, F, v, w);
          }
          l = (l + 1) | 0;
          if ((l | 0) >= (b | 0)) {
            B = 15;
            break;
          }
        }
        if ((B | 0) == 13) Oa(16605, 15693, 408, 29907);
        else if ((B | 0) == 15) {
          p = k[G >> 2] | 0;
          break;
        } else if ((B | 0) == 20) Oa(16605, 15693, 425, 29764);
      } else p = q;
    while (0);
    if ((p | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
    n = k[z >> 2] | 0;
    m = k[(n + (c << 2)) >> 2] | 0;
    w = (c + 1) | 0;
    a = (c + -1) | 0;
    do
      if (!c) {
        q = 0;
        l = 0;
        B = 51;
      } else {
        if ((m | 0) <= -1) Oa(16605, 15693, 425, 29764);
        if ((k[(o + 4) >> 2] | 0) <= (m | 0)) Oa(16605, 15693, 425, 29764);
        l = k[((k[o >> 2] | 0) + (m << 2)) >> 2] | 0;
        r = k[H >> 2] | 0;
        if ((r | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
        s = k[I >> 2] | 0;
        b = (s + (c << 2)) | 0;
        t = k[b >> 2] | 0;
        if (!(((c | 0) > 0) & ((r | 0) >= (c | 0)))) Oa(16605, 15693, 425, 29764);
        v = (s + (a << 2)) | 0;
        q = k[v >> 2] | 0;
        if (!(((c - l) | 0) >= (e | 0) ? 1 : (((k[F >> 2] | 0) - t) | 0) != ((t + -1 - q) | 0))) {
          if ((k[C >> 2] | 0) != -1) {
            E = m;
            break;
          }
        } else k[C >> 2] = -1;
        if ((l | 0) >= ((c + -2) | 0)) {
          q = c;
          l = (m + 1) | 0;
          B = 51;
          break;
        }
        p = (l + 1) | 0;
        if (!(((l | 0) > -2) & ((r | 0) > (p | 0)))) Oa(16605, 15693, 425, 29764);
        l = k[(s + (p << 2)) >> 2] | 0;
        k[v >> 2] = l;
        p = (t - q + l) | 0;
        if ((k[(j + 4) >> 2] | 0) < (c | 0)) Oa(16605, 15693, 425, 29764);
        k[((k[j >> 2] | 0) + (a << 2)) >> 2] = p;
        if ((k[H >> 2] | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
        k[b >> 2] = p;
        a: do
          if ((q | 0) < (k[F >> 2] | 0)) {
            r = (o + 28) | 0;
            s = k[(o + 24) >> 2] | 0;
            t = (q | 0) > -1;
            v = (l | 0) > -1;
            p = l;
            while (1) {
              if (!t) {
                B = 46;
                break;
              }
              l = k[r >> 2] | 0;
              if ((l | 0) <= (q | 0)) {
                B = 46;
                break;
              }
              if (!(v & ((l | 0) > (p | 0)))) {
                B = 48;
                break;
              }
              k[(s + (p << 2)) >> 2] = k[(s + (q << 2)) >> 2];
              q = (q + 1) | 0;
              p = (p + 1) | 0;
              if ((q | 0) >= (k[F >> 2] | 0)) {
                D = p;
                break a;
              }
            }
            if ((B | 0) == 46) Oa(16605, 15693, 425, 29764);
            else if ((B | 0) == 48) Oa(16605, 15693, 425, 29764);
          } else D = l;
        while (0);
        k[F >> 2] = D;
        q = c;
        l = (m + 1) | 0;
        p = k[G >> 2] | 0;
        B = 51;
      }
    while (0);
    if ((B | 0) == 51) {
      if ((p | 0) <= (q | 0)) Oa(16605, 15693, 425, 29764);
      k[(n + (q << 2)) >> 2] = l;
      if ((l | 0) > -2) E = l;
      else Oa(16605, 15693, 425, 29764);
    }
    p = (E + 1) | 0;
    if ((k[(o + 4) >> 2] | 0) <= (p | 0)) Oa(16605, 15693, 425, 29764);
    k[((k[o >> 2] | 0) + (p << 2)) >> 2] = w;
    if (!((c | 0) > -2 ? (k[G >> 2] | 0) > (w | 0) : 0)) Oa(16605, 15693, 425, 29764);
    k[(n + (w << 2)) >> 2] = E;
    if ((k[(j + 4) >> 2] | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
    k[((k[j >> 2] | 0) + (c << 2)) >> 2] = k[F >> 2];
    if ((k[H >> 2] | 0) > (w | 0)) {
      k[((k[I >> 2] | 0) + (w << 2)) >> 2] = k[F >> 2];
      u = J;
      return 0;
    } else Oa(16605, 15693, 425, 29764);
    return 0;
  }
  function qi(a, b, c, d, e, f, g, h, i) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    var j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0;
    W = u;
    u = (u + 80) | 0;
    V = (W + 64) | 0;
    T = (W + 56) | 0;
    S = (W + 48) | 0;
    U = W;
    R = (W + 28) | 0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    C = (i + 12) | 0;
    if ((k[C >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    D = (i + 8) | 0;
    N = k[((k[D >> 2] | 0) + (b << 2)) >> 2] | 0;
    a: do
      if ((c | 0) > 0) {
        E = (f + 4) | 0;
        F = (i + 4) | 0;
        G = (i + 36) | 0;
        H = (i + 32) | 0;
        I = (i + 44) | 0;
        J = (i + 40) | 0;
        K = (g + 4) | 0;
        L = (i + 16) | 0;
        M = (i + 24) | 0;
        A = c;
        B = 0;
        b: while (1) {
          if ((A | 0) <= 0) {
            O = 9;
            break;
          }
          if ((k[E >> 2] | 0) < (A | 0)) {
            O = 9;
            break;
          }
          A = (A + -1) | 0;
          q = k[((k[f >> 2] | 0) + (A << 2)) >> 2] | 0;
          if (!((q | 0) > -1 ? (k[C >> 2] | 0) > (q | 0) : 0)) {
            O = 11;
            break;
          }
          j = k[((k[D >> 2] | 0) + (q << 2)) >> 2] | 0;
          do
            if ((N | 0) != (j | 0)) {
              if (!((j | 0) > -1 ? (k[F >> 2] | 0) > (j | 0) : 0)) {
                O = 14;
                break b;
              }
              j = k[((k[i >> 2] | 0) + (j << 2)) >> 2] | 0;
              w = (j | 0) < (h | 0) ? h : j;
              l = (w - j) | 0;
              r = k[G >> 2] | 0;
              if (!(((w | 0) > -1) & ((r | 0) > (w | 0)))) {
                O = 16;
                break b;
              }
              s = k[H >> 2] | 0;
              t = (s + (w << 2)) | 0;
              k[S >> 2] = (k[t >> 2] | 0) + l;
              if ((j | 0) <= -1) {
                O = 19;
                break b;
              }
              m = k[I >> 2] | 0;
              if ((m | 0) <= (j | 0)) {
                O = 19;
                break b;
              }
              n = k[J >> 2] | 0;
              o = k[(n + (j << 2)) >> 2] | 0;
              x = (o + l) | 0;
              if ((k[K >> 2] | 0) <= (q | 0)) {
                O = 21;
                break b;
              }
              v = k[((k[g >> 2] | 0) + (q << 2)) >> 2] | 0;
              v = (v | 0) < (h | 0) ? h : v;
              y = (q - v) | 0;
              z = (y + 1) | 0;
              j = (j + 1) | 0;
              if ((m | 0) <= (j | 0)) {
                O = 23;
                break b;
              }
              m = (w + ~q - l - o + (k[(n + (j << 2)) >> 2] | 0)) | 0;
              j = (w + 1) | 0;
              if ((r | 0) <= (j | 0)) {
                O = 25;
                break b;
              }
              l = ((k[(s + (j << 2)) >> 2] | 0) - (k[t >> 2] | 0)) | 0;
              j = (v - w) | 0;
              if (!y) {
                Qi(z, d, e, L, S, l, m, M, x, j);
                break;
              } else {
                Ri(z, d, e, L, S, l, m, M, x, j);
                break;
              }
            }
          while (0);
          B = (B + 1) | 0;
          if ((B | 0) >= (c | 0)) {
            Q = G;
            break a;
          }
        }
        if ((O | 0) == 9) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 11) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 14) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 16) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 19) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 21) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 23) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 25) Oa(16605, 15693, 425, 29764);
      } else Q = (i + 36) | 0;
    while (0);
    if ((k[Q >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    z = (i + 32) | 0;
    w = k[((k[z >> 2] | 0) + (b << 2)) >> 2] | 0;
    if ((N | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(i + 4) >> 2] | 0) <= (N | 0)) Oa(16605, 15693, 425, 29764);
    C = k[((k[i >> 2] | 0) + (N << 2)) >> 2] | 0;
    D = (C + 1) | 0;
    if ((C | 0) <= -2) Oa(16605, 15693, 425, 29764);
    B = (i + 44) | 0;
    j = k[B >> 2] | 0;
    if ((j | 0) <= (D | 0)) Oa(16605, 15693, 425, 29764);
    o = (i + 40) | 0;
    l = k[o >> 2] | 0;
    if (!(((C | 0) > -1) & ((j | 0) > (C | 0)))) Oa(16605, 15693, 425, 29764);
    l = ((k[(l + (D << 2)) >> 2] | 0) + w - (k[(l + (C << 2)) >> 2] | 0)) | 0;
    m = (i + 52) | 0;
    E = (i + 16) | 0;
    n = (i + 88) | 0;
    while (1) {
      if ((l | 0) <= (k[m >> 2] | 0)) break;
      j = yi(a, E, m, w, 0, n) | 0;
      if (j | 0) {
        O = 86;
        break;
      }
    }
    if ((O | 0) == 86) {
      u = W;
      return j | 0;
    }
    l = k[B >> 2] | 0;
    if ((l | 0) <= (C | 0)) Oa(16605, 15693, 425, 29764);
    j = k[o >> 2] | 0;
    y = (j + (C << 2)) | 0;
    m = k[y >> 2] | 0;
    if ((l | 0) <= (D | 0)) Oa(16605, 15693, 425, 29764);
    x = (j + (D << 2)) | 0;
    q = k[x >> 2] | 0;
    r = k[(i + 28) >> 2] | 0;
    s = k[(i + 24) >> 2] | 0;
    t = (d + 4) | 0;
    c = (i + 20) | 0;
    v = k[c >> 2] | 0;
    A = k[(i + 16) >> 2] | 0;
    n = (m | 0) > -1;
    o = (w | 0) > -1;
    c: do
      if ((m | 0) < (q | 0)) {
        j = w;
        while (1) {
          if (!(n & ((r | 0) > (m | 0)))) {
            O = 53;
            break;
          }
          l = k[(s + (m << 2)) >> 2] | 0;
          if ((l | 0) <= -1) {
            O = 54;
            break;
          }
          if ((k[t >> 2] | 0) <= (l | 0)) {
            O = 54;
            break;
          }
          if (!(o & ((v | 0) > (j | 0)))) {
            O = 55;
            break;
          }
          i = ((k[d >> 2] | 0) + (l << 3)) | 0;
          p[(A + (j << 3)) >> 3] = +p[i >> 3];
          p[i >> 3] = 0.0;
          j = (j + 1) | 0;
          m = (m + 1) | 0;
          if ((m | 0) >= (q | 0)) {
            P = j;
            break c;
          }
        }
        if ((O | 0) == 53) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 54) Oa(16605, 15693, 425, 29764);
        else if ((O | 0) == 55) Oa(16605, 15693, 425, 29764);
      } else P = w;
    while (0);
    v = (b + 1) | 0;
    if (!((b | 0) > -2 ? (k[Q >> 2] | 0) > (v | 0) : 0)) Oa(16605, 15693, 425, 29764);
    q = k[z >> 2] | 0;
    s = (q + (v << 2)) | 0;
    k[s >> 2] = P;
    l = (C | 0) < (h | 0) ? h : C;
    if ((l | 0) >= (b | 0)) {
      V = 0;
      u = W;
      return V | 0;
    }
    o = (l - C) | 0;
    j = k[B >> 2] | 0;
    if ((j | 0) <= (C | 0)) Oa(16605, 15693, 425, 29764);
    m = k[Q >> 2] | 0;
    if (!(((l | 0) > -1) & ((m | 0) > (l | 0)))) Oa(16605, 15693, 425, 29764);
    n = ((k[(q + (l << 2)) >> 2] | 0) + o) | 0;
    k[S >> 2] = n;
    if ((j | 0) <= (D | 0)) Oa(16605, 15693, 425, 29764);
    t = (b - l) | 0;
    r = ((k[x >> 2] | 0) - (t + o) - (k[y >> 2] | 0)) | 0;
    if ((m | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    j = k[(q + (b << 2)) >> 2] | 0;
    q = (j + o) | 0;
    if ((m | 0) <= (v | 0)) Oa(16605, 15693, 425, 29764);
    o = ((k[s >> 2] | 0) - j) | 0;
    j = (A + (n << 3)) | 0;
    if ((o | 0) <= -1) Oa(19264, 19297, 66, 19366);
    l = (t | 0) > -1;
    if (!(l | ((j | 0) == 0))) Oa(13818, 13988, 175, 14058);
    b = (A + (q << 3)) | 0;
    k[U >> 2] = b;
    n = (U + 4) | 0;
    k[n >> 2] = t;
    if (!(l | ((b | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[(U + 12) >> 2] = E;
    k[(U + 16) >> 2] = q;
    b = k[c >> 2] | 0;
    k[(U + 24) >> 2] = b;
    if (((q | t | 0) < 0) | (((b - t) | 0) < (q | 0))) Oa(14177, 13744, 147, 13812);
    k[R >> 2] = j;
    k[(R + 4) >> 2] = t;
    k[(R + 8) >> 2] = t;
    k[(R + 12) >> 2] = o;
    k[T >> 2] = R;
    k[(T + 4) >> 2] = U;
    Si(U, T, V);
    j = k[E >> 2] | 0;
    m = (j + (((k[S >> 2] | 0) + t) << 3)) | 0;
    if (!(((r | t | 0) > -1) | ((m | 0) == 0))) Oa(13818, 13988, 175, 14058);
    l = (q + t) | 0;
    j = (j + (l << 3)) | 0;
    if (!(((r | 0) > -1) | ((j | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((l | r | 0) < 0 ? 1 : (((k[c >> 2] | 0) - r) | 0) < (l | 0)) Oa(14177, 13744, 147, 13812);
    if ((t | 0) != (k[n >> 2] | 0)) Oa(14710, 14850, 97, 14920);
    U = k[U >> 2] | 0;
    k[V >> 2] = m;
    k[(V + 4) >> 2] = o;
    k[T >> 2] = U;
    k[(T + 4) >> 2] = 1;
    Ui(r, t, V, T, j, 1, -1.0);
    V = 0;
    u = W;
    return V | 0;
  }
  function ri(a, b, c, d, e, f, g, h) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    var i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    R = (h + 12) | 0;
    if ((k[R >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    P = (h + 8) | 0;
    Q = k[((k[P >> 2] | 0) + (b << 2)) >> 2] | 0;
    S = (h + 76) | 0;
    i = k[S >> 2] | 0;
    if ((i | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    V = (h + 72) | 0;
    j = k[((k[V >> 2] | 0) + (b << 2)) >> 2] | 0;
    a: do
      if ((c | 0) > 0) {
        y = (d + 4) | 0;
        z = (e + 4) | 0;
        A = (h + 4) | 0;
        B = (h + 44) | 0;
        C = (h + 40) | 0;
        D = (h + 80) | 0;
        E = (h + 56) | 0;
        F = (h + 88) | 0;
        G = (h + 64) | 0;
        H = (h + 28) | 0;
        I = (h + 24) | 0;
        J = (f + 4) | 0;
        K = (h + 68) | 0;
        L = (h + 64) | 0;
        M = (g + 4) | 0;
        N = (h + 60) | 0;
        O = (h + 56) | 0;
        w = 0;
        x = c;
        b: while (1) {
          if ((x | 0) < 1 ? 1 : (k[y >> 2] | 0) < (x | 0)) {
            j = 9;
            break;
          }
          x = (x + -1) | 0;
          l = k[((k[d >> 2] | 0) + (x << 2)) >> 2] | 0;
          if (!((l | 0) > -1 ? (k[R >> 2] | 0) > (l | 0) : 0)) {
            j = 11;
            break;
          }
          i = k[((k[P >> 2] | 0) + (l << 2)) >> 2] | 0;
          if ((Q | 0) != (i | 0)) {
            if ((k[z >> 2] | 0) <= (l | 0)) {
              j = 14;
              break;
            }
            m = k[((k[e >> 2] | 0) + (l << 2)) >> 2] | 0;
            if ((m | 0) != -1) {
              if (!((i | 0) > -1 ? (k[A >> 2] | 0) > (i | 0) : 0)) {
                j = 17;
                break;
              }
              i = k[((k[h >> 2] | 0) + (i << 2)) >> 2] | 0;
              if (!((i | 0) > -1 ? (k[B >> 2] | 0) > (i | 0) : 0)) {
                j = 19;
                break;
              }
              u = (m - i + (k[((k[C >> 2] | 0) + (i << 2)) >> 2] | 0)) | 0;
              v = (l - m) | 0;
              l = (j + 1 + v) | 0;
              while (1) {
                if ((l | 0) <= (k[D >> 2] | 0)) break;
                i = yi(a, E, D, j, 0, F) | 0;
                if (i | 0) {
                  j = 42;
                  break b;
                }
                i = zi(a, G, D, j, 1, F) | 0;
                if (i | 0) {
                  j = 42;
                  break b;
                }
              }
              if ((v | 0) >= 0) {
                n = k[I >> 2] | 0;
                o = k[f >> 2] | 0;
                q = k[L >> 2] | 0;
                r = k[O >> 2] | 0;
                s = (u | 0) > -1;
                t = (j | 0) > -1;
                m = 0;
                l = u;
                i = j;
                while (1) {
                  if (!(s & ((k[H >> 2] | 0) > (l | 0)))) {
                    j = 27;
                    break b;
                  }
                  j = k[(n + (l << 2)) >> 2] | 0;
                  if (!((j | 0) > -1 ? (k[J >> 2] | 0) > (j | 0) : 0)) {
                    j = 29;
                    break b;
                  }
                  if (!(t & ((k[K >> 2] | 0) > (i | 0)))) {
                    j = 31;
                    break b;
                  }
                  k[(q + (i << 2)) >> 2] = k[(o + (j << 2)) >> 2];
                  if ((k[M >> 2] | 0) <= (j | 0)) {
                    j = 33;
                    break b;
                  }
                  if ((k[N >> 2] | 0) <= (i | 0)) {
                    j = 35;
                    break b;
                  }
                  u = ((k[g >> 2] | 0) + (j << 3)) | 0;
                  p[(r + (i << 3)) >> 3] = +p[u >> 3];
                  p[u >> 3] = 0.0;
                  i = (i + 1) | 0;
                  if ((m | 0) < (v | 0)) {
                    m = (m + 1) | 0;
                    l = (l + 1) | 0;
                  } else break;
                }
              } else i = j;
            } else i = j;
          } else i = j;
          w = (w + 1) | 0;
          if ((w | 0) >= (c | 0)) {
            j = 38;
            break;
          } else j = i;
        }
        switch (j | 0) {
          case 9: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 11: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 14: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 17: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 19: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 27: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 29: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 31: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 33: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 35: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 38: {
            T = i;
            U = k[S >> 2] | 0;
            break a;
          }
          case 42:
            return i | 0;
        }
      } else {
        T = j;
        U = i;
      }
    while (0);
    i = (b + 1) | 0;
    if (!(((b | 0) > -2) & ((U | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    k[((k[V >> 2] | 0) + (i << 2)) >> 2] = T;
    V = 0;
    return V | 0;
  }
  function si(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0.0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0.0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(g + 12) >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    a = k[((k[(g + 8) >> 2] | 0) + (b << 2)) >> 2] | 0;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(g + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    r = k[((k[g >> 2] | 0) + (a << 2)) >> 2] | 0;
    s = (b - r) | 0;
    if ((r | 0) <= -1) Oa(16605, 15693, 425, 29764);
    a = k[(g + 44) >> 2] | 0;
    if ((a | 0) <= (r | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(g + 40) >> 2] | 0;
    m = k[(i + (r << 2)) >> 2] | 0;
    j = (r + 1) | 0;
    if ((a | 0) <= (j | 0)) Oa(16605, 15693, 425, 29764);
    t = ((k[(i + (j << 2)) >> 2] | 0) - m) | 0;
    i = k[(g + 36) >> 2] | 0;
    if ((i | 0) <= (j | 0)) Oa(16605, 15693, 425, 29764);
    l = k[(g + 32) >> 2] | 0;
    if ((i | 0) <= (r | 0)) Oa(16605, 15693, 425, 29764);
    o = k[(l + (r << 2)) >> 2] | 0;
    n = ((k[(l + (j << 2)) >> 2] | 0) - o) | 0;
    a = k[(g + 16) >> 2] | 0;
    o = (a + (o << 3)) | 0;
    if ((i | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    q = (a + (k[(l + (b << 2)) >> 2] << 3)) | 0;
    m = ((k[(g + 24) >> 2] | 0) + (m << 2)) | 0;
    if ((k[(e + 4) >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    a = k[((k[e >> 2] | 0) + (b << 2)) >> 2] | 0;
    do
      if ((s | 0) < (t | 0)) {
        h = -1.0;
        j = s;
        i = s;
        l = -1;
        do {
          u = +P(+(+p[(q + (i << 3)) >> 3]));
          e = u > h;
          j = e ? i : j;
          h = e ? u : h;
          l = (k[(m + (i << 2)) >> 2] | 0) == (a | 0) ? i : l;
          i = (i + 1) | 0;
        } while ((i | 0) != (t | 0));
        if (h <= 0.0) {
          if (h < 0.0) break;
          a = k[(m + (j << 2)) >> 2] | 0;
          break;
        }
        if ((l | 0) > -1) {
          u = +p[(q + (l << 3)) >> 3];
          c = u == 0.0 ? 1 : !(+P(+u) >= h * +p[c >> 3]);
          j = c ? j : l;
        }
        a = (m + (j << 2)) | 0;
        i = k[a >> 2] | 0;
        k[f >> 2] = i;
        if ((i | 0) <= -1) Oa(16605, 15693, 425, 29764);
        if ((k[(d + 4) >> 2] | 0) <= (i | 0)) Oa(16605, 15693, 425, 29764);
        k[((k[d >> 2] | 0) + (i << 2)) >> 2] = b;
        if (
          (j | 0) != (s | 0) ? ((f = (m + (s << 2)) | 0), (d = k[a >> 2] | 0), (k[a >> 2] = k[f >> 2]), (k[f >> 2] = d), (s | 0) >= 0) : 0
        ) {
          i = (b + 1 - r) | 0;
          a = 0;
          do {
            f = aa(a, n) | 0;
            d = (o + ((f + j) << 3)) | 0;
            f = (o + ((f + s) << 3)) | 0;
            u = +p[d >> 3];
            p[d >> 3] = +p[f >> 3];
            p[f >> 3] = u;
            a = (a + 1) | 0;
          } while ((a | 0) != (i | 0));
        }
        h = 1.0 / +p[(q + (s << 3)) >> 3];
        a = (s + 1) | 0;
        if ((a | 0) >= (t | 0)) {
          f = 0;
          return f | 0;
        }
        do {
          f = (q + (a << 3)) | 0;
          p[f >> 3] = h * +p[f >> 3];
          a = (a + 1) | 0;
        } while ((a | 0) != (t | 0));
        a = 0;
        return a | 0;
      }
    while (0);
    k[f >> 2] = a;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(d + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    k[((k[d >> 2] | 0) + (a << 2)) >> 2] = b;
    f = (b + 1) | 0;
    return f | 0;
  }
  function ti(a) {
    a = a | 0;
    var b = 0,
      c = 0;
    k[a >> 2] = 2804;
    b = (a + 56) | 0;
    k[b >> 2] = 2824;
    c = (a + 4) | 0;
    k[c >> 2] = 2856;
    NA((a + 36) | 0);
    br(c);
    Ar(a, 2836);
    Zq(b);
    return;
  }
  function ui(a, b, c, d, e, f, g, h, i) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    var j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0.0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    L = (i + 12) | 0;
    if ((k[L >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    M = k[(i + 8) >> 2] | 0;
    w = k[(M + (b << 2)) >> 2] | 0;
    if ((e | 0) <= 0) return;
    x = (f + 4) | 0;
    y = (g + 4) | 0;
    z = (h + 4) | 0;
    A = (i + 44) | 0;
    B = (i + 40) | 0;
    C = (i + 28) | 0;
    D = (i + 24) | 0;
    E = (i + 4) | 0;
    F = (c + 4) | 0;
    G = (i + 36) | 0;
    H = (i + 32) | 0;
    I = (i + 20) | 0;
    J = (i + 16) | 0;
    v = 0;
    a: while (1) {
      if ((k[x >> 2] | 0) <= (v | 0)) {
        a = 7;
        break;
      }
      K = k[((k[f >> 2] | 0) + (v << 2)) >> 2] | 0;
      b = (K + 1) | 0;
      if ((K | 0) <= -1) {
        a = 10;
        break;
      }
      if ((k[y >> 2] | 0) <= (K | 0)) {
        a = 10;
        break;
      }
      b: do
        if ((k[((k[g >> 2] | 0) + (K << 2)) >> 2] | 0) != -1) {
          a = k[L >> 2] | 0;
          if ((a | 0) <= (K | 0)) {
            a = 13;
            break a;
          }
          o = k[(M + (K << 2)) >> 2] | 0;
          if ((a | 0) <= (b | 0)) {
            a = 15;
            break a;
          }
          if (!((o | 0) == (w | 0) ? 1 : (o | 0) == (k[(M + (b << 2)) >> 2] | 0))) {
            if ((k[z >> 2] | 0) <= (K | 0)) {
              a = 18;
              break a;
            }
            a = k[A >> 2] | 0;
            if ((a | 0) <= (b | 0)) {
              a = 20;
              break a;
            }
            u = ((k[h >> 2] | 0) + (K << 2)) | 0;
            j = k[B >> 2] | 0;
            n = k[(j + (b << 2)) >> 2] | 0;
            if ((k[u >> 2] | 0) >= (n | 0)) {
              if ((a | 0) <= (K | 0)) {
                a = 23;
                break a;
              }
              t = (j + (K << 2)) | 0;
              a = k[t >> 2] | 0;
              b = (n + -1) | 0;
              if ((a | 0) < (n | 0)) {
                m = k[C >> 2] | 0;
                q = k[D >> 2] | 0;
                l = (a | 0) > -1;
                j = a;
                while (1) {
                  if (!(l & ((m | 0) > (j | 0)))) {
                    a = 28;
                    break a;
                  }
                  if ((k[(q + (j << 2)) >> 2] | 0) == (d | 0)) break;
                  j = (j + 1) | 0;
                  if ((j | 0) >= (n | 0)) break b;
                }
                if (!((o | 0) > -1 ? (k[E >> 2] | 0) > (o | 0) : 0)) {
                  a = 31;
                  break a;
                }
                c: do
                  if ((K | 0) == (k[((k[i >> 2] | 0) + (o << 2)) >> 2] | 0)) {
                    l = q;
                    while (1) {
                      n = k[F >> 2] | 0;
                      r = k[c >> 2] | 0;
                      j = (b | 0) < (m | 0);
                      while (1) {
                        if (!(((b | 0) > -1) & j)) {
                          a = 51;
                          break a;
                        }
                        o = (l + (b << 2)) | 0;
                        q = k[o >> 2] | 0;
                        if (!(((q | 0) > -1) & ((n | 0) > (q | 0)))) {
                          a = 53;
                          break a;
                        }
                        if ((k[(r + (q << 2)) >> 2] | 0) != -1) break;
                        if ((a | 0) < (b | 0)) b = (b + -1) | 0;
                        else break c;
                      }
                      if ((m | 0) <= (a | 0)) {
                        a = 57;
                        break a;
                      }
                      l = (l + (a << 2)) | 0;
                      j = k[l >> 2] | 0;
                      if (!(((j | 0) > -1) & ((n | 0) > (j | 0)))) {
                        a = 59;
                        break a;
                      }
                      s = (a + 1) | 0;
                      if ((k[(r + (j << 2)) >> 2] | 0) == -1) {
                        k[l >> 2] = q;
                        k[o >> 2] = j;
                        if ((k[G >> 2] | 0) <= (K | 0)) {
                          a = 62;
                          break a;
                        }
                        j = k[((k[H >> 2] | 0) + (K << 2)) >> 2] | 0;
                        if ((k[A >> 2] | 0) <= (K | 0)) {
                          a = 63;
                          break a;
                        }
                        m = k[t >> 2] | 0;
                        l = (a - m + j) | 0;
                        m = (b - m + j) | 0;
                        if ((l | 0) <= -1) {
                          a = 64;
                          break a;
                        }
                        n = k[I >> 2] | 0;
                        if ((n | 0) <= (l | 0)) {
                          a = 64;
                          break a;
                        }
                        o = k[J >> 2] | 0;
                        j = (o + (l << 3)) | 0;
                        if (!(((m | 0) > -1) & ((n | 0) > (m | 0)))) {
                          a = 65;
                          break a;
                        }
                        r = (o + (m << 3)) | 0;
                        N = +p[j >> 3];
                        p[j >> 3] = +p[r >> 3];
                        p[r >> 3] = N;
                        b = (b + -1) | 0;
                      }
                      if ((a | 0) >= (b | 0)) {
                        a = s;
                        break c;
                      }
                      a = s;
                      m = k[C >> 2] | 0;
                      l = k[D >> 2] | 0;
                    }
                  } else {
                    l = q;
                    while (1) {
                      n = k[F >> 2] | 0;
                      r = k[c >> 2] | 0;
                      j = (b | 0) < (m | 0);
                      while (1) {
                        if (!(((b | 0) > -1) & j)) {
                          a = 51;
                          break a;
                        }
                        o = (l + (b << 2)) | 0;
                        q = k[o >> 2] | 0;
                        if (!(((q | 0) > -1) & ((n | 0) > (q | 0)))) {
                          a = 53;
                          break a;
                        }
                        if ((k[(r + (q << 2)) >> 2] | 0) != -1) break;
                        if ((a | 0) < (b | 0)) b = (b + -1) | 0;
                        else break c;
                      }
                      if ((m | 0) <= (a | 0)) {
                        a = 57;
                        break a;
                      }
                      j = (l + (a << 2)) | 0;
                      l = k[j >> 2] | 0;
                      if (!(((l | 0) > -1) & ((n | 0) > (l | 0)))) {
                        a = 59;
                        break a;
                      }
                      m = (a + 1) | 0;
                      if ((k[(r + (l << 2)) >> 2] | 0) == -1) {
                        k[j >> 2] = q;
                        k[o >> 2] = l;
                        b = (b + -1) | 0;
                      }
                      if ((a | 0) >= (b | 0)) {
                        a = m;
                        break c;
                      }
                      a = m;
                      m = k[C >> 2] | 0;
                      l = k[D >> 2] | 0;
                    }
                  }
                while (0);
                if ((k[z >> 2] | 0) <= (K | 0)) {
                  a = 69;
                  break a;
                }
                k[u >> 2] = a;
              }
            }
          }
        }
      while (0);
      v = (v + 1) | 0;
      if ((v | 0) >= (e | 0)) {
        a = 72;
        break;
      }
    }
    switch (a | 0) {
      case 7: {
        Oa(16605, 15693, 180, 29764);
        break;
      }
      case 10: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 13: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 15: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 18: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 20: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 23: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 28: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 31: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 51: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 53: {
        Oa(16605, 15693, 180, 29764);
        break;
      }
      case 57: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 59: {
        Oa(16605, 15693, 180, 29764);
        break;
      }
      case 62: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 63: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 64: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 65: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 69: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 72:
        return;
    }
  }
  function vi(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0;
    l = k[(a + 4) >> 2] | 0;
    if ((l | 0) <= -1) Oa(13359, 12702, 312, 12780);
    if (!l) {
      m = 1;
      return m | 0;
    }
    b = Oq((l + 16) | 0) | 0;
    j = (b + 16) & -16;
    if (!b) {
      m = Kb(4) | 0;
      cF(m);
      Cc(m | 0, 2032, 79);
    }
    k[(j + -4) >> 2] = b;
    if (!j) {
      m = Kb(4) | 0;
      cF(m);
      Cc(m | 0, 2032, 79);
    }
    g = j;
    iF(g | 0, 0, l | 0) | 0;
    b = 1;
    c = 0;
    a: while (1) {
      e = (c | 0) > -1;
      while (1) {
        if ((c | 0) >= (l | 0)) {
          m = 16;
          break a;
        }
        if (!e) {
          m = 12;
          break a;
        }
        d = (g + c) | 0;
        f = (c + 1) | 0;
        if (!(i[d >> 0] | 0)) break;
        else c = f;
      }
      i[d >> 0] = 1;
      e = k[a >> 2] | 0;
      d = k[(e + (c << 2)) >> 2] | 0;
      if ((d | 0) != (c | 0))
        do {
          i[(g + d) >> 0] = 1;
          b = (0 - b) | 0;
          d = k[(e + (d << 2)) >> 2] | 0;
        } while ((d | 0) != (c | 0));
      if ((f | 0) < (l | 0)) c = f;
      else {
        h = b;
        break;
      }
    }
    if ((m | 0) == 12) Oa(16605, 15693, 408, 29907);
    if ((m | 0) == 16)
      if (!j) {
        m = b;
        return m | 0;
      } else h = b;
    Pq(k[(g + -4) >> 2] | 0);
    m = h;
    return m | 0;
  }
  function wi(a, b, c, d, e) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0;
    k[c >> 2] = 0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(e + 76) >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    k[d >> 2] = k[((k[(e + 72) >> 2] | 0) + (b << 2)) >> 2];
    if ((k[(e + 12) >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    q = k[((k[(e + 8) >> 2] | 0) + (b << 2)) >> 2] | 0;
    if (((b | 0) < 1) | ((q | 0) < 0)) return;
    n = (e + 4) | 0;
    o = k[e >> 2] | 0;
    p = (e + 44) | 0;
    m = k[(e + 40) >> 2] | 0;
    l = 0;
    f = k[n >> 2] | 0;
    a: while (1) {
      if ((f | 0) <= (l | 0)) {
        a = 10;
        break;
      }
      b = k[(o + (l << 2)) >> 2] | 0;
      e = (b + 1) | 0;
      if ((b | 0) <= -2) {
        a = 13;
        break;
      }
      a = k[p >> 2] | 0;
      if ((a | 0) <= (e | 0)) {
        a = 13;
        break;
      }
      if (!(((b | 0) > -1) & ((a | 0) > (b | 0)))) {
        a = 15;
        break;
      }
      h = l;
      l = (l + 1) | 0;
      if ((f | 0) <= (l | 0)) {
        a = 20;
        break;
      }
      i = (o + (l << 2)) | 0;
      j = (1 - b) | 0;
      g = b;
      b = ((k[(m + (e << 2)) >> 2] | 0) - (k[(m + (b << 2)) >> 2] | 0)) | 0;
      a = f;
      while (1) {
        if ((g | 0) >= (k[i >> 2] | 0)) break;
        k[c >> 2] = (k[c >> 2] | 0) + b;
        k[d >> 2] = j + g + (k[d >> 2] | 0);
        a = k[n >> 2] | 0;
        if ((a | 0) > (l | 0)) {
          g = (g + 1) | 0;
          b = (b + -1) | 0;
        } else {
          a = 20;
          break a;
        }
      }
      if ((h | 0) >= (q | 0)) {
        a = 21;
        break;
      } else f = a;
    }
    if ((a | 0) == 10) Oa(16605, 15693, 425, 29764);
    else if ((a | 0) == 13) Oa(16605, 15693, 425, 29764);
    else if ((a | 0) == 15) Oa(16605, 15693, 425, 29764);
    else if ((a | 0) == 20) Oa(16605, 15693, 425, 29764);
    else if ((a | 0) == 21) return;
  }
  function xi(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0;
    if ((b | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(d + 12) >> 2] | 0) <= (b | 0)) Oa(16605, 15693, 425, 29764);
    p = k[((k[(d + 8) >> 2] | 0) + (b << 2)) >> 2] | 0;
    a: do
      if ((p | 0) >= 0) {
        q = (d + 4) | 0;
        r = (d + 44) | 0;
        s = (d + 40) | 0;
        t = (d + 28) | 0;
        u = (d + 24) | 0;
        v = (c + 4) | 0;
        g = 0;
        o = 0;
        a = k[q >> 2] | 0;
        b: while (1) {
          if ((a | 0) <= (o | 0)) {
            a = 9;
            break;
          }
          l = k[d >> 2] | 0;
          a = k[(l + (o << 2)) >> 2] | 0;
          if (!((a | 0) > -1 ? (k[r >> 2] | 0) > (a | 0) : 0)) {
            a = 11;
            break;
          }
          e = k[s >> 2] | 0;
          n = (e + (a << 2)) | 0;
          f = k[n >> 2] | 0;
          k[n >> 2] = g;
          n = (a + 1) | 0;
          if ((k[r >> 2] | 0) <= (n | 0)) {
            a = 20;
            break;
          }
          h = (e + (n << 2)) | 0;
          i = (f | 0) > -1;
          j = (g | 0) > -1;
          m = g;
          while (1) {
            if ((f | 0) >= (k[h >> 2] | 0)) break;
            if (!i) {
              a = 26;
              break b;
            }
            a = k[t >> 2] | 0;
            if ((a | 0) <= (f | 0)) {
              a = 26;
              break b;
            }
            e = k[u >> 2] | 0;
            g = k[(e + (f << 2)) >> 2] | 0;
            if (!((g | 0) > -1 ? (k[v >> 2] | 0) > (g | 0) : 0)) {
              a = 27;
              break b;
            }
            if (!(j & ((a | 0) > (m | 0)))) {
              a = 28;
              break b;
            }
            k[(e + (m << 2)) >> 2] = k[((k[c >> 2] | 0) + (g << 2)) >> 2];
            if ((k[r >> 2] | 0) > (n | 0)) {
              f = (f + 1) | 0;
              m = (m + 1) | 0;
            } else {
              a = 20;
              break b;
            }
          }
          h = o;
          o = (o + 1) | 0;
          a = k[q >> 2] | 0;
          if ((a | 0) <= (o | 0)) {
            a = 29;
            break;
          }
          f = (l + (o << 2)) | 0;
          g = k[s >> 2] | 0;
          e = n;
          while (1) {
            if ((e | 0) >= (k[f >> 2] | 0)) break;
            if ((k[r >> 2] | 0) <= (e | 0)) {
              a = 30;
              break b;
            }
            k[(g + (e << 2)) >> 2] = m;
            a = k[q >> 2] | 0;
            if ((a | 0) > (o | 0)) e = (e + 1) | 0;
            else {
              a = 29;
              break b;
            }
          }
          if ((h | 0) >= (p | 0)) {
            w = m;
            x = r;
            break a;
          } else g = m;
        }
        if ((a | 0) == 9) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 11) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 20) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 26) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 27) Oa(16605, 15693, 180, 29764);
        else if ((a | 0) == 28) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 29) Oa(16605, 15693, 425, 29764);
        else if ((a | 0) == 30) Oa(16605, 15693, 425, 29764);
      } else {
        w = 0;
        x = (d + 44) | 0;
      }
    while (0);
    if ((k[x >> 2] | 0) > (b | 0)) {
      k[((k[(d + 40) >> 2] | 0) + (b << 2)) >> 2] = w;
      return;
    } else Oa(16605, 15693, 425, 29764);
  }
  function yi(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    m = u;
    u = (u + 16) | 0;
    l = m;
    a = k[c >> 2] | 0;
    if (!(((e | 0) != 0) | ((k[f >> 2] | 0) == 0))) {
      j = (a + 1) | 0;
      a = ~~(+(a | 0) * 1.5);
      a = (j | 0) < (a | 0) ? a : j;
    }
    k[l >> 2] = 0;
    j = (l + 4) | 0;
    k[j >> 2] = 0;
    g = (d | 0) > 0;
    if (g) {
      h = k[b >> 2] | 0;
      if ((k[(b + 4) >> 2] | 0) < (d | 0)) Oa(14177, 13744, 147, 13812);
      Nf(l, d, 1);
      if ((k[j >> 2] | 0) != (d | 0)) Oa(12160, 12207, 721, 12285);
      i = k[l >> 2] | 0;
      e = 0;
      do {
        p[(i + (e << 3)) >> 3] = +p[(h + (e << 3)) >> 3];
        e = (e + 1) | 0;
      } while ((e | 0) != (d | 0));
      Df(b, a);
      if (g) {
        h = k[b >> 2] | 0;
        if ((k[(b + 4) >> 2] | 0) < (d | 0)) Oa(14177, 13744, 147, 13812);
        g = k[l >> 2] | 0;
        if ((k[j >> 2] | 0) == (d | 0)) {
          e = 0;
          do {
            p[(h + (e << 3)) >> 3] = +p[(g + (e << 3)) >> 3];
            e = (e + 1) | 0;
          } while ((e | 0) != (d | 0));
        } else Oa(14445, 14320, 257, 12780);
      }
    } else Df(b, a);
    k[c >> 2] = a;
    a = k[f >> 2] | 0;
    if (a | 0) k[f >> 2] = a + 1;
    a = k[l >> 2] | 0;
    if (!a) {
      u = m;
      return 0;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = m;
    return 0;
  }
  function zi(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    m = u;
    u = (u + 16) | 0;
    l = m;
    a = k[c >> 2] | 0;
    if (!(((e | 0) != 0) | ((k[f >> 2] | 0) == 0))) {
      j = (a + 1) | 0;
      a = ~~(+(a | 0) * 1.5);
      a = (j | 0) < (a | 0) ? a : j;
    }
    k[l >> 2] = 0;
    j = (l + 4) | 0;
    k[j >> 2] = 0;
    g = (d | 0) > 0;
    if (g) {
      h = k[b >> 2] | 0;
      if ((k[(b + 4) >> 2] | 0) < (d | 0)) Oa(14177, 13744, 147, 13812);
      Ng(l, d, 1);
      if ((k[j >> 2] | 0) != (d | 0)) Oa(12160, 12207, 721, 12285);
      i = k[l >> 2] | 0;
      e = 0;
      do {
        k[(i + (e << 2)) >> 2] = k[(h + (e << 2)) >> 2];
        e = (e + 1) | 0;
      } while ((e | 0) != (d | 0));
      Ef(b, a);
      if (g) {
        h = k[b >> 2] | 0;
        if ((k[(b + 4) >> 2] | 0) < (d | 0)) Oa(14177, 13744, 147, 13812);
        g = k[l >> 2] | 0;
        if ((k[j >> 2] | 0) == (d | 0)) {
          e = 0;
          do {
            k[(h + (e << 2)) >> 2] = k[(g + (e << 2)) >> 2];
            e = (e + 1) | 0;
          } while ((e | 0) != (d | 0));
        } else Oa(14445, 14320, 257, 12780);
      }
    } else Ef(b, a);
    k[c >> 2] = a;
    a = k[f >> 2] | 0;
    if (a | 0) k[f >> 2] = a + 1;
    a = k[l >> 2] | 0;
    if (!a) {
      u = m;
      return 0;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = m;
    return 0;
  }
  function Ai(a, b, c, d, e, f, g, h, i, j, l, m, n, o, p) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    l = l | 0;
    m = m | 0;
    n = n | 0;
    o = o | 0;
    p = p | 0;
    var q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0;
    if ((o | 0) <= -1) Oa(16605, 15693, 425, 29764);
    M = (i + 4) | 0;
    if ((k[M >> 2] | 0) <= (o | 0)) Oa(16605, 15693, 425, 29764);
    K = k[i >> 2] | 0;
    k[(K + (o << 2)) >> 2] = b;
    L = (c + 4) | 0;
    if ((k[L >> 2] | 0) <= (o | 0)) Oa(16605, 15693, 425, 29764);
    J = k[c >> 2] | 0;
    c = k[(J + (o << 2)) >> 2] | 0;
    if ((c | 0) == -1) {
      a = k[n >> 2] | 0;
      k[n >> 2] = a + 1;
      if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
      if ((k[(e + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
      k[((k[e >> 2] | 0) + (a << 2)) >> 2] = o;
      return;
    }
    if ((c | 0) <= -1) Oa(16605, 15693, 425, 29764);
    F = (m + 12) | 0;
    if ((k[F >> 2] | 0) <= (c | 0)) Oa(16605, 15693, 425, 29764);
    G = k[(m + 8) >> 2] | 0;
    I = k[(G + (c << 2)) >> 2] | 0;
    a = (I + 1) | 0;
    if ((I | 0) <= -2) Oa(16605, 15693, 425, 29764);
    H = (m + 4) | 0;
    if ((k[H >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    I = k[m >> 2] | 0;
    o = k[(I + (a << 2)) >> 2] | 0;
    q = (o + -1) | 0;
    if ((o | 0) <= 0) Oa(16605, 15693, 425, 29764);
    E = (g + 4) | 0;
    if ((k[E >> 2] | 0) < (o | 0)) Oa(16605, 15693, 425, 29764);
    D = k[g >> 2] | 0;
    i = (D + (q << 2)) | 0;
    a = k[i >> 2] | 0;
    if ((a | 0) != -1) {
      if ((a | 0) <= (c | 0)) return;
      k[i >> 2] = c;
      return;
    }
    C = (j + 4) | 0;
    if ((k[C >> 2] | 0) < (o | 0)) Oa(16605, 15693, 425, 29764);
    B = k[j >> 2] | 0;
    k[(B + (q << 2)) >> 2] = -1;
    if ((k[E >> 2] | 0) < (o | 0)) Oa(16605, 15693, 425, 29764);
    k[i >> 2] = c;
    z = (m + 44) | 0;
    if ((k[z >> 2] | 0) < (o | 0)) Oa(16605, 15693, 425, 29764);
    A = (h + 4) | 0;
    if ((k[A >> 2] | 0) < (o | 0)) Oa(16605, 15693, 425, 29764);
    u = k[(m + 40) >> 2] | 0;
    v = (p + 4) | 0;
    w = (f + 4) | 0;
    x = (l + 4) | 0;
    y = (m + 28) | 0;
    s = (m + 24) | 0;
    t = (e + 4) | 0;
    r = k[h >> 2] | 0;
    i = q;
    a = (u + (q << 2)) | 0;
    a: while (1) {
      a = k[a >> 2] | 0;
      c = k[(r + (i << 2)) >> 2] | 0;
      b: do
        if ((a | 0) < (c | 0))
          while (1) {
            h = (a | 0) > -1;
            c: while (1) {
              if (!(h & ((k[y >> 2] | 0) > (a | 0)))) {
                a = 36;
                break a;
              }
              g = k[((k[s >> 2] | 0) + (a << 2)) >> 2] | 0;
              a = (a + 1) | 0;
              if ((g | 0) <= -1) {
                a = 39;
                break a;
              }
              if ((k[M >> 2] | 0) <= (g | 0)) {
                a = 39;
                break a;
              }
              o = (K + (g << 2)) | 0;
              do
                if ((k[o >> 2] | 0) != (b | 0)) {
                  k[o >> 2] = b;
                  if ((k[L >> 2] | 0) <= (g | 0)) {
                    a = 42;
                    break a;
                  }
                  m = k[(J + (g << 2)) >> 2] | 0;
                  if ((m | 0) == -1) {
                    o = k[n >> 2] | 0;
                    k[n >> 2] = o + 1;
                    if (!((o | 0) > -1 ? (k[t >> 2] | 0) > (o | 0) : 0)) {
                      a = 45;
                      break a;
                    }
                    k[((k[e >> 2] | 0) + (o << 2)) >> 2] = g;
                    break;
                  }
                  if (!((m | 0) > -1 ? (k[F >> 2] | 0) > (m | 0) : 0)) {
                    a = 49;
                    break a;
                  }
                  q = k[(G + (m << 2)) >> 2] | 0;
                  o = (q + 1) | 0;
                  if (!((q | 0) > -2 ? (k[H >> 2] | 0) > (o | 0) : 0)) {
                    a = 51;
                    break a;
                  }
                  o = k[(I + (o << 2)) >> 2] | 0;
                  q = (o + -1) | 0;
                  if ((o | 0) <= 0) {
                    a = 54;
                    break a;
                  }
                  if ((k[E >> 2] | 0) < (o | 0)) {
                    a = 54;
                    break a;
                  }
                  g = (D + (q << 2)) | 0;
                  j = k[g >> 2] | 0;
                  if ((j | 0) == -1) break c;
                  if ((j | 0) <= (m | 0)) break;
                  k[g >> 2] = m;
                }
              while (0);
              if ((a | 0) >= (c | 0)) break b;
            }
            if (!((i | 0) > -1 ? (k[x >> 2] | 0) > (i | 0) : 0)) {
              a = 59;
              break a;
            }
            k[((k[l >> 2] | 0) + (i << 2)) >> 2] = a;
            if ((k[C >> 2] | 0) < (o | 0)) {
              a = 61;
              break a;
            }
            k[(B + (q << 2)) >> 2] = i;
            if ((k[E >> 2] | 0) < (o | 0)) {
              a = 63;
              break a;
            }
            k[(D + (q << 2)) >> 2] = m;
            if ((k[z >> 2] | 0) < (o | 0)) {
              a = 65;
              break a;
            }
            if ((k[A >> 2] | 0) < (o | 0)) {
              a = 67;
              break a;
            }
            a = k[(u + (q << 2)) >> 2] | 0;
            c = k[(r + (q << 2)) >> 2] | 0;
            if ((a | 0) >= (c | 0)) {
              i = q;
              break;
            } else i = q;
          }
      while (0);
      a = ((k[v >> 2] | 0) + (i << 2)) | 0;
      if ((k[a >> 2] | 0) < (k[p >> 2] | 0)) {
        k[a >> 2] = b;
        a = k[d >> 2] | 0;
        if (!((a | 0) > -1 ? (k[w >> 2] | 0) > (a | 0) : 0)) {
          a = 71;
          break;
        }
        k[((k[f >> 2] | 0) + (a << 2)) >> 2] = i;
        k[d >> 2] = (k[d >> 2] | 0) + 1;
      }
      if (!((i | 0) > -1 ? (k[C >> 2] | 0) > (i | 0) : 0)) {
        a = 74;
        break;
      }
      a = k[(B + (i << 2)) >> 2] | 0;
      if ((a | 0) == -1) {
        a = 78;
        break;
      }
      if (!((a | 0) > -1 ? (k[x >> 2] | 0) > (a | 0) : 0)) {
        a = 77;
        break;
      }
      if ((k[A >> 2] | 0) > (a | 0)) {
        i = a;
        a = ((k[l >> 2] | 0) + (a << 2)) | 0;
      } else {
        a = 32;
        break;
      }
    }
    switch (a | 0) {
      case 32: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 36: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 39: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 42: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 45: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 49: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 51: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 54: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 59: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 61: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 63: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 65: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 67: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 71: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 74: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 77: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 78:
        return;
    }
  }
  function Bi(a, b, c, d, e, f, g, h, i) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    var j = 0,
      k = 0.0,
      l = 0,
      m = 0.0,
      n = 0.0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0.0,
      v = 0,
      w = 0.0,
      x = 0.0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0.0,
      X = 0,
      Y = 0.0,
      Z = 0.0,
      _ = 0,
      $ = 0,
      ba = 0,
      ca = 0;
    J = (((c | 0) / 2) | 0) << 1;
    K = (((b | 0) / 2) | 0) << 1;
    if ((a | 0) <= 0) return;
    L = (b | 0) > 1;
    M = (c | 0) > 1;
    N = (f + ((aa((b + -1) | 0, g) | 0) << 3)) | 0;
    O = aa(K, i) | 0;
    I = (c - J) | 0;
    P = (d + ((aa(J, e) | 0) << 3)) | 0;
    Q = J | 1;
    R = (d + ((aa(Q, e) | 0) << 3)) | 0;
    S = (J + 2) | 0;
    T = (d + ((aa(S, e) | 0) << 3)) | 0;
    U = (I | 0) == 1;
    G = ((K | 0) >= (b | 0)) | ((c | 0) < 2);
    H = ((I | 0) < 1) | ((b | 0) < 1);
    I = (I | 0) == 2;
    E = 0;
    a: while (1) {
      D = (a - E) | 0;
      F = (D | 0) < 512 ? D : 512;
      C = (((F | 0) / 8) | 0) << 3;
      if (L) {
        t = (d + (E << 3)) | 0;
        v = (h + (E << 3)) | 0;
        y = (F | 0) > 7;
        z = (C | 0) < (F | 0);
        r = 0;
        do {
          c = r | 1;
          if (M) {
            A = (v + ((aa(r, i) | 0) << 3)) | 0;
            B = (v + ((aa(c, i) | 0) << 3)) | 0;
            s = (f + ((aa(r, g) | 0) << 3)) | 0;
            j = (f + ((aa(c, g) | 0) << 3)) | 0;
            l = 0;
            while (1) {
              n = +p[s >> 3];
              u = +p[(s + 8) >> 3];
              w = +p[j >> 3];
              x = +p[(j + 8) >> 3];
              o = (t + ((aa(l, e) | 0) << 3)) | 0;
              q = (t + ((aa(l | 1, e) | 0) << 3)) | 0;
              l = (l + 2) | 0;
              k = +p[o >> 3];
              m = +p[q >> 3];
              if (y) {
                c = 0;
                do {
                  $ = (o + (c << 3)) | 0;
                  _ = (q + (c << 3)) | 0;
                  X = (A + (c << 3)) | 0;
                  V = (B + (c << 3)) | 0;
                  Y = +p[($ + 8) >> 3];
                  W = x * m + (w * k + +p[V >> 3]);
                  Z = +p[(_ + 8) >> 3];
                  p[X >> 3] = u * m + (n * k + +p[X >> 3]);
                  p[V >> 3] = W;
                  ba = (X + 8) | 0;
                  ca = (V + 8) | 0;
                  k = +p[($ + 16) >> 3];
                  W = x * Z + (w * Y + +p[ca >> 3]);
                  m = +p[(_ + 16) >> 3];
                  p[ba >> 3] = u * Z + (n * Y + +p[ba >> 3]);
                  p[ca >> 3] = W;
                  ca = (X + 16) | 0;
                  ba = (V + 16) | 0;
                  W = +p[($ + 24) >> 3];
                  Y = x * m + (w * k + +p[ba >> 3]);
                  Z = +p[(_ + 24) >> 3];
                  p[ca >> 3] = u * m + (n * k + +p[ca >> 3]);
                  p[ba >> 3] = Y;
                  ba = (X + 24) | 0;
                  ca = (V + 24) | 0;
                  Y = +p[($ + 32) >> 3];
                  k = x * Z + (w * W + +p[ca >> 3]);
                  m = +p[(_ + 32) >> 3];
                  p[ba >> 3] = u * Z + (n * W + +p[ba >> 3]);
                  p[ca >> 3] = k;
                  ca = (X + 32) | 0;
                  ba = (V + 32) | 0;
                  k = +p[($ + 40) >> 3];
                  W = x * m + (w * Y + +p[ba >> 3]);
                  Z = +p[(_ + 40) >> 3];
                  p[ca >> 3] = u * m + (n * Y + +p[ca >> 3]);
                  p[ba >> 3] = W;
                  ba = (X + 40) | 0;
                  ca = (V + 40) | 0;
                  W = +p[($ + 48) >> 3];
                  Y = x * Z + (w * k + +p[ca >> 3]);
                  m = +p[(_ + 48) >> 3];
                  p[ba >> 3] = u * Z + (n * k + +p[ba >> 3]);
                  p[ca >> 3] = Y;
                  ca = (X + 48) | 0;
                  ba = (V + 48) | 0;
                  Y = +p[($ + 56) >> 3];
                  k = x * m + (w * W + +p[ba >> 3]);
                  Z = +p[(_ + 56) >> 3];
                  p[ca >> 3] = u * m + (n * W + +p[ca >> 3]);
                  p[ba >> 3] = k;
                  X = (X + 56) | 0;
                  V = (V + 56) | 0;
                  k = +p[($ + 64) >> 3];
                  W = x * Z + (w * Y + +p[V >> 3]);
                  m = +p[(_ + 64) >> 3];
                  p[X >> 3] = u * Z + (n * Y + +p[X >> 3]);
                  p[V >> 3] = W;
                  c = (c + 8) | 0;
                } while ((c | 0) < (C | 0));
              }
              if (z) {
                c = C;
                do {
                  ba = (A + (c << 3)) | 0;
                  ca = (B + (c << 3)) | 0;
                  Y = k;
                  k = +p[(o + (c << 3) + 8) >> 3];
                  Z = x * m + (w * Y + +p[ca >> 3]);
                  W = m;
                  m = +p[(q + (c << 3) + 8) >> 3];
                  p[ba >> 3] = u * W + (n * Y + +p[ba >> 3]);
                  p[ca >> 3] = Z;
                  c = (c + 1) | 0;
                } while ((c | 0) < (F | 0));
              }
              if ((l | 0) >= (J | 0)) break;
              else {
                s = (s + 16) | 0;
                j = (j + 16) | 0;
              }
            }
          }
          r = (r + 2) | 0;
        } while ((r | 0) < (K | 0));
      }
      if (!G) {
        o = (d + (E << 3)) | 0;
        q = (h + (E << 3) + (O << 3)) | 0;
        r = (F | 0) > 7;
        s = (C | 0) < (F | 0);
        j = 0;
        l = N;
        while (1) {
          n = +p[l >> 3];
          u = +p[(l + 8) >> 3];
          t = (o + ((aa(j, e) | 0) << 3)) | 0;
          v = (o + ((aa(j | 1, e) | 0) << 3)) | 0;
          j = (j + 2) | 0;
          k = +p[t >> 3];
          m = +p[v >> 3];
          if (r) {
            c = 0;
            do {
              ca = (q + (c << 3)) | 0;
              $ = (t + (c << 3)) | 0;
              Z = +p[($ + 8) >> 3];
              ba = (v + (c << 3)) | 0;
              Y = +p[(ba + 8) >> 3];
              p[ca >> 3] = u * m + (n * k + +p[ca >> 3]);
              _ = (ca + 8) | 0;
              k = +p[($ + 16) >> 3];
              m = +p[(ba + 16) >> 3];
              p[_ >> 3] = u * Y + (n * Z + +p[_ >> 3]);
              _ = (ca + 16) | 0;
              Z = +p[($ + 24) >> 3];
              Y = +p[(ba + 24) >> 3];
              p[_ >> 3] = u * m + (n * k + +p[_ >> 3]);
              _ = (ca + 24) | 0;
              k = +p[($ + 32) >> 3];
              m = +p[(ba + 32) >> 3];
              p[_ >> 3] = u * Y + (n * Z + +p[_ >> 3]);
              _ = (ca + 32) | 0;
              Z = +p[($ + 40) >> 3];
              Y = +p[(ba + 40) >> 3];
              p[_ >> 3] = u * m + (n * k + +p[_ >> 3]);
              _ = (ca + 40) | 0;
              k = +p[($ + 48) >> 3];
              m = +p[(ba + 48) >> 3];
              p[_ >> 3] = u * Y + (n * Z + +p[_ >> 3]);
              _ = (ca + 48) | 0;
              Z = +p[($ + 56) >> 3];
              Y = +p[(ba + 56) >> 3];
              p[_ >> 3] = u * m + (n * k + +p[_ >> 3]);
              ca = (ca + 56) | 0;
              k = +p[($ + 64) >> 3];
              m = +p[(ba + 64) >> 3];
              p[ca >> 3] = u * Y + (n * Z + +p[ca >> 3]);
              c = (c + 8) | 0;
            } while ((c | 0) < (C | 0));
          }
          if (s) {
            c = C;
            do {
              ca = (q + (c << 3)) | 0;
              Z = k;
              k = +p[(t + (c << 3) + 8) >> 3];
              Y = m;
              m = +p[(v + (c << 3) + 8) >> 3];
              p[ca >> 3] = u * Y + (n * Z + +p[ca >> 3]);
              c = (c + 1) | 0;
            } while ((c | 0) < (F | 0));
          }
          if ((j | 0) >= (J | 0)) break;
          else l = (l + 16) | 0;
        }
      }
      b: do
        if (!H) {
          s = (F | 0) > -1;
          t = (P + (E << 3)) | 0;
          o = (R + (E << 3)) | 0;
          q = (T + (E << 3)) | 0;
          r = (D | 0) > 0;
          if (U) {
            c = 0;
            while (1) {
              if (!s) {
                c = 28;
                break a;
              }
              l = (f + (((aa(c, g) | 0) + J) << 3)) | 0;
              k = +p[l >> 3];
              l = (h + ((aa(c, i) | 0) << 3) + (E << 3)) | 0;
              if (r) {
                j = 0;
                do {
                  ca = (l + (j << 3)) | 0;
                  p[ca >> 3] = k * +p[(t + (j << 3)) >> 3] + +p[ca >> 3];
                  j = (j + 1) | 0;
                } while ((j | 0) != (F | 0));
              }
              c = (c + 1) | 0;
              if ((c | 0) >= (b | 0)) break b;
            }
          } else l = 0;
          do {
            c = aa(l, g) | 0;
            if (I) {
              if (!s) {
                c = 30;
                break a;
              }
              m = +p[(f + ((c + J) << 3)) >> 3];
              k = +p[(f + ((c + Q) << 3)) >> 3];
              j = (h + ((aa(l, i) | 0) << 3) + (E << 3)) | 0;
              if (r) {
                c = 0;
                do {
                  ca = (j + (c << 3)) | 0;
                  p[ca >> 3] = +p[ca >> 3] + (m * +p[(t + (c << 3)) >> 3] + k * +p[(o + (c << 3)) >> 3]);
                  c = (c + 1) | 0;
                } while ((c | 0) != (F | 0));
              }
            } else {
              if (!s) {
                c = 34;
                break a;
              }
              m = +p[(f + ((c + J) << 3)) >> 3];
              n = +p[(f + ((c + Q) << 3)) >> 3];
              k = +p[(f + ((c + S) << 3)) >> 3];
              j = (h + ((aa(l, i) | 0) << 3) + (E << 3)) | 0;
              if (r) {
                c = 0;
                do {
                  ca = (j + (c << 3)) | 0;
                  p[ca >> 3] = +p[ca >> 3] + (m * +p[(t + (c << 3)) >> 3] + n * +p[(o + (c << 3)) >> 3] + k * +p[(q + (c << 3)) >> 3]);
                  c = (c + 1) | 0;
                } while ((c | 0) != (F | 0));
              }
            }
            l = (l + 1) | 0;
          } while ((l | 0) < (b | 0));
        }
      while (0);
      E = (E + 512) | 0;
      if ((E | 0) >= (a | 0)) {
        c = 3;
        break;
      }
    }
    if ((c | 0) == 3) return;
    else if ((c | 0) == 28) Oa(14697, 13988, 163, 14058);
    else if ((c | 0) == 30) Oa(14697, 13988, 163, 14058);
    else if ((c | 0) == 34) Oa(14697, 13988, 163, 14058);
  }
  function Ci(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0.0,
      m = 0,
      n = 0.0;
    a = (j + i) | 0;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(h + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    c = k[h >> 2] | 0;
    a = k[(c + (a << 2)) >> 2] | 0;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(b + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    m = k[b >> 2] | 0;
    l = +p[(m + (a << 3)) >> 3];
    h = aa(j, f) | 0;
    h = (j + 1 + h + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = h;
    h = ((k[d >> 2] | 0) + (h << 3)) | 0;
    b = (c + (i << 2) + (j << 2)) | 0;
    c = (b + 4) | 0;
    if ((g | 0) > 1) {
      a = 0;
      while (1) {
        j = b;
        b = (b + 8) | 0;
        d = (h + 16) | 0;
        i = (m + (k[c >> 2] << 3)) | 0;
        c = (m + (k[b >> 2] << 3)) | 0;
        n = +p[c >> 3] - l * +p[(h + 8) >> 3];
        p[i >> 3] = +p[i >> 3] - l * +p[h >> 3];
        p[c >> 3] = n;
        a = (a + 2) | 0;
        c = (j + 12) | 0;
        if ((a | 1 | 0) >= (g | 0)) {
          h = d;
          break;
        } else h = d;
      }
    } else a = 0;
    if ((a | 0) >= (g | 0)) return;
    g = (m + (k[c >> 2] << 3)) | 0;
    p[g >> 3] = +p[g >> 3] - l * +p[h >> 3];
    return;
  }
  function Di(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0.0,
      s = 0.0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0;
    v = (j + i) | 0;
    x = (h + 4) | 0;
    l = k[x >> 2] | 0;
    m = k[h >> 2] | 0;
    y = (b + 4) | 0;
    n = k[y >> 2] | 0;
    o = k[b >> 2] | 0;
    u = (c + 4) | 0;
    q = k[u >> 2] | 0;
    t = k[c >> 2] | 0;
    if (!(((v | 0) > -1) & ((l | 0) > (v | 0)))) Oa(16605, 15693, 425, 29764);
    i = k[(m + (v << 2)) >> 2] | 0;
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    if ((q | 0) <= 0) Oa(16605, 15693, 425, 29764);
    s = +p[(o + (i << 3)) >> 3];
    p[t >> 3] = s;
    w = (v + 1) | 0;
    if ((l | 0) <= (w | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(m + (w << 2)) >> 2] | 0;
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    if ((q | 0) <= 1) Oa(16605, 15693, 425, 29764);
    r = +p[(o + (i << 3)) >> 3];
    m = (t + 8) | 0;
    p[m >> 3] = r;
    l = ((aa(j, f) | 0) + j) | 0;
    l = (l + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = l;
    i = k[d >> 2] | 0;
    if ((f | 0) <= -1) Oa(19264, 19297, 66, 19366);
    if ((a | 0) != 2) Oa(14066, 14080, 110, 14157);
    p[m >> 3] = r - s * +p[(i + (l << 3) + 8) >> 3];
    l = (l + 2) | 0;
    k[e >> 2] = l;
    i = (i + (l << 3)) | 0;
    l = (g | 0) > -1;
    if (!(l | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    a = (t + 16) | 0;
    if (!l) Oa(19264, 19297, 66, 19366);
    if (g | 0) iF(a | 0, 0, (g << 3) | 0) | 0;
    Bi(g, 1, 2, i, f, t, 2, a, g);
    l = k[x >> 2] | 0;
    q = k[h >> 2] | 0;
    j = k[u >> 2] | 0;
    m = k[c >> 2] | 0;
    n = k[y >> 2] | 0;
    o = k[b >> 2] | 0;
    if ((l | 0) <= (v | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(q + (v << 2)) >> 2] | 0;
    if ((j | 0) <= 0) Oa(16605, 15693, 425, 29764);
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    p[(o + (i << 3)) >> 3] = +p[m >> 3];
    i = (v + 2) | 0;
    if ((l | 0) <= (w | 0)) Oa(16605, 15693, 425, 29764);
    l = k[(q + (w << 2)) >> 2] | 0;
    if ((j | 0) <= 1) Oa(16605, 15693, 425, 29764);
    if (!(((l | 0) > -1) & ((n | 0) > (l | 0)))) Oa(16605, 15693, 425, 29764);
    p[(o + (l << 3)) >> 3] = +p[(m + 8) >> 3];
    if ((g | 0) <= 0) return;
    d = k[x >> 2] | 0;
    j = k[h >> 2] | 0;
    q = k[y >> 2] | 0;
    n = k[b >> 2] | 0;
    o = (i | 0) > -1;
    l = 0;
    while (1) {
      if (!(o & ((d | 0) > (i | 0)))) {
        i = 26;
        break;
      }
      m = k[(j + (i << 2)) >> 2] | 0;
      if (!(((m | 0) > -1) & ((q | 0) > (m | 0)))) {
        i = 28;
        break;
      }
      b = (n + (m << 3)) | 0;
      p[b >> 3] = +p[b >> 3] - +p[(a + (l << 3)) >> 3];
      l = (l + 1) | 0;
      if ((l | 0) >= (g | 0)) {
        i = 30;
        break;
      } else i = (i + 1) | 0;
    }
    if ((i | 0) == 26) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 28) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 30) return;
  }
  function Ei(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0.0,
      t = 0.0,
      u = 0.0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0;
    z = (j + i) | 0;
    A = (h + 4) | 0;
    l = k[A >> 2] | 0;
    m = k[h >> 2] | 0;
    B = (b + 4) | 0;
    n = k[B >> 2] | 0;
    o = k[b >> 2] | 0;
    w = (c + 4) | 0;
    q = k[w >> 2] | 0;
    v = k[c >> 2] | 0;
    if (!(((z | 0) > -1) & ((l | 0) > (z | 0)))) Oa(16605, 15693, 425, 29764);
    i = k[(m + (z << 2)) >> 2] | 0;
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    if ((q | 0) <= 0) Oa(16605, 15693, 425, 29764);
    u = +p[(o + (i << 3)) >> 3];
    p[v >> 3] = u;
    x = (z + 1) | 0;
    if ((l | 0) <= (x | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(m + (x << 2)) >> 2] | 0;
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    if ((q | 0) <= 1) Oa(16605, 15693, 425, 29764);
    t = +p[(o + (i << 3)) >> 3];
    r = (v + 8) | 0;
    p[r >> 3] = t;
    y = (z + 2) | 0;
    if ((l | 0) <= (y | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(m + (y << 2)) >> 2] | 0;
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    if ((q | 0) <= 2) Oa(16605, 15693, 425, 29764);
    s = +p[(o + (i << 3)) >> 3];
    n = (v + 16) | 0;
    p[n >> 3] = s;
    m = ((aa(j, f) | 0) + j) | 0;
    m = (m + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = m;
    l = k[d >> 2] | 0;
    i = (l + (m << 3)) | 0;
    if ((f | 0) <= -1) Oa(19264, 19297, 66, 19366);
    if ((a | 0) != 3) Oa(14066, 14080, 110, 14157);
    t = t - u * +p[(i + 8) >> 3];
    p[r >> 3] = t;
    i = (i + 16) | 0;
    p[n >> 3] = s - (u * +p[i >> 3] + t * +p[(i + (f << 3)) >> 3]);
    i = (m + 3) | 0;
    k[e >> 2] = i;
    i = (l + (i << 3)) | 0;
    l = (g | 0) > -1;
    if (!(l | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    d = (v + 24) | 0;
    if (!l) Oa(19264, 19297, 66, 19366);
    if (g | 0) iF(d | 0, 0, (g << 3) | 0) | 0;
    Bi(g, 1, 3, i, f, v, 3, d, g);
    l = k[A >> 2] | 0;
    q = k[h >> 2] | 0;
    r = k[w >> 2] | 0;
    m = k[c >> 2] | 0;
    n = k[B >> 2] | 0;
    o = k[b >> 2] | 0;
    if ((l | 0) <= (z | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(q + (z << 2)) >> 2] | 0;
    if ((r | 0) <= 0) Oa(16605, 15693, 425, 29764);
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    p[(o + (i << 3)) >> 3] = +p[m >> 3];
    if ((l | 0) <= (x | 0)) Oa(16605, 15693, 425, 29764);
    i = k[(q + (x << 2)) >> 2] | 0;
    if ((r | 0) <= 1) Oa(16605, 15693, 425, 29764);
    if (!(((i | 0) > -1) & ((n | 0) > (i | 0)))) Oa(16605, 15693, 425, 29764);
    p[(o + (i << 3)) >> 3] = +p[(m + 8) >> 3];
    i = (z + 3) | 0;
    if ((l | 0) <= (y | 0)) Oa(16605, 15693, 425, 29764);
    l = k[(q + (y << 2)) >> 2] | 0;
    if ((r | 0) <= 2) Oa(16605, 15693, 425, 29764);
    if (!(((l | 0) > -1) & ((n | 0) > (l | 0)))) Oa(16605, 15693, 425, 29764);
    p[(o + (l << 3)) >> 3] = +p[(m + 16) >> 3];
    if ((g | 0) <= 0) return;
    j = k[A >> 2] | 0;
    r = k[h >> 2] | 0;
    q = k[B >> 2] | 0;
    n = k[b >> 2] | 0;
    o = (i | 0) > -1;
    l = 0;
    while (1) {
      if (!(o & ((j | 0) > (i | 0)))) {
        i = 26;
        break;
      }
      m = k[(r + (i << 2)) >> 2] | 0;
      if (!(((m | 0) > -1) & ((q | 0) > (m | 0)))) {
        i = 28;
        break;
      }
      b = (n + (m << 3)) | 0;
      p[b >> 3] = +p[b >> 3] - +p[(d + (l << 3)) >> 3];
      l = (l + 1) | 0;
      if ((l | 0) >= (g | 0)) {
        i = 30;
        break;
      } else i = (i + 1) | 0;
    }
    if ((i | 0) == 26) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 28) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 30) return;
  }
  function Fi(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0;
    D = u;
    u = (u + 48) | 0;
    x = (D + 44) | 0;
    B = (D + 32) | 0;
    y = (D + 24) | 0;
    z = D;
    C = (j + i) | 0;
    A = (a | 0) > 0;
    a: do
      if (A) {
        n = k[(h + 4) >> 2] | 0;
        o = k[h >> 2] | 0;
        q = k[(b + 4) >> 2] | 0;
        r = k[(c + 4) >> 2] | 0;
        s = k[b >> 2] | 0;
        t = k[c >> 2] | 0;
        v = (C | 0) > -1;
        i = C;
        m = 0;
        while (1) {
          if (!(v & ((n | 0) > (i | 0)))) {
            i = 4;
            break;
          }
          w = k[(o + (i << 2)) >> 2] | 0;
          if (!(((w | 0) > -1) & ((q | 0) > (w | 0)))) {
            i = 6;
            break;
          }
          if ((r | 0) <= (m | 0)) {
            i = 8;
            break;
          }
          p[(t + (m << 3)) >> 3] = +p[(s + (w << 3)) >> 3];
          m = (m + 1) | 0;
          if ((m | 0) >= (a | 0)) break a;
          else i = (i + 1) | 0;
        }
        if ((i | 0) == 4) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 6) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 8) Oa(16605, 15693, 425, 29764);
      }
    while (0);
    i = ((aa(j, f) | 0) + j) | 0;
    i = (i + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = i;
    i = ((k[d >> 2] | 0) + (i << 3)) | 0;
    if ((f | 0) <= -1) Oa(19264, 19297, 66, 19366);
    m = (a | 0) > -1;
    if (!(m | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[B >> 2] = k[c >> 2];
    n = (B + 4) | 0;
    k[n >> 2] = a;
    if (!m) Oa(14697, 13988, 163, 14058);
    k[z >> 2] = i;
    k[(z + 4) >> 2] = a;
    k[(z + 8) >> 2] = a;
    k[(z + 12) >> 2] = f;
    k[y >> 2] = z;
    k[(y + 4) >> 2] = B;
    Li(B, y, x);
    i = ((k[e >> 2] | 0) + a) | 0;
    k[e >> 2] = i;
    i = ((k[d >> 2] | 0) + (i << 3)) | 0;
    if (!(((g | a | 0) > -1) | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    j = ((k[c >> 2] | 0) + (a << 3)) | 0;
    if ((g | 0) <= -1) Oa(19264, 19297, 66, 19366);
    if (g | 0) iF(j | 0, 0, (g << 3) | 0) | 0;
    Bi(g, 1, a, i, f, k[B >> 2] | 0, k[n >> 2] | 0, j, g);
    b: do
      if (A) {
        t = k[(h + 4) >> 2] | 0;
        v = k[h >> 2] | 0;
        w = k[(c + 4) >> 2] | 0;
        o = k[c >> 2] | 0;
        q = k[(b + 4) >> 2] | 0;
        r = k[b >> 2] | 0;
        s = (C | 0) > -1;
        i = C;
        m = 0;
        while (1) {
          n = (i + 1) | 0;
          if (!(s & ((t | 0) > (i | 0)))) {
            i = 27;
            break;
          }
          i = k[(v + (i << 2)) >> 2] | 0;
          if ((w | 0) <= (m | 0)) {
            i = 29;
            break;
          }
          if (!(((i | 0) > -1) & ((q | 0) > (i | 0)))) {
            i = 31;
            break;
          }
          p[(r + (i << 3)) >> 3] = +p[(o + (m << 3)) >> 3];
          m = (m + 1) | 0;
          if ((m | 0) >= (a | 0)) {
            l = n;
            break b;
          } else i = n;
        }
        if ((i | 0) == 27) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 29) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 31) Oa(16605, 15693, 425, 29764);
      } else l = C;
    while (0);
    if ((g | 0) <= 0) {
      u = D;
      return;
    }
    s = k[(h + 4) >> 2] | 0;
    q = k[h >> 2] | 0;
    r = k[(b + 4) >> 2] | 0;
    n = k[b >> 2] | 0;
    o = (l | 0) > -1;
    i = 0;
    while (1) {
      if (!(o & ((s | 0) > (l | 0)))) {
        i = 34;
        break;
      }
      m = k[(q + (l << 2)) >> 2] | 0;
      if (!(((m | 0) > -1) & ((r | 0) > (m | 0)))) {
        i = 36;
        break;
      }
      b = (n + (m << 3)) | 0;
      p[b >> 3] = +p[b >> 3] - +p[(j + (i << 3)) >> 3];
      i = (i + 1) | 0;
      if ((i | 0) >= (g | 0)) {
        i = 38;
        break;
      } else l = (l + 1) | 0;
    }
    if ((i | 0) == 34) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 36) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 38) {
      u = D;
      return;
    }
  }
  function Gi(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    m = k[b >> 2] | 0;
    b = k[(b + 4) >> 2] | 0;
    l = k[(b + 8) >> 2] | 0;
    h = k[(a + 4) >> 2] | 0;
    if ((h | 0) != (k[(m + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
    if ((k[(a + 8) >> 2] | 0) != (l | 0) ? (k[(a + 8) >> 2] | 0) != (l | 0) : 0) Oa(14445, 14320, 257, 12780);
    i = k[a >> 2] | 0;
    j = k[b >> 2] | 0;
    if ((i | 0) == (j | 0)) {
      c = k[(b + 12) >> 2] | 0;
      if ((k[(a + 12) >> 2] | 0) != (c | 0)) d = 8;
    } else {
      c = k[(b + 12) >> 2] | 0;
      d = 8;
    }
    if ((d | 0) == 8) {
      if ((h | 0) != (k[(b + 4) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      if ((l | 0) != (k[(b + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      e = k[(a + 12) >> 2] | 0;
      if (((h | 0) > 0) & ((l | 0) > 0)) {
        b = 0;
        do {
          f = aa(b, e) | 0;
          g = aa(b, c) | 0;
          d = 0;
          do {
            p[(i + ((d + f) << 3)) >> 3] = +p[(j + ((d + g) << 3)) >> 3];
            d = (d + 1) | 0;
          } while ((d | 0) != (h | 0));
          b = (b + 1) | 0;
        } while ((b | 0) != (l | 0));
      }
    }
    l = k[(m + 8) >> 2] | 0;
    if ((l | 0) == (h | 0) ? (l | 0) == (k[(m + 4) >> 2] | 0) : 0) {
      Hi(m, a);
      return;
    } else Oa(19710, 19864, 170, 18516);
  }
  function Hi(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    d = u;
    u = (u + 32) | 0;
    j = (d + 28) | 0;
    c = d;
    f = k[(a + 4) >> 2] | 0;
    e = k[(b + 8) >> 2] | 0;
    h = k[(b + 4) >> 2] | 0;
    i = c;
    k[i >> 2] = 0;
    k[(i + 4) >> 2] = 0;
    i = (c + 8) | 0;
    k[i >> 2] = h;
    h = (c + 12) | 0;
    k[h >> 2] = e;
    g = (c + 16) | 0;
    k[g >> 2] = f;
    k[j >> 2] = e;
    Ji(g, i, j, 1);
    g = k[g >> 2] | 0;
    i = aa(g, k[i >> 2] | 0) | 0;
    k[(c + 20) >> 2] = i;
    g = aa(k[h >> 2] | 0, g) | 0;
    k[(c + 24) >> 2] = g;
    Ii(f, e, k[a >> 2] | 0, k[(a + 12) >> 2] | 0, k[b >> 2] | 0, k[(b + 12) >> 2] | 0, c);
    a = k[c >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(c + 4) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = d;
    return;
  }
  function Ii(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0.0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0;
    _ = u;
    u = (u + 16) | 0;
    X = (_ + 10) | 0;
    Y = (_ + 9) | 0;
    Z = (_ + 8) | 0;
    U = _;
    W = k[(g + 16) >> 2] | 0;
    T = k[(g + 8) >> 2] | 0;
    T = (T | 0) < (a | 0) ? T : a;
    h = aa(T, W) | 0;
    m = aa(W, b) | 0;
    if (h >>> 0 > 536870911) {
      _ = Kb(4) | 0;
      cF(_);
      Cc(_ | 0, 2032, 79);
    }
    j = k[g >> 2] | 0;
    l = h << 3;
    if (!j)
      do
        if (l >>> 0 >= 131073) {
          h = Oq((l + 16) | 0) | 0;
          j = (h + 16) & -16;
          if (!h) {
            _ = Kb(4) | 0;
            cF(_);
            Cc(_ | 0, 2032, 79);
          }
          k[(j + -4) >> 2] = h;
          if (!j) {
            _ = Kb(4) | 0;
            cF(_);
            Cc(_ | 0, 2032, 79);
          } else {
            h = k[g >> 2] | 0;
            break;
          }
        } else {
          j = u;
          u = (u + ((((1 * ((l + 15) | 0)) | 0) + 15) & -16)) | 0;
          j = (j + 15) & -16;
          h = 0;
        }
      while (0);
    else h = j;
    S = (h | 0) == 0 ? j : 0;
    R = l >>> 0 > 131072;
    if (m >>> 0 > 536870911) {
      _ = Kb(4) | 0;
      cF(_);
      Cc(_ | 0, 2032, 79);
    }
    g = (g + 4) | 0;
    l = k[g >> 2] | 0;
    m = m << 3;
    if (!l)
      do
        if (m >>> 0 >= 131073) {
          h = Oq((m + 16) | 0) | 0;
          l = (h + 16) & -16;
          if (!h) {
            _ = Kb(4) | 0;
            cF(_);
            Cc(_ | 0, 2032, 79);
          }
          k[(l + -4) >> 2] = h;
          if (!l) {
            _ = Kb(4) | 0;
            cF(_);
            Cc(_ | 0, 2032, 79);
          } else {
            h = k[g >> 2] | 0;
            break;
          }
        } else {
          l = u;
          u = (u + ((((1 * ((m + 15) | 0)) | 0) + 15) & -16)) | 0;
          l = (l + 15) & -16;
          h = 0;
        }
      while (0);
    else h = l;
    Q = (h | 0) == 0 ? l : 0;
    O = m >>> 0 > 131072;
    if ((i[31304] | 0) == 0 ? aF(31304) | 0 : 0) {
      k[7994] = 16384;
      k[7995] = 524288;
      k[7996] = 524288;
    }
    P = (b | 0) > 0;
    if (P) h = ((((((k[7995] | 0) >>> 0) / ((((f | 0) < (a | 0) ? a : f) << 5) >>> 0)) | 0 | 0) / 4) | 0) << 2;
    else h = 0;
    I = (h | 0) > 4 ? h : 4;
    a: do
      if ((a | 0) > 0) {
        J = (U + 4) | 0;
        K = (U + 4) | 0;
        L = (U + 4) | 0;
        M = (U + 4) | 0;
        N = (U + 4) | 0;
        G = 0;
        do {
          H = (a - G) | 0;
          H = (W | 0) < (H | 0) ? W : H;
          if (P) {
            F = (H | 0) > 0;
            w = 0;
            do {
              z = (b - w) | 0;
              z = (I | 0) < (z | 0) ? I : z;
              if (F) {
                A = (z + w) | 0;
                B = (z | 0) > 0;
                C = (l + ((aa(w, H) | 0) << 3)) | 0;
                D = aa(w, f) | 0;
                x = 0;
                do {
                  n = (H - x) | 0;
                  y = (n | 0) < 4 ? n : 4;
                  E = (x + G) | 0;
                  if ((n | 0) > 0 ? ((V = (y + -1) | 0), B) : 0) {
                    h = 0;
                    do {
                      o = (h + E) | 0;
                      q = (V - h) | 0;
                      r = (o + 1) | 0;
                      s = (c + (((aa(o, d) | 0) + r) << 3)) | 0;
                      if ((q | 0) > 0) {
                        m = w;
                        do {
                          v = aa(m, f) | 0;
                          t = +p[(e + ((v + o) << 3)) >> 3];
                          v = (e + ((v + r) << 3)) | 0;
                          g = 0;
                          do {
                            $ = (v + (g << 3)) | 0;
                            p[$ >> 3] = +p[$ >> 3] - t * +p[(s + (g << 3)) >> 3];
                            g = (g + 1) | 0;
                          } while ((g | 0) < (q | 0));
                          m = (m + 1) | 0;
                        } while ((m | 0) < (A | 0));
                      }
                      h = (h + 1) | 0;
                    } while ((y | 0) > (h | 0));
                  }
                  h = (n - y) | 0;
                  k[U >> 2] = e + ((E + D) << 3);
                  k[L >> 2] = f;
                  Ki(Z, C, U, y, z, H, x);
                  if ((h | 0) > 0) {
                    $ = (y + E) | 0;
                    E = (c + (($ + (aa(E, d) | 0)) << 3)) | 0;
                    k[U >> 2] = E;
                    k[M >> 2] = d;
                    ag(Y, j, U, y, h, 0, 0);
                    k[U >> 2] = e + (($ + D) << 3);
                    k[N >> 2] = f;
                    cg(X, U, j, C, h, y, z, -1.0, y, H, 0, x);
                  }
                  x = (x + 4) | 0;
                } while ((H | 0) > (x | 0));
              }
              w = (w + I) | 0;
            } while ((w | 0) < (b | 0));
          }
          h = G;
          G = (G + W) | 0;
          n = (G | 0) < (a | 0);
          if (!n) break a;
          m = aa(h, d) | 0;
          h = G;
          do {
            g = (a - h) | 0;
            g = (g | 0) < (T | 0) ? g : T;
            if ((g | 0) > 0) {
              k[U >> 2] = c + ((h + m) << 3);
              k[J >> 2] = d;
              ag(Y, j, U, H, g, 0, 0);
              k[U >> 2] = e + (h << 3);
              k[K >> 2] = f;
              cg(X, U, j, l, g, H, b, -1.0, -1, -1, 0, 0);
            }
            h = (h + T) | 0;
          } while ((h | 0) < (a | 0));
        } while (n);
      }
    while (0);
    if (!(((Q | 0) == 0) | (O ^ 1))) Pq(k[(Q + -4) >> 2] | 0);
    if (((S | 0) == 0) | (R ^ 1)) {
      u = _;
      return;
    }
    Pq(k[(S + -4) >> 2] | 0);
    u = _;
    return;
  }
  function Ji(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    if ((i[31304] | 0) == 0 ? aF(31304) | 0 : 0) {
      k[7994] = 16384;
      k[7995] = 524288;
      k[7996] = 524288;
    }
    m = k[7994] | 0;
    o = k[7995] | 0;
    n = k[7996] | 0;
    if ((d | 0) > 1) {
      f = (((m + -32) | 0) / 160) | 0;
      f = (f | 0) < 320 ? f : 320;
      e = k[a >> 2] | 0;
      if ((f | 0) < (e | 0)) {
        e = (f - ((f | 0) % 8 | 0)) | 0;
        k[a >> 2] = e;
      }
      e = ((((o - m) | 0) >>> 0) / ((e << 5) >>> 0)) | 0;
      f = k[c >> 2] | 0;
      h = (d + -1) | 0;
      g = (((h + f) | 0) / (d | 0)) | 0;
      if ((e | 0) > (g | 0)) {
        e = (g + 3) | 0;
        e = (e - ((e | 0) % 4 | 0)) | 0;
        e = (e | 0) < (f | 0) ? e : f;
      } else e = (e - ((e | 0) % 4 | 0)) | 0;
      k[c >> 2] = e;
      if ((n | 0) <= (o | 0)) return;
      f = ((((n - o) | 0) >>> 0) / ((aa(d << 3, k[a >> 2] | 0) | 0) >>> 0)) | 0;
      g = k[b >> 2] | 0;
      e = (((h + g) | 0) / (d | 0)) | 0;
      if (((f | 0) > 0) & ((f | 0) < (e | 0))) {
        k[b >> 2] = f;
        return;
      } else {
        k[b >> 2] = (e | 0) < (g | 0) ? e : g;
        return;
      }
    }
    e = k[b >> 2] | 0;
    f = k[c >> 2] | 0;
    j = (e | 0) < (f | 0) ? f : e;
    l = k[a >> 2] | 0;
    if ((((l | 0) < (j | 0) ? j : l) | 0) < 48) return;
    d = (m + -32) | 0;
    j = (((d | 0) / 160) | 0) & -8;
    j = (j | 0) > 1 ? j : 1;
    if ((l | 0) > (j | 0)) {
      e = (l | 0) % (j | 0) | 0;
      if (!e) e = j;
      else e = (j - (((((j + -1 - e) | 0) / ((((((l | 0) / (j | 0)) | 0) << 3) + 8) | 0)) | 0) << 3)) | 0;
      k[a >> 2] = e;
      a = k[b >> 2] | 0;
      g = e;
      h = k[c >> 2] | 0;
    } else {
      a = e;
      g = l;
      h = f;
    }
    d = (d - (aa(a << 3, g) | 0)) | 0;
    e = (d | 0) < ((g << 5) | 0);
    j = (((e ? 4718592 : d) >>> 0) / ((e ? j << 5 : g << 3) >>> 0)) | 0;
    e = (1572864 / ((g << 4) >>> 0)) | 0;
    e = ((j | 0) < (e | 0) ? j : e) & -4;
    if ((h | 0) > (e | 0)) {
      f = (h | 0) % (e | 0) | 0;
      if (f) e = (e - (((((e - f) | 0) / ((((((h | 0) / (e | 0)) | 0) << 2) + 4) | 0)) | 0) << 2)) | 0;
      k[c >> 2] = e;
      return;
    }
    if ((l | 0) != (g | 0)) return;
    e = aa(l << 3, h) | 0;
    if ((e | 0) < 1025) {
      f = a;
      e = m;
    } else {
      e = ((n | 0) != 0) & ((e | 0) < 32769);
      f = e ? ((a | 0) < 576 ? a : 576) : a;
      e = e ? o : 1572864;
    }
    e = ((e >>> 0) / (((l * 24) | 0) >>> 0)) | 0;
    e = (f | 0) < (e | 0) ? f : e;
    if (!e) return;
    f = (a | 0) % (e | 0) | 0;
    if (f) e = (e - ((((e - f) | 0) / (((((a | 0) / (e | 0)) | 0) + 1) | 0)) | 0)) | 0;
    k[b >> 2] = e;
    return;
  }
  function Ki(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0;
    if (((f | 0) < (d | 0)) | ((f | 0) < (g | 0))) Oa(15454, 15545, 1906, 29764);
    l = (((e | 0) / 4) | 0) << 2;
    do
      if ((e | 0) > 3) {
        m = g << 2;
        n = k[c >> 2] | 0;
        o = k[(c + 4) >> 2] | 0;
        q = (f - d - g) << 2;
        if ((d | 0) <= 0) {
          w = f << 2;
          a = d << 2;
          a = ((aa(((((l | 0) > 4 ? l : 4) + -1) | 0) >>> 2, (w - a) | 0) | 0) + w - a) | 0;
          break;
        }
        r = (m + (d << 2)) | 0;
        w = (l | 0) > 4 ? l : 4;
        h = 0;
        i = 0;
        while (1) {
          s = (n + ((aa(o, h) | 0) << 3)) | 0;
          t = (n + ((aa(o, h | 1) | 0) << 3)) | 0;
          u = (n + ((aa(o, h | 2) | 0) << 3)) | 0;
          v = (n + ((aa(o, h | 3) | 0) << 3)) | 0;
          a = 0;
          j = (i + m) | 0;
          while (1) {
            p[(b + (j << 3)) >> 3] = +p[(s + (a << 3)) >> 3];
            p[(b + ((j + 1) << 3)) >> 3] = +p[(t + (a << 3)) >> 3];
            p[(b + ((j + 2) << 3)) >> 3] = +p[(u + (a << 3)) >> 3];
            p[(b + ((j + 3) << 3)) >> 3] = +p[(v + (a << 3)) >> 3];
            a = (a + 1) | 0;
            if ((a | 0) == (d | 0)) break;
            else j = (j + 4) | 0;
          }
          h = (h + 4) | 0;
          if ((h | 0) >= (l | 0)) break;
          else i = (r + i + q) | 0;
        }
        a = aa(w, f) | 0;
      } else a = 0;
    while (0);
    if ((l | 0) >= (e | 0)) return;
    n = k[c >> 2] | 0;
    m = k[(c + 4) >> 2] | 0;
    if ((d | 0) <= 0) return;
    while (1) {
      j = (n + ((aa(m, l) | 0) << 3)) | 0;
      h = 0;
      i = (a + g) | 0;
      while (1) {
        p[(b + (i << 3)) >> 3] = +p[(j + (h << 3)) >> 3];
        h = (h + 1) | 0;
        if ((h | 0) == (d | 0)) break;
        else i = (i + 1) | 0;
      }
      l = (l + 1) | 0;
      if ((l | 0) == (e | 0)) break;
      else a = (a + f) | 0;
    }
    return;
  }
  function Li(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    e = k[b >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    if ((f | 0) != (k[(e + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
    c = k[(b + 4) >> 2] | 0;
    b = k[a >> 2] | 0;
    d = k[c >> 2] | 0;
    c = k[(c + 4) >> 2] | 0;
    if (!(((b | 0) == (d | 0)) & ((f | 0) == (c | 0)))) {
      if ((f | 0) != (c | 0)) Oa(14445, 14320, 257, 12780);
      if ((f | 0) > 0) {
        c = 0;
        do {
          p[(b + (c << 3)) >> 3] = +p[(d + (c << 3)) >> 3];
          c = (c + 1) | 0;
        } while ((c | 0) != (f | 0));
      }
    }
    d = k[(e + 8) >> 2] | 0;
    if ((d | 0) == (f | 0) ? (d | 0) == (k[(e + 4) >> 2] | 0) : 0) {
      Mi(e, a);
      return;
    } else Oa(19710, 19864, 170, 18516);
  }
  function Mi(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = u;
    c = k[(b + 4) >> 2] | 0;
    if (c >>> 0 > 536870911) {
      f = Kb(4) | 0;
      cF(f);
      Cc(f | 0, 2032, 79);
    }
    d = k[b >> 2] | 0;
    e = c << 3;
    if (!d)
      do
        if (e >>> 0 >= 131073) {
          c = Oq((e + 16) | 0) | 0;
          d = (c + 16) & -16;
          if (!c) {
            f = Kb(4) | 0;
            cF(f);
            Cc(f | 0, 2032, 79);
          }
          k[(d + -4) >> 2] = c;
          if (!d) {
            f = Kb(4) | 0;
            cF(f);
            Cc(f | 0, 2032, 79);
          } else {
            c = k[b >> 2] | 0;
            break;
          }
        } else {
          d = u;
          u = (u + ((((1 * ((e + 15) | 0)) | 0) + 15) & -16)) | 0;
          d = (d + 15) & -16;
          c = 0;
        }
      while (0);
    else c = d;
    c = (c | 0) == 0 ? d : 0;
    Ni(k[(a + 8) >> 2] | 0, k[a >> 2] | 0, k[(a + 12) >> 2] | 0, d);
    if (((c | 0) == 0) | ((e >>> 0 > 131072) ^ 1)) {
      u = f;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Ni(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0.0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0;
    v = u;
    u = (u + 16) | 0;
    r = (v + 8) | 0;
    s = v;
    if ((c | 0) <= -1) Oa(19264, 19297, 66, 19366);
    t = (a | 0) > -1;
    if (!(t | ((b | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((a | 0) <= 0) {
      u = v;
      return;
    }
    n = (r + 4) | 0;
    o = (s + 4) | 0;
    l = 0;
    a: while (1) {
      j = (a - l) | 0;
      m = (j | 0) < 8 ? j : 8;
      q = (m + l) | 0;
      b: do
        if ((j | 0) > 0) {
          if (t) {
            h = 0;
            while (1) {
              e = (h + l) | 0;
              j = (m - h) | 0;
              i = (j + -1) | 0;
              f = (e + 1) | 0;
              if ((j | 0) > 1) {
                if ((e | 0) >= (a | 0)) {
                  e = 21;
                  break a;
                }
                j = (b + ((aa(e, c) | 0) << 3) + (f << 3)) | 0;
                if (((i | f | 0) < 0) | (((a - i) | 0) <= (e | 0))) {
                  e = 23;
                  break a;
                }
                g = +p[(d + (e << 3)) >> 3];
                f = (d + (f << 3)) | 0;
                e = 0;
                do {
                  w = (f + (e << 3)) | 0;
                  p[w >> 3] = +p[w >> 3] - g * +p[(j + (e << 3)) >> 3];
                  e = (e + 1) | 0;
                } while ((e | 0) != (i | 0));
              }
              h = (h + 1) | 0;
              if ((m | 0) <= (h | 0)) break b;
            }
          } else h = 0;
          do {
            e = (h + l) | 0;
            w = (m - h) | 0;
            i = (w + -1) | 0;
            f = (e + 1) | 0;
            if ((w | 0) > 1) {
              if ((b + ((aa(e, c) | 0) << 3)) | 0) {
                e = 19;
                break a;
              }
              if ((e | 0) >= (a | 0)) {
                e = 21;
                break a;
              }
              j = (0 + (f << 3)) | 0;
              if (((i | f | 0) < 0) | (((a - i) | 0) <= (e | 0))) {
                e = 23;
                break a;
              }
              g = +p[(d + (e << 3)) >> 3];
              f = (d + (f << 3)) | 0;
              e = 0;
              do {
                w = (f + (e << 3)) | 0;
                p[w >> 3] = +p[w >> 3] - g * +p[(j + (e << 3)) >> 3];
                e = (e + 1) | 0;
              } while ((e | 0) != (i | 0));
            }
            h = (h + 1) | 0;
          } while ((m | 0) > (h | 0));
        }
      while (0);
      e = (a - q) | 0;
      if ((e | 0) > 0) {
        w = (b + ((q + (aa(l, c) | 0)) << 3)) | 0;
        k[r >> 2] = w;
        k[n >> 2] = c;
        k[s >> 2] = d + (l << 3);
        k[o >> 2] = 1;
        Oi(e, m, r, s, (d + (q << 3)) | 0, 1, -1.0);
      }
      l = (l + 8) | 0;
      if ((l | 0) >= (a | 0)) {
        e = 7;
        break;
      }
    }
    if ((e | 0) == 7) {
      u = v;
      return;
    } else if ((e | 0) == 19) Oa(13818, 13988, 175, 14058);
    else if ((e | 0) == 21) Oa(13577, 13744, 122, 13812);
    else if ((e | 0) == 23) Oa(14177, 13744, 147, 13812);
  }
  function Oi(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = +g;
    var h = 0,
      i = 0.0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0.0,
      q = 0.0,
      r = 0.0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0.0;
    w = (c + 4) | 0;
    f = (((b | 0) / 4) | 0) << 2;
    if ((b | 0) > 3 ? ((t = k[d >> 2] | 0), (u = k[c >> 2] | 0), (v = k[w >> 2] | 0), (a | 0) > 0) : 0) {
      j = 0;
      do {
        i = +p[(t + (j << 3)) >> 3] * g;
        m = j | 1;
        o = +p[(t + (m << 3)) >> 3] * g;
        n = j | 2;
        q = +p[(t + (n << 3)) >> 3] * g;
        s = j | 3;
        r = +p[(t + (s << 3)) >> 3] * g;
        l = (u + ((aa(v, j) | 0) << 3)) | 0;
        m = (u + ((aa(v, m) | 0) << 3)) | 0;
        n = (u + ((aa(v, n) | 0) << 3)) | 0;
        s = (u + ((aa(v, s) | 0) << 3)) | 0;
        h = 0;
        do {
          x = (e + (h << 3)) | 0;
          y = i * +p[(l + (h << 3)) >> 3] + +p[x >> 3];
          p[x >> 3] = y;
          y = y + o * +p[(m + (h << 3)) >> 3];
          p[x >> 3] = y;
          y = y + q * +p[(n + (h << 3)) >> 3];
          p[x >> 3] = y;
          p[x >> 3] = y + r * +p[(s + (h << 3)) >> 3];
          h = (h + 1) | 0;
        } while ((h | 0) != (a | 0));
        j = (j + 4) | 0;
      } while ((j | 0) < (f | 0));
    }
    if ((f | 0) >= (b | 0)) return;
    n = k[d >> 2] | 0;
    m = k[c >> 2] | 0;
    l = k[w >> 2] | 0;
    if ((a | 0) <= 0) return;
    do {
      i = +p[(n + (f << 3)) >> 3] * g;
      j = (m + ((aa(l, f) | 0) << 3)) | 0;
      h = 0;
      do {
        x = (e + (h << 3)) | 0;
        p[x >> 3] = +p[x >> 3] + i * +p[(j + (h << 3)) >> 3];
        h = (h + 1) | 0;
      } while ((h | 0) != (a | 0));
      f = (f + 1) | 0;
    } while ((f | 0) != (b | 0));
    return;
  }
  function Pi(a, b, c, d, e, f, g, h, i, j, l, m, n, o, p) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    l = l | 0;
    m = m | 0;
    n = n | 0;
    o = o | 0;
    p = p | 0;
    var q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0;
    if ((o | 0) <= -1) Oa(16605, 15693, 425, 29764);
    N = (i + 4) | 0;
    if ((k[N >> 2] | 0) <= (o | 0)) Oa(16605, 15693, 425, 29764);
    O = ((k[i >> 2] | 0) + (o << 2)) | 0;
    r = k[O >> 2] | 0;
    k[O >> 2] = b;
    O = (c + 4) | 0;
    if ((k[O >> 2] | 0) <= (o | 0)) Oa(16605, 15693, 425, 29764);
    q = k[((k[c >> 2] | 0) + (o << 2)) >> 2] | 0;
    if ((q | 0) == -1) {
      a = k[n >> 2] | 0;
      k[n >> 2] = a + 1;
      if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
      if ((k[(e + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
      k[((k[e >> 2] | 0) + (a << 2)) >> 2] = o;
      a = k[n >> 2] | 0;
      o = k[(p + 8) >> 2] | 0;
      q = (o + 48) | 0;
      if ((a | 0) >= (k[q >> 2] | 0)) zi(k[(p + 12) >> 2] | 0, e, q, a, 0, (o + 88) | 0) | 0;
      if ((((k[p >> 2] | 0) + -1) | 0) == (r | 0)) return;
      k[k[(p + 4) >> 2] >> 2] = -1;
      return;
    }
    if ((q | 0) <= -1) Oa(16605, 15693, 425, 29764);
    K = (m + 12) | 0;
    if ((k[K >> 2] | 0) <= (q | 0)) Oa(16605, 15693, 425, 29764);
    L = (m + 8) | 0;
    M = k[((k[L >> 2] | 0) + (q << 2)) >> 2] | 0;
    a = (M + 1) | 0;
    if ((M | 0) <= -2) Oa(16605, 15693, 425, 29764);
    M = (m + 4) | 0;
    if ((k[M >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    r = k[((k[m >> 2] | 0) + (a << 2)) >> 2] | 0;
    s = (r + -1) | 0;
    if ((r | 0) <= 0) Oa(16605, 15693, 425, 29764);
    J = (g + 4) | 0;
    if ((k[J >> 2] | 0) < (r | 0)) Oa(16605, 15693, 425, 29764);
    o = ((k[g >> 2] | 0) + (s << 2)) | 0;
    a = k[o >> 2] | 0;
    if ((a | 0) != -1) {
      if ((a | 0) <= (q | 0)) return;
      k[o >> 2] = q;
      return;
    }
    I = (j + 4) | 0;
    if ((k[I >> 2] | 0) < (r | 0)) Oa(16605, 15693, 425, 29764);
    k[((k[j >> 2] | 0) + (s << 2)) >> 2] = -1;
    if ((k[J >> 2] | 0) < (r | 0)) Oa(16605, 15693, 425, 29764);
    k[o >> 2] = q;
    F = (m + 44) | 0;
    if ((k[F >> 2] | 0) < (r | 0)) Oa(16605, 15693, 425, 29764);
    G = (m + 40) | 0;
    H = (h + 4) | 0;
    if ((k[H >> 2] | 0) < (r | 0)) Oa(16605, 15693, 425, 29764);
    y = (f + 4) | 0;
    z = (l + 4) | 0;
    A = (m + 28) | 0;
    B = (m + 24) | 0;
    C = (e + 4) | 0;
    D = (p + 8) | 0;
    E = (p + 4) | 0;
    x = (p + 12) | 0;
    a = s;
    o = ((k[G >> 2] | 0) + (s << 2)) | 0;
    a: while (1) {
      o = k[o >> 2] | 0;
      q = k[((k[h >> 2] | 0) + (a << 2)) >> 2] | 0;
      b: do
        if ((o | 0) < (q | 0))
          while (1) {
            w = (o | 0) > -1;
            c: while (1) {
              if (!(w & ((k[A >> 2] | 0) > (o | 0)))) {
                a = 39;
                break a;
              }
              s = k[((k[B >> 2] | 0) + (o << 2)) >> 2] | 0;
              o = (o + 1) | 0;
              if ((s | 0) <= -1) {
                a = 42;
                break a;
              }
              if ((k[N >> 2] | 0) <= (s | 0)) {
                a = 42;
                break a;
              }
              r = ((k[i >> 2] | 0) + (s << 2)) | 0;
              u = k[r >> 2] | 0;
              do
                if ((u | 0) != (b | 0)) {
                  k[r >> 2] = b;
                  if ((k[O >> 2] | 0) <= (s | 0)) {
                    a = 45;
                    break a;
                  }
                  v = k[((k[c >> 2] | 0) + (s << 2)) >> 2] | 0;
                  if ((v | 0) == -1) {
                    r = k[n >> 2] | 0;
                    k[n >> 2] = r + 1;
                    if (!((r | 0) > -1 ? (k[C >> 2] | 0) > (r | 0) : 0)) {
                      a = 48;
                      break a;
                    }
                    k[((k[e >> 2] | 0) + (r << 2)) >> 2] = s;
                    r = k[n >> 2] | 0;
                    s = k[D >> 2] | 0;
                    t = (s + 48) | 0;
                    if ((r | 0) >= (k[t >> 2] | 0)) zi(k[x >> 2] | 0, e, t, r, 0, (s + 88) | 0) | 0;
                    if ((((k[p >> 2] | 0) + -1) | 0) == (u | 0)) break;
                    k[k[E >> 2] >> 2] = -1;
                    break;
                  }
                  if (!((v | 0) > -1 ? (k[K >> 2] | 0) > (v | 0) : 0)) {
                    a = 54;
                    break a;
                  }
                  u = k[((k[L >> 2] | 0) + (v << 2)) >> 2] | 0;
                  r = (u + 1) | 0;
                  if (!((u | 0) > -2 ? (k[M >> 2] | 0) > (r | 0) : 0)) {
                    a = 56;
                    break a;
                  }
                  r = k[((k[m >> 2] | 0) + (r << 2)) >> 2] | 0;
                  u = (r + -1) | 0;
                  if ((r | 0) <= 0) {
                    a = 59;
                    break a;
                  }
                  if ((k[J >> 2] | 0) < (r | 0)) {
                    a = 59;
                    break a;
                  }
                  s = ((k[g >> 2] | 0) + (u << 2)) | 0;
                  t = k[s >> 2] | 0;
                  if ((t | 0) == -1) break c;
                  if ((t | 0) <= (v | 0)) break;
                  k[s >> 2] = v;
                }
              while (0);
              if ((o | 0) >= (q | 0)) break b;
            }
            if (!((a | 0) > -1 ? (k[z >> 2] | 0) > (a | 0) : 0)) {
              a = 65;
              break a;
            }
            k[((k[l >> 2] | 0) + (a << 2)) >> 2] = o;
            if ((k[I >> 2] | 0) < (r | 0)) {
              a = 67;
              break a;
            }
            k[((k[j >> 2] | 0) + (u << 2)) >> 2] = a;
            if ((k[J >> 2] | 0) < (r | 0)) {
              a = 69;
              break a;
            }
            k[s >> 2] = v;
            if ((k[F >> 2] | 0) < (r | 0)) {
              a = 71;
              break a;
            }
            if ((k[H >> 2] | 0) < (r | 0)) {
              a = 73;
              break a;
            }
            o = k[((k[G >> 2] | 0) + (u << 2)) >> 2] | 0;
            q = k[((k[h >> 2] | 0) + (u << 2)) >> 2] | 0;
            if ((o | 0) >= (q | 0)) {
              a = u;
              break;
            } else a = u;
          }
      while (0);
      o = k[d >> 2] | 0;
      if (!((o | 0) > -1 ? (k[y >> 2] | 0) > (o | 0) : 0)) {
        a = 76;
        break;
      }
      k[((k[f >> 2] | 0) + (o << 2)) >> 2] = a;
      k[d >> 2] = (k[d >> 2] | 0) + 1;
      if (!((a | 0) > -1 ? (k[I >> 2] | 0) > (a | 0) : 0)) {
        a = 78;
        break;
      }
      o = k[((k[j >> 2] | 0) + (a << 2)) >> 2] | 0;
      if ((o | 0) == -1) {
        a = 82;
        break;
      }
      if (!((o | 0) > -1 ? (k[z >> 2] | 0) > (o | 0) : 0)) {
        a = 81;
        break;
      }
      if ((k[H >> 2] | 0) > (o | 0)) {
        a = o;
        o = ((k[l >> 2] | 0) + (o << 2)) | 0;
      } else {
        a = 35;
        break;
      }
    }
    switch (a | 0) {
      case 35: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 39: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 42: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 45: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 48: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 54: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 56: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 59: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 65: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 67: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 69: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 71: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 73: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 76: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 78: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 81: {
        Oa(16605, 15693, 425, 29764);
        break;
      }
      case 82:
        return;
    }
  }
  function Qi(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0.0,
      m = 0,
      n = 0.0;
    a = (j + i) | 0;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(h + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    c = k[h >> 2] | 0;
    a = k[(c + (a << 2)) >> 2] | 0;
    if ((a | 0) <= -1) Oa(16605, 15693, 425, 29764);
    if ((k[(b + 4) >> 2] | 0) <= (a | 0)) Oa(16605, 15693, 425, 29764);
    m = k[b >> 2] | 0;
    l = +p[(m + (a << 3)) >> 3];
    h = aa(j, f) | 0;
    h = (j + 1 + h + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = h;
    h = ((k[d >> 2] | 0) + (h << 3)) | 0;
    b = (c + (i << 2) + (j << 2)) | 0;
    c = (b + 4) | 0;
    if ((g | 0) > 1) {
      a = 0;
      while (1) {
        j = b;
        b = (b + 8) | 0;
        d = (h + 16) | 0;
        i = (m + (k[c >> 2] << 3)) | 0;
        c = (m + (k[b >> 2] << 3)) | 0;
        n = +p[c >> 3] - l * +p[(h + 8) >> 3];
        p[i >> 3] = +p[i >> 3] - l * +p[h >> 3];
        p[c >> 3] = n;
        a = (a + 2) | 0;
        c = (j + 12) | 0;
        if ((a | 1 | 0) >= (g | 0)) {
          h = d;
          break;
        } else h = d;
      }
    } else a = 0;
    if ((a | 0) >= (g | 0)) return;
    g = (m + (k[c >> 2] << 3)) | 0;
    p[g >> 3] = +p[g >> 3] - l * +p[h >> 3];
    return;
  }
  function Ri(a, b, c, d, e, f, g, h, i, j) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    h = h | 0;
    i = i | 0;
    j = j | 0;
    var l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0;
    C = u;
    u = (u + 48) | 0;
    w = (C + 44) | 0;
    A = (C + 32) | 0;
    x = (C + 24) | 0;
    y = C;
    B = (j + i) | 0;
    z = (a | 0) > 0;
    a: do
      if (z) {
        n = k[(h + 4) >> 2] | 0;
        o = k[h >> 2] | 0;
        q = (b + 4) | 0;
        r = k[(c + 4) >> 2] | 0;
        s = k[c >> 2] | 0;
        t = (B | 0) > -1;
        i = B;
        m = 0;
        while (1) {
          if (!(t & ((n | 0) > (i | 0)))) {
            i = 4;
            break;
          }
          v = k[(o + (i << 2)) >> 2] | 0;
          if ((v | 0) <= -1) {
            i = 7;
            break;
          }
          if ((k[q >> 2] | 0) <= (v | 0)) {
            i = 7;
            break;
          }
          if ((r | 0) <= (m | 0)) {
            i = 9;
            break;
          }
          p[(s + (m << 3)) >> 3] = +p[((k[b >> 2] | 0) + (v << 3)) >> 3];
          m = (m + 1) | 0;
          if ((m | 0) >= (a | 0)) break a;
          else i = (i + 1) | 0;
        }
        if ((i | 0) == 4) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 7) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 9) Oa(16605, 15693, 425, 29764);
      }
    while (0);
    i = ((aa(j, f) | 0) + j) | 0;
    i = (i + (k[e >> 2] | 0)) | 0;
    k[e >> 2] = i;
    i = ((k[d >> 2] | 0) + (i << 3)) | 0;
    if ((f | 0) <= -1) Oa(19264, 19297, 66, 19366);
    m = (a | 0) > -1;
    if (!(m | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[A >> 2] = k[c >> 2];
    n = (A + 4) | 0;
    k[n >> 2] = a;
    if (!m) Oa(14697, 13988, 163, 14058);
    k[y >> 2] = i;
    k[(y + 4) >> 2] = a;
    k[(y + 8) >> 2] = a;
    k[(y + 12) >> 2] = f;
    k[x >> 2] = y;
    k[(x + 4) >> 2] = A;
    Li(A, x, w);
    i = ((k[e >> 2] | 0) + a) | 0;
    k[e >> 2] = i;
    i = ((k[d >> 2] | 0) + (i << 3)) | 0;
    if (!(((g | a | 0) > -1) | ((i | 0) == 0))) Oa(13818, 13988, 175, 14058);
    j = ((k[c >> 2] | 0) + (a << 3)) | 0;
    if ((g | 0) <= -1) Oa(19264, 19297, 66, 19366);
    if (g | 0) iF(j | 0, 0, (g << 3) | 0) | 0;
    Bi(g, 1, a, i, f, k[A >> 2] | 0, k[n >> 2] | 0, j, g);
    b: do
      if (z) {
        s = k[(h + 4) >> 2] | 0;
        t = k[h >> 2] | 0;
        v = k[(c + 4) >> 2] | 0;
        o = k[c >> 2] | 0;
        q = (b + 4) | 0;
        r = (B | 0) > -1;
        i = B;
        m = 0;
        while (1) {
          n = (i + 1) | 0;
          if (!(r & ((s | 0) > (i | 0)))) {
            i = 28;
            break;
          }
          i = k[(t + (i << 2)) >> 2] | 0;
          if ((v | 0) <= (m | 0)) {
            i = 30;
            break;
          }
          if ((i | 0) <= -1) {
            i = 33;
            break;
          }
          if ((k[q >> 2] | 0) <= (i | 0)) {
            i = 33;
            break;
          }
          p[((k[b >> 2] | 0) + (i << 3)) >> 3] = +p[(o + (m << 3)) >> 3];
          m = (m + 1) | 0;
          if ((m | 0) >= (a | 0)) {
            l = n;
            break b;
          } else i = n;
        }
        if ((i | 0) == 28) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 30) Oa(16605, 15693, 425, 29764);
        else if ((i | 0) == 33) Oa(16605, 15693, 425, 29764);
      } else l = B;
    while (0);
    if ((g | 0) <= 0) {
      u = C;
      return;
    }
    r = k[(h + 4) >> 2] | 0;
    n = k[h >> 2] | 0;
    o = (b + 4) | 0;
    q = (l | 0) > -1;
    i = 0;
    while (1) {
      if (!(q & ((r | 0) > (l | 0)))) {
        i = 36;
        break;
      }
      m = k[(n + (l << 2)) >> 2] | 0;
      if ((m | 0) <= -1) {
        i = 39;
        break;
      }
      if ((k[o >> 2] | 0) <= (m | 0)) {
        i = 39;
        break;
      }
      h = ((k[b >> 2] | 0) + (m << 3)) | 0;
      p[h >> 3] = +p[h >> 3] - +p[(j + (i << 3)) >> 3];
      i = (i + 1) | 0;
      if ((i | 0) >= (g | 0)) {
        i = 41;
        break;
      } else l = (l + 1) | 0;
    }
    if ((i | 0) == 36) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 39) Oa(16605, 15693, 425, 29764);
    else if ((i | 0) == 41) {
      u = C;
      return;
    }
  }
  function Si(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0;
    e = k[b >> 2] | 0;
    f = k[(a + 4) >> 2] | 0;
    if ((f | 0) != (k[(e + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
    c = k[(b + 4) >> 2] | 0;
    b = k[a >> 2] | 0;
    d = k[c >> 2] | 0;
    if (!((b | 0) == (d | 0) ? (k[(a + 24) >> 2] | 0) == (k[(c + 24) >> 2] | 0) : 0)) {
      if ((f | 0) != (k[(c + 4) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      if ((f | 0) > 0) {
        c = 0;
        do {
          p[(b + (c << 3)) >> 3] = +p[(d + (c << 3)) >> 3];
          c = (c + 1) | 0;
        } while ((c | 0) != (f | 0));
      }
    }
    d = k[(e + 8) >> 2] | 0;
    if ((d | 0) == (f | 0) ? (d | 0) == (k[(e + 4) >> 2] | 0) : 0) {
      Ti(e, a);
      return;
    } else Oa(19710, 19864, 170, 18516);
  }
  function Ti(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    f = u;
    c = k[(b + 4) >> 2] | 0;
    if (c >>> 0 > 536870911) {
      f = Kb(4) | 0;
      cF(f);
      Cc(f | 0, 2032, 79);
    }
    d = k[b >> 2] | 0;
    e = c << 3;
    if (!d)
      do
        if (e >>> 0 >= 131073) {
          c = Oq((e + 16) | 0) | 0;
          d = (c + 16) & -16;
          if (!c) {
            f = Kb(4) | 0;
            cF(f);
            Cc(f | 0, 2032, 79);
          }
          k[(d + -4) >> 2] = c;
          if (!d) {
            f = Kb(4) | 0;
            cF(f);
            Cc(f | 0, 2032, 79);
          } else {
            c = k[b >> 2] | 0;
            break;
          }
        } else {
          d = u;
          u = (u + ((((1 * ((e + 15) | 0)) | 0) + 15) & -16)) | 0;
          d = (d + 15) & -16;
          c = 0;
        }
      while (0);
    else c = d;
    c = (c | 0) == 0 ? d : 0;
    Ni(k[(a + 8) >> 2] | 0, k[a >> 2] | 0, k[(a + 12) >> 2] | 0, d);
    if (((c | 0) == 0) | ((e >>> 0 > 131072) ^ 1)) {
      u = f;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = f;
    return;
  }
  function Ui(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = +g;
    var h = 0,
      i = 0.0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0.0,
      r = 0.0,
      s = 0.0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0.0;
    x = (c + 4) | 0;
    f = (((b | 0) / 4) | 0) << 2;
    if ((b | 0) > 3 ? ((t = k[d >> 2] | 0), (u = k[(d + 4) >> 2] | 0), (v = k[c >> 2] | 0), (w = k[x >> 2] | 0), (a | 0) > 0) : 0) {
      j = 0;
      do {
        m = (t + ((aa(u, j) | 0) << 3)) | 0;
        i = +p[m >> 3] * g;
        m = j | 1;
        n = (t + ((aa(u, m) | 0) << 3)) | 0;
        q = +p[n >> 3] * g;
        n = j | 2;
        o = (t + ((aa(u, n) | 0) << 3)) | 0;
        r = +p[o >> 3] * g;
        o = j | 3;
        l = (t + ((aa(u, o) | 0) << 3)) | 0;
        s = +p[l >> 3] * g;
        l = (v + ((aa(w, j) | 0) << 3)) | 0;
        m = (v + ((aa(w, m) | 0) << 3)) | 0;
        n = (v + ((aa(w, n) | 0) << 3)) | 0;
        o = (v + ((aa(w, o) | 0) << 3)) | 0;
        h = 0;
        do {
          y = (e + (h << 3)) | 0;
          z = i * +p[(l + (h << 3)) >> 3] + +p[y >> 3];
          p[y >> 3] = z;
          z = z + q * +p[(m + (h << 3)) >> 3];
          p[y >> 3] = z;
          z = z + r * +p[(n + (h << 3)) >> 3];
          p[y >> 3] = z;
          p[y >> 3] = z + s * +p[(o + (h << 3)) >> 3];
          h = (h + 1) | 0;
        } while ((h | 0) != (a | 0));
        j = (j + 4) | 0;
      } while ((j | 0) < (f | 0));
    }
    if ((f | 0) >= (b | 0)) return;
    o = k[d >> 2] | 0;
    n = k[(d + 4) >> 2] | 0;
    m = k[c >> 2] | 0;
    l = k[x >> 2] | 0;
    if ((a | 0) <= 0) return;
    do {
      j = (o + ((aa(n, f) | 0) << 3)) | 0;
      i = +p[j >> 3] * g;
      j = (m + ((aa(l, f) | 0) << 3)) | 0;
      h = 0;
      do {
        y = (e + (h << 3)) | 0;
        p[y >> 3] = +p[y >> 3] + i * +p[(j + (h << 3)) >> 3];
        h = (h + 1) | 0;
      } while ((h | 0) != (a | 0));
      f = (f + 1) | 0;
    } while ((f | 0) != (b | 0));
    return;
  }
  function Vi(a) {
    a = a | 0;
    var b = 0,
      c = 0;
    k[a >> 2] = 2804;
    b = (a + 56) | 0;
    k[b >> 2] = 2824;
    c = (a + 4) | 0;
    k[c >> 2] = 2856;
    NA((a + 36) | 0);
    br(c);
    Ar(a, 2836);
    Zq(b);
    EA(a);
    return;
  }
  function Wi(a) {
    a = a | 0;
    var b = 0,
      c = 0;
    b = (a + (k[((k[a >> 2] | 0) + -12) >> 2] | 0)) | 0;
    k[b >> 2] = 2804;
    a = (b + 56) | 0;
    k[a >> 2] = 2824;
    c = (b + 4) | 0;
    k[c >> 2] = 2856;
    NA((b + 36) | 0);
    br(c);
    Ar(b, 2836);
    Zq(a);
    return;
  }
  function Xi(a) {
    a = a | 0;
    var b = 0,
      c = 0;
    a = (a + (k[((k[a >> 2] | 0) + -12) >> 2] | 0)) | 0;
    k[a >> 2] = 2804;
    b = (a + 56) | 0;
    k[b >> 2] = 2824;
    c = (a + 4) | 0;
    k[c >> 2] = 2856;
    NA((a + 36) | 0);
    br(c);
    Ar(a, 2836);
    Zq(b);
    EA(a);
    return;
  }
  function Yi(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    g = (a + 32) | 0;
    OA(g, b) | 0;
    f = (a + 44) | 0;
    k[f >> 2] = 0;
    h = (a + 48) | 0;
    e = k[h >> 2] | 0;
    if ((e & 8) | 0) {
      b = i[(g + 11) >> 0] | 0;
      if ((b << 24) >> 24 < 0) {
        b = k[g >> 2] | 0;
        c = b;
        d = b;
        b = (b + (k[(a + 36) >> 2] | 0)) | 0;
      } else {
        c = g;
        d = g;
        b = (g + (b & 255)) | 0;
      }
      k[f >> 2] = b;
      k[(a + 8) >> 2] = c;
      k[(a + 12) >> 2] = d;
      k[(a + 16) >> 2] = b;
    }
    if (!(e & 16)) return;
    c = (g + 11) | 0;
    b = i[c >> 0] | 0;
    if ((b << 24) >> 24 < 0) {
      e = k[(a + 36) >> 2] | 0;
      k[f >> 2] = (k[g >> 2] | 0) + e;
      b = ((k[(a + 40) >> 2] & 2147483647) + -1) | 0;
      f = e;
    } else {
      e = b & 255;
      k[f >> 2] = g + e;
      b = 10;
      f = e;
    }
    UA(g, b, 0);
    b = i[c >> 0] | 0;
    if ((b << 24) >> 24 < 0) {
      c = k[g >> 2] | 0;
      e = c;
      d = k[(a + 36) >> 2] | 0;
    } else {
      e = g;
      d = b & 255;
      c = g;
    }
    b = (a + 24) | 0;
    k[b >> 2] = c;
    k[(a + 20) >> 2] = c;
    k[(a + 28) >> 2] = e + d;
    if (!(k[h >> 2] & 3)) return;
    k[b >> 2] = c + f;
    return;
  }
  function Zi(a) {
    a = a | 0;
    k[a >> 2] = 2856;
    NA((a + 32) | 0);
    br(a);
    return;
  }
  function _i(a) {
    a = a | 0;
    k[a >> 2] = 2856;
    NA((a + 32) | 0);
    br(a);
    EA(a);
    return;
  }
  function $i(a, b, c, d, e, f) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0;
    g = (b + 44) | 0;
    h = k[g >> 2] | 0;
    m = (b + 24) | 0;
    n = k[m >> 2] | 0;
    j = n;
    if (h >>> 0 < n >>> 0) {
      k[g >> 2] = n;
      l = j;
    } else l = h;
    h = f & 24;
    a: do
      if ((h | 0) != 0 ? !(((e | 0) == 1) & ((h | 0) == 24)) : 0) {
        b: do
          switch (e | 0) {
            case 0: {
              g = 0;
              h = 0;
              break;
            }
            case 1:
              if (!(f & 8)) {
                h = (j - (k[(b + 20) >> 2] | 0)) | 0;
                g = h;
                h = (((h | 0) < 0) << 31) >> 31;
                break b;
              } else {
                h = ((k[(b + 12) >> 2] | 0) - (k[(b + 8) >> 2] | 0)) | 0;
                g = h;
                h = (((h | 0) < 0) << 31) >> 31;
                break b;
              }
            case 2: {
              g = (b + 32) | 0;
              if ((i[(g + 11) >> 0] | 0) < 0) g = k[g >> 2] | 0;
              h = (l - g) | 0;
              g = h;
              h = (((h | 0) < 0) << 31) >> 31;
              break;
            }
            default: {
              h = -1;
              g = -1;
              break a;
            }
          }
        while (0);
        h = kF(g | 0, h | 0, c | 0, d | 0) | 0;
        g = N;
        if ((g | 0) >= 0) {
          j = (b + 32) | 0;
          if ((i[(j + 11) >> 0] | 0) < 0) j = k[j >> 2] | 0;
          d = (l - j) | 0;
          c = (((d | 0) < 0) << 31) >> 31;
          if (!(((c | 0) < (g | 0)) | (((c | 0) == (g | 0)) & (d >>> 0 < h >>> 0)))) {
            j = f & 8;
            if (!(((h | 0) == 0) & ((g | 0) == 0))) {
              if (j | 0 ? (k[(b + 12) >> 2] | 0) == 0 : 0) {
                h = -1;
                g = -1;
                break;
              }
              if ((((f & 16) | 0) != 0) & ((n | 0) == 0)) {
                h = -1;
                g = -1;
                break;
              }
            }
            if (j | 0) {
              k[(b + 12) >> 2] = (k[(b + 8) >> 2] | 0) + h;
              k[(b + 16) >> 2] = l;
            }
            if (f & 16) k[m >> 2] = (k[(b + 20) >> 2] | 0) + h;
          } else {
            h = -1;
            g = -1;
          }
        } else {
          h = -1;
          g = -1;
        }
      } else {
        h = -1;
        g = -1;
      }
    while (0);
    n = a;
    k[n >> 2] = 0;
    k[(n + 4) >> 2] = 0;
    a = (a + 8) | 0;
    k[a >> 2] = h;
    k[(a + 4) >> 2] = g;
    return;
  }
  function aj(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    c = (c + 8) | 0;
    Tc[k[((k[b >> 2] | 0) + 16) >> 2] & 15](a, b, k[c >> 2] | 0, k[(c + 4) >> 2] | 0, 0, d);
    return;
  }
  function bj(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0;
    b = (a + 44) | 0;
    d = k[b >> 2] | 0;
    c = k[(a + 24) >> 2] | 0;
    if (d >>> 0 < c >>> 0) {
      k[b >> 2] = c;
      d = c;
    }
    if (!(k[(a + 48) >> 2] & 8)) {
      a = -1;
      return a | 0;
    }
    b = (a + 16) | 0;
    c = k[b >> 2] | 0;
    if (c >>> 0 < d >>> 0) {
      k[b >> 2] = d;
      c = d;
    }
    b = k[(a + 12) >> 2] | 0;
    if (b >>> 0 >= c >>> 0) {
      a = -1;
      return a | 0;
    }
    a = l[b >> 0] | 0;
    return a | 0;
  }
  function cj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    d = (a + 44) | 0;
    c = k[d >> 2] | 0;
    e = k[(a + 24) >> 2] | 0;
    if (c >>> 0 < e >>> 0) {
      k[d >> 2] = e;
      c = e;
    }
    f = (a + 12) | 0;
    d = k[f >> 2] | 0;
    if ((k[(a + 8) >> 2] | 0) >>> 0 >= d >>> 0) {
      b = -1;
      return b | 0;
    }
    if ((b | 0) == -1) {
      k[f >> 2] = d + -1;
      k[(a + 16) >> 2] = c;
      b = 0;
      return b | 0;
    }
    if (!(k[(a + 48) >> 2] & 16)) {
      e = b & 255;
      d = (d + -1) | 0;
      if ((e << 24) >> 24 != (i[d >> 0] | 0)) {
        b = -1;
        return b | 0;
      }
    } else {
      e = b & 255;
      d = (d + -1) | 0;
    }
    k[f >> 2] = d;
    k[(a + 16) >> 2] = c;
    i[d >> 0] = e;
    return b | 0;
  }
  function dj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0;
    t = u;
    u = (u + 16) | 0;
    o = t;
    if ((b | 0) == -1) {
      s = 0;
      u = t;
      return s | 0;
    }
    p = (a + 12) | 0;
    q = (a + 8) | 0;
    r = ((k[p >> 2] | 0) - (k[q >> 2] | 0)) | 0;
    s = (a + 24) | 0;
    j = k[s >> 2] | 0;
    m = (a + 28) | 0;
    c = k[m >> 2] | 0;
    if ((j | 0) == (c | 0)) {
      h = (a + 48) | 0;
      if (!(k[h >> 2] & 16)) {
        s = -1;
        u = t;
        return s | 0;
      }
      f = (a + 20) | 0;
      g = k[f >> 2] | 0;
      n = (a + 44) | 0;
      l = ((k[n >> 2] | 0) - g) | 0;
      e = (a + 32) | 0;
      YA(e, 0);
      c = (e + 11) | 0;
      if ((i[c >> 0] | 0) < 0) d = ((k[(a + 40) >> 2] & 2147483647) + -1) | 0;
      else d = 10;
      UA(e, d, 0);
      c = i[c >> 0] | 0;
      if ((c << 24) >> 24 < 0) {
        d = k[e >> 2] | 0;
        c = k[(a + 36) >> 2] | 0;
      } else {
        d = e;
        c = c & 255;
      }
      c = (d + c) | 0;
      k[f >> 2] = d;
      k[m >> 2] = c;
      j = (d + (j - g)) | 0;
      k[s >> 2] = j;
      d = (d + l) | 0;
      k[n >> 2] = d;
      l = n;
      e = n;
      g = c;
    } else {
      d = (a + 44) | 0;
      l = d;
      h = (a + 48) | 0;
      e = d;
      d = k[d >> 2] | 0;
      g = c;
    }
    f = (j + 1) | 0;
    k[o >> 2] = f;
    d = k[(f >>> 0 < d >>> 0 ? e : o) >> 2] | 0;
    k[l >> 2] = d;
    if ((k[h >> 2] & 8) | 0) {
      c = (a + 32) | 0;
      if ((i[(c + 11) >> 0] | 0) < 0) c = k[c >> 2] | 0;
      k[q >> 2] = c;
      k[p >> 2] = c + r;
      k[(a + 16) >> 2] = d;
    }
    if ((j | 0) == (g | 0)) {
      s = Yc[k[((k[a >> 2] | 0) + 52) >> 2] & 63](a, b & 255) | 0;
      u = t;
      return s | 0;
    } else {
      k[s >> 2] = f;
      i[j >> 0] = b;
      s = b & 255;
      u = t;
      return s | 0;
    }
    return 0;
  }
  function ej(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0;
    c = k[(b + 48) >> 2] | 0;
    if ((c & 16) | 0) {
      c = (b + 44) | 0;
      d = k[c >> 2] | 0;
      e = k[(b + 24) >> 2] | 0;
      if (d >>> 0 < e >>> 0) k[c >> 2] = e;
      else e = d;
      c = k[(b + 20) >> 2] | 0;
      k[a >> 2] = 0;
      k[(a + 4) >> 2] = 0;
      k[(a + 8) >> 2] = 0;
      b = (e - c) | 0;
      if (b >>> 0 <= 4294967279)
        if (b >>> 0 < 11) i[(a + 11) >> 0] = b;
        else f = 8;
      else {
        HA(a);
        f = 8;
      }
      if ((f | 0) == 8) {
        d = (b + 16) & -16;
        f = CA(d) | 0;
        k[a >> 2] = f;
        k[(a + 8) >> 2] = d | -2147483648;
        k[(a + 4) >> 2] = b;
        a = f;
      }
      if ((c | 0) != (e | 0)) {
        d = a;
        while (1) {
          i[d >> 0] = i[c >> 0] | 0;
          c = (c + 1) | 0;
          if ((c | 0) == (e | 0)) break;
          else d = (d + 1) | 0;
        }
        a = (a + b) | 0;
      }
      i[a >> 0] = 0;
      return;
    }
    if (!(c & 8)) {
      k[a >> 2] = 0;
      k[(a + 4) >> 2] = 0;
      k[(a + 8) >> 2] = 0;
      return;
    }
    c = k[(b + 8) >> 2] | 0;
    e = k[(b + 16) >> 2] | 0;
    k[a >> 2] = 0;
    k[(a + 4) >> 2] = 0;
    k[(a + 8) >> 2] = 0;
    b = (e - c) | 0;
    if (b >>> 0 <= 4294967279)
      if (b >>> 0 < 11) i[(a + 11) >> 0] = b;
      else f = 18;
    else {
      HA(a);
      f = 18;
    }
    if ((f | 0) == 18) {
      d = (b + 16) & -16;
      f = CA(d) | 0;
      k[a >> 2] = f;
      k[(a + 8) >> 2] = d | -2147483648;
      k[(a + 4) >> 2] = b;
      a = f;
    }
    if ((c | 0) != (e | 0)) {
      d = a;
      while (1) {
        i[d >> 0] = i[c >> 0] | 0;
        c = (c + 1) | 0;
        if ((c | 0) == (e | 0)) break;
        else d = (d + 1) | 0;
      }
      a = (a + b) | 0;
    }
    i[a >> 0] = 0;
    return;
  }
  function fj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    d = k[((k[b >> 2] | 0) + 28) >> 2] | 0;
    i = (b + 4) | 0;
    c = k[((k[i >> 2] | 0) + 8) >> 2] | 0;
    if (!(((d | 0) == 0) | ((c | 0) == 0)) ? ((2147483647 / (c | 0)) | 0 | 0) < (d | 0) : 0) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    mf(a, d, c);
    c = k[b >> 2] | 0;
    d = k[(c + 28) >> 2] | 0;
    e = k[i >> 2] | 0;
    f = k[(e + 8) >> 2] | 0;
    if ((k[g >> 2] | 0) == (d | 0) ? (k[h >> 2] | 0) == (f | 0) : 0) {
      h = c;
      i = e;
      gj(h, i, a) | 0;
      return;
    }
    mf(a, d, f);
    h = k[b >> 2] | 0;
    i = k[i >> 2] | 0;
    gj(h, i, a) | 0;
    return;
  }
  function gj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0;
    F = u;
    u = (u + 96) | 0;
    D = (F + 56) | 0;
    A = (F + 28) | 0;
    E = F;
    if (!(i[(a + 8) >> 0] | 0)) Oa(20078, 18907, 220, 18314);
    B = (b + 4) | 0;
    C = (b + 8) | 0;
    mf(c, k[B >> 2] | 0, k[C >> 2] | 0);
    d = k[C >> 2] | 0;
    a: do
      if ((d | 0) > 0) {
        p = (a + 140) | 0;
        n = (D + 4) | 0;
        o = (D + 8) | 0;
        l = (D + 16) | 0;
        m = (D + 20) | 0;
        h = (D + 24) | 0;
        j = (D + 28) | 0;
        q = (a + 144) | 0;
        r = (c + 4) | 0;
        s = (A + 4) | 0;
        t = (A + 12) | 0;
        v = (A + 16) | 0;
        w = (A + 20) | 0;
        x = (A + 24) | 0;
        y = (c + 8) | 0;
        z = (a + 144) | 0;
        g = 0;
        while (1) {
          e = k[B >> 2] | 0;
          f = ((k[b >> 2] | 0) + ((aa(e, g) | 0) << 3)) | 0;
          if (!(((e | 0) > -1) | ((f | 0) == 0))) {
            d = 8;
            break;
          }
          if ((d | 0) <= (g | 0)) {
            d = 10;
            break;
          }
          k[D >> 2] = p;
          k[n >> 2] = f;
          k[o >> 2] = e;
          k[l >> 2] = b;
          k[m >> 2] = 0;
          k[h >> 2] = g;
          k[j >> 2] = e;
          if ((k[q >> 2] | 0) != (e | 0)) {
            d = 12;
            break;
          }
          d = k[r >> 2] | 0;
          f = ((k[c >> 2] | 0) + ((aa(d, g) | 0) << 3)) | 0;
          k[A >> 2] = f;
          k[s >> 2] = d;
          if (!(((d | 0) > -1) | ((f | 0) == 0))) {
            d = 14;
            break;
          }
          k[t >> 2] = c;
          k[v >> 2] = 0;
          k[w >> 2] = g;
          k[x >> 2] = d;
          if ((k[y >> 2] | 0) <= (g | 0)) {
            d = 16;
            break;
          }
          if ((d | 0) != (k[z >> 2] | 0)) {
            d = 18;
            break;
          }
          ij(A, p, n);
          g = (g + 1) | 0;
          d = k[C >> 2] | 0;
          if ((g | 0) >= (d | 0)) break a;
        }
        if ((d | 0) == 8) Oa(13818, 13988, 175, 14058);
        else if ((d | 0) == 10) Oa(13577, 13744, 122, 13812);
        else if ((d | 0) == 12) Oa(14710, 14850, 97, 14920);
        else if ((d | 0) == 14) Oa(13818, 13988, 175, 14058);
        else if ((d | 0) == 16) Oa(13577, 13744, 122, 13812);
        else if ((d | 0) == 18) Oa(14445, 14320, 257, 12780);
      }
    while (0);
    B = (a + 60) | 0;
    jj(B, c);
    k[D >> 2] = B;
    k[(D + 4) >> 2] = a + 96;
    hj(D, c);
    if ((k[C >> 2] | 0) <= 0) {
      u = F;
      return 1;
    }
    b = (a + 132) | 0;
    p = b;
    q = (c + 4) | 0;
    r = (c + 8) | 0;
    n = (D + 4) | 0;
    o = (D + 8) | 0;
    l = (D + 16) | 0;
    m = (D + 20) | 0;
    h = (D + 24) | 0;
    j = (D + 28) | 0;
    s = (a + 136) | 0;
    t = (E + 4) | 0;
    v = (E + 12) | 0;
    w = (E + 16) | 0;
    x = (E + 20) | 0;
    y = (E + 24) | 0;
    e = (a + 136) | 0;
    d = 0;
    while (1) {
      f = k[q >> 2] | 0;
      g = ((k[c >> 2] | 0) + ((aa(f, d) | 0) << 3)) | 0;
      if (!(((f | 0) > -1) | ((g | 0) == 0))) {
        d = 22;
        break;
      }
      if ((k[r >> 2] | 0) <= (d | 0)) {
        d = 24;
        break;
      }
      k[D >> 2] = p;
      k[n >> 2] = g;
      k[o >> 2] = f;
      k[l >> 2] = c;
      k[m >> 2] = 0;
      k[h >> 2] = d;
      k[j >> 2] = f;
      if ((k[s >> 2] | 0) != (f | 0)) {
        d = 26;
        break;
      }
      k[E >> 2] = g;
      k[t >> 2] = f;
      k[v >> 2] = c;
      k[w >> 2] = 0;
      k[x >> 2] = d;
      k[y >> 2] = f;
      if ((f | 0) != (k[e >> 2] | 0)) {
        d = 28;
        break;
      }
      sj(E, b, n);
      d = (d + 1) | 0;
      if ((d | 0) >= (k[C >> 2] | 0)) {
        d = 20;
        break;
      }
    }
    if ((d | 0) == 20) {
      u = F;
      return 1;
    } else if ((d | 0) == 22) Oa(13818, 13988, 175, 14058);
    else if ((d | 0) == 24) Oa(13577, 13744, 122, 13812);
    else if ((d | 0) == 26) Oa(14710, 14850, 97, 14920);
    else if ((d | 0) == 28) Oa(14445, 14320, 257, 12780);
    return 0;
  }
  function hj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0;
    O = u;
    u = (u + 64) | 0;
    E = (O + 52) | 0;
    H = (O + 32) | 0;
    I = (O + 24) | 0;
    J = O;
    K = (b + 8) | 0;
    L = k[K >> 2] | 0;
    M = (b + 4) | 0;
    N = k[M >> 2] | 0;
    d = k[a >> 2] | 0;
    c = k[(d + 8) >> 2] | 0;
    if ((c | 0) <= -1) {
      u = O;
      return;
    }
    y = (L | 0) > 0;
    z = (a + 4) | 0;
    A = (N | 0) > -1;
    B = (H + 4) | 0;
    C = (H + 8) | 0;
    D = (H + 12) | 0;
    w = (J + 4) | 0;
    x = (J + 8) | 0;
    F = (J + 12) | 0;
    G = (I + 4) | 0;
    a: while (1) {
      v = k[(d + 32) >> 2] | 0;
      t = k[(v + (c << 2)) >> 2] | 0;
      e = k[(d + 16) >> 2] | 0;
      h = k[(e + (t << 2)) >> 2] | 0;
      v = k[(v + ((c + 1) << 2)) >> 2] | 0;
      f = (v - t) | 0;
      b: do
        if ((f | 0) == 1) {
          if (y) {
            if ((t | 0) <= -1) {
              s = 9;
              break a;
            }
            f = k[M >> 2] | 0;
            g = (f | 0) > (t | 0);
            if (g) e = 0;
            else {
              s = 9;
              break a;
            }
            while (1) {
              if ((k[K >> 2] | 0) <= (e | 0)) {
                s = 9;
                break a;
              }
              s = ((k[b >> 2] | 0) + (((aa(f, e) | 0) + t) << 3)) | 0;
              p[s >> 3] = +p[s >> 3] / +p[((k[(d + 12) >> 2] | 0) + (h << 3)) >> 3];
              e = (e + 1) | 0;
              if ((e | 0) >= (L | 0)) {
                s = 25;
                break b;
              }
              if (!g) {
                s = 9;
                break a;
              } else d = k[a >> 2] | 0;
            }
          }
        } else {
          e = ((k[(e + ((t + 1) << 2)) >> 2] | 0) - h) | 0;
          d = ((k[(d + 12) >> 2] | 0) + (h << 3)) | 0;
          if ((e | 0) <= -1) {
            s = 13;
            break a;
          }
          if (!(((f | 0) > -1) | ((d | 0) == 0))) {
            s = 15;
            break a;
          }
          if ((t | 0) <= -1) {
            s = 19;
            break a;
          }
          if ((k[M >> 2] | 0) <= (t | 0)) {
            s = 19;
            break a;
          }
          if ((k[K >> 2] | 0) <= 0) {
            s = 19;
            break a;
          }
          if (!A) {
            s = 21;
            break a;
          }
          k[H >> 2] = (k[b >> 2] | 0) + (t << 3);
          k[B >> 2] = f;
          k[C >> 2] = L;
          if ((f | L | 0) <= -1) {
            s = 23;
            break a;
          }
          k[D >> 2] = N;
          k[J >> 2] = d;
          k[w >> 2] = f;
          k[x >> 2] = f;
          k[F >> 2] = e;
          k[I >> 2] = J;
          k[G >> 2] = H;
          pj(H, I, E);
          s = 25;
        }
      while (0);
      if ((s | 0) == 25 ? ((s = 0), y) : 0) {
        o = (v | 0) > (t | 0);
        n = 0;
        do {
          if (o) {
            m = t;
            do {
              e = k[z >> 2] | 0;
              q = k[(e + 28) >> 2] | 0;
              r = k[(e + 24) >> 2] | 0;
              d = k[(e + 20) >> 2] | 0;
              f = k[(d + (m << 2)) >> 2] | 0;
              e = k[(e + 32) >> 2] | 0;
              if (!e) g = k[(d + ((m + 1) << 2)) >> 2] | 0;
              else g = ((k[(e + (m << 2)) >> 2] | 0) + f) | 0;
              if ((f | 0) < (g | 0)) {
                if ((m | 0) <= -1) {
                  s = 42;
                  break a;
                }
                h = k[M >> 2] | 0;
                i = (h | 0) > (m | 0);
                j = aa(h, n) | 0;
                l = (j + m) | 0;
                d = f;
                do {
                  e = k[(r + (d << 2)) >> 2] | 0;
                  if (!i) {
                    s = 42;
                    break a;
                  }
                  if ((k[K >> 2] | 0) <= (n | 0)) {
                    s = 42;
                    break a;
                  }
                  f = k[b >> 2] | 0;
                  if (!(((e | n | 0) > -1) & ((h | 0) > (e | 0)))) {
                    s = 43;
                    break a;
                  }
                  e = (f + ((j + e) << 3)) | 0;
                  p[e >> 3] = +p[e >> 3] - +p[(f + (l << 3)) >> 3] * +p[(q + (d << 3)) >> 3];
                  d = (d + 1) | 0;
                } while ((d | 0) < (g | 0));
              }
              m = (m + 1) | 0;
            } while ((m | 0) < (v | 0));
          }
          n = (n + 1) | 0;
        } while ((n | 0) < (L | 0));
      }
      if ((c | 0) <= 0) {
        s = 3;
        break;
      }
      c = (c + -1) | 0;
      d = k[a >> 2] | 0;
    }
    if ((s | 0) == 3) {
      u = O;
      return;
    } else if ((s | 0) == 9) Oa(15640, 15693, 365, 29764);
    else if ((s | 0) == 13) Oa(19264, 19297, 66, 19366);
    else if ((s | 0) == 15) Oa(13818, 13988, 175, 14058);
    else if ((s | 0) == 19) Oa(15640, 15693, 365, 29764);
    else if ((s | 0) == 21) Oa(19264, 19297, 66, 19366);
    else if ((s | 0) == 23) Oa(13818, 13988, 175, 14058);
    else if ((s | 0) == 42) Oa(15640, 15693, 365, 29764);
    else if ((s | 0) == 43) Oa(15640, 15693, 365, 29764);
  }
  function ij(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0.0;
    f = k[c >> 2] | 0;
    g = k[(c + 4) >> 2] | 0;
    h = k[a >> 2] | 0;
    if ((h | 0) == (f | 0) ? (k[(a + 24) >> 2] | 0) == (k[(c + 24) >> 2] | 0) : 0) {
      n = (b + 4) | 0;
      o = k[n >> 2] | 0;
      if ((o | 0) <= -1) Oa(13359, 12702, 312, 12780);
      if (!o) return;
      c = Oq((o + 16) | 0) | 0;
      q = (c + 16) & -16;
      if (!c) {
        r = Kb(4) | 0;
        cF(r);
        Cc(r | 0, 2032, 79);
      }
      k[(q + -4) >> 2] = c;
      if (!q) {
        r = Kb(4) | 0;
        cF(r);
        Cc(r | 0, 2032, 79);
      }
      l = q;
      iF(l | 0, 0, o | 0) | 0;
      d = k[n >> 2] | 0;
      a: do
        if ((d | 0) > 0) {
          m = k[a >> 2] | 0;
          j = (a + 4) | 0;
          c = 0;
          b: while (1) {
            c: do
              if ((c | 0) < (d | 0)) {
                a = (c | 0) > -1;
                while (1) {
                  if (!(a & ((o | 0) > (c | 0)))) {
                    r = 17;
                    break b;
                  }
                  if (!(i[(l + c) >> 0] | 0)) {
                    h = c;
                    break c;
                  }
                  c = (c + 1) | 0;
                  if ((c | 0) >= (d | 0)) {
                    h = c;
                    break;
                  }
                }
              } else h = c;
            while (0);
            if ((h | 0) >= (d | 0)) {
              r = 29;
              break a;
            }
            c = (h + 1) | 0;
            i[(l + h) >> 0] = 1;
            f = k[b >> 2] | 0;
            d = k[(f + (h << 2)) >> 2] | 0;
            if ((d | 0) != (h | 0)) {
              g = (m + (h << 3)) | 0;
              if ((h | 0) <= -1) {
                r = 26;
                break;
              }
              do {
                a = (m + (d << 3)) | 0;
                e = k[j >> 2] | 0;
                if (!(((d | 0) > -1) & ((e | 0) > (d | 0)))) {
                  r = 27;
                  break b;
                }
                if ((e | 0) <= (h | 0)) {
                  r = 28;
                  break b;
                }
                s = +p[a >> 3];
                p[a >> 3] = +p[g >> 3];
                p[g >> 3] = s;
                i[(l + d) >> 0] = 1;
                d = k[(f + (d << 2)) >> 2] | 0;
              } while ((d | 0) != (h | 0));
            }
            d = k[n >> 2] | 0;
            if ((c | 0) >= (d | 0)) break a;
          }
          if ((r | 0) == 17) Oa(16605, 15693, 408, 29907);
          else if ((r | 0) == 26)
            if ((d | 0) > -1 ? (k[j >> 2] | 0) > (d | 0) : 0) Oa(13577, 13744, 122, 13812);
            else Oa(13577, 13744, 122, 13812);
          else if ((r | 0) == 27) Oa(13577, 13744, 122, 13812);
          else if ((r | 0) == 28) Oa(13577, 13744, 122, 13812);
        } else r = 29;
      while (0);
      if ((r | 0) == 29 ? (q | 0) == 0 : 0) return;
      Pq(k[(l + -4) >> 2] | 0);
      return;
    }
    if ((g | 0) <= 0) return;
    e = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    c = 0;
    while (1) {
      a = k[(e + (c << 2)) >> 2] | 0;
      if (!(((a | 0) > -1) & ((d | 0) > (a | 0)))) {
        r = 32;
        break;
      }
      p[(h + (a << 3)) >> 3] = +p[(f + (c << 3)) >> 3];
      c = (c + 1) | 0;
      if ((c | 0) >= (g | 0)) {
        r = 34;
        break;
      }
    }
    if ((r | 0) == 32) Oa(13577, 13744, 122, 13812);
    else if ((r | 0) == 34) return;
  }
  function jj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      ba = 0,
      ca = 0,
      da = 0,
      ea = 0,
      fa = 0,
      ga = 0,
      ha = 0,
      ia = 0,
      ja = 0;
    ja = u;
    u = (u + 128) | 0;
    X = (ja + 80) | 0;
    ia = (ja + 68) | 0;
    Y = (ja + 48) | 0;
    Z = (ja + 20) | 0;
    _ = ja;
    $ = (b + 4) | 0;
    ca = k[$ >> 2] | 0;
    ha = (b + 8) | 0;
    S = k[ha >> 2] | 0;
    T = (a + 12) | 0;
    U = k[T >> 2] | 0;
    k[ia >> 2] = 0;
    V = (ia + 4) | 0;
    k[V >> 2] = 0;
    W = (ia + 8) | 0;
    k[W >> 2] = 0;
    mf(ia, ca, S);
    c = k[V >> 2] | 0;
    d = k[W >> 2] | 0;
    if ((d | c | 0) <= -1) Oa(11919, 12068, 74, 12145);
    c = aa(d, c) | 0;
    if ((c | 0) > 0) iF(k[ia >> 2] | 0, 0, (c << 3) | 0) | 0;
    M = (a + 8) | 0;
    c = k[M >> 2] | 0;
    a: do
      if ((c | 0) >= 0) {
        N = (a + 32) | 0;
        O = (a + 24) | 0;
        P = (S | 0) > 0;
        Q = (a + 28) | 0;
        R = (a + 16) | 0;
        v = (a + 20) | 0;
        w = (ca | 0) > -1;
        x = (Y + 4) | 0;
        y = (Y + 8) | 0;
        z = (Y + 12) | 0;
        r = (_ + 4) | 0;
        t = (_ + 8) | 0;
        A = (_ + 12) | 0;
        B = (Z + 4) | 0;
        q = (X + 4) | 0;
        s = (X + 8) | 0;
        C = (X + 12) | 0;
        D = (X + 20) | 0;
        E = (X + 32) | 0;
        F = (Z + 4) | 0;
        G = (Z + 8) | 0;
        H = (Z + 12) | 0;
        I = (Z + 16) | 0;
        J = (Z + 20) | 0;
        K = (Z + 24) | 0;
        L = (X + 28) | 0;
        o = 0;
        b: while (1) {
          d = k[N >> 2] | 0;
          l = k[(d + (o << 2)) >> 2] | 0;
          a = k[O >> 2] | 0;
          f = k[(a + (l << 2)) >> 2] | 0;
          e = (l + 1) | 0;
          n = o;
          o = (o + 1) | 0;
          g = ((k[(d + (o << 2)) >> 2] | 0) - l) | 0;
          m = ((k[(a + (e << 2)) >> 2] | 0) - f - g) | 0;
          if ((g | 0) == 1) {
            if (
              P
                ? ((ea = k[R >> 2] | 0),
                  (ba = k[(ea + (e << 2)) >> 2] | 0),
                  (fa = k[(d + (k[((k[Q >> 2] | 0) + (l << 2)) >> 2] << 2)) >> 2] | 0),
                  (da = k[(a + ((fa + 1) << 2)) >> 2] | 0),
                  (ea = ((k[(ea + (l << 2)) >> 2] | 0) + 1) | 0),
                  (fa = ((k[(a + (fa << 2)) >> 2] | 0) + 1) | 0),
                  (ga = (l | 0) > -1),
                  (ea | 0) < (ba | 0))
                : 0
            ) {
              a = (fa | 0) < (da | 0);
              d = 0;
              do {
                c: do
                  if (!ga) {
                    if (a) {
                      c = 22;
                      break b;
                    }
                  } else {
                    e = ea;
                    f = fa;
                    while (1) {
                      if ((f | 0) >= (da | 0)) break c;
                      g = k[((k[v >> 2] | 0) + (f << 2)) >> 2] | 0;
                      h = k[$ >> 2] | 0;
                      if ((h | 0) <= (l | 0)) {
                        c = 22;
                        break b;
                      }
                      if ((k[ha >> 2] | 0) <= (d | 0)) {
                        c = 22;
                        break b;
                      }
                      i = k[b >> 2] | 0;
                      j = aa(h, d) | 0;
                      if (!(((g | d | 0) > -1) & ((h | 0) > (g | 0)))) {
                        c = 23;
                        break b;
                      }
                      m = (i + ((j + g) << 3)) | 0;
                      p[m >> 3] = +p[m >> 3] - +p[((k[T >> 2] | 0) + (e << 3)) >> 3] * +p[(i + ((j + l) << 3)) >> 3];
                      e = (e + 1) | 0;
                      if ((e | 0) >= (ba | 0)) break;
                      else f = (f + 1) | 0;
                    }
                  }
                while (0);
                d = (d + 1) | 0;
              } while ((d | 0) < (S | 0));
            }
          } else {
            a = k[R >> 2] | 0;
            d = k[(a + (l << 2)) >> 2] | 0;
            a = ((k[(a + (e << 2)) >> 2] | 0) - d) | 0;
            if ((a | 0) <= -1) {
              c = 25;
              break;
            }
            c = (U + (d << 3)) | 0;
            if (!(((g | 0) > -1) | ((c | 0) == 0))) {
              c = 27;
              break;
            }
            if ((l | 0) <= -1) {
              c = 31;
              break;
            }
            if ((k[$ >> 2] | 0) <= (l | 0)) {
              c = 31;
              break;
            }
            if ((k[ha >> 2] | 0) <= 0) {
              c = 31;
              break;
            }
            if (!w) {
              c = 33;
              break;
            }
            k[Y >> 2] = (k[b >> 2] | 0) + (l << 3);
            k[x >> 2] = g;
            k[y >> 2] = S;
            if ((g | S | 0) <= -1) {
              c = 35;
              break;
            }
            k[z >> 2] = ca;
            k[_ >> 2] = c;
            k[r >> 2] = g;
            k[t >> 2] = g;
            k[A >> 2] = a;
            k[Z >> 2] = _;
            k[B >> 2] = Y;
            kj(Y, Z, X);
            c = (U + ((d + g) << 3)) | 0;
            if (!(((m | g | 0) > -1) | ((c | 0) == 0))) {
              c = 37;
              break;
            }
            k[X >> 2] = c;
            k[q >> 2] = m;
            k[s >> 2] = g;
            k[C >> 2] = a;
            k[D >> 2] = k[Y >> 2];
            k[(D + 4) >> 2] = k[(Y + 4) >> 2];
            k[(D + 8) >> 2] = k[(Y + 8) >> 2];
            k[E >> 2] = k[z >> 2];
            if ((g | 0) != (k[x >> 2] | 0)) {
              c = 39;
              break;
            }
            c = k[W >> 2] | 0;
            l = k[ia >> 2] | 0;
            k[Z >> 2] = l;
            k[F >> 2] = m;
            k[G >> 2] = c;
            if (!(((c | m | 0) > -1) | ((l | 0) == 0))) {
              c = 41;
              break;
            }
            k[H >> 2] = ia;
            k[I >> 2] = 0;
            k[J >> 2] = 0;
            d = k[V >> 2] | 0;
            k[K >> 2] = d;
            if ((m | 0) <= -1) {
              c = 44;
              break;
            }
            if (!(((c | 0) > -1) & ((d | 0) >= (m | 0)))) {
              c = 44;
              break;
            }
            if ((c | 0) != (k[L >> 2] | 0)) {
              c = 46;
              break;
            }
            mj(Z, X, D);
            do
              if (P) {
                h = (g + f) | 0;
                i = k[ia >> 2] | 0;
                if ((m | 0) <= 0) break;
                g = k[v >> 2] | 0;
                a = 0;
                do {
                  e = 0;
                  f = h;
                  while (1) {
                    j = k[(g + (f << 2)) >> 2] | 0;
                    c = k[V >> 2] | 0;
                    if (!((c | 0) > (e | 0) ? (k[W >> 2] | 0) > (a | 0) : 0)) {
                      c = 60;
                      break b;
                    }
                    c = (i + (((aa(c, a) | 0) + e) << 3)) | 0;
                    if ((j | 0) <= -1) {
                      c = 61;
                      break b;
                    }
                    d = k[$ >> 2] | 0;
                    if ((d | 0) <= (j | 0)) {
                      c = 61;
                      break b;
                    }
                    if ((k[ha >> 2] | 0) <= (a | 0)) {
                      c = 61;
                      break b;
                    }
                    l = ((k[b >> 2] | 0) + (((aa(d, a) | 0) + j) << 3)) | 0;
                    p[l >> 3] = +p[l >> 3] - +p[c >> 3];
                    if ((k[W >> 2] | 0) <= (a | 0)) {
                      c = 62;
                      break b;
                    }
                    p[c >> 3] = 0.0;
                    e = (e + 1) | 0;
                    if ((e | 0) >= (m | 0)) break;
                    else f = (f + 1) | 0;
                  }
                  a = (a + 1) | 0;
                } while ((a | 0) < (S | 0));
              }
            while (0);
            c = k[M >> 2] | 0;
          }
          if ((n | 0) >= (c | 0)) break a;
        }
        switch (c | 0) {
          case 22: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
          case 23: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
          case 25: {
            Oa(19264, 19297, 66, 19366);
            break;
          }
          case 27: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 31: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
          case 33: {
            Oa(19264, 19297, 66, 19366);
            break;
          }
          case 35: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 37: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 39: {
            Oa(14710, 14850, 97, 14920);
            break;
          }
          case 41: {
            Oa(13818, 13988, 175, 14058);
            break;
          }
          case 44: {
            Oa(14177, 13744, 147, 13812);
            break;
          }
          case 46: {
            Oa(14445, 14320, 257, 12780);
            break;
          }
          case 60: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
          case 61: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
          case 62: {
            Oa(15640, 15693, 365, 29764);
            break;
          }
        }
      }
    while (0);
    c = k[ia >> 2] | 0;
    if (!c) {
      u = ja;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = ja;
    return;
  }
  function kj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    m = k[b >> 2] | 0;
    b = k[(b + 4) >> 2] | 0;
    l = k[(b + 8) >> 2] | 0;
    h = k[(a + 4) >> 2] | 0;
    if ((h | 0) != (k[(m + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
    if ((k[(a + 8) >> 2] | 0) != (l | 0) ? (k[(a + 8) >> 2] | 0) != (l | 0) : 0) Oa(14445, 14320, 257, 12780);
    i = k[a >> 2] | 0;
    j = k[b >> 2] | 0;
    if ((i | 0) == (j | 0)) {
      c = k[(b + 12) >> 2] | 0;
      if ((k[(a + 12) >> 2] | 0) != (c | 0)) d = 8;
    } else {
      c = k[(b + 12) >> 2] | 0;
      d = 8;
    }
    if ((d | 0) == 8) {
      if ((h | 0) != (k[(b + 4) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      if ((l | 0) != (k[(b + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      e = k[(a + 12) >> 2] | 0;
      if (((h | 0) > 0) & ((l | 0) > 0)) {
        b = 0;
        do {
          f = aa(b, e) | 0;
          g = aa(b, c) | 0;
          d = 0;
          do {
            p[(i + ((d + f) << 3)) >> 3] = +p[(j + ((d + g) << 3)) >> 3];
            d = (d + 1) | 0;
          } while ((d | 0) != (h | 0));
          b = (b + 1) | 0;
        } while ((b | 0) != (l | 0));
      }
    }
    l = k[(m + 8) >> 2] | 0;
    if ((l | 0) == (h | 0) ? (l | 0) == (k[(m + 4) >> 2] | 0) : 0) {
      lj(m, a);
      return;
    } else Oa(19710, 19864, 170, 18516);
  }
  function lj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    d = u;
    u = (u + 32) | 0;
    j = (d + 28) | 0;
    c = d;
    f = k[(a + 4) >> 2] | 0;
    e = k[(b + 8) >> 2] | 0;
    h = k[(b + 4) >> 2] | 0;
    i = c;
    k[i >> 2] = 0;
    k[(i + 4) >> 2] = 0;
    i = (c + 8) | 0;
    k[i >> 2] = h;
    h = (c + 12) | 0;
    k[h >> 2] = e;
    g = (c + 16) | 0;
    k[g >> 2] = f;
    k[j >> 2] = e;
    Ji(g, i, j, 1);
    g = k[g >> 2] | 0;
    i = aa(g, k[i >> 2] | 0) | 0;
    k[(c + 20) >> 2] = i;
    g = aa(k[h >> 2] | 0, g) | 0;
    k[(c + 24) >> 2] = g;
    Ii(f, e, k[a >> 2] | 0, k[(a + 12) >> 2] | 0, k[b >> 2] | 0, k[(b + 12) >> 2] | 0, c);
    a = k[c >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(c + 4) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = d;
    return;
  }
  function mj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0.0;
    s = u;
    u = (u + 80) | 0;
    r = s;
    n = k[(c + 4) >> 2] | 0;
    o = (a + 4) | 0;
    e = k[o >> 2] | 0;
    q = (a + 8) | 0;
    d = k[q >> 2] | 0;
    if (!(((n | 0) > 0) & (((e + n + d) | 0) < 20))) {
      if ((d | e | 0) <= -1) Oa(11919, 12068, 74, 12145);
      g = k[a >> 2] | 0;
      h = k[(a + 24) >> 2] | 0;
      if (((e | 0) > 0) & ((d | 0) > 0)) {
        f = e << 3;
        e = 0;
        do {
          iF((g + ((aa(e, h) | 0) << 3)) | 0, 0, f | 0) | 0;
          e = (e + 1) | 0;
        } while ((e | 0) != (d | 0));
      }
      p[r >> 3] = 1.0;
      nj(a, b, c, r);
      u = s;
      return;
    }
    g = k[b >> 2] | 0;
    i = k[(b + 4) >> 2] | 0;
    j = k[(b + 12) >> 2] | 0;
    m = c;
    l = k[m >> 2] | 0;
    m = k[(m + 4) >> 2] | 0;
    h = k[(c + 8) >> 2] | 0;
    f = k[(c + 12) >> 2] | 0;
    if ((k[(b + 8) >> 2] | 0) != (n | 0)) Oa(14710, 14850, 97, 14920);
    k[r >> 2] = g;
    k[(r + 4) >> 2] = i;
    k[(r + 8) >> 2] = n;
    k[(r + 12) >> 2] = j;
    b = (r + 20) | 0;
    k[b >> 2] = l;
    k[(b + 4) >> 2] = m;
    k[(r + 28) >> 2] = h;
    k[(r + 32) >> 2] = f;
    k[(r + 40) >> 2] = g;
    k[(r + 48) >> 2] = j;
    k[(r + 52) >> 2] = l;
    k[(r + 60) >> 2] = f;
    k[(r + 64) >> 2] = n;
    if (!(((e | 0) == (i | 0)) & ((d | 0) == (h | 0)))) Oa(14445, 14320, 257, 12780);
    i = k[a >> 2] | 0;
    h = k[(a + 24) >> 2] | 0;
    if ((d | 0) > 0) {
      g = 0;
      do {
        if ((e | 0) > 0) {
          f = aa(g, h) | 0;
          d = 0;
          do {
            t = +oj(r, d, g);
            p[(i + ((d + f) << 3)) >> 3] = t;
            d = (d + 1) | 0;
            e = k[o >> 2] | 0;
          } while ((d | 0) < (e | 0));
          d = k[q >> 2] | 0;
        }
        g = (g + 1) | 0;
      } while ((g | 0) < (d | 0));
    }
    u = s;
    return;
  }
  function nj(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0.0,
      o = 0;
    m = u;
    u = (u + 32) | 0;
    l = m;
    i = k[(a + 4) >> 2] | 0;
    j = (b + 4) | 0;
    if ((i | 0) != (k[j >> 2] | 0)) Oa(15296, 15349, 460, 15440);
    e = k[(a + 8) >> 2] | 0;
    f = (c + 8) | 0;
    if ((e | 0) != (k[f >> 2] | 0)) Oa(15296, 15349, 460, 15440);
    g = (b + 8) | 0;
    h = k[g >> 2] | 0;
    if (((e | 0) == 0) | (((i | 0) == 0) | ((h | 0) == 0))) {
      u = m;
      return;
    }
    n = +p[d >> 3];
    o = l;
    k[o >> 2] = 0;
    k[(o + 4) >> 2] = 0;
    o = (l + 8) | 0;
    k[o >> 2] = i;
    d = (l + 12) | 0;
    k[d >> 2] = e;
    i = (l + 16) | 0;
    k[i >> 2] = h;
    _f(i, o, d, 1);
    i = k[i >> 2] | 0;
    h = aa(i, k[o >> 2] | 0) | 0;
    k[(l + 20) >> 2] = h;
    i = aa(k[d >> 2] | 0, i) | 0;
    k[(l + 24) >> 2] = i;
    $f(
      k[j >> 2] | 0,
      k[f >> 2] | 0,
      k[g >> 2] | 0,
      k[b >> 2] | 0,
      k[(b + 12) >> 2] | 0,
      k[c >> 2] | 0,
      k[(c + 12) >> 2] | 0,
      k[a >> 2] | 0,
      k[(a + 24) >> 2] | 0,
      n,
      l,
      0
    );
    a = k[l >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(l + 4) >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    u = m;
    return;
  }
  function oj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0.0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    g = ((k[a >> 2] | 0) + (b << 3)) | 0;
    h = k[(a + 8) >> 2] | 0;
    if (!(((g | 0) == 0) | ((h | 0) > -1))) Oa(13818, 13988, 175, 14058);
    f = k[(a + 12) >> 2] | 0;
    if ((b | 0) <= -1) Oa(13577, 13744, 122, 13812);
    if ((k[(a + 4) >> 2] | 0) <= (b | 0)) Oa(13577, 13744, 122, 13812);
    e = ((k[(a + 20) >> 2] | 0) + ((aa(k[(a + 32) >> 2] | 0, c) | 0) << 3)) | 0;
    b = k[(a + 24) >> 2] | 0;
    if (!(((b | 0) > -1) | ((e | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((c | 0) <= -1) Oa(13577, 13744, 122, 13812);
    if ((k[(a + 28) >> 2] | 0) <= (c | 0)) Oa(13577, 13744, 122, 13812);
    if ((h | 0) != (b | 0)) Oa(14550, 14607, 110, 14683);
    if (!h) {
      d = 0.0;
      return +d;
    }
    if ((h | 0) <= 0) Oa(13148, 13216, 413, 13284);
    d = +p[g >> 3] * +p[e >> 3];
    if ((h | 0) == 1) return +d;
    else b = 1;
    do {
      c = (g + ((aa(b, f) | 0) << 3)) | 0;
      d = d + +p[c >> 3] * +p[(e + (b << 3)) >> 3];
      b = (b + 1) | 0;
    } while ((b | 0) < (h | 0));
    return +d;
  }
  function pj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0;
    m = k[b >> 2] | 0;
    b = k[(b + 4) >> 2] | 0;
    l = k[(b + 8) >> 2] | 0;
    h = k[(a + 4) >> 2] | 0;
    if ((h | 0) != (k[(m + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
    if ((k[(a + 8) >> 2] | 0) != (l | 0) ? (k[(a + 8) >> 2] | 0) != (l | 0) : 0) Oa(14445, 14320, 257, 12780);
    i = k[a >> 2] | 0;
    j = k[b >> 2] | 0;
    if ((i | 0) == (j | 0)) {
      c = k[(b + 12) >> 2] | 0;
      if ((k[(a + 12) >> 2] | 0) != (c | 0)) d = 8;
    } else {
      c = k[(b + 12) >> 2] | 0;
      d = 8;
    }
    if ((d | 0) == 8) {
      if ((h | 0) != (k[(b + 4) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      if ((l | 0) != (k[(b + 8) >> 2] | 0)) Oa(14445, 14320, 257, 12780);
      e = k[(a + 12) >> 2] | 0;
      if (((h | 0) > 0) & ((l | 0) > 0)) {
        b = 0;
        do {
          f = aa(b, e) | 0;
          g = aa(b, c) | 0;
          d = 0;
          do {
            p[(i + ((d + f) << 3)) >> 3] = +p[(j + ((d + g) << 3)) >> 3];
            d = (d + 1) | 0;
          } while ((d | 0) != (h | 0));
          b = (b + 1) | 0;
        } while ((b | 0) != (l | 0));
      }
    }
    l = k[(m + 8) >> 2] | 0;
    if ((l | 0) == (h | 0) ? (l | 0) == (k[(m + 4) >> 2] | 0) : 0) {
      qj(m, a);
      return;
    } else Oa(19710, 19864, 170, 18516);
  }
  function qj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    d = u;
    u = (u + 32) | 0;
    j = (d + 28) | 0;
    c = d;
    f = k[(a + 4) >> 2] | 0;
    e = k[(b + 8) >> 2] | 0;
    h = k[(b + 4) >> 2] | 0;
    i = c;
    k[i >> 2] = 0;
    k[(i + 4) >> 2] = 0;
    i = (c + 8) | 0;
    k[i >> 2] = h;
    h = (c + 12) | 0;
    k[h >> 2] = e;
    g = (c + 16) | 0;
    k[g >> 2] = f;
    k[j >> 2] = e;
    Ji(g, i, j, 1);
    g = k[g >> 2] | 0;
    i = aa(g, k[i >> 2] | 0) | 0;
    k[(c + 20) >> 2] = i;
    g = aa(k[h >> 2] | 0, g) | 0;
    k[(c + 24) >> 2] = g;
    rj(f, e, k[a >> 2] | 0, k[(a + 12) >> 2] | 0, k[b >> 2] | 0, k[(b + 12) >> 2] | 0, c);
    a = k[c >> 2] | 0;
    if (a | 0) Pq(k[(a + -4) >> 2] | 0);
    a = k[(c + 4) >> 2] | 0;
    if (!a) {
      u = d;
      return;
    }
    Pq(k[(a + -4) >> 2] | 0);
    u = d;
    return;
  }
  function rj(a, b, c, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0.0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0.0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      ba = 0;
    $ = u;
    u = (u + 16) | 0;
    Y = ($ + 10) | 0;
    Z = ($ + 9) | 0;
    _ = ($ + 8) | 0;
    W = $;
    X = k[(g + 16) >> 2] | 0;
    V = k[(g + 8) >> 2] | 0;
    V = (V | 0) < (a | 0) ? V : a;
    h = aa(V, X) | 0;
    m = aa(X, b) | 0;
    if (h >>> 0 > 536870911) {
      $ = Kb(4) | 0;
      cF($);
      Cc($ | 0, 2032, 79);
    }
    j = k[g >> 2] | 0;
    l = h << 3;
    if (!j)
      do
        if (l >>> 0 >= 131073) {
          h = Oq((l + 16) | 0) | 0;
          j = (h + 16) & -16;
          if (!h) {
            $ = Kb(4) | 0;
            cF($);
            Cc($ | 0, 2032, 79);
          }
          k[(j + -4) >> 2] = h;
          if (!j) {
            $ = Kb(4) | 0;
            cF($);
            Cc($ | 0, 2032, 79);
          } else {
            h = k[g >> 2] | 0;
            break;
          }
        } else {
          j = u;
          u = (u + ((((1 * ((l + 15) | 0)) | 0) + 15) & -16)) | 0;
          j = (j + 15) & -16;
          h = 0;
        }
      while (0);
    else h = j;
    U = (h | 0) == 0 ? j : 0;
    T = l >>> 0 > 131072;
    if (m >>> 0 > 536870911) {
      $ = Kb(4) | 0;
      cF($);
      Cc($ | 0, 2032, 79);
    }
    g = (g + 4) | 0;
    l = k[g >> 2] | 0;
    m = m << 3;
    if (!l)
      do
        if (m >>> 0 >= 131073) {
          h = Oq((m + 16) | 0) | 0;
          l = (h + 16) & -16;
          if (!h) {
            $ = Kb(4) | 0;
            cF($);
            Cc($ | 0, 2032, 79);
          }
          k[(l + -4) >> 2] = h;
          if (!l) {
            $ = Kb(4) | 0;
            cF($);
            Cc($ | 0, 2032, 79);
          } else {
            h = k[g >> 2] | 0;
            break;
          }
        } else {
          l = u;
          u = (u + ((((1 * ((m + 15) | 0)) | 0) + 15) & -16)) | 0;
          l = (l + 15) & -16;
          h = 0;
        }
      while (0);
    else h = l;
    S = (h | 0) == 0 ? l : 0;
    Q = m >>> 0 > 131072;
    if ((i[31304] | 0) == 0 ? aF(31304) | 0 : 0) {
      k[7994] = 16384;
      k[7995] = 524288;
      k[7996] = 524288;
    }
    R = (b | 0) > 0;
    if (R) h = ((((((k[7995] | 0) >>> 0) / ((((f | 0) < (a | 0) ? a : f) << 5) >>> 0)) | 0 | 0) / 4) | 0) << 2;
    else h = 0;
    K = (h | 0) > 4 ? h : 4;
    a: do
      if ((a | 0) > 0) {
        L = (W + 4) | 0;
        M = (W + 4) | 0;
        N = (W + 4) | 0;
        O = (W + 4) | 0;
        P = (W + 4) | 0;
        I = a;
        do {
          J = (I | 0) > (X | 0) ? X : I;
          if (R) {
            G = (J | 0) > 0;
            H = (I - J) | 0;
            x = 0;
            do {
              B = (b - x) | 0;
              B = (K | 0) < (B | 0) ? K : B;
              if (G) {
                C = (B + x) | 0;
                D = (l + ((aa(x, J) | 0) << 3)) | 0;
                E = aa(x, f) | 0;
                F = (e + ((E + H) << 3)) | 0;
                z = (B | 0) < 1;
                y = 0;
                do {
                  s = (J - y) | 0;
                  A = (s | 0) < 4 ? s : 4;
                  w = (I - y) | 0;
                  if (!(((s | 0) < 1) | z)) {
                    r = 0;
                    do {
                      t = (w - r + -1) | 0;
                      q = (A - r) | 0;
                      m = (q + -1) | 0;
                      a = (t - m) | 0;
                      n = aa(t, d) | 0;
                      v = 1.0 / +p[(c + ((n + t) << 3)) >> 3];
                      n = (c + ((n + a) << 3)) | 0;
                      if ((q | 0) > 1) {
                        g = x;
                        do {
                          q = aa(g, f) | 0;
                          h = (e + ((q + t) << 3)) | 0;
                          o = v * +p[h >> 3];
                          p[h >> 3] = o;
                          q = (e + ((q + a) << 3)) | 0;
                          h = 0;
                          do {
                            ba = (q + (h << 3)) | 0;
                            p[ba >> 3] = +p[ba >> 3] - o * +p[(n + (h << 3)) >> 3];
                            h = (h + 1) | 0;
                          } while ((h | 0) < (m | 0));
                          g = (g + 1) | 0;
                        } while ((g | 0) < (C | 0));
                      } else {
                        h = x;
                        do {
                          ba = (e + (((aa(h, f) | 0) + t) << 3)) | 0;
                          p[ba >> 3] = v * +p[ba >> 3];
                          h = (h + 1) | 0;
                        } while ((h | 0) < (C | 0));
                      }
                      r = (r + 1) | 0;
                    } while ((A | 0) > (r | 0));
                  }
                  g = (s - A) | 0;
                  h = (w - A) | 0;
                  k[W >> 2] = e + ((h + E) << 3);
                  k[N >> 2] = f;
                  Ki(_, D, W, A, B, J, g);
                  if ((g | 0) > 0) {
                    ba = (c + (((aa(h, d) | 0) + H) << 3)) | 0;
                    k[W >> 2] = ba;
                    k[O >> 2] = d;
                    ag(Z, j, W, A, g, 0, 0);
                    k[W >> 2] = F;
                    k[P >> 2] = f;
                    cg(Y, W, j, D, g, A, B, -1.0, A, J, 0, g);
                  }
                  y = (y + 4) | 0;
                } while ((J | 0) > (y | 0));
              }
              x = (x + K) | 0;
            } while ((x | 0) < (b | 0));
          }
          I = (I - X) | 0;
          m = (I | 0) > 0;
          if (!m) break a;
          a = aa(I, d) | 0;
          h = 0;
          do {
            g = (I - h) | 0;
            g = (g | 0) < (V | 0) ? g : V;
            if ((g | 0) > 0) {
              k[W >> 2] = c + ((h + a) << 3);
              k[L >> 2] = d;
              ag(Z, j, W, J, g, 0, 0);
              k[W >> 2] = e + (h << 3);
              k[M >> 2] = f;
              cg(Y, W, j, l, g, J, b, -1.0, -1, -1, 0, 0);
            }
            h = (h + V) | 0;
          } while ((I | 0) > (h | 0));
        } while (m);
      }
    while (0);
    if (!(((S | 0) == 0) | (Q ^ 1))) Pq(k[(S + -4) >> 2] | 0);
    if (((U | 0) == 0) | (T ^ 1)) {
      u = $;
      return;
    }
    Pq(k[(U + -4) >> 2] | 0);
    u = $;
    return;
  }
  function sj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0.0;
    f = k[c >> 2] | 0;
    g = k[(c + 4) >> 2] | 0;
    h = k[a >> 2] | 0;
    if ((h | 0) == (f | 0) ? (k[(a + 24) >> 2] | 0) == (k[(c + 24) >> 2] | 0) : 0) {
      o = (b + 4) | 0;
      q = k[o >> 2] | 0;
      if ((q | 0) <= -1) Oa(13359, 12702, 312, 12780);
      if (!q) return;
      c = Oq((q + 16) | 0) | 0;
      r = (c + 16) & -16;
      if (!c) {
        s = Kb(4) | 0;
        cF(s);
        Cc(s | 0, 2032, 79);
      }
      k[(r + -4) >> 2] = c;
      if (!r) {
        s = Kb(4) | 0;
        cF(s);
        Cc(s | 0, 2032, 79);
      }
      m = r;
      iF(m | 0, 0, q | 0) | 0;
      d = k[o >> 2] | 0;
      a: do
        if ((d | 0) > 0) {
          n = k[a >> 2] | 0;
          l = (a + 4) | 0;
          c = 0;
          b: while (1) {
            c: do
              if ((c | 0) < (d | 0)) {
                a = (c | 0) > -1;
                while (1) {
                  if (!(a & ((q | 0) > (c | 0)))) {
                    s = 17;
                    break b;
                  }
                  if (!(i[(m + c) >> 0] | 0)) {
                    j = c;
                    break c;
                  }
                  c = (c + 1) | 0;
                  if ((c | 0) >= (d | 0)) {
                    j = c;
                    break;
                  }
                }
              } else j = c;
            while (0);
            if ((j | 0) >= (d | 0)) {
              s = 27;
              break a;
            }
            c = (j + 1) | 0;
            i[(m + j) >> 0] = 1;
            h = k[b >> 2] | 0;
            d = k[(h + (j << 2)) >> 2] | 0;
            if ((d | 0) != (j | 0)) {
              f = j;
              g = d;
              while (1) {
                d = (n + (g << 3)) | 0;
                a = k[l >> 2] | 0;
                if (!(((g | 0) > -1) & ((a | 0) > (g | 0)))) {
                  s = 23;
                  break b;
                }
                e = (n + (f << 3)) | 0;
                if (!(((f | 0) > -1) & ((a | 0) > (f | 0)))) {
                  s = 25;
                  break b;
                }
                t = +p[d >> 3];
                p[d >> 3] = +p[e >> 3];
                p[e >> 3] = t;
                i[(m + g) >> 0] = 1;
                d = k[(h + (g << 2)) >> 2] | 0;
                if ((d | 0) == (j | 0)) break;
                else {
                  f = g;
                  g = d;
                }
              }
            }
            d = k[o >> 2] | 0;
            if ((c | 0) >= (d | 0)) break a;
          }
          if ((s | 0) == 17) Oa(16605, 15693, 408, 29907);
          else if ((s | 0) == 23) Oa(13577, 13744, 122, 13812);
          else if ((s | 0) == 25) Oa(13577, 13744, 122, 13812);
        } else s = 27;
      while (0);
      if ((s | 0) == 27 ? (r | 0) == 0 : 0) return;
      Pq(k[(m + -4) >> 2] | 0);
      return;
    }
    if ((g | 0) <= 0) return;
    e = k[b >> 2] | 0;
    d = k[(a + 4) >> 2] | 0;
    c = 0;
    while (1) {
      a = k[(e + (c << 2)) >> 2] | 0;
      if (!(((a | 0) > -1) & ((g | 0) > (a | 0)))) {
        s = 30;
        break;
      }
      if ((d | 0) <= (c | 0)) {
        s = 32;
        break;
      }
      p[(h + (c << 3)) >> 3] = +p[(f + (a << 3)) >> 3];
      c = (c + 1) | 0;
      if ((c | 0) >= (g | 0)) {
        s = 34;
        break;
      }
    }
    if ((s | 0) == 30) Oa(13577, 13744, 122, 13812);
    else if ((s | 0) == 32) Oa(13577, 13744, 122, 13812);
    else if ((s | 0) == 34) return;
  }
  function tj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    f = u;
    u = (u + 16) | 0;
    e = f;
    d = k[a >> 2] | 0;
    g = k[(a + 4) >> 2] | 0;
    a = (b + (g >> 1)) | 0;
    if (g & 1) d = k[((k[a >> 2] | 0) + d) >> 2] | 0;
    cd[d & 63](e, a, c);
    a = sf(e) | 0;
    d = k[e >> 2] | 0;
    if (!d) {
      u = f;
      return a | 0;
    }
    Pq(k[(d + -4) >> 2] | 0);
    u = f;
    return a | 0;
  }
  function uj(a) {
    a = a | 0;
    return 176;
  }
  function vj(a) {
    a = a | 0;
    if (!a) return;
    sg((a + 8) | 0);
    EA(a);
    return;
  }
  function wj(a) {
    a = a | 0;
    var b = 0;
    b = CA(216) | 0;
    k[b >> 2] = a;
    Cg((b + 8) | 0);
    i[(b + 208) >> 0] = 0;
    i[(b + 209) >> 0] = 0;
    return b | 0;
  }
  function xj(a, b) {
    a = a | 0;
    b = b | 0;
    return Pc[a & 127](b) | 0;
  }
  function yj(a) {
    a = a | 0;
    var b = 0,
      c = 0,
      d = 0,
      e = 0;
    b = (a + 208) | 0;
    if (!(i[b >> 0] | 0)) {
      i[b >> 0] = 0;
      c = (a + 209) | 0;
      i[c >> 0] = 0;
      e = ((k[a >> 2] | 0) + 664) | 0;
      Bh(e);
      d = (a + 8) | 0;
      zj(d, e);
      i[b >> 0] = 1;
      Aj(d, e);
      if (!(i[d >> 0] | 0)) Oa(17611, 20281, 257, 17666);
      if (k[(a + 12) >> 2] | 0) return;
      i[c >> 0] = 1;
      return;
    }
    b = (a + 209) | 0;
    if (i[b >> 0] | 0) return;
    d = ((k[a >> 2] | 0) + 664) | 0;
    Bh(d);
    e = (a + 8) | 0;
    Aj(e, d);
    if (!(i[e >> 0] | 0)) Oa(17611, 20281, 257, 17666);
    if (k[(a + 12) >> 2] | 0) return;
    i[b >> 0] = 1;
    return;
  }
  function zj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0;
    p = u;
    u = (u + 32) | 0;
    j = (p + 8) | 0;
    e = p;
    n = (b + 16) | 0;
    if (k[n >> 2] | 0) Oa(20150, 20281, 309, 17410);
    g = (a + 136) | 0;
    ci((p + 16) | 0, b, g);
    l = k[(b + 4) >> 2] | 0;
    m = k[(b + 8) >> 2] | 0;
    o = (l | 0) < (m | 0) ? l : m;
    d = (a + 140) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
      Ef(g, l);
      k[j >> 2] = 0;
      k[e >> 2] = l + -1;
      Bj(g, l, j, e) | 0;
      c = k[d >> 2] | 0;
    }
    k[j >> 2] = 0;
    f = (j + 4) | 0;
    k[f >> 2] = 0;
    Ef(j, c);
    e = k[f >> 2] | 0;
    h = k[j >> 2] | 0;
    if ((e | 0) > 0) {
      d = k[g >> 2] | 0;
      c = 0;
      do {
        k[(h + (k[(d + (c << 2)) >> 2] << 2)) >> 2] = c;
        c = (c + 1) | 0;
      } while ((c | 0) != (e | 0));
      e = k[f >> 2] | 0;
    }
    f = (a + 152) | 0;
    c = (a + 156) | 0;
    if ((k[c >> 2] | 0) != (e | 0) ? (Ng(f, e, 1), (k[c >> 2] | 0) != (e | 0)) : 0) Oa(12160, 12207, 721, 12285);
    c = k[f >> 2] | 0;
    if ((e | 0) > 0) {
      d = 0;
      do {
        k[(c + (d << 2)) >> 2] = k[(h + (d << 2)) >> 2];
        d = (d + 1) | 0;
      } while ((d | 0) != (e | 0));
    }
    d = k[j >> 2] | 0;
    if (d) {
      Pq(k[(d + -4) >> 2] | 0);
      c = k[f >> 2] | 0;
    }
    di(b, (a + 176) | 0, (a + 184) | 0, c) | 0;
    i[(a + 193) >> 0] = 1;
    g = (a + 56) | 0;
    Dg(g, m, l);
    h = (a + 92) | 0;
    Dg(h, m, o);
    e = k[n >> 2] | 0;
    if (e) {
      f = k[(b + 4) >> 2] | 0;
      if (f) {
        if ((f | 0) <= -1) Oa(14697, 13988, 163, 14058);
        c = k[e >> 2] | 0;
        if ((f | 0) != 1) {
          d = 1;
          do {
            c = ((k[(e + (d << 2)) >> 2] | 0) + c) | 0;
            d = (d + 1) | 0;
          } while ((d | 0) < (f | 0));
        }
      } else c = 0;
    } else {
      c = k[(b + 12) >> 2] | 0;
      c = ((k[(c + (k[(b + 4) >> 2] << 2)) >> 2] | 0) - (k[c >> 2] | 0)) | 0;
    }
    Gg(g, c << 1);
    f = k[n >> 2] | 0;
    if (!f) {
      n = k[(b + 12) >> 2] | 0;
      b = ((k[(n + (k[(b + 4) >> 2] << 2)) >> 2] | 0) - (k[n >> 2] | 0)) | 0;
      b = b << 1;
      Gg(h, b);
      b = (a + 128) | 0;
      Df(b, o);
      a = (a + 1) | 0;
      i[a >> 0] = 1;
      u = p;
      return;
    }
    e = k[(b + 4) >> 2] | 0;
    if (!e) {
      b = 0;
      b = b << 1;
      Gg(h, b);
      b = (a + 128) | 0;
      Df(b, o);
      a = (a + 1) | 0;
      i[a >> 0] = 1;
      u = p;
      return;
    }
    if ((e | 0) <= -1) Oa(14697, 13988, 163, 14058);
    c = k[f >> 2] | 0;
    if ((e | 0) == 1) {
      b = c;
      b = b << 1;
      Gg(h, b);
      b = (a + 128) | 0;
      Df(b, o);
      a = (a + 1) | 0;
      i[a >> 0] = 1;
      u = p;
      return;
    } else d = 1;
    do {
      c = ((k[(f + (d << 2)) >> 2] | 0) + c) | 0;
      d = (d + 1) | 0;
    } while ((d | 0) < (e | 0));
    b = c << 1;
    Gg(h, b);
    b = (a + 128) | 0;
    Df(b, o);
    a = (a + 1) | 0;
    i[a >> 0] = 1;
    u = p;
    return;
  }
  function Aj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0,
      j = 0.0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0.0,
      t = 0.0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      aa = 0,
      ba = 0,
      ca = 0,
      da = 0,
      ea = 0,
      fa = 0,
      ga = 0,
      ha = 0,
      ia = 0,
      ja = 0,
      ka = 0,
      la = 0,
      ma = 0,
      na = 0,
      oa = 0,
      pa = 0,
      qa = 0,
      ra = 0,
      sa = 0,
      ta = 0,
      ua = 0,
      va = 0,
      wa = 0,
      xa = 0,
      ya = 0,
      za = 0,
      Aa = 0,
      Ba = 0,
      Ca = 0,
      Da = 0,
      Ea = 0,
      Fa = 0;
    Fa = u;
    u = (u + 80) | 0;
    Ea = (Fa + 72) | 0;
    Da = (Fa + 64) | 0;
    Ca = (Fa + 56) | 0;
    Ba = (Fa + 48) | 0;
    Aa = (Fa + 12) | 0;
    za = Fa;
    if (!(i[(a + 1) >> 0] | 0)) Oa(20356, 20281, 352, 17671);
    ma = k[(b + 8) >> 2] | 0;
    ya = k[(b + 4) >> 2] | 0;
    oa = (ya | 0) < (ma | 0) ? ya : ma;
    k[Ea >> 2] = 0;
    na = (Ea + 4) | 0;
    k[na >> 2] = 0;
    Ef(Ea, (ma | 0) < (ya | 0) ? ya : ma);
    c = k[na >> 2] | 0;
    if ((c | 0) <= -1) Oa(11919, 12068, 74, 12145);
    if (c | 0) iF(k[Ea >> 2] | 0, -1, (c << 2) | 0) | 0;
    k[Da >> 2] = 0;
    ia = (Da + 4) | 0;
    k[ia >> 2] = 0;
    Ef(Da, ya);
    k[Ca >> 2] = 0;
    ja = (Ca + 4) | 0;
    k[ja >> 2] = 0;
    Ef(Ca, ma);
    k[Ba >> 2] = 0;
    ka = (Ba + 4) | 0;
    k[ka >> 2] = 0;
    Df(Ba, ma);
    h = +p[(a + 160) >> 3];
    wa = (a + 56) | 0;
    ua = (a + 84) | 0;
    k[ua >> 2] = 0;
    va = (a + 68) | 0;
    xa = (a + 60) | 0;
    iF(k[va >> 2] | 0, 0, ((k[xa >> 2] << 2) + 4) | 0) | 0;
    c = k[(a + 72) >> 2] | 0;
    if (c | 0) iF(c | 0, 0, (k[xa >> 2] << 2) | 0) | 0;
    sa = (a + 92) | 0;
    qa = (a + 120) | 0;
    k[qa >> 2] = 0;
    ra = (a + 104) | 0;
    ta = (a + 96) | 0;
    iF(k[ra >> 2] | 0, 0, ((k[ta >> 2] << 2) + 4) | 0) | 0;
    ha = (a + 108) | 0;
    c = k[ha >> 2] | 0;
    if (c | 0) iF(c | 0, 0, (k[ta >> 2] << 2) | 0) | 0;
    fa = (a + 20) | 0;
    Ag(fa, b) | 0;
    ga = (a + 193) | 0;
    if (!(i[ga >> 0] | 0)) {
      e = k[(a + 140) >> 2] | 0;
      k[Aa >> 2] = 0;
      d = (Aa + 4) | 0;
      k[d >> 2] = 0;
      Ef(Aa, e);
      e = k[d >> 2] | 0;
      g = k[Aa >> 2] | 0;
      if ((e | 0) > 0) {
        f = k[(a + 136) >> 2] | 0;
        c = 0;
        do {
          k[(g + (k[(f + (c << 2)) >> 2] << 2)) >> 2] = c;
          c = (c + 1) | 0;
        } while ((c | 0) != (e | 0));
        e = k[d >> 2] | 0;
      }
      f = (a + 152) | 0;
      c = (a + 156) | 0;
      if ((k[c >> 2] | 0) != (e | 0) ? (Ng(f, e, 1), (k[c >> 2] | 0) != (e | 0)) : 0) Oa(12160, 12207, 721, 12285);
      c = k[f >> 2] | 0;
      if ((e | 0) > 0) {
        d = 0;
        do {
          k[(c + (d << 2)) >> 2] = k[(g + (d << 2)) >> 2];
          d = (d + 1) | 0;
        } while ((d | 0) != (e | 0));
      }
      d = k[Aa >> 2] | 0;
      if (d) {
        Pq(k[(d + -4) >> 2] | 0);
        c = k[f >> 2] | 0;
      }
      di(fa, (a + 176) | 0, (a + 184) | 0, c) | 0;
      i[ga >> 0] = 1;
    }
    d = (a + 36) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
      f = k[(a + 24) >> 2] | 0;
      c = Oq(f << 2) | 0;
      k[d >> 2] = c;
      if ((f | 0) > 0) {
        e = k[(a + 32) >> 2] | 0;
        d = 0;
        do {
          ea = d;
          d = (d + 1) | 0;
          k[(c + (ea << 2)) >> 2] = (k[(e + (d << 2)) >> 2] | 0) - (k[(e + (ea << 2)) >> 2] | 0);
        } while ((d | 0) < (f | 0));
      }
    }
    f = k[(b + 12) >> 2] | 0;
    r = (ya | 0) > 0;
    a: do
      if (r) {
        g = (a + 140) | 0;
        b = (a + 32) | 0;
        l = (a + 136) | 0;
        e = 0;
        while (1) {
          d = k[g >> 2] | 0;
          if (!d) d = e;
          else {
            if ((d | 0) <= (e | 0)) break;
            d = k[((k[l >> 2] | 0) + (e << 2)) >> 2] | 0;
          }
          ea = (f + (e << 2)) | 0;
          k[((k[b >> 2] | 0) + (d << 2)) >> 2] = k[ea >> 2];
          e = (e + 1) | 0;
          k[(c + (d << 2)) >> 2] = (k[(f + (e << 2)) >> 2] | 0) - (k[ea >> 2] | 0);
          if ((e | 0) >= (ya | 0)) break a;
        }
        Oa(16605, 15693, 425, 29764);
      }
    while (0);
    if (i[(a + 168) >> 0] | 0) {
      b: do
        if (r) {
          l = (a + 28) | 0;
          m = (a + 40) | 0;
          n = (a + 32) | 0;
          o = k[(fa + 4) >> 2] | 0;
          q = (c | 0) == 0;
          b = 0;
          h = 0.0;
          while (1) {
            if ((o | 0) <= (b | 0)) {
              pa = 40;
              break;
            }
            if ((k[l >> 2] | 0) <= 0) {
              pa = 42;
              break;
            }
            g = k[m >> 2] | 0;
            d = ((k[n >> 2] | 0) + (b << 2)) | 0;
            if (!d) {
              pa = 44;
              break;
            }
            e = k[d >> 2] | 0;
            if (!q ? ((v = (c + (b << 2)) | 0), (v | 0) != 0) : 0) f = ((k[v >> 2] | 0) + e) | 0;
            else f = k[(d + 4) >> 2] | 0;
            if ((e | 0) < (f | 0)) {
              j = 0.0;
              d = e;
              do {
                t = +p[(g + (d << 3)) >> 3];
                j = j + t * t;
                d = (d + 1) | 0;
              } while ((d | 0) != (f | 0));
            } else j = 0.0;
            t = +Q(+j);
            h = h < t ? t : h;
            b = (b + 1) | 0;
            if ((b | 0) >= (ya | 0)) {
              s = h;
              break b;
            }
          }
          if ((pa | 0) == 40) Oa(13577, 13744, 122, 13812);
          else if ((pa | 0) == 42) Oa(16822, 16887, 19, 11478);
          else if ((pa | 0) == 44) while (1) pa = 44;
        } else s = 0.0;
      while (0);
      h = +((((ya + ma) | 0) * 20) | 0) * (s == 0.0 ? 1.0 : s) * 2.220446049250313e-16;
    }
    ea = (a + 144) | 0;
    Ef(ea, ya);
    da = (a + 148) | 0;
    d = k[da >> 2] | 0;
    if ((d | 0) > 0) {
      e = k[ea >> 2] | 0;
      c = 0;
      do {
        k[(e + (c << 2)) >> 2] = c;
        c = (c + 1) | 0;
      } while ((c | 0) != (d | 0));
    }
    c = k[ra >> 2] | 0;
    d = k[c >> 2] | 0;
    if ((d | 0) != (k[qa >> 2] | 0)) Oa(16047, 15958, 414, 16152);
    c = (c + 4) | 0;
    if (k[c >> 2] | 0) Oa(16161, 15958, 415, 16152);
    k[c >> 2] = d;
    c: do
      if (r) {
        L = (fa + 20) | 0;
        M = (fa + 24) | 0;
        N = (fa + 12) | 0;
        O = (fa + 16) | 0;
        R = (ya + -1) | 0;
        S = (a + 176) | 0;
        T = (a + 184) | 0;
        U = (a + 76) | 0;
        V = (a + 80) | 0;
        W = (sa + 4) | 0;
        X = (a + 100) | 0;
        Y = (a + 112) | 0;
        Z = (a + 116) | 0;
        c = (a + 132) | 0;
        d = (a + 128) | 0;
        _ = (a + 180) | 0;
        $ = (a + 176) | 0;
        aa = (a + 188) | 0;
        ba = (a + 184) | 0;
        ca = (a + 112) | 0;
        e = 0;
        b = 0;
        d: while (1) {
          H = (b | 0) >= (ma | 0);
          G = H ^ 1;
          I = (oa | 0) > (b | 0);
          J = (b | 0) < (R | 0);
          while (1) {
            f = k[na >> 2] | 0;
            if ((f | 0) <= -1) {
              pa = 64;
              break d;
            }
            if (f | 0) iF(k[Ea >> 2] | 0, -1, (f << 2) | 0) | 0;
            f = k[va >> 2] | 0;
            g = k[(f + (e << 2)) >> 2] | 0;
            if ((g | 0) != (k[ua >> 2] | 0)) {
              pa = 68;
              break d;
            }
            K = (e + 1) | 0;
            f = (f + (K << 2)) | 0;
            if (k[f >> 2] | 0) {
              pa = 70;
              break d;
            }
            k[f >> 2] = g;
            if ((k[na >> 2] | 0) <= (b | 0)) {
              pa = 72;
              break d;
            }
            k[((k[Ea >> 2] | 0) + (b << 2)) >> 2] = e;
            if ((k[ja >> 2] | 0) <= 0) {
              pa = 74;
              break d;
            }
            k[k[Ca >> 2] >> 2] = b;
            f = k[ka >> 2] | 0;
            if ((f | 0) <= -1) {
              pa = 76;
              break d;
            }
            if (f | 0) iF(k[Ba >> 2] | 0, 0, (f << 3) | 0) | 0;
            E = k[L >> 2] | 0;
            F = k[M >> 2] | 0;
            f = k[N >> 2] | 0;
            l = k[(f + (e << 2)) >> 2] | 0;
            g = k[O >> 2] | 0;
            if (!g) z = k[(f + (K << 2)) >> 2] | 0;
            else z = ((k[(g + (e << 2)) >> 2] | 0) + l) | 0;
            g = (l | 0) < (z | 0);
            do
              if (g | G) {
                A = k[Ea >> 2] | 0;
                B = k[Da >> 2] | 0;
                C = k[Ba >> 2] | 0;
                D = k[Ca >> 2] | 0;
                w = 0;
                f = 1;
                y = H;
                while (1) {
                  if (g) v = k[(F + (l << 2)) >> 2] | 0;
                  else v = b;
                  y = y | ((v | 0) == (b | 0));
                  if ((v | 0) <= -1) {
                    pa = 88;
                    break d;
                  }
                  if ((k[aa >> 2] | 0) <= (v | 0)) {
                    pa = 88;
                    break d;
                  }
                  m = k[((k[ba >> 2] | 0) + (v << 2)) >> 2] | 0;
                  if ((m | 0) < 0) {
                    pa = 92;
                    break d;
                  }
                  if ((k[na >> 2] | 0) <= (m | 0)) {
                    pa = 93;
                    break d;
                  }
                  o = (w | 0) > -1;
                  x = w;
                  while (1) {
                    n = (A + (m << 2)) | 0;
                    if ((k[n >> 2] | 0) == (e | 0)) break;
                    if (!(o & ((k[ia >> 2] | 0) > (x | 0)))) {
                      pa = 96;
                      break d;
                    }
                    k[(B + (x << 2)) >> 2] = m;
                    if ((k[na >> 2] | 0) <= (m | 0)) {
                      pa = 98;
                      break d;
                    }
                    k[n >> 2] = e;
                    if ((k[_ >> 2] | 0) <= (m | 0)) {
                      pa = 100;
                      break d;
                    }
                    m = k[((k[$ >> 2] | 0) + (m << 2)) >> 2] | 0;
                    if (!((m | 0) > -1 ? (k[na >> 2] | 0) > (m | 0) : 0)) {
                      pa = 93;
                      break d;
                    } else x = (x + 1) | 0;
                  }
                  r = (x - w) | 0;
                  q = ((r | 0) / 2) | 0;
                  if ((r | 0) > 1) {
                    o = 0;
                    do {
                      m = (o + w) | 0;
                      if ((m | 0) <= -1) {
                        pa = 106;
                        break d;
                      }
                      r = k[ia >> 2] | 0;
                      if ((r | 0) <= (m | 0)) {
                        pa = 106;
                        break d;
                      }
                      m = (B + (m << 2)) | 0;
                      n = (x - o) | 0;
                      if (!(((n | 0) > 0) & ((r | 0) >= (n | 0)))) {
                        pa = 108;
                        break d;
                      }
                      r = (B + ((n + -1) << 2)) | 0;
                      n = k[m >> 2] | 0;
                      k[m >> 2] = k[r >> 2];
                      k[r >> 2] = n;
                      o = (o + 1) | 0;
                    } while ((o | 0) < (q | 0));
                  }
                  if (g)
                    if ((k[ka >> 2] | 0) > (v | 0)) j = +p[(E + (l << 3)) >> 3];
                    else {
                      pa = 111;
                      break d;
                    }
                  else if ((k[ka >> 2] | 0) > (v | 0)) j = 0.0;
                  else {
                    pa = 113;
                    break d;
                  }
                  p[(C + (v << 3)) >> 3] = j;
                  do
                    if ((v | 0) > (b | 0)) {
                      if ((k[na >> 2] | 0) <= (v | 0)) {
                        pa = 116;
                        break d;
                      }
                      g = (A + (v << 2)) | 0;
                      if ((k[g >> 2] | 0) == (e | 0)) break;
                      if (!((f | 0) > -1 ? (k[ja >> 2] | 0) > (f | 0) : 0)) {
                        pa = 119;
                        break d;
                      }
                      k[(D + (f << 2)) >> 2] = v;
                      if ((k[na >> 2] | 0) <= (v | 0)) {
                        pa = 121;
                        break d;
                      }
                      k[g >> 2] = e;
                      f = (f + 1) | 0;
                    }
                  while (0);
                  l = (l + 1) | 0;
                  g = (l | 0) < (z | 0);
                  if (!(g | (y ^ 1))) break;
                  else w = x;
                }
                r = (x + -1) | 0;
                v = (x | 0) > 0;
                if (!v) {
                  w = f;
                  v = 0;
                  break;
                }
                C = k[Da >> 2] | 0;
                D = k[Ba >> 2] | 0;
                E = k[Ea >> 2] | 0;
                F = k[Ca >> 2] | 0;
                B = r;
                while (1) {
                  g = k[ia >> 2] | 0;
                  if ((g | 0) <= (B | 0)) {
                    pa = 128;
                    break d;
                  }
                  w = k[(C + (B << 2)) >> 2] | 0;
                  if ((w | 0) <= -1) {
                    pa = 131;
                    break d;
                  }
                  if ((k[W >> 2] | 0) <= (w | 0)) {
                    pa = 131;
                    break d;
                  }
                  o = k[X >> 2] | 0;
                  if ((o | 0) != (k[ka >> 2] | 0)) {
                    pa = 133;
                    break d;
                  }
                  if ((o | 0) <= 0) {
                    pa = 135;
                    break d;
                  }
                  q = k[Y >> 2] | 0;
                  A = k[Z >> 2] | 0;
                  x = k[ra >> 2] | 0;
                  l = (x + (w << 2)) | 0;
                  if (!l) {
                    pa = 137;
                    break d;
                  }
                  m = k[l >> 2] | 0;
                  y = k[ha >> 2] | 0;
                  z = (y | 0) == 0;
                  do
                    if (z) pa = 140;
                    else {
                      n = (y + (w << 2)) | 0;
                      if (!n) {
                        pa = 140;
                        break;
                      }
                      l = ((k[n >> 2] | 0) + m) | 0;
                    }
                  while (0);
                  if ((pa | 0) == 140) {
                    pa = 0;
                    l = k[(l + 4) >> 2] | 0;
                  }
                  if ((m | 0) < (l | 0)) {
                    j = 0.0;
                    n = m;
                    do {
                      j = j + +p[(q + (n << 3)) >> 3] * +p[(D + (k[(A + (n << 2)) >> 2] << 3)) >> 3];
                      n = (n + 1) | 0;
                    } while ((n | 0) != (l | 0));
                  } else j = 0.0;
                  if ((k[c >> 2] | 0) <= (w | 0)) {
                    pa = 145;
                    break d;
                  }
                  j = j * +p[((k[d >> 2] | 0) + (w << 3)) >> 3];
                  if (z) n = k[(x + ((w + 1) << 2)) >> 2] | 0;
                  else n = ((k[(y + (w << 2)) >> 2] | 0) + m) | 0;
                  if ((m | 0) < (n | 0)) {
                    g = m;
                    do {
                      l = k[(A + (g << 2)) >> 2] | 0;
                      if (!(((l | 0) > -1) & ((o | 0) > (l | 0)))) {
                        pa = 154;
                        break d;
                      }
                      l = (D + (l << 3)) | 0;
                      p[l >> 3] = +p[l >> 3] - j * +p[(q + (g << 3)) >> 3];
                      g = (g + 1) | 0;
                    } while ((g | 0) < (n | 0));
                    g = k[ia >> 2] | 0;
                  }
                  if ((g | 0) <= (B | 0)) {
                    pa = 152;
                    break d;
                  }
                  if ((k[_ >> 2] | 0) <= (w | 0)) {
                    pa = 157;
                    break d;
                  }
                  do
                    if ((k[((k[$ >> 2] | 0) + (w << 2)) >> 2] | 0) == (b | 0)) {
                      if (z) n = k[(x + ((w + 1) << 2)) >> 2] | 0;
                      else n = ((k[(y + (w << 2)) >> 2] | 0) + m) | 0;
                      if ((m | 0) >= (n | 0)) break;
                      do {
                        g = k[(A + (m << 2)) >> 2] | 0;
                        if (!((g | 0) > -1 ? (k[na >> 2] | 0) > (g | 0) : 0)) {
                          pa = 164;
                          break d;
                        }
                        l = (E + (g << 2)) | 0;
                        if ((k[l >> 2] | 0) != (e | 0)) {
                          if (!((f | 0) > -1 ? (k[ja >> 2] | 0) > (f | 0) : 0)) {
                            pa = 167;
                            break d;
                          }
                          k[(F + (f << 2)) >> 2] = g;
                          if ((k[na >> 2] | 0) <= (g | 0)) {
                            pa = 169;
                            break d;
                          }
                          k[l >> 2] = e;
                          f = (f + 1) | 0;
                        }
                        m = (m + 1) | 0;
                      } while ((m | 0) < (n | 0));
                    }
                  while (0);
                  if ((B | 0) > 0) B = (B + -1) | 0;
                  else {
                    w = f;
                    break;
                  }
                }
              } else {
                w = 1;
                v = 0;
                r = -1;
              }
            while (0);
            e: do
              if (I) {
                do
                  if (!w) j = 0.0;
                  else {
                    if ((k[ja >> 2] | 0) <= 0) {
                      pa = 175;
                      break d;
                    }
                    f = k[k[Ca >> 2] >> 2] | 0;
                    if (!((f | 0) > -1 ? (k[ka >> 2] | 0) > (f | 0) : 0)) {
                      pa = 177;
                      break d;
                    }
                    t = +p[((k[Ba >> 2] | 0) + (f << 3)) >> 3];
                    q = (w | 0) > 1;
                    if (!q) {
                      j = t;
                      break;
                    }
                    g = k[ja >> 2] | 0;
                    l = k[Ca >> 2] | 0;
                    m = k[ka >> 2] | 0;
                    n = k[Ba >> 2] | 0;
                    f = 1;
                    j = 0.0;
                    do {
                      if ((g | 0) <= (f | 0)) {
                        pa = 182;
                        break d;
                      }
                      o = k[(l + (f << 2)) >> 2] | 0;
                      if (!(((o | 0) > -1) & ((m | 0) > (o | 0)))) {
                        pa = 184;
                        break d;
                      }
                      s = +p[(n + (o << 3)) >> 3];
                      j = j + s * s;
                      f = (f + 1) | 0;
                    } while ((f | 0) < (w | 0));
                    if (j == 0.0) {
                      j = t;
                      break;
                    }
                    j = +Q(+(t * t + j));
                    j = !(t >= 0.0) ? j : -j;
                    if ((k[ja >> 2] | 0) <= 0) {
                      pa = 192;
                      break d;
                    }
                    f = k[k[Ca >> 2] >> 2] | 0;
                    if (!((f | 0) > -1 ? (k[ka >> 2] | 0) > (f | 0) : 0)) {
                      pa = 194;
                      break d;
                    }
                    p[((k[Ba >> 2] | 0) + (f << 3)) >> 3] = 1.0;
                    if (q) {
                      s = t - j;
                      g = k[Ca >> 2] | 0;
                      l = k[Ba >> 2] | 0;
                      f = 1;
                      do {
                        if ((k[ja >> 2] | 0) <= (f | 0)) {
                          pa = 198;
                          break d;
                        }
                        m = k[(g + (f << 2)) >> 2] | 0;
                        if (!((m | 0) > -1 ? (k[ka >> 2] | 0) > (m | 0) : 0)) {
                          pa = 200;
                          break d;
                        }
                        F = (l + (m << 3)) | 0;
                        p[F >> 3] = +p[F >> 3] / s;
                        f = (f + 1) | 0;
                      } while ((f | 0) < (w | 0));
                    }
                    s = (j - t) / j;
                    break e;
                  }
                while (0);
                if ((k[ja >> 2] | 0) <= 0) {
                  pa = 187;
                  break d;
                }
                f = k[k[Ca >> 2] >> 2] | 0;
                if (!((f | 0) > -1 ? (k[ka >> 2] | 0) > (f | 0) : 0)) {
                  pa = 189;
                  break d;
                }
                p[((k[Ba >> 2] | 0) + (f << 3)) >> 3] = 1.0;
                s = 0.0;
              } else {
                s = 0.0;
                j = 0.0;
              }
            while (0);
            if (v) {
              f = r;
              while (1) {
                if ((k[ia >> 2] | 0) <= (f | 0)) {
                  pa = 208;
                  break d;
                }
                g = k[((k[Da >> 2] | 0) + (f << 2)) >> 2] | 0;
                if ((g | 0) < (b | 0)) {
                  if (!((g | 0) > -1 ? (k[ka >> 2] | 0) > (g | 0) : 0)) {
                    pa = 211;
                    break d;
                  }
                  t = +p[((k[Ba >> 2] | 0) + (g << 3)) >> 3];
                  D = ((k[va >> 2] | 0) + (K << 2)) | 0;
                  F = k[D >> 2] | 0;
                  k[D >> 2] = F + 1;
                  D = k[ua >> 2] | 0;
                  Eg(U, (D + 1) | 0, 1.0);
                  E = k[U >> 2] | 0;
                  p[(E + (D << 3)) >> 3] = 0.0;
                  k[((k[V >> 2] | 0) + (D << 2)) >> 2] = g;
                  p[(E + (F << 3)) >> 3] = t;
                  if ((k[ka >> 2] | 0) <= (g | 0)) {
                    pa = 213;
                    break d;
                  }
                  p[((k[Ba >> 2] | 0) + (g << 3)) >> 3] = 0.0;
                }
                if ((f | 0) > 0) f = (f + -1) | 0;
                else break;
              }
            }
            if (I ? +P(+j) >= h : 0) break;
            if (J) {
              f = b;
              do {
                g = k[da >> 2] | 0;
                if ((g | 0) <= (f | 0)) {
                  pa = 241;
                  break d;
                }
                e = k[ea >> 2] | 0;
                l = (e + (f << 2)) | 0;
                f = (f + 1) | 0;
                if ((g | 0) <= (f | 0)) {
                  pa = 243;
                  break d;
                }
                F = (e + (f << 2)) | 0;
                E = k[l >> 2] | 0;
                k[l >> 2] = k[F >> 2];
                k[F >> 2] = E;
              } while ((f | 0) < (R | 0));
            } else e = k[ea >> 2] | 0;
            di(fa, S, T, e) | 0;
            i[ga >> 0] = 0;
            if ((K | 0) < (ya | 0)) e = K;
            else {
              pa = 245;
              break c;
            }
          }
          f = k[va >> 2] | 0;
          g = (f + (K << 2)) | 0;
          l = k[g >> 2] | 0;
          if ((l | 0) != (k[ua >> 2] | 0)) {
            pa = 218;
            break;
          }
          if ((l | 0) != (k[(f + (e << 2)) >> 2] | 0) ? (k[((k[V >> 2] | 0) + ((l + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
            pa = 221;
            break;
          }
          k[g >> 2] = l + 1;
          I = k[ua >> 2] | 0;
          Eg(U, (I + 1) | 0, 1.0);
          J = k[U >> 2] | 0;
          p[(J + (I << 3)) >> 3] = 0.0;
          k[((k[V >> 2] | 0) + (I << 2)) >> 2] = b;
          p[(J + (l << 3)) >> 3] = j;
          if ((k[c >> 2] | 0) <= (b | 0)) {
            pa = 223;
            break;
          }
          p[((k[d >> 2] | 0) + (b << 3)) >> 3] = s;
          g = (b + 1) | 0;
          if ((w | 0) > 0) {
            e = 0;
            do {
              if ((k[ja >> 2] | 0) <= (e | 0)) {
                pa = 228;
                break d;
              }
              f = k[((k[Ca >> 2] | 0) + (e << 2)) >> 2] | 0;
              if (!((f | 0) > -1 ? (k[ka >> 2] | 0) > (f | 0) : 0)) {
                pa = 230;
                break d;
              }
              t = +p[((k[Ba >> 2] | 0) + (f << 3)) >> 3];
              H = ((k[ra >> 2] | 0) + (g << 2)) | 0;
              J = k[H >> 2] | 0;
              k[H >> 2] = J + 1;
              H = k[qa >> 2] | 0;
              Eg(ca, (H + 1) | 0, 1.0);
              I = k[ca >> 2] | 0;
              p[(I + (H << 3)) >> 3] = 0.0;
              k[((k[Z >> 2] | 0) + (H << 2)) >> 2] = f;
              p[(I + (J << 3)) >> 3] = t;
              if ((k[ka >> 2] | 0) <= (f | 0)) {
                pa = 232;
                break d;
              }
              p[((k[Ba >> 2] | 0) + (f << 3)) >> 3] = 0.0;
              e = (e + 1) | 0;
            } while ((e | 0) < (w | 0));
          }
          if ((g | 0) < (oa | 0)) {
            e = k[ra >> 2] | 0;
            f = k[(e + (g << 2)) >> 2] | 0;
            if ((f | 0) != (k[qa >> 2] | 0)) {
              pa = 235;
              break;
            }
            e = (e + ((b + 2) << 2)) | 0;
            if (k[e >> 2] | 0) {
              pa = 237;
              break;
            }
            k[e >> 2] = f;
          }
          if ((K | 0) < (ya | 0)) {
            e = K;
            b = g;
          } else {
            b = g;
            pa = 245;
            break c;
          }
        }
        switch (pa | 0) {
          case 64: {
            Oa(11919, 12068, 74, 12145);
            break;
          }
          case 68: {
            Oa(16047, 15958, 414, 16152);
            break;
          }
          case 70: {
            Oa(16161, 15958, 415, 16152);
            break;
          }
          case 72: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 74: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 76: {
            Oa(11919, 12068, 74, 12145);
            break;
          }
          case 88: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 92: {
            TA((a + 8) | 0, 20427) | 0;
            la = 3;
            break c;
          }
          case 93: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 96: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 98: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 100: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 106: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 108: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 111: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 113: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 116: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 119: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 121: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 128: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 131: {
            Oa(13577, 13744, 122, 13812);
            break;
          }
          case 133: {
            Oa(20474, 20497, 26, 20575);
            break;
          }
          case 135: {
            Oa(20579, 20497, 27, 20575);
            break;
          }
          case 137:
            while (1) pa = 137;
          case 145: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 152: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 154: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 157: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 164: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 167: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 169: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 175: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 177: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 182: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 184: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 187: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 189: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 192: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 194: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 198: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 200: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 208: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 211: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 213: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 218: {
            Oa(16249, 15958, 392, 16348);
            break;
          }
          case 221: {
            Oa(16371, 15958, 393, 16348);
            break;
          }
          case 223: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 228: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 230: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 232: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 235: {
            Oa(16047, 15958, 414, 16152);
            break;
          }
          case 237: {
            Oa(16161, 15958, 415, 16152);
            break;
          }
          case 241: {
            Oa(16605, 15693, 425, 29764);
            break;
          }
          case 243: {
            Oa(16605, 15693, 408, 29907);
            break;
          }
        }
      } else {
        b = 0;
        d = (a + 128) | 0;
        c = (a + 132) | 0;
        pa = 245;
      }
    while (0);
    if ((pa | 0) == 245) {
      f = (oa - b) | 0;
      e = ((k[c >> 2] | 0) - f) | 0;
      c = ((k[d >> 2] | 0) + (e << 3)) | 0;
      d = (f | 0) > -1;
      if (!(d | ((c | 0) == 0))) Oa(13818, 13988, 175, 14058);
      if ((e | f | 0) < 0) Oa(14177, 13744, 147, 13812);
      if (!d) Oa(11919, 12068, 74, 12145);
      if (f | 0) iF(c | 0, 0, (f << 3) | 0) | 0;
      do
        if (!(k[(sa + 16) >> 2] | 0)) {
          g = k[qa >> 2] | 0;
          e = k[ta >> 2] | 0;
          if ((e | 0) <= -1) break;
          f = k[ra >> 2] | 0;
          c = e;
          while (1) {
            if (k[(f + (c << 2)) >> 2] | 0) break;
            d = (c + -1) | 0;
            if ((c | 0) > 0) c = d;
            else {
              c = d;
              break;
            }
          }
          if ((c | 0) >= (e | 0)) break;
          do {
            c = (c + 1) | 0;
            k[(f + (c << 2)) >> 2] = g;
          } while ((c | 0) < (k[ta >> 2] | 0));
        }
      while (0);
      Bh(sa);
      do
        if (!(k[(wa + 16) >> 2] | 0)) {
          g = k[ua >> 2] | 0;
          e = k[xa >> 2] | 0;
          if ((e | 0) <= -1) break;
          f = k[va >> 2] | 0;
          c = e;
          while (1) {
            if (k[(f + (c << 2)) >> 2] | 0) break;
            d = (c + -1) | 0;
            if ((c | 0) > 0) c = d;
            else {
              c = d;
              break;
            }
          }
          if ((c | 0) >= (e | 0)) break;
          do {
            c = (c + 1) | 0;
            k[(f + (c << 2)) >> 2] = g;
          } while ((c | 0) < (k[xa >> 2] | 0));
        }
      while (0);
      Bh(wa);
      i[(a + 192) >> 0] = 0;
      k[(a + 172) >> 2] = b;
      if ((b | 0) < (ya | 0)) {
        i[Aa >> 0] = 0;
        ya = (Aa + 4) | 0;
        k[ya >> 2] = 0;
        k[(ya + 4) >> 2] = 0;
        k[(ya + 8) >> 2] = 0;
        k[(ya + 12) >> 2] = 0;
        k[(ya + 16) >> 2] = 0;
        k[(ya + 20) >> 2] = 0;
        k[(ya + 24) >> 2] = 0;
        k[(ya + 28) >> 2] = 0;
        Ag(Aa, wa) | 0;
        i[za >> 0] = 0;
        k[(za + 4) >> 2] = Aa;
        k[(za + 8) >> 2] = ea;
        if ((k[(Aa + 4) >> 2] | 0) != (k[da >> 2] | 0)) Oa(14710, 14850, 97, 14920);
        Cj(wa, za) | 0;
        d = (a + 152) | 0;
        ji(za, 0, d, ea);
        e = k[za >> 2] | 0;
        f = k[(za + 4) >> 2] | 0;
        c = (a + 156) | 0;
        do
          if ((k[c >> 2] | 0) != (f | 0)) {
            Ng(d, f, 1);
            if ((k[c >> 2] | 0) == (f | 0)) break;
            Oa(12160, 12207, 721, 12285);
          }
        while (0);
        d = k[d >> 2] | 0;
        if ((f | 0) > 0) {
          c = 0;
          do {
            k[(d + (c << 2)) >> 2] = k[(e + (c << 2)) >> 2];
            c = (c + 1) | 0;
          } while ((c | 0) != (f | 0));
        }
        c = k[za >> 2] | 0;
        if (c | 0) Pq(k[(c + -4) >> 2] | 0);
        Pq(k[(Aa + 12) >> 2] | 0);
        Pq(k[(Aa + 16) >> 2] | 0);
        c = k[(Aa + 20) >> 2] | 0;
        if (c | 0) FA(c);
        c = k[(Aa + 24) >> 2] | 0;
        if (c | 0) FA(c);
      }
      i[a >> 0] = 1;
      i[(a + 2) >> 0] = 1;
      la = 0;
    }
    k[(a + 4) >> 2] = la;
    c = k[Ba >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    c = k[Ca >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    c = k[Da >> 2] | 0;
    if (c | 0) Pq(k[(c + -4) >> 2] | 0);
    c = k[Ea >> 2] | 0;
    if (!c) {
      u = Fa;
      return;
    }
    Pq(k[(c + -4) >> 2] | 0);
    u = Fa;
    return;
  }
  function Bj(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    i = k[d >> 2] | 0;
    h = (b | 0) == 1 ? i : k[c >> 2] | 0;
    d = (i - h) | 0;
    e = ((d | 0) / (((b | 0) < 2 ? 1 : (b + -1) | 0) | 0)) | 0;
    f = (d | 0) > -1 ? d : (0 - d) | 0;
    c = (f + 1) | 0;
    f = (((((i | 0) >= (h | 0) ? b : (0 - b) | 0) + d) | 0) / (((f | 0) == -1 ? 1 : c) | 0)) | 0;
    if ((b | 0) <= 1)
      if ((b | 0) > -1) g = 0;
      else Oa(11919, 12068, 74, 12145);
    else g = ((c | 0) < (b | 0)) & 1;
    c = (a + 4) | 0;
    if ((k[c >> 2] | 0) != (b | 0) ? (Ng(a, b, 1), (k[c >> 2] | 0) != (b | 0)) : 0) Oa(12160, 12207, 721, 12285);
    d = k[a >> 2] | 0;
    if ((b | 0) <= 0) return a | 0;
    if (!((g << 24) >> 24)) {
      c = 0;
      do {
        i = ((aa(c, e) | 0) + h) | 0;
        k[(d + (c << 2)) >> 2] = i;
        c = (c + 1) | 0;
      } while ((c | 0) != (b | 0));
      return a | 0;
    } else {
      c = 0;
      do {
        k[(d + (c << 2)) >> 2] = (((c | 0) / (f | 0)) | 0) + h;
        c = (c + 1) | 0;
      } while ((c | 0) != (b | 0));
      return a | 0;
    }
    return 0;
  }
  function Cj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0;
    if (
      i[b >> 0] | 0
        ? (Dg(a, k[((k[(b + 4) >> 2] | 0) + 8) >> 2] | 0, k[((k[(b + 8) >> 2] | 0) + 4) >> 2] | 0),
          (c = (a + 16) | 0),
          (d = k[c >> 2] | 0),
          d | 0)
        : 0
    ) {
      Pq(d);
      k[c >> 2] = 0;
    }
    Dj(a, b);
    return a | 0;
  }
  function Dj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0.0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0;
    C = u;
    u = (u + 96) | 0;
    B = C;
    z = (C + 56) | 0;
    Ej(B, b);
    g = (b + 8) | 0;
    A = k[((k[g >> 2] | 0) + 4) >> 2] | 0;
    if (!(i[b >> 0] | 0)) {
      e = (b + 4) | 0;
      s = k[((k[e >> 2] | 0) + 8) >> 2] | 0;
      i[z >> 0] = 0;
      w = (z + 4) | 0;
      k[w >> 2] = 0;
      k[(w + 4) >> 2] = 0;
      k[(w + 8) >> 2] = 0;
      k[(w + 12) >> 2] = 0;
      k[(w + 16) >> 2] = 0;
      k[(w + 20) >> 2] = 0;
      k[(w + 24) >> 2] = 0;
      k[(w + 28) >> 2] = 0;
      k[(z + 8) >> 2] = s;
      s = (z + 28) | 0;
      k[s >> 2] = 0;
      c = Oq(((A << 2) + 4) | 0) | 0;
      k[(z + 12) >> 2] = c;
      if (!c) {
        C = Kb(4) | 0;
        cF(C);
        Cc(C | 0, 2032, 79);
      }
      k[w >> 2] = A;
      v = (z + 16) | 0;
      b = k[v >> 2] | 0;
      if (!b) {
        t = (z + 12) | 0;
        r = t;
        d = A;
        b = c;
      } else {
        Pq(b);
        k[v >> 2] = 0;
        b = (z + 12) | 0;
        r = b;
        t = b;
        d = k[w >> 2] | 0;
        b = k[b >> 2] | 0;
      }
      iF(b | 0, 0, ((d << 2) + 4) | 0) | 0;
      q = k[((k[e >> 2] | 0) + 8) >> 2] | 0;
      o = k[((k[g >> 2] | 0) + 4) >> 2] | 0;
      Gg(z, ((q | 0) < (o | 0) ? o : q) << 1);
      a: do
        if ((A | 0) > 0) {
          q = (z + 20) | 0;
          o = (z + 24) | 0;
          m = 0;
          b: while (1) {
            d = k[r >> 2] | 0;
            g = k[(d + (m << 2)) >> 2] | 0;
            if ((g | 0) != (k[s >> 2] | 0)) {
              b = 45;
              break;
            }
            n = m;
            m = (m + 1) | 0;
            b = (d + (m << 2)) | 0;
            if (k[b >> 2] | 0) {
              b = 47;
              break;
            }
            k[b >> 2] = g;
            c = k[B >> 2] | 0;
            j = k[(c + 20) >> 2] | 0;
            l = k[(c + 24) >> 2] | 0;
            b = k[(c + 12) >> 2] | 0;
            e = k[(b + (n << 2)) >> 2] | 0;
            c = k[(c + 16) >> 2] | 0;
            if (!c) h = k[(b + (m << 2)) >> 2] | 0;
            else h = ((k[(c + (n << 2)) >> 2] | 0) + e) | 0;
            c: do
              if ((e | 0) < (h | 0)) {
                if ((g | 0) != (k[s >> 2] | 0)) {
                  b = 53;
                  break b;
                }
                while (1) {
                  f = +p[(j + (e << 3)) >> 3];
                  b = k[(l + (e << 2)) >> 2] | 0;
                  c = (d + (m << 2)) | 0;
                  if ((g | 0) != (k[(d + (n << 2)) >> 2] | 0) ? (k[((k[o >> 2] | 0) + ((g + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                    b = 56;
                    break b;
                  }
                  k[c >> 2] = g + 1;
                  c = k[s >> 2] | 0;
                  Eg(q, (c + 1) | 0, 1.0);
                  d = k[q >> 2] | 0;
                  p[(d + (c << 3)) >> 3] = 0.0;
                  k[((k[o >> 2] | 0) + (c << 2)) >> 2] = b;
                  p[(d + (g << 3)) >> 3] = f;
                  e = (e + 1) | 0;
                  if ((e | 0) >= (h | 0)) break c;
                  d = k[r >> 2] | 0;
                  g = k[(d + (m << 2)) >> 2] | 0;
                  if ((g | 0) != (k[s >> 2] | 0)) {
                    b = 53;
                    break b;
                  }
                }
              }
            while (0);
            if ((m | 0) >= (A | 0)) break a;
          }
          if ((b | 0) == 45) Oa(16047, 15958, 414, 16152);
          else if ((b | 0) == 47) Oa(16161, 15958, 415, 16152);
          else if ((b | 0) == 53) Oa(16249, 15958, 392, 16348);
          else if ((b | 0) == 56) Oa(16371, 15958, 393, 16348);
        }
      while (0);
      if ((k[(z + 16) >> 2] | 0) == 0 ? ((y = k[s >> 2] | 0), (x = k[w >> 2] | 0), (x | 0) > -1) : 0) {
        d = k[r >> 2] | 0;
        b = x;
        while (1) {
          if (k[(d + (b << 2)) >> 2] | 0) break;
          c = (b + -1) | 0;
          if ((b | 0) > 0) b = c;
          else {
            b = c;
            break;
          }
        }
        if ((b | 0) < (x | 0))
          do {
            b = (b + 1) | 0;
            k[(d + (b << 2)) >> 2] = y;
          } while ((b | 0) < (k[w >> 2] | 0));
      }
      i[z >> 0] = 1;
      Ag(a, z) | 0;
      Pq(k[t >> 2] | 0);
      Pq(k[v >> 2] | 0);
      b = k[(z + 20) >> 2] | 0;
      if (b | 0) FA(b);
      b = k[(z + 24) >> 2] | 0;
      if (b | 0) FA(b);
    } else {
      b = (b + 4) | 0;
      Dg(a, k[((k[b >> 2] | 0) + 8) >> 2] | 0, A);
      r = (a + 28) | 0;
      k[r >> 2] = 0;
      s = (a + 12) | 0;
      t = (a + 4) | 0;
      iF(k[s >> 2] | 0, 0, ((k[t >> 2] << 2) + 4) | 0) | 0;
      c = k[(a + 16) >> 2] | 0;
      if (c | 0) iF(c | 0, 0, (k[t >> 2] << 2) | 0) | 0;
      z = k[((k[b >> 2] | 0) + 8) >> 2] | 0;
      y = k[((k[g >> 2] | 0) + 4) >> 2] | 0;
      Gg(a, ((z | 0) < (y | 0) ? y : z) << 1);
      d: do
        if ((A | 0) > 0) {
          q = (a + 20) | 0;
          o = (a + 24) | 0;
          m = 0;
          e: while (1) {
            d = k[s >> 2] | 0;
            g = k[(d + (m << 2)) >> 2] | 0;
            if ((g | 0) != (k[r >> 2] | 0)) {
              b = 15;
              break;
            }
            n = m;
            m = (m + 1) | 0;
            b = (d + (m << 2)) | 0;
            if (k[b >> 2] | 0) {
              b = 17;
              break;
            }
            k[b >> 2] = g;
            c = k[B >> 2] | 0;
            j = k[(c + 20) >> 2] | 0;
            l = k[(c + 24) >> 2] | 0;
            b = k[(c + 12) >> 2] | 0;
            e = k[(b + (n << 2)) >> 2] | 0;
            c = k[(c + 16) >> 2] | 0;
            if (!c) h = k[(b + (m << 2)) >> 2] | 0;
            else h = ((k[(c + (n << 2)) >> 2] | 0) + e) | 0;
            f: do
              if ((e | 0) < (h | 0)) {
                if ((g | 0) != (k[r >> 2] | 0)) {
                  b = 23;
                  break e;
                }
                while (1) {
                  f = +p[(j + (e << 3)) >> 3];
                  b = k[(l + (e << 2)) >> 2] | 0;
                  c = (d + (m << 2)) | 0;
                  if ((g | 0) != (k[(d + (n << 2)) >> 2] | 0) ? (k[((k[o >> 2] | 0) + ((g + -1) << 2)) >> 2] | 0) >= (b | 0) : 0) {
                    b = 26;
                    break e;
                  }
                  k[c >> 2] = g + 1;
                  y = k[r >> 2] | 0;
                  Eg(q, (y + 1) | 0, 1.0);
                  z = k[q >> 2] | 0;
                  p[(z + (y << 3)) >> 3] = 0.0;
                  k[((k[o >> 2] | 0) + (y << 2)) >> 2] = b;
                  p[(z + (g << 3)) >> 3] = f;
                  e = (e + 1) | 0;
                  if ((e | 0) >= (h | 0)) break f;
                  d = k[s >> 2] | 0;
                  g = k[(d + (m << 2)) >> 2] | 0;
                  if ((g | 0) != (k[r >> 2] | 0)) {
                    b = 23;
                    break e;
                  }
                }
              }
            while (0);
            if ((m | 0) >= (A | 0)) break d;
          }
          if ((b | 0) == 15) Oa(16047, 15958, 414, 16152);
          else if ((b | 0) == 17) Oa(16161, 15958, 415, 16152);
          else if ((b | 0) == 23) Oa(16249, 15958, 392, 16348);
          else if ((b | 0) == 26) Oa(16371, 15958, 393, 16348);
        }
      while (0);
      if ((k[(a + 16) >> 2] | 0) == 0 ? ((w = k[r >> 2] | 0), (v = k[t >> 2] | 0), (v | 0) > -1) : 0) {
        d = k[s >> 2] | 0;
        b = v;
        while (1) {
          if (k[(d + (b << 2)) >> 2] | 0) break;
          c = (b + -1) | 0;
          if ((b | 0) > 0) b = c;
          else {
            b = c;
            break;
          }
        }
        if ((b | 0) < (v | 0))
          do {
            b = (b + 1) | 0;
            k[(d + (b << 2)) >> 2] = w;
          } while ((b | 0) < (k[t >> 2] | 0));
      }
    }
    Pq(k[(B + 28) >> 2] | 0);
    Pq(k[(B + 32) >> 2] | 0);
    b = k[(B + 36) >> 2] | 0;
    if (b | 0) FA(b);
    b = k[(B + 40) >> 2] | 0;
    if (!b) {
      u = C;
      return;
    }
    FA(b);
    u = C;
    return;
  }
  function Ej(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0;
    k[a >> 2] = 0;
    e = (a + 8) | 0;
    p[e >> 3] = 0.0;
    d = (a + 16) | 0;
    c = (b + 4) | 0;
    g = k[((k[c >> 2] | 0) + 8) >> 2] | 0;
    b = (b + 8) | 0;
    f = k[((k[b >> 2] | 0) + 4) >> 2] | 0;
    i[d >> 0] = 0;
    h = (a + 20) | 0;
    k[h >> 2] = 0;
    k[(h + 4) >> 2] = 0;
    k[(h + 8) >> 2] = 0;
    k[(h + 12) >> 2] = 0;
    k[(h + 16) >> 2] = 0;
    k[(h + 20) >> 2] = 0;
    k[(h + 24) >> 2] = 0;
    k[(h + 28) >> 2] = 0;
    Dg(d, g, f);
    k[a >> 2] = d;
    p[e >> 3] = 0.0;
    Fj(d, k[b >> 2] | 0, k[c >> 2] | 0);
    return;
  }
  function Fj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0.0;
    x = u;
    u = (u + 48) | 0;
    w = (x + 8) | 0;
    t = x;
    e = k[(c + 8) >> 2] | 0;
    v = (c + 4) | 0;
    f = k[v >> 2] | 0;
    i[w >> 0] = 0;
    d = (w + 4) | 0;
    k[d >> 2] = 0;
    k[(d + 4) >> 2] = 0;
    k[(d + 8) >> 2] = 0;
    k[(d + 12) >> 2] = 0;
    k[(d + 16) >> 2] = 0;
    k[(d + 20) >> 2] = 0;
    k[(d + 24) >> 2] = 0;
    k[(d + 28) >> 2] = 0;
    k[(w + 8) >> 2] = e;
    k[(w + 28) >> 2] = 0;
    e = Oq(((f << 2) + 4) | 0) | 0;
    k[(w + 12) >> 2] = e;
    if (!e) {
      x = Kb(4) | 0;
      cF(x);
      Cc(x | 0, 2032, 79);
    }
    k[d >> 2] = f;
    r = (w + 16) | 0;
    q = k[v >> 2] | 0;
    s = (w + 12) | 0;
    iF(e | 0, 0, ((f << 2) + 4) | 0) | 0;
    k[t >> 2] = 0;
    h = (t + 4) | 0;
    k[h >> 2] = 0;
    Ef(t, q);
    e = k[v >> 2] | 0;
    a: do
      if ((e | 0) > 0) {
        j = k[b >> 2] | 0;
        l = k[(c + 12) >> 2] | 0;
        g = k[(c + 16) >> 2] | 0;
        m = k[t >> 2] | 0;
        b: do
          if (!g) {
            f = 0;
            while (1) {
              d = k[(j + (f << 2)) >> 2] | 0;
              if (!(((d | 0) > -1) & ((e | 0) > (d | 0)))) {
                d = 12;
                break;
              }
              d = (l + (d << 2)) | 0;
              if (!d) break b;
              if ((k[h >> 2] | 0) <= (f | 0)) {
                d = 19;
                break;
              }
              k[(m + (f << 2)) >> 2] = (k[(d + 4) >> 2] | 0) - (k[d >> 2] | 0);
              f = (f + 1) | 0;
              e = k[v >> 2] | 0;
              if ((f | 0) >= (e | 0)) break a;
            }
            if ((d | 0) == 12) Oa(13577, 13744, 122, 13812);
            else if ((d | 0) == 19) Oa(16605, 15693, 408, 29907);
          } else {
            f = 0;
            while (1) {
              d = k[(j + (f << 2)) >> 2] | 0;
              if (!(((d | 0) > -1) & ((e | 0) > (d | 0)))) {
                d = 12;
                break;
              }
              e = (l + (d << 2)) | 0;
              if (!e) break b;
              d = (g + (d << 2)) | 0;
              if (!d) d = ((k[(e + 4) >> 2] | 0) - (k[e >> 2] | 0)) | 0;
              else d = k[d >> 2] | 0;
              if ((k[h >> 2] | 0) <= (f | 0)) {
                d = 19;
                break;
              }
              k[(m + (f << 2)) >> 2] = d;
              f = (f + 1) | 0;
              e = k[v >> 2] | 0;
              if ((f | 0) >= (e | 0)) break a;
            }
            if ((d | 0) == 12) Oa(13577, 13744, 122, 13812);
            else if ((d | 0) == 19) Oa(16605, 15693, 408, 29907);
          }
        while (0);
        while (1) {}
      }
    while (0);
    Gj(w, t);
    d = k[v >> 2] | 0;
    if ((d | 0) > 0) {
      n = (c + 20) | 0;
      o = (c + 24) | 0;
      q = (c + 12) | 0;
      c = (c + 16) | 0;
      m = 0;
      do {
        e = k[((k[b >> 2] | 0) + (m << 2)) >> 2] | 0;
        j = k[n >> 2] | 0;
        l = k[o >> 2] | 0;
        f = k[q >> 2] | 0;
        h = k[(f + (e << 2)) >> 2] | 0;
        g = k[c >> 2] | 0;
        if (!g) e = k[(f + ((e + 1) << 2)) >> 2] | 0;
        else e = ((k[(g + (e << 2)) >> 2] | 0) + h) | 0;
        if ((h | 0) < (e | 0)) {
          d = h;
          do {
            y = +p[(j + (d << 3)) >> 3];
            h = Hj(w, k[(l + (d << 2)) >> 2] | 0, m) | 0;
            p[h >> 3] = y;
            d = (d + 1) | 0;
          } while ((d | 0) < (e | 0));
          d = k[v >> 2] | 0;
        }
        m = (m + 1) | 0;
      } while ((m | 0) < (d | 0));
    }
    Ag(a, w) | 0;
    d = k[t >> 2] | 0;
    if (d | 0) Pq(k[(d + -4) >> 2] | 0);
    Pq(k[s >> 2] | 0);
    Pq(k[r >> 2] | 0);
    d = k[(w + 20) >> 2] | 0;
    if (d | 0) FA(d);
    d = k[(w + 24) >> 2] | 0;
    if (!d) {
      u = x;
      return;
    }
    FA(d);
    u = x;
    return;
  }
  function Gj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    l = k[(a + 16) >> 2] | 0;
    v = (a + 4) | 0;
    n = k[v >> 2] | 0;
    c = n << 2;
    if (l | 0) {
      s = Oq((c + 4) | 0) | 0;
      t = s;
      if (!s) {
        v = Kb(4) | 0;
        cF(v);
        Cc(v | 0, 2032, 79);
      }
      a: do
        if ((n | 0) > 0) {
          i = k[(a + 12) >> 2] | 0;
          j = k[b >> 2] | 0;
          h = k[(b + 4) >> 2] | 0;
          g = 0;
          c = 0;
          while (1) {
            k[(s + (g << 2)) >> 2] = c;
            d = g;
            g = (g + 1) | 0;
            e = k[(l + (d << 2)) >> 2] | 0;
            f = ((k[(i + (g << 2)) >> 2] | 0) - (k[(i + (d << 2)) >> 2] | 0) - e) | 0;
            if ((h | 0) <= (d | 0)) break;
            b = k[(j + (d << 2)) >> 2] | 0;
            c = (e + c + ((b | 0) < (f | 0) ? f : b)) | 0;
            if ((g | 0) >= (n | 0)) {
              m = c;
              break a;
            }
          }
          Oa(16605, 15693, 162, 29907);
        } else m = 0;
      while (0);
      k[(s + (n << 2)) >> 2] = m;
      r = (a + 20) | 0;
      Eg(r, m, 0.0);
      d = k[v >> 2] | 0;
      q = (a + 12) | 0;
      if ((d | 0) > 0) {
        c = k[q >> 2] | 0;
        o = (a + 16) | 0;
        n = (a + 24) | 0;
        do {
          g = d;
          d = (d + -1) | 0;
          i = (s + (d << 2)) | 0;
          f = k[i >> 2] | 0;
          j = (c + (d << 2)) | 0;
          e = k[j >> 2] | 0;
          if ((f | 0) > (e | 0) ? ((u = k[((k[o >> 2] | 0) + (d << 2)) >> 2] | 0), (u | 0) > 0) : 0) {
            l = k[n >> 2] | 0;
            m = k[r >> 2] | 0;
            h = u;
            do {
              v = h;
              h = (h + -1) | 0;
              k[(l + ((f + h) << 2)) >> 2] = k[(l + ((e + h) << 2)) >> 2];
              e = k[j >> 2] | 0;
              f = k[i >> 2] | 0;
              p[(m + ((f + h) << 3)) >> 3] = +p[(m + ((e + h) << 3)) >> 3];
            } while ((v | 0) > 1);
          }
        } while ((g | 0) > 1);
      } else c = k[q >> 2] | 0;
      k[q >> 2] = t;
      Pq(c);
      return;
    }
    t = Oq(c) | 0;
    m = (a + 16) | 0;
    k[m >> 2] = t;
    if (!t) {
      v = Kb(4) | 0;
      cF(v);
      Cc(v | 0, 2032, 79);
    }
    b: do
      if ((n | 0) > 0) {
        f = (b + 4) | 0;
        g = k[b >> 2] | 0;
        h = (a + 12) | 0;
        d = 0;
        c = 0;
        e = 0;
        while (1) {
          k[(t + (d << 2)) >> 2] = e;
          if ((k[f >> 2] | 0) <= (d | 0)) break;
          u = k[(g + (d << 2)) >> 2] | 0;
          r = k[h >> 2] | 0;
          s = d;
          d = (d + 1) | 0;
          e = (u + e + (k[(r + (d << 2)) >> 2] | 0) - (k[(r + (s << 2)) >> 2] | 0)) | 0;
          c = (u + c) | 0;
          if ((d | 0) >= (k[v >> 2] | 0)) {
            i = c;
            break b;
          }
        }
        Oa(16605, 15693, 162, 29907);
      } else i = 0;
    while (0);
    s = (a + 20) | 0;
    c = k[(a + 28) >> 2] | 0;
    h = (c + i) | 0;
    i = (a + 32) | 0;
    if ((h | 0) > (k[i >> 2] | 0)) {
      j = DA(h >>> 0 > 536870911 ? -1 : h << 3) | 0;
      l = DA(h >>> 0 > 1073741823 ? -1 : h << 2) | 0;
      c = (c | 0) < (h | 0) ? c : h;
      if ((c | 0) > 0) {
        g = k[s >> 2] | 0;
        nF(j | 0, g | 0, (c << 3) | 0) | 0;
        d = (a + 24) | 0;
        e = k[d >> 2] | 0;
        nF(l | 0, e | 0, (c << 2) | 0) | 0;
        c = d;
        d = e;
        f = g;
      } else {
        g = k[s >> 2] | 0;
        c = (a + 24) | 0;
        e = k[c >> 2] | 0;
        d = e;
        f = g;
      }
      k[s >> 2] = j;
      k[c >> 2] = l;
      k[i >> 2] = h;
      if (d | 0) FA(e);
      if (f | 0) FA(g);
    }
    e = k[v >> 2] | 0;
    r = k[(a + 12) >> 2] | 0;
    if ((e | 0) > 0) {
      c = k[m >> 2] | 0;
      q = (a + 24) | 0;
      d = k[(r + (e << 2)) >> 2] | 0;
      do {
        n = e;
        e = (e + -1) | 0;
        o = (r + (e << 2)) | 0;
        g = k[o >> 2] | 0;
        m = (d - g) | 0;
        if ((m | 0) > 0) {
          i = k[q >> 2] | 0;
          j = (t + (e << 2)) | 0;
          l = k[s >> 2] | 0;
          h = m;
          f = k[j >> 2] | 0;
          d = g;
          do {
            a = h;
            h = (h + -1) | 0;
            k[(i + ((f + h) << 2)) >> 2] = k[(i + ((d + h) << 2)) >> 2];
            d = k[o >> 2] | 0;
            f = k[j >> 2] | 0;
            p[(l + ((f + h) << 3)) >> 3] = +p[(l + ((d + h) << 3)) >> 3];
          } while ((a | 0) > 1);
        } else {
          d = g;
          f = k[(t + (e << 2)) >> 2] | 0;
        }
        k[o >> 2] = f;
        k[(c + (e << 2)) >> 2] = m;
      } while ((n | 0) > 1);
      e = k[v >> 2] | 0;
    } else c = k[m >> 2] | 0;
    d = (e + -1) | 0;
    c = ((k[(c + (d << 2)) >> 2] | 0) + (k[(r + (d << 2)) >> 2] | 0)) | 0;
    if ((e | 0) <= 0) Oa(16605, 15693, 162, 29907);
    if ((k[(b + 4) >> 2] | 0) < (e | 0)) Oa(16605, 15693, 162, 29907);
    k[(r + (e << 2)) >> 2] = c + (k[((k[b >> 2] | 0) + (d << 2)) >> 2] | 0);
    Eg(s, k[(r + (k[v >> 2] << 2)) >> 2] | 0, 0.0);
    return;
  }
  function Hj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0;
    v = u;
    u = (u + 16) | 0;
    r = v;
    if ((b | 0) <= -1) Oa(20638, 15958, 1131, 20683);
    h = k[(a + 8) >> 2] | 0;
    if (!(((c | 0) > -1) & ((h | 0) > (b | 0)))) Oa(20638, 15958, 1131, 20683);
    t = (a + 4) | 0;
    e = k[t >> 2] | 0;
    if ((e | 0) <= (c | 0)) Oa(20638, 15958, 1131, 20683);
    f = k[(a + 16) >> 2] | 0;
    a: do
      if (!f) {
        g = k[(a + 12) >> 2] | 0;
        if ((k[(g + (e << 2)) >> 2] | 0) != (k[g >> 2] | 0)) {
          f = Oq(e << 2) | 0;
          k[(a + 16) >> 2] = f;
          if (!f) {
            v = Kb(4) | 0;
            cF(v);
            Cc(v | 0, 2032, 79);
          }
          if ((e | 0) > 0) e = 0;
          else break;
          while (1) {
            q = e;
            e = (e + 1) | 0;
            k[(f + (q << 2)) >> 2] = (k[(g + (e << 2)) >> 2] | 0) - (k[(g + (q << 2)) >> 2] | 0);
            if ((e | 0) >= (k[t >> 2] | 0)) break a;
          }
        }
        m = (a + 20) | 0;
        n = (a + 32) | 0;
        if ((k[n >> 2] | 0) == 0 ? ((i = k[(a + 28) >> 2] | 0), (o = (i + (h << 1)) | 0), (o | 0) > 0) : 0) {
          j = DA(o >>> 0 > 536870911 ? -1 : o << 3) | 0;
          l = DA(o >>> 0 > 1073741823 ? -1 : o << 2) | 0;
          e = (i | 0) < (o | 0) ? i : o;
          if ((e | 0) > 0) {
            i = k[m >> 2] | 0;
            nF(j | 0, i | 0, (e << 3) | 0) | 0;
            f = (a + 24) | 0;
            g = k[f >> 2] | 0;
            nF(l | 0, g | 0, (e << 2) | 0) | 0;
            e = f;
            f = g;
            h = i;
          } else {
            i = k[m >> 2] | 0;
            e = (a + 24) | 0;
            g = k[e >> 2] | 0;
            f = g;
            h = i;
          }
          k[m >> 2] = j;
          k[e >> 2] = l;
          k[n >> 2] = o;
          if (f | 0) FA(g);
          if (h | 0) FA(i);
        }
        f = k[t >> 2] | 0;
        e = f << 2;
        h = Oq(e) | 0;
        k[(a + 16) >> 2] = h;
        if (!h) {
          v = Kb(4) | 0;
          cF(v);
          Cc(v | 0, 2032, 79);
        }
        iF(h | 0, 0, e | 0) | 0;
        g = k[n >> 2] | 0;
        if ((f | 0) < 1) f = h;
        else {
          f = k[(a + 12) >> 2] | 0;
          e = 1;
          while (1) {
            k[(f + (e << 2)) >> 2] = g;
            if ((e | 0) < (k[t >> 2] | 0)) e = (e + 1) | 0;
            else {
              f = h;
              break;
            }
          }
        }
      }
    while (0);
    q = (a + 20) | 0;
    l = (a + 32) | 0;
    o = k[l >> 2] | 0;
    n = (a + 12) | 0;
    h = k[n >> 2] | 0;
    i = k[(h + (c << 2)) >> 2] | 0;
    if ((i | 0) == (o | 0)) {
      g = (a + 28) | 0;
      i = k[g >> 2] | 0;
      e = c;
      while (1) {
        if (k[(f + (e << 2)) >> 2] | 0) break;
        k[(h + (e << 2)) >> 2] = i;
        if ((e | 0) > 0) e = (e + -1) | 0;
        else break;
      }
      h = (f + (c << 2)) | 0;
      k[h >> 2] = (k[h >> 2] | 0) + 1;
      g = k[g >> 2] | 0;
      Eg(q, (g + 1) | 0, 1.0);
      h = k[q >> 2] | 0;
      p[(h + (g << 3)) >> 3] = 0.0;
      k[((k[(a + 24) >> 2] | 0) + (g << 2)) >> 2] = b;
      g = k[l >> 2] | 0;
      if ((o | 0) != (g | 0) ? ((d = k[t >> 2] | 0), (d | 0) > (c | 0)) : 0) {
        f = k[n >> 2] | 0;
        do {
          c = (c + 1) | 0;
          e = (f + (c << 2)) | 0;
          if ((k[e >> 2] | 0) == (o | 0)) {
            k[e >> 2] = g;
            d = k[t >> 2] | 0;
          }
        } while ((c | 0) < (d | 0));
      }
      b = (h + (i << 3)) | 0;
      u = v;
      return b | 0;
    }
    j = (c + 1) | 0;
    if ((k[(h + (j << 2)) >> 2] | 0) == (o | 0)) {
      m = (a + 16) | 0;
      e = (f + (c << 2)) | 0;
      f = k[e >> 2] | 0;
      g = (a + 28) | 0;
      d = k[g >> 2] | 0;
      if (((f + i) | 0) == (d | 0)) {
        k[e >> 2] = f + 1;
        Eg(q, ((k[g >> 2] | 0) + 1) | 0, 0.0);
        g = k[l >> 2] | 0;
        if ((o | 0) != (g | 0) ? ((s = k[t >> 2] | 0), (s | 0) > (c | 0)) : 0) {
          h = k[n >> 2] | 0;
          f = j;
          d = s;
          while (1) {
            e = (h + (f << 2)) | 0;
            if ((k[e >> 2] | 0) == (o | 0)) {
              k[e >> 2] = g;
              d = k[t >> 2] | 0;
            }
            if ((f | 0) < (d | 0)) f = (f + 1) | 0;
            else break;
          }
        }
        g = k[((k[n >> 2] | 0) + (c << 2)) >> 2] | 0;
        e = ((k[((k[m >> 2] | 0) + (c << 2)) >> 2] | 0) + g) | 0;
        d = (e + -1) | 0;
        f = k[(a + 24) >> 2] | 0;
        b: do
          if ((d | 0) > (g | 0)) {
            c = d;
            while (1) {
              d = (e + -2) | 0;
              e = k[(f + (d << 2)) >> 2] | 0;
              if ((e | 0) <= (b | 0)) {
                d = c;
                break b;
              }
              k[(f + (c << 2)) >> 2] = e;
              t = k[q >> 2] | 0;
              p[(t + (c << 3)) >> 3] = +p[(t + (d << 3)) >> 3];
              d = (c + -1) | 0;
              if ((d | 0) > (g | 0)) {
                e = c;
                c = d;
              } else break;
            }
          }
        while (0);
        k[(f + (d << 2)) >> 2] = b;
        b = ((k[q >> 2] | 0) + (d << 3)) | 0;
        p[b >> 3] = 0.0;
        u = v;
        return b | 0;
      }
    } else d = k[(a + 28) >> 2] | 0;
    do
      if ((d | 0) != (o | 0)) {
        Eg(q, o, 0.0);
        t = k[t >> 2] | 0;
        k[r >> 2] = t;
        k[(r + 8) >> 2] = 2;
        if ((t | 0) > -1) {
          Ij(a, r);
          break;
        } else Oa(11919, 12068, 74, 12145);
      }
    while (0);
    b = Jj(a, b, c) | 0;
    u = v;
    return b | 0;
  }
  function Ij(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    j = k[(a + 16) >> 2] | 0;
    v = (a + 4) | 0;
    m = k[v >> 2] | 0;
    c = m << 2;
    if (j | 0) {
      s = Oq((c + 4) | 0) | 0;
      t = s;
      if (!s) {
        v = Kb(4) | 0;
        cF(v);
        Cc(v | 0, 2032, 79);
      }
      a: do
        if ((m | 0) > 0) {
          h = k[(a + 12) >> 2] | 0;
          i = (b + 8) | 0;
          g = k[b >> 2] | 0;
          f = 0;
          c = 0;
          while (1) {
            k[(s + (f << 2)) >> 2] = c;
            b = f;
            f = (f + 1) | 0;
            d = k[(j + (b << 2)) >> 2] | 0;
            e = ((k[(h + (f << 2)) >> 2] | 0) - (k[(h + (b << 2)) >> 2] | 0) - d) | 0;
            if ((g | 0) <= (b | 0)) break;
            b = k[i >> 2] | 0;
            c = (d + c + ((b | 0) < (e | 0) ? e : b)) | 0;
            if ((f | 0) >= (m | 0)) {
              l = c;
              break a;
            }
          }
          Oa(16605, 15693, 162, 29907);
        } else l = 0;
      while (0);
      k[(s + (m << 2)) >> 2] = l;
      r = (a + 20) | 0;
      Eg(r, l, 0.0);
      d = k[v >> 2] | 0;
      q = (a + 12) | 0;
      if ((d | 0) > 0) {
        c = k[q >> 2] | 0;
        o = (a + 16) | 0;
        n = (a + 24) | 0;
        do {
          g = d;
          d = (d + -1) | 0;
          i = (s + (d << 2)) | 0;
          f = k[i >> 2] | 0;
          j = (c + (d << 2)) | 0;
          e = k[j >> 2] | 0;
          if ((f | 0) > (e | 0) ? ((u = k[((k[o >> 2] | 0) + (d << 2)) >> 2] | 0), (u | 0) > 0) : 0) {
            l = k[n >> 2] | 0;
            m = k[r >> 2] | 0;
            h = u;
            do {
              v = h;
              h = (h + -1) | 0;
              k[(l + ((f + h) << 2)) >> 2] = k[(l + ((e + h) << 2)) >> 2];
              e = k[j >> 2] | 0;
              f = k[i >> 2] | 0;
              p[(m + ((f + h) << 3)) >> 3] = +p[(m + ((e + h) << 3)) >> 3];
            } while ((v | 0) > 1);
          }
        } while ((g | 0) > 1);
      } else c = k[q >> 2] | 0;
      k[q >> 2] = t;
      Pq(c);
      return;
    }
    s = Oq(c) | 0;
    n = (a + 16) | 0;
    k[n >> 2] = s;
    if (!s) {
      v = Kb(4) | 0;
      cF(v);
      Cc(v | 0, 2032, 79);
    }
    b: do
      if ((m | 0) > 0) {
        f = (b + 8) | 0;
        g = (a + 12) | 0;
        d = 0;
        c = 0;
        e = 0;
        while (1) {
          k[(s + (d << 2)) >> 2] = e;
          if ((k[b >> 2] | 0) <= (d | 0)) break;
          u = k[f >> 2] | 0;
          r = k[g >> 2] | 0;
          t = d;
          d = (d + 1) | 0;
          e = (u + e + (k[(r + (d << 2)) >> 2] | 0) - (k[(r + (t << 2)) >> 2] | 0)) | 0;
          c = (u + c) | 0;
          if ((d | 0) >= (k[v >> 2] | 0)) {
            h = c;
            break b;
          }
        }
        Oa(16605, 15693, 162, 29907);
      } else h = 0;
    while (0);
    r = (a + 20) | 0;
    c = k[(a + 28) >> 2] | 0;
    h = (c + h) | 0;
    i = (a + 32) | 0;
    if ((h | 0) > (k[i >> 2] | 0)) {
      j = DA(h >>> 0 > 536870911 ? -1 : h << 3) | 0;
      l = DA(h >>> 0 > 1073741823 ? -1 : h << 2) | 0;
      c = (c | 0) < (h | 0) ? c : h;
      if ((c | 0) > 0) {
        g = k[r >> 2] | 0;
        nF(j | 0, g | 0, (c << 3) | 0) | 0;
        d = (a + 24) | 0;
        e = k[d >> 2] | 0;
        nF(l | 0, e | 0, (c << 2) | 0) | 0;
        c = d;
        d = e;
        f = g;
      } else {
        g = k[r >> 2] | 0;
        c = (a + 24) | 0;
        e = k[c >> 2] | 0;
        d = e;
        f = g;
      }
      k[r >> 2] = j;
      k[c >> 2] = l;
      k[i >> 2] = h;
      if (d | 0) FA(e);
      if (f | 0) FA(g);
    }
    d = k[v >> 2] | 0;
    q = k[(a + 12) >> 2] | 0;
    if ((d | 0) > 0) {
      c = k[n >> 2] | 0;
      o = (a + 24) | 0;
      e = k[(q + (d << 2)) >> 2] | 0;
      do {
        m = d;
        d = (d + -1) | 0;
        n = (q + (d << 2)) | 0;
        f = k[n >> 2] | 0;
        l = (e - f) | 0;
        if ((l | 0) > 0) {
          h = k[o >> 2] | 0;
          i = (s + (d << 2)) | 0;
          j = k[r >> 2] | 0;
          g = l;
          e = f;
          f = k[i >> 2] | 0;
          do {
            a = g;
            g = (g + -1) | 0;
            k[(h + ((f + g) << 2)) >> 2] = k[(h + ((e + g) << 2)) >> 2];
            e = k[n >> 2] | 0;
            f = k[i >> 2] | 0;
            p[(j + ((f + g) << 3)) >> 3] = +p[(j + ((e + g) << 3)) >> 3];
          } while ((a | 0) > 1);
        } else {
          e = f;
          f = k[(s + (d << 2)) >> 2] | 0;
        }
        k[n >> 2] = f;
        k[(c + (d << 2)) >> 2] = l;
      } while ((m | 0) > 1);
      d = k[v >> 2] | 0;
    } else c = k[n >> 2] | 0;
    a = (d + -1) | 0;
    c = ((k[(c + (a << 2)) >> 2] | 0) + (k[(q + (a << 2)) >> 2] | 0)) | 0;
    if ((d | 0) <= 0) Oa(16605, 15693, 162, 29907);
    if ((k[b >> 2] | 0) < (d | 0)) Oa(16605, 15693, 162, 29907);
    k[(q + (d << 2)) >> 2] = c + (k[(b + 8) >> 2] | 0);
    Eg(r, k[(q + (k[v >> 2] << 2)) >> 2] | 0, 0.0);
    return;
  }
  function Jj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0;
    l = u;
    u = (u + 16) | 0;
    d = l;
    e = k[(a + 16) >> 2] | 0;
    if (!e) Oa(16634, 15958, 1251, 20690);
    h = (a + 12) | 0;
    i = k[h >> 2] | 0;
    g = k[(i + (c << 2)) >> 2] | 0;
    f = k[(e + (c << 2)) >> 2] | 0;
    if ((f | 0) >= (((k[(i + ((c + 1) << 2)) >> 2] | 0) - g) | 0)) {
      k[d >> 2] = c;
      k[(d + 4) >> 2] = (f | 0) > 2 ? f : 2;
      Kj(a, d);
      f = k[(a + 16) >> 2] | 0;
      e = f;
      f = k[(f + (c << 2)) >> 2] | 0;
      g = k[((k[h >> 2] | 0) + (c << 2)) >> 2] | 0;
    }
    c = (e + (c << 2)) | 0;
    d = (f + g) | 0;
    i = k[(a + 24) >> 2] | 0;
    h = (a + 20) | 0;
    a: do
      if ((f | 0) > 0) {
        while (1) {
          e = (d + -1) | 0;
          f = k[(i + (e << 2)) >> 2] | 0;
          if ((f | 0) <= (b | 0)) break;
          k[(i + (d << 2)) >> 2] = f;
          a = k[h >> 2] | 0;
          p[(a + (d << 3)) >> 3] = +p[(a + (e << 3)) >> 3];
          if ((e | 0) > (g | 0)) d = e;
          else {
            j = e;
            break a;
          }
        }
        if ((f | 0) == (b | 0)) Oa(20709, 15958, 1272, 20690);
        else j = d;
      } else j = d;
    while (0);
    k[c >> 2] = (k[c >> 2] | 0) + 1;
    k[(i + (j << 2)) >> 2] = b;
    b = ((k[h >> 2] | 0) + (j << 3)) | 0;
    p[b >> 3] = 0.0;
    u = l;
    return b | 0;
  }
  function Kj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0;
    h = k[(a + 16) >> 2] | 0;
    u = (a + 4) | 0;
    i = k[u >> 2] | 0;
    c = i << 2;
    if (h | 0) {
      r = Oq((c + 4) | 0) | 0;
      s = r;
      if (!r) {
        u = Kb(4) | 0;
        cF(u);
        Cc(u | 0, 2032, 79);
      }
      if ((i | 0) > 0) {
        f = k[(a + 12) >> 2] | 0;
        g = k[b >> 2] | 0;
        e = k[(b + 4) >> 2] | 0;
        d = 0;
        c = 0;
        do {
          k[(r + (d << 2)) >> 2] = c;
          b = d;
          d = (d + 1) | 0;
          o = k[(h + (b << 2)) >> 2] | 0;
          q = ((k[(f + (d << 2)) >> 2] | 0) - (k[(f + (b << 2)) >> 2] | 0) - o) | 0;
          b = (g | 0) == (b | 0) ? e : 0;
          c = (o + c + ((b | 0) < (q | 0) ? q : b)) | 0;
        } while ((d | 0) < (i | 0));
      } else c = 0;
      k[(r + (i << 2)) >> 2] = c;
      q = (a + 20) | 0;
      Eg(q, c, 0.0);
      d = k[u >> 2] | 0;
      o = (a + 12) | 0;
      if ((d | 0) > 0) {
        c = k[o >> 2] | 0;
        n = (a + 16) | 0;
        a = (a + 24) | 0;
        do {
          g = d;
          d = (d + -1) | 0;
          i = (r + (d << 2)) | 0;
          f = k[i >> 2] | 0;
          j = (c + (d << 2)) | 0;
          e = k[j >> 2] | 0;
          if ((f | 0) > (e | 0) ? ((t = k[((k[n >> 2] | 0) + (d << 2)) >> 2] | 0), (t | 0) > 0) : 0) {
            l = k[a >> 2] | 0;
            m = k[q >> 2] | 0;
            h = t;
            do {
              u = h;
              h = (h + -1) | 0;
              k[(l + ((f + h) << 2)) >> 2] = k[(l + ((e + h) << 2)) >> 2];
              e = k[j >> 2] | 0;
              f = k[i >> 2] | 0;
              p[(m + ((f + h) << 3)) >> 3] = +p[(m + ((e + h) << 3)) >> 3];
            } while ((u | 0) > 1);
          }
        } while ((g | 0) > 1);
      } else c = k[o >> 2] | 0;
      k[o >> 2] = s;
      Pq(c);
      return;
    }
    r = Oq(c) | 0;
    m = (a + 16) | 0;
    k[m >> 2] = r;
    if (!r) {
      u = Kb(4) | 0;
      cF(u);
      Cc(u | 0, 2032, 79);
    }
    if ((i | 0) > 0) {
      g = (b + 4) | 0;
      f = k[(a + 12) >> 2] | 0;
      d = 0;
      c = 0;
      e = 0;
      do {
        k[(r + (d << 2)) >> 2] = e;
        t = (k[b >> 2] | 0) == (d | 0) ? k[g >> 2] | 0 : 0;
        s = d;
        d = (d + 1) | 0;
        e = (t + e + (k[(f + (d << 2)) >> 2] | 0) - (k[(f + (s << 2)) >> 2] | 0)) | 0;
        c = (t + c) | 0;
      } while ((d | 0) < (k[u >> 2] | 0));
    } else c = 0;
    q = (a + 20) | 0;
    d = k[(a + 28) >> 2] | 0;
    h = (d + c) | 0;
    i = (a + 32) | 0;
    if ((h | 0) > (k[i >> 2] | 0)) {
      j = DA(h >>> 0 > 536870911 ? -1 : h << 3) | 0;
      l = DA(h >>> 0 > 1073741823 ? -1 : h << 2) | 0;
      c = (d | 0) < (h | 0) ? d : h;
      if ((c | 0) > 0) {
        g = k[q >> 2] | 0;
        nF(j | 0, g | 0, (c << 3) | 0) | 0;
        d = (a + 24) | 0;
        e = k[d >> 2] | 0;
        nF(l | 0, e | 0, (c << 2) | 0) | 0;
        c = d;
        d = e;
        f = g;
      } else {
        g = k[q >> 2] | 0;
        c = (a + 24) | 0;
        e = k[c >> 2] | 0;
        d = e;
        f = g;
      }
      k[q >> 2] = j;
      k[c >> 2] = l;
      k[i >> 2] = h;
      if (d | 0) FA(e);
      if (f | 0) FA(g);
    }
    d = k[u >> 2] | 0;
    o = k[(a + 12) >> 2] | 0;
    if ((d | 0) > 0) {
      c = k[m >> 2] | 0;
      n = (a + 24) | 0;
      e = k[(o + (d << 2)) >> 2] | 0;
      do {
        m = d;
        d = (d + -1) | 0;
        a = (o + (d << 2)) | 0;
        f = k[a >> 2] | 0;
        l = (e - f) | 0;
        if ((l | 0) > 0) {
          h = k[n >> 2] | 0;
          i = (r + (d << 2)) | 0;
          j = k[q >> 2] | 0;
          g = l;
          e = f;
          f = k[i >> 2] | 0;
          do {
            t = g;
            g = (g + -1) | 0;
            k[(h + ((f + g) << 2)) >> 2] = k[(h + ((e + g) << 2)) >> 2];
            e = k[a >> 2] | 0;
            f = k[i >> 2] | 0;
            p[(j + ((f + g) << 3)) >> 3] = +p[(j + ((e + g) << 3)) >> 3];
          } while ((t | 0) > 1);
        } else {
          e = f;
          f = k[(r + (d << 2)) >> 2] | 0;
        }
        k[a >> 2] = f;
        k[(c + (d << 2)) >> 2] = l;
      } while ((m | 0) > 1);
      d = k[u >> 2] | 0;
    } else c = k[m >> 2] | 0;
    t = (d + -1) | 0;
    k[(o + (d << 2)) >> 2] =
      (k[(c + (t << 2)) >> 2] | 0) + (k[(o + (t << 2)) >> 2] | 0) + ((k[b >> 2] | 0) == (t | 0) ? k[(b + 4) >> 2] | 0 : 0);
    Eg(q, k[(o + (k[u >> 2] << 2)) >> 2] | 0, 0.0);
    return;
  }
  function Lj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    k[a >> 2] = 0;
    g = (a + 4) | 0;
    k[g >> 2] = 0;
    h = (a + 8) | 0;
    k[h >> 2] = 0;
    d = k[((k[b >> 2] | 0) + 24) >> 2] | 0;
    i = (b + 4) | 0;
    c = k[((k[i >> 2] | 0) + 8) >> 2] | 0;
    if (!(((d | 0) == 0) | ((c | 0) == 0)) ? ((2147483647 / (c | 0)) | 0 | 0) < (d | 0) : 0) {
      i = Kb(4) | 0;
      cF(i);
      Cc(i | 0, 2032, 79);
    }
    mf(a, d, c);
    c = k[b >> 2] | 0;
    d = k[(c + 24) >> 2] | 0;
    e = k[i >> 2] | 0;
    f = k[(e + 8) >> 2] | 0;
    if ((k[g >> 2] | 0) == (d | 0) ? (k[h >> 2] | 0) == (f | 0) : 0) {
      h = c;
      i = e;
      Mj(h, i, a) | 0;
      return;
    }
    mf(a, d, f);
    h = k[b >> 2] | 0;
    i = k[i >> 2] | 0;
    Mj(h, i, a) | 0;
    return;
  }
  function Mj(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0;
    z = u;
    u = (u + 160) | 0;
    w = (z + 120) | 0;
    y = (z + 108) | 0;
    x = (z + 96) | 0;
    o = (z + 88) | 0;
    l = (z + 56) | 0;
    g = (z + 152) | 0;
    m = z;
    q = (z + 28) | 0;
    if (!(i[a >> 0] | 0)) Oa(20840, 20281, 194, 18314);
    d = k[(a + 28) >> 2] | 0;
    if ((d | 0) != (k[(b + 4) >> 2] | 0)) Oa(20917, 20281, 195, 18314);
    r = k[(a + 172) >> 2] | 0;
    k[y >> 2] = 0;
    v = (y + 4) | 0;
    k[v >> 2] = 0;
    s = (y + 8) | 0;
    k[s >> 2] = 0;
    k[x >> 2] = 0;
    j = (x + 4) | 0;
    k[j >> 2] = 0;
    h = (x + 8) | 0;
    k[h >> 2] = 0;
    k[w >> 2] = a;
    k[(w + 4) >> 2] = b;
    i[(w + 8) >> 0] = 1;
    mf(y, d, k[(b + 8) >> 2] | 0);
    Nj(w, y);
    e = k[y >> 2] | 0;
    b = k[v >> 2] | 0;
    d = k[s >> 2] | 0;
    if (
      !((k[j >> 2] | 0) == (b | 0) ? (k[h >> 2] | 0) == (d | 0) : 0)
        ? (mf(x, b, d), !((k[j >> 2] | 0) == (b | 0) ? (k[h >> 2] | 0) == (d | 0) : 0))
        : 0
    )
      Oa(12160, 12207, 721, 12285);
    f = k[x >> 2] | 0;
    d = aa(d, b) | 0;
    if ((d | 0) > 0) {
      b = 0;
      do {
        p[(f + (b << 3)) >> 3] = +p[(e + (b << 3)) >> 3];
        b = (b + 1) | 0;
      } while ((b | 0) != (d | 0));
    }
    n = (a + 24) | 0;
    b = k[n >> 2] | 0;
    f = k[v >> 2] | 0;
    mf(y, (b | 0) < (f | 0) ? f : b, k[s >> 2] | 0);
    b = (a + 56) | 0;
    if ((r | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if ((k[(b + 8) >> 2] | 0) < (r | 0)) Oa(14177, 13744, 147, 13812);
    if ((k[(b + 4) >> 2] | 0) < (r | 0)) Oa(14177, 13744, 147, 13812);
    i[l >> 0] = 0;
    i[(l + 4) >> 0] = 0;
    f = (l + 5) | 0;
    i[f >> 0] = i[g >> 0] | 0;
    i[(f + 1) >> 0] = i[(g + 1) >> 0] | 0;
    i[(f + 2) >> 0] = i[(g + 2) >> 0] | 0;
    k[(l + 8) >> 2] = b;
    k[(l + 12) >> 2] = 0;
    k[(l + 16) >> 2] = 0;
    k[(l + 20) >> 2] = r;
    k[(l + 24) >> 2] = r;
    b = k[h >> 2] | 0;
    h = k[x >> 2] | 0;
    k[m >> 2] = h;
    k[(m + 4) >> 2] = r;
    k[(m + 8) >> 2] = b;
    if (!(((b | r | 0) > -1) | ((h | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[(m + 12) >> 2] = x;
    k[(m + 16) >> 2] = 0;
    k[(m + 20) >> 2] = 0;
    j = k[j >> 2] | 0;
    k[(m + 24) >> 2] = j;
    if (!(((b | 0) > -1) & ((j | 0) >= (r | 0)))) Oa(14177, 13744, 147, 13812);
    k[o >> 2] = l;
    k[(o + 4) >> 2] = m;
    b = k[s >> 2] | 0;
    m = k[y >> 2] | 0;
    k[q >> 2] = m;
    k[(q + 4) >> 2] = r;
    k[(q + 8) >> 2] = b;
    if (!(((b | r | 0) > -1) | ((m | 0) == 0))) Oa(13818, 13988, 175, 14058);
    k[(q + 12) >> 2] = y;
    k[(q + 16) >> 2] = 0;
    k[(q + 20) >> 2] = 0;
    m = k[v >> 2] | 0;
    k[(q + 24) >> 2] = m;
    if (!(((b | 0) > -1) & ((m | 0) >= (r | 0)))) Oa(14177, 13744, 147, 13812);
    Oj(q, o, w);
    e = k[v >> 2] | 0;
    b = (e - r) | 0;
    f = k[s >> 2] | 0;
    g = ((k[y >> 2] | 0) + (r << 3)) | 0;
    d = (f | b | 0) > -1;
    if (!(d | ((g | 0) == 0))) Oa(13818, 13988, 175, 14058);
    if ((b | r | f | 0) <= -1) Oa(14177, 13744, 147, 13812);
    if (!d) Oa(11919, 12068, 74, 12145);
    if (((b | 0) > 0) & ((f | 0) > 0)) {
      d = b << 3;
      b = 0;
      do {
        iF((g + ((aa(b, e) | 0) << 3)) | 0, 0, d | 0) | 0;
        b = (b + 1) | 0;
      } while ((b | 0) != (f | 0));
    }
    do
      if (!(k[(a + 140) >> 2] | 0)) {
        m = k[n >> 2] | 0;
        j = k[s >> 2] | 0;
        l = k[y >> 2] | 0;
        if (!(((j | m | 0) > -1) | ((l | 0) == 0))) Oa(13818, 13988, 175, 14058);
        h = k[v >> 2] | 0;
        if ((m | 0) <= -1) Oa(14177, 13744, 147, 13812);
        if (!(((j | 0) > -1) & ((h | 0) >= (m | 0)))) Oa(14177, 13744, 147, 13812);
        b = (c + 4) | 0;
        if (!((k[b >> 2] | 0) == (m | 0) ? (k[(c + 8) >> 2] | 0) == (j | 0) : 0)) t = 52;
        do
          if ((t | 0) == 52) {
            mf(c, m, j);
            if ((k[b >> 2] | 0) != (m | 0)) Oa(12160, 12207, 721, 12285);
            if ((k[(c + 8) >> 2] | 0) == (j | 0)) break;
            Oa(12160, 12207, 721, 12285);
          }
        while (0);
        e = k[c >> 2] | 0;
        if (((m | 0) > 0) & ((j | 0) > 0)) b = 0;
        else break;
        do {
          f = aa(b, m) | 0;
          g = aa(b, h) | 0;
          d = 0;
          do {
            p[(e + ((d + f) << 3)) >> 3] = +p[(l + ((d + g) << 3)) >> 3];
            d = (d + 1) | 0;
          } while ((d | 0) != (m | 0));
          b = (b + 1) | 0;
        } while ((b | 0) != (j | 0));
      } else {
        if (!(i[a >> 0] | 0)) Oa(17611, 20281, 181, 21094);
        b = (a + 152) | 0;
        f = k[n >> 2] | 0;
        g = k[s >> 2] | 0;
        e = k[y >> 2] | 0;
        if (!(((g | f | 0) > -1) | ((e | 0) == 0))) Oa(13818, 13988, 175, 14058);
        d = k[v >> 2] | 0;
        if ((f | 0) <= -1) Oa(14177, 13744, 147, 13812);
        if (!(((g | 0) > -1) & ((d | 0) >= (f | 0)))) Oa(14177, 13744, 147, 13812);
        k[w >> 2] = b;
        k[(w + 4) >> 2] = e;
        k[(w + 8) >> 2] = f;
        k[(w + 12) >> 2] = g;
        k[(w + 16) >> 2] = y;
        k[(w + 20) >> 2] = 0;
        k[(w + 24) >> 2] = 0;
        k[(w + 28) >> 2] = d;
        if ((k[(a + 156) >> 2] | 0) != (f | 0)) Oa(14710, 14850, 97, 14920);
        d = k[(a + 156) >> 2] | 0;
        if (!((k[(c + 4) >> 2] | 0) == (d | 0) ? (k[(c + 8) >> 2] | 0) == (g | 0) : 0)) {
          mf(c, d, g);
          b = k[w >> 2] | 0;
        }
        Qj(c, b, (w + 4) | 0);
      }
    while (0);
    k[(a + 4) >> 2] = 0;
    b = k[x >> 2] | 0;
    if (b | 0) Pq(k[(b + -4) >> 2] | 0);
    b = k[y >> 2] | 0;
    if (!b) {
      u = z;
      return 1;
    }
    Pq(k[(b + -4) >> 2] | 0);
    u = z;
    return 1;
  }
  function Nj(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0,
      d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0.0,
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0;
    f = k[a >> 2] | 0;
    C = k[(f + 28) >> 2] | 0;
    f = k[(f + 24) >> 2] | 0;
    C = (f | 0) < (C | 0) ? f : C;
    f = (a + 4) | 0;
    g = k[f >> 2] | 0;
    d = k[g >> 2] | 0;
    D = k[(g + 4) >> 2] | 0;
    g = k[(g + 8) >> 2] | 0;
    E = (b + 4) | 0;
    if (!((k[E >> 2] | 0) == (D | 0) ? (k[(b + 8) >> 2] | 0) == (g | 0) : 0)) {
      mf(b, D, g);
      if ((k[E >> 2] | 0) != (D | 0)) Oa(12160, 12207, 721, 12285);
      if ((k[(b + 8) >> 2] | 0) != (g | 0)) Oa(12160, 12207, 721, 12285);
    }
    j = k[b >> 2] | 0;
    e = aa(g, D) | 0;
    if ((e | 0) > 0) {
      c = 0;
      do {
        p[(j + (c << 3)) >> 3] = +p[(d + (c << 3)) >> 3];
        c = (c + 1) | 0;
      } while ((c | 0) != (e | 0));
    }
    c = (k[((k[a >> 2] | 0) + 100) >> 2] | 0) == (k[((k[f >> 2] | 0) + 4) >> 2] | 0);
    if (!(i[(a + 8) >> 0] | 0)) {
      if (!c) Oa(21020, 20281, 635, 21087);
      y = (b + 8) | 0;
      if ((g | 0) <= 0) return;
      v = (C | 0) > 0;
      w = (D | 0) > -1;
      x = (D | 0) > 0;
      u = 0;
      c = j;
      a: while (1) {
        if (v) {
          t = aa(D, u) | 0;
          s = C;
          do {
            r = s;
            s = (s + -1) | 0;
            g = k[a >> 2] | 0;
            e = (g + 92) | 0;
            if ((k[(e + 4) >> 2] | 0) < (r | 0)) {
              F = 58;
              break a;
            }
            j = (c + (t << 3)) | 0;
            if (!(w | ((j | 0) == 0))) {
              F = 60;
              break a;
            }
            if ((k[y >> 2] | 0) <= (u | 0)) {
              F = 62;
              break a;
            }
            if ((k[(e + 8) >> 2] | 0) != (D | 0)) {
              F = 64;
              break a;
            }
            if (!x) {
              F = 66;
              break a;
            }
            o = k[(e + 20) >> 2] | 0;
            q = k[(e + 24) >> 2] | 0;
            n = ((k[(e + 12) >> 2] | 0) + (s << 2)) | 0;
            if (!n) {
              F = 68;
              break a;
            }
            d = k[n >> 2] | 0;
            l = k[(e + 16) >> 2] | 0;
            m = (l | 0) == 0;
            if (!m ? ((B = (l + (s << 2)) | 0), (B | 0) != 0) : 0) e = ((k[B >> 2] | 0) + d) | 0;
            else e = k[(n + 4) >> 2] | 0;
            do
              if ((d | 0) < (e | 0)) {
                h = 0.0;
                f = d;
                do {
                  f = (f + 1) | 0;
              }