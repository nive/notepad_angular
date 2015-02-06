// (c) 2013-2014 Nive GmbH - www.nive.co  
// This file is released under the MIT-License. See http://jquery.org/license 
// 
// Nive api endpoint url construction
// ----------------------------------
// Documentation: http://www.nive.co/docs/webapi/endpoints.html
//
// Requires <nothing>

'use strict';

window.nive = window.nive || {};
nive.endpoint = nive.endpoint || {};
(function () {

nive.endpoint.apiUrl = function (options) {
  /* values: method, name, domain, path, secure, relative, outpost */
  options = options||{};
  return nive.endpoint.__makeUrl(options,true);
};

nive.endpoint.widgetUrl = function (options) {
  /* values: method, name, domain, path, secure, outpost */
  options = options||{};
  options.version = "widgets";
  return nive.endpoint.__makeUrl(options);
};

nive.endpoint.EndpointException = function (message) {
   this.message = message;
   this.name = "EndpointException";
};


nive.endpoint.__makeUrl = function (options) {
  /* values: method, name, domain, path, secure, outpost */
  options = options||{};
  var defaultDomain = ".nive.io";
  var defaultOutpost = "http://127.0.0.1:5556";
  var domainPlaceholder = "__domain";
  var devmodePrefix = "__proxy";
  
  // protocol
  var protocol = options.protocol || document.location.protocol;
  if(options.secure) { protocol = "https:"; }
  else if(protocol.indexOf(":")!=protocol.length-1) protocol += ":";
  
  // domain
  var domain = options.domain || "";
  if(domain) {
    // if '.' contained in domain, a fully qualified domain expected
    domain = domain.indexOf(".")==-1 ? domain+defaultDomain : domain;
  }

  // version
  var version = options.version || "api";

  // method
  var method = options.method;
  
  // outpost development proxy 
  var outpost = options.outpost || defaultOutpost;
  var devmode = window.location.href.indexOf(outpost)==0?9:0;

  // base path
  var path = options.path;
  if(path) {
    // relative directory
    if(path.indexOf("./")==0||path.indexOf("../")==0) {
      // not supported in if devmode=9
      if(path.lastIndexOf("/")!=path.length-1) path += "/"; 
      return path + method;
    }
    // remove slash
    if(path.indexOf("/")==0) path = path.substr(1, path.length);
    if(path.lastIndexOf("/")==path.length-1) path = path.substr(0, path.length-1);
  }
  
  // service name
  if(!options.name && !options.relative) throw "Invalid service name";
  var name = options.name||"";
  
  // make url
  var url = "";
  if(devmode==9) {
    if(name=="") throw "Service name required in development mode";
    if(domain=="") domain = domainPlaceholder;
    url = outpost + "/" + devmodePrefix + "/" + domain;
  } 
  else if(domain) {
    url = protocol + "//" + domain;
  }
  url += "/" + name;
  if(version) url += "/"+version;
  if(path) url += "/"+path;
  if(method) url += "/"+method;
  return url;
};
})();

