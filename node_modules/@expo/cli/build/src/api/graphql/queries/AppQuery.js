"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppQuery", {
    enumerable: true,
    get: function() {
        return AppQuery;
    }
});
function _core() {
    const data = require("@urql/core");
    _core = function() {
        return data;
    };
    return data;
}
const _client = require("../client");
const _App = require("../types/App");
const AppQuery = {
    async byIdAsync (projectId) {
        const data = await (0, _client.withErrorHandlingAsync)(_client.graphqlClient.query((0, _core().gql)`
            query AppByIdQuery($appId: String!) {
              app {
                byId(appId: $appId) {
                  id
                  ...AppFragment
                }
              }
            }

            ${_App.AppFragmentNode}
          `, {
            appId: projectId
        }, {
            additionalTypenames: [
                'App'
            ]
        }).toPromise());
        return data.app.byId;
    }
};

//# sourceMappingURL=AppQuery.js.map