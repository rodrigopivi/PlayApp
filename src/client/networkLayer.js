"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var pushMessagesStore_1 = require('./pushMessagesStore');
var Relay = require('react-relay');
var settings = require('../../config/settings');
var CustomNetworkLayer = (function (_super) {
    __extends(CustomNetworkLayer, _super);
    function CustomNetworkLayer() {
        _super.apply(this, arguments);
    }
    CustomNetworkLayer.prototype._sendQuery = function (request) {
        var currentQueryString = request.getQueryString();
        var queryRegexp = /^query [^\s]+{root{...F0}} fragment F0 on RootQuery{recentMessages{id,createdAt,userId,body,user{id,name,email}}}$/i;
        if (queryRegexp.test(currentQueryString)) {
            return this.sendInterceptedRecentMessagesResponse(request);
        }
        return _super.prototype._sendQuery.call(this, request);
    };
    CustomNetworkLayer.prototype.sendInterceptedRecentMessagesResponse = function (request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var data = [];
            var cachedData = Relay.Store.readQuery(request._query);
            if (cachedData && cachedData.length && cachedData[0] && cachedData[0].recentMessages) {
                var messagesToPush = pushMessagesStore_1.default.getState().messagesToPush;
                data = data.concat(cachedData[0].recentMessages).concat(messagesToPush);
                pushMessagesStore_1.default.dispatch({ type: 'CLEAR_MESSAGES' });
                var response_1 = { 'data': { 'root': { 'recentMessages': data } } };
                var jsonResponsePromise = new Promise(function (res) {
                    res({ json: function () { return response_1; } });
                });
                resolve(jsonResponsePromise);
            }
            else {
                resolve(_super.prototype._sendQuery.call(_this, request));
            }
        });
    };
    return CustomNetworkLayer;
}(Relay.DefaultNetworkLayer));
var customNetworkLayer = new CustomNetworkLayer("http://" + settings.hostname + ":" + settings.mainEntryPort + "/graphql", { credentials: 'same-origin' });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = customNetworkLayer;
